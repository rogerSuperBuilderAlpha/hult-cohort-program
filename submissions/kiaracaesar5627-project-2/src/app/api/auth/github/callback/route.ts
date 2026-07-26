import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  hashPassword,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/auth";
import { ensureSeeded } from "@/lib/bootstrap";
import {
  allocateUsername,
  createUser,
  findUserByEmail,
  findUserByGithubId,
  updateUser,
} from "@/lib/db";
import {
  GITHUB_OAUTH_STATE_COOKIE,
  exchangeGithubCode,
  fetchGithubProfile,
  getGithubCallbackUrl,
  isGithubOAuthConfigured,
  sanitizeGithubUsername,
} from "@/lib/github-oauth";

function clearStateCookie(response: NextResponse) {
  response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function redirectWithError(request: Request, code: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", code);
  const response = NextResponse.redirect(url);
  clearStateCookie(response);
  return response;
}

export async function GET(request: Request) {
  if (!isGithubOAuthConfigured()) {
    return redirectWithError(request, "github_unavailable");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return redirectWithError(request, "github_denied");
  }
  if (!code || !state) {
    return redirectWithError(request, "github_invalid");
  }

  const jar = await cookies();
  const stateCookie = jar.get(GITHUB_OAUTH_STATE_COOKIE)?.value;

  if (!stateCookie || stateCookie !== state) {
    return redirectWithError(request, "github_state");
  }

  try {
    await ensureSeeded();
    const redirectUri = getGithubCallbackUrl(request);
    const accessToken = await exchangeGithubCode(code, redirectUri);
    const profile = await fetchGithubProfile(accessToken);

    let user = await findUserByGithubId(profile.id);
    if (!user) {
      const byEmail = await findUserByEmail(profile.email);
      if (byEmail) {
        user =
          (await updateUser(byEmail.id, { github_id: profile.id })) ?? byEmail;
      } else {
        const username = await allocateUsername(
          sanitizeGithubUsername(profile.login),
        );
        // Unusable random hash — GitHub users sign in via OAuth, not password.
        user = await createUser({
          name: profile.name,
          email: profile.email,
          username,
          password_hash: await hashPassword(crypto.randomUUID()),
          github_id: profile.id,
          role: "MEMBER",
        });
      }
    }

    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.redirect(new URL("/app", request.url));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    clearStateCookie(response);
    return response;
  } catch {
    return redirectWithError(request, "github_failed");
  }
}
