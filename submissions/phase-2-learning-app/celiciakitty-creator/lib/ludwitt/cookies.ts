import { cookies } from "next/headers";

import { ludwittConfig } from "@/lib/ludwitt/config";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

type CookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

export function getTransientOAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: ludwittConfig.oauthCookieMaxAge,
  };
}

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: ludwittConfig.sessionMaxAge,
  };
}

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/learn";
  }
  return value;
}

export async function setOAuthTransientCookies(
  state: string,
  codeVerifier: string,
  returnTo?: string
): Promise<void> {
  const store = await cookies();
  const options = getTransientOAuthCookieOptions();
  store.set(ludwittConfig.oauthStateCookie, state, options);
  store.set(ludwittConfig.pkceVerifierCookie, codeVerifier, options);
  store.set(
    ludwittConfig.returnToCookie,
    sanitizeReturnTo(returnTo),
    options
  );
}

export async function readOAuthTransientCookies(): Promise<{
  state: string | undefined;
  codeVerifier: string | undefined;
  returnTo: string;
}> {
  const store = await cookies();
  return {
    state: store.get(ludwittConfig.oauthStateCookie)?.value,
    codeVerifier: store.get(ludwittConfig.pkceVerifierCookie)?.value,
    returnTo: sanitizeReturnTo(
      store.get(ludwittConfig.returnToCookie)?.value
    ),
  };
}

export async function clearOAuthTransientCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ludwittConfig.oauthStateCookie);
  store.delete(ludwittConfig.pkceVerifierCookie);
  store.delete(ludwittConfig.returnToCookie);
}

export async function setSessionCookie(value: string): Promise<void> {
  const store = await cookies();
  store.set(ludwittConfig.sessionCookie, value, getSessionCookieOptions());
}

export async function readSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ludwittConfig.sessionCookie)?.value;
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ludwittConfig.sessionCookie);
}
