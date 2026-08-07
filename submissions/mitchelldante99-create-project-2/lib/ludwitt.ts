const BASE_URL = process.env.NEXT_PUBLIC_LUDWITT_BASE_URL || "https://pitchrise.ludwitt.com";

export const LUDWITT = {
  baseUrl: BASE_URL,
  clientId: process.env.NEXT_PUBLIC_LUDWITT_CLIENT_ID || "",
  clientSecret: process.env.LUDWITT_CLIENT_SECRET || "",
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000"}/auth/callback`,
  scopes: "profile credits:read credits:spend data:read data:write",

  authorizeUrl: `${BASE_URL}/oauth/authorize`,
  tokenUrl: `${BASE_URL}/api/oauth/token`,
  userinfoUrl: `${BASE_URL}/api/oauth/userinfo`,
  creditBalanceUrl: `${BASE_URL}/api/v1/credits/balance`,
  aiProxyUrl: `${BASE_URL}/api/v1/ai/messages`,
  dataUrl: (collection: string, docId?: string) =>
    docId
      ? `${BASE_URL}/api/v1/data/${collection}/${docId}`
      : `${BASE_URL}/api/v1/data/${collection}`,
};

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}
