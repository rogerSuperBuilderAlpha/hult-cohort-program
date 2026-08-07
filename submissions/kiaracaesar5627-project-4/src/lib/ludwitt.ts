import { SignJWT, jwtVerify } from "jose";
import { SEEDED_APP, getApp, type LearningEventName } from "@/lib/platform/store";

export type LaunchClaims = {
  sub: string;
  email: string;
  app_id: string;
};

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function verifyLaunchToken(
  token: string,
): Promise<{ ok: true; claims: LaunchClaims } | { ok: false; error: string }> {
  try {
    const probe = await jwtVerify(token, secretKey(SEEDED_APP.jwt_secret), {
      algorithms: ["HS256"],
    }).catch(() => null);

    let claims: LaunchClaims | null = null;
    let appId: string | null = null;

    if (probe) {
      const payload = probe.payload;
      appId = typeof payload.app_id === "string" ? payload.app_id : null;
      if (
        typeof payload.sub === "string" &&
        typeof payload.email === "string" &&
        appId
      ) {
        claims = { sub: payload.sub, email: payload.email, app_id: appId };
      }
    }

    if (!claims) {
      // Try per-app secrets for non-seeded apps
      return { ok: false, error: "invalid_token" };
    }

    const app = getApp(claims.app_id);
    if (!app) return { ok: false, error: "unknown_app" };
    if (app.jwt_secret !== SEEDED_APP.jwt_secret) {
      await jwtVerify(token, secretKey(app.jwt_secret), { algorithms: ["HS256"] });
    }

    return { ok: true, claims };
  } catch {
    return { ok: false, error: "invalid_token" };
  }
}

export async function mintLaunchToken(input: {
  app_id: string;
  user_id: string;
  email: string;
  jwt_secret: string;
}): Promise<string> {
  return new SignJWT({
    email: input.email,
    app_id: input.app_id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.user_id)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey(input.jwt_secret));
}

export function ludwittApiBase(): string {
  const raw = process.env.LUDWITT_API_BASE?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"}/v1`;
}

export async function postLearningEvent(input: {
  app_id: string;
  api_key: string;
  event: LearningEventName;
  user_id: string;
  session_id: string;
  metadata?: Record<string, unknown>;
}): Promise<{ accepted: boolean; counted?: boolean; status: number }> {
  const res = await fetch(`${ludwittApiBase()}/apps/${input.app_id}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: input.event,
      user_id: input.user_id,
      session_id: input.session_id,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    accepted?: boolean;
    counted?: boolean;
  };
  return {
    accepted: Boolean(json.accepted),
    counted: json.counted,
    status: res.status,
  };
}
