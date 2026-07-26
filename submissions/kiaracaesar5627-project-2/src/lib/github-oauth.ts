const STATE_COOKIE = "comms_github_oauth_state";

export { STATE_COOKIE as GITHUB_OAUTH_STATE_COOKIE };

export function isGithubOAuthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim(),
  );
}

export function getGithubClientId(): string {
  return process.env.GITHUB_CLIENT_ID?.trim() ?? "";
}

export function getGithubClientSecret(): string {
  return process.env.GITHUB_CLIENT_SECRET?.trim() ?? "";
}

/** Prefer explicit callback URL, then public app URL, else request origin. */
export function getGithubCallbackUrl(request: Request): string {
  const explicit = process.env.GITHUB_CALLBACK_URL?.trim();
  if (explicit) return explicit;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/api/auth/github/callback`;
  }

  const url = new URL(request.url);
  return `${url.origin}/api/auth/github/callback`;
}

export function sanitizeGithubUsername(login: string): string {
  const cleaned = login.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return cleaned || "github-user";
}

export type GithubProfile = {
  id: string;
  login: string;
  name: string;
  email: string;
};

type GithubUserResponse = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
};

type GithubEmailResponse = {
  email: string;
  primary: boolean;
  verified: boolean;
};

export async function exchangeGithubCode(
  code: string,
  redirectUri: string,
): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: getGithubClientId(),
      client_secret: getGithubClientSecret(),
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error("GITHUB_TOKEN_EXCHANGE_FAILED");
  }

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!data.access_token) {
    throw new Error(data.error ?? "GITHUB_TOKEN_MISSING");
  }
  return data.access_token;
}

export async function fetchGithubProfile(accessToken: string): Promise<GithubProfile> {
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Huddle-Comms",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!userRes.ok) throw new Error("GITHUB_USER_FETCH_FAILED");

  const user = (await userRes.json()) as GithubUserResponse;
  let email = user.email?.trim() || "";

  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Huddle-Comms",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as GithubEmailResponse[];
      const primary =
        emails.find((e) => e.primary && e.verified) ??
        emails.find((e) => e.verified) ??
        emails[0];
      email = primary?.email?.trim() ?? "";
    }
  }

  if (!email) {
    email = `${user.id}+${user.login}@users.noreply.github.com`;
  }

  return {
    id: String(user.id),
    login: user.login,
    name: (user.name?.trim() || user.login).slice(0, 80),
    email: email.toLowerCase(),
  };
}
