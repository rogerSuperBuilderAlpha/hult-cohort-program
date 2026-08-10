import { REDIRECT_URI } from './config';
import {
  ensureFreshSession,
  exchangeAuthorizationCode,
  fetchCreditsBalance,
  fetchUserInfo,
  publicUser,
  revokeToken,
  sendAiMessage,
  sessionFromTokens,
} from './ludwitt';
import {
  buildAuthorizeUrl,
  clearOAuthStateCookie,
  clearSessionCookie,
  createOAuthState,
  parseBody,
  readOAuthState,
  readSession,
  sendJson,
  setOAuthStateCookie,
  setSessionCookie,
} from './session';
import type { ApiRequest, ApiResponse } from './types';

export async function handleAuthStart(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = parseBody<{ codeChallenge?: string }>(req);
  if (!body?.codeChallenge) {
    sendJson(res, 400, { error: 'codeChallenge is required.' });
    return;
  }

  const state = createOAuthState();
  setOAuthStateCookie(res, state);
  sendJson(res, 200, {
    state,
    authorizeUrl: buildAuthorizeUrl(state, body.codeChallenge),
  });
}

export async function handleAuthCallback(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = parseBody<{ code?: string; state?: string; codeVerifier?: string }>(req);
  const storedState = readOAuthState(req);

  if (!body?.code || !body.state || !body.codeVerifier) {
    sendJson(res, 400, { error: 'code, state, and codeVerifier are required.' });
    return;
  }

  if (!storedState || storedState !== body.state) {
    sendJson(res, 400, { error: 'Invalid OAuth state. Please try signing in again.' });
    return;
  }

  try {
    const tokens = await exchangeAuthorizationCode(body.code, body.codeVerifier, REDIRECT_URI);
    const user = await fetchUserInfo(tokens.access_token);
    const session = sessionFromTokens(user, tokens);
    setSessionCookie(res, session);
    clearOAuthStateCookie(res);
    sendJson(res, 200, { user: publicUser(session) });
  } catch (err) {
    clearOAuthStateCookie(res);
    sendJson(res, 400, {
      error: err instanceof Error ? err.message : 'OAuth callback failed.',
    });
  }
}

export async function handleAuthMe(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Not signed in.' });
    return;
  }

  try {
    const fresh = await ensureFreshSession(session);
    if (fresh.accessToken !== session.accessToken || fresh.refreshToken !== session.refreshToken) {
      setSessionCookie(res, fresh);
    }
    sendJson(res, 200, { user: publicUser(fresh) });
  } catch {
    clearSessionCookie(res);
    sendJson(res, 401, { error: 'Session expired. Please sign in again.' });
  }
}

export async function handleAuthLogout(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const session = readSession(req);
  if (session) {
    await revokeToken(session.accessToken).catch(() => undefined);
  }
  clearSessionCookie(res);
  clearOAuthStateCookie(res);
  sendJson(res, 200, { ok: true });
}

export async function handleCreditsBalance(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Not signed in.' });
    return;
  }

  try {
    const fresh = await ensureFreshSession(session);
    if (fresh.accessToken !== session.accessToken || fresh.refreshToken !== session.refreshToken) {
      setSessionCookie(res, fresh);
    }
    const balance = await fetchCreditsBalance(fresh.accessToken);
    sendJson(res, 200, balance);
  } catch (err) {
    sendJson(res, 500, {
      error: err instanceof Error ? err.message : 'Failed to load credits.',
    });
  }
}

export async function handleAiMessages(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Not signed in.' });
    return;
  }

  const body = parseBody<{
    model?: string;
    max_tokens?: number;
    messages?: { role: string; content: string }[];
    system?: string;
  }>(req);

  if (!body?.messages?.length) {
    sendJson(res, 400, { error: 'messages array is required.' });
    return;
  }

  try {
    const fresh = await ensureFreshSession(session);
    if (fresh.accessToken !== session.accessToken || fresh.refreshToken !== session.refreshToken) {
      setSessionCookie(res, fresh);
    }
    const result = await sendAiMessage(fresh.accessToken, body);
    sendJson(res, result.status, result.data);
  } catch (err) {
    sendJson(res, 500, {
      error: err instanceof Error ? err.message : 'AI request failed.',
    });
  }
}

export async function dispatchApi(pathname: string, req: ApiRequest, res: ApiResponse): Promise<boolean> {
  switch (pathname) {
    case '/api/auth/start':
      await handleAuthStart(req, res);
      return true;
    case '/api/auth/callback':
      await handleAuthCallback(req, res);
      return true;
    case '/api/auth/me':
      await handleAuthMe(req, res);
      return true;
    case '/api/auth/logout':
      await handleAuthLogout(req, res);
      return true;
    case '/api/ludwitt/credits/balance':
      await handleCreditsBalance(req, res);
      return true;
    case '/api/ludwitt/ai/messages':
      await handleAiMessages(req, res);
      return true;
    default:
      return false;
  }
}
