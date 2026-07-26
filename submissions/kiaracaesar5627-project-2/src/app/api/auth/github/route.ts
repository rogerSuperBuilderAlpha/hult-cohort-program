import { NextResponse } from "next/server";
import {
  GITHUB_OAUTH_STATE_COOKIE,
  getGithubCallbackUrl,
  getGithubClientId,
  isGithubOAuthConfigured,
} from "@/lib/github-oauth";

export async function GET(request: Request) {
  if (!isGithubOAuthConfigured()) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "github_unavailable");
    return NextResponse.redirect(url);
  }

  const state = crypto.randomUUID().replace(/-/g, "");
  const callbackUrl = getGithubCallbackUrl(request);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", getGithubClientId());
  authorize.searchParams.set("redirect_uri", callbackUrl);
  authorize.searchParams.set("scope", "read:user user:email");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
