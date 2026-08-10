import { jwtVerify } from "jose";

export type LaunchPayload = {
  sub: string;
  email?: string;
  app_id?: string;
  iat?: number;
  exp?: number;
};

export type VerifyResult =
  | { ok: true; payload: LaunchPayload }
  | {
      ok: false;
      reason:
        | "missing_token"
        | "missing_secret"
        | "invalid"
        | "app_mismatch";
    };

function getSecretKey(): Uint8Array | null {
  const secret = process.env.LUDWITT_JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Verify Ludwitt/Hult launch JWT (HS256). */
export async function verifyLaunchToken(
  token: string | undefined | null,
): Promise<VerifyResult> {
  if (!token?.trim()) {
    return { ok: false, reason: "missing_token" };
  }

  const key = getSecretKey();
  if (!key) {
    return { ok: false, reason: "missing_secret" };
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sub) {
      return { ok: false, reason: "invalid" };
    }

    const appIdFromToken =
      typeof payload.app_id === "string" ? payload.app_id : undefined;
    const configuredAppId = process.env.LUDWITT_APP_ID?.trim();

    if (
      configuredAppId &&
      appIdFromToken &&
      appIdFromToken !== configuredAppId
    ) {
      return { ok: false, reason: "app_mismatch" };
    }

    return {
      ok: true,
      payload: {
        sub,
        email: typeof payload.email === "string" ? payload.email : undefined,
        app_id: appIdFromToken,
        iat: typeof payload.iat === "number" ? payload.iat : undefined,
        exp: typeof payload.exp === "number" ? payload.exp : undefined,
      },
    };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export function ludwittConfig() {
  return {
    appId: process.env.LUDWITT_APP_ID?.trim() ?? "",
    apiKey: process.env.LUDWITT_API_KEY?.trim() ?? "",
    jwtSecretConfigured: Boolean(process.env.LUDWITT_JWT_SECRET?.trim()),
    apiBaseUrl:
      process.env.LUDWITT_API_BASE_URL?.trim() ||
      "https://api.ludwitt.hult/v1",
    publicAppUrl:
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
    allowDevBypass: process.env.ALLOW_DEV_BYPASS === "true",
  };
}

/** Safe status for UI — never includes secret values (apiKey / jwt secret). */
export function ludwittIntegrationStatus() {
  const cfg = ludwittConfig();
  const hasAppId = Boolean(cfg.appId);
  const hasApiKey = Boolean(cfg.apiKey);
  const hasJwt = cfg.jwtSecretConfigured;

  return {
    appId: cfg.appId ? "configured" : "",
    apiBaseUrl: cfg.apiBaseUrl,
    publicAppUrl: cfg.publicAppUrl,
    allowDevBypass: cfg.allowDevBypass,
    hasAppId,
    hasApiKey,
    hasJwt,
    eventsReady: hasAppId && hasApiKey,
    launchReady: hasJwt,
    fullyWired: hasAppId && hasApiKey && hasJwt,
    launchUrl: `${cfg.publicAppUrl.replace(/\/$/, "")}/launch`,
  };
}
