export interface LudwittTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface LudwittUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface LudwittSession {
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LudwittCreditsBalance {
  spendableCents: number;
  spendableFormatted: string;
  balanceCents: number;
  balanceFormatted: string;
  lastUsageAt?: string;
}

export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: string;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string | string[]): void;
  end(body?: string): void;
}
