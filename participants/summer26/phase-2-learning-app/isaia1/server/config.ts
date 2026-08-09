export const LUDWITT_CLIENT_ID = 'le_c4ad1bb389677060475555';

export const LUDWITT_AUTHORIZE_URL = 'https://pitchrise.ludwitt.com/oauth/authorize';
export const LUDWITT_TOKEN_URL = 'https://pitchrise.ludwitt.com/api/oauth/token';
export const LUDWITT_USERINFO_URL = 'https://pitchrise.ludwitt.com/api/oauth/userinfo';
export const LUDWITT_REVOKE_URL = 'https://pitchrise.ludwitt.com/api/oauth/revoke';
export const LUDWITT_CREDITS_BALANCE_URL = 'https://pitchrise.ludwitt.com/api/v1/credits/balance';
export const LUDWITT_AI_MESSAGES_URL = 'https://pitchrise.ludwitt.com/api/v1/ai/messages';

export const LUDWITT_SCOPES = 'profile credits:read credits:spend';

export const REDIRECT_URI =
  process.env.LUDWITT_REDIRECT_URI ?? 'https://localhost:3000/auth/callback';

export function getClientSecret(): string {
  const secret = process.env.LUDWITT_CLIENT_SECRET;
  if (!secret) {
    throw new Error('LUDWITT_CLIENT_SECRET is not set.');
  }
  return secret;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? process.env.LUDWITT_CLIENT_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET (or LUDWITT_CLIENT_SECRET) is not set.');
  }
  return secret;
}
