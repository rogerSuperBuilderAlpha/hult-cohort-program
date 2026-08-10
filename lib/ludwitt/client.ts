import { LUDWITT_URLS } from "./config";
import { refreshAccessToken, sessionFromTokens } from "./oauth";
import {
  clearSession,
  readSession,
  writeSession,
  type LudwittSession,
} from "./session";

const REFRESH_SKEW_MS = 60_000;

export type CreditBalance = {
  spendableCents: number;
  spendableFormatted: string;
  balanceCents: number;
  balanceFormatted: string;
  lastUsageAt?: string | null;
};

export type AiMessageResult = {
  text: string;
  credits?: {
    chargedCostCents: number;
    newBalanceCents: number;
    transactionId: string;
  };
  usage?: { input_tokens?: number; output_tokens?: number };
};

async function ensureFreshSession(): Promise<LudwittSession | null> {
  const session = await readSession();
  if (!session) return null;

  if (session.expiresAt - Date.now() > REFRESH_SKEW_MS) {
    return session;
  }

  try {
    const tokens = await refreshAccessToken(session.refreshToken);
    const next = sessionFromTokens(tokens, session.user);
    await writeSession(next);
    return next;
  } catch {
    await clearSession();
    return null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const session = await ensureFreshSession();
  return session?.accessToken ?? null;
}

export async function getSessionUser() {
  const session = await ensureFreshSession();
  return session?.user ?? null;
}

export async function fetchCreditBalance(): Promise<CreditBalance | null> {
  const token = await getValidAccessToken();
  if (!token) return null;

  const res = await fetch(LUDWITT_URLS.balance, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    await clearSession();
    return null;
  }

  if (!res.ok) {
    throw new Error(`Credit balance failed (${res.status})`);
  }

  return (await res.json()) as CreditBalance;
}

export async function callLudwittAi(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  system?: string;
  model?: string;
  maxTokens?: number;
}): Promise<AiMessageResult> {
  const token = await getValidAccessToken();
  if (!token) {
    throw Object.assign(new Error("Not signed in with Ludwitt"), {
      status: 401,
      code: "NOT_AUTHENTICATED",
    });
  }

  const res = await fetch(LUDWITT_URLS.aiMessages, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model ?? "claude-sonnet-4-6",
      max_tokens: params.maxTokens ?? 1024,
      messages: params.messages,
      ...(params.system ? { system: params.system } : {}),
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    "x-ludwitt-credits"?: {
      chargedCostCents: number;
      newBalanceCents: number;
      transactionId: string;
    };
    error?: string;
    error_description?: string;
    code?: string;
    details?: { topUpUrl?: string; paidBalanceFormatted?: string };
  };

  if (res.status === 402 || data.code === "INSUFFICIENT_PAID_CREDITS") {
    throw Object.assign(
      new Error(
        data.error_description ||
          "You're out of Ludwitt credits for third-party apps — top up at https://pitchrise.ludwitt.com/account/credits",
      ),
      {
        status: 402,
        code: "INSUFFICIENT_PAID_CREDITS",
        topUpUrl: LUDWITT_URLS.topUp,
      },
    );
  }

  if (res.status === 401) {
    await clearSession();
    throw Object.assign(new Error("Ludwitt session expired — please sign in again"), {
      status: 401,
      code: "invalid_token",
    });
  }

  if (!res.ok) {
    throw Object.assign(
      new Error(data.error_description || data.error || `AI request failed (${res.status})`),
      { status: res.status, code: data.code || data.error },
    );
  }

  const text =
    data.content
      ?.filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n")
      .trim() || "";

  return {
    text,
    credits: data["x-ludwitt-credits"],
    usage: data.usage,
  };
}
