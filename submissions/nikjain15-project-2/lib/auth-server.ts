import { adminAuth } from './admin';

/**
 * Verify the Firebase ID token on a request and return the caller's uid, or null.
 *
 * Every point-writing / model route gates on this: the client sends its ID token as a Bearer
 * header, the Admin SDK verifies it, and the verified uid — never a uid from the request body —
 * is what the ledger logic trusts. A body-supplied uid would let anyone act as anyone.
 */
export async function verifyUid(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const auth = adminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(match[1]);
    return decoded.uid;
  } catch {
    return null;
  }
}
