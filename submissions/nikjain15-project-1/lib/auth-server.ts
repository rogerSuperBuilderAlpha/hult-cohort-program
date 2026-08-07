/**
 * Verify the Firebase ID token on a request and return the caller's uid, or null.
 *
 * Every bus-touching route gates on this: the client sends its ID token as a Bearer header, and the
 * VERIFIED uid — never a uid from the request body — is what the handle (and thus the shared-context
 * identity) is derived from. The bus writes with the Admin SDK, which bypasses client rules, so a
 * body-supplied identity would let anyone read or write someone else's shared context. This closes
 * that hole.
 *
 * Verification goes through Google's Identity Toolkit REST endpoint rather than
 * `firebase-admin/auth`'s `verifyIdToken`, ON PURPOSE: the admin path pulls in `jwks-rsa`/`jose`,
 * which trip an `ERR_REQUIRE_ESM` in the serverless runtime and 500 the whole route module on load.
 * The REST lookup is dependency-free — Google validates the token (signature, expiry, project) and
 * returns the user record — and the Web API key is a public, non-secret project scoper, safe to use
 * server-side. Any failure yields null: the route degrades to "unauthenticated", never a crash.
 */
export async function verifyUid(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: match[1] }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: { localId?: string }[] };
    const uid = data.users?.[0]?.localId;
    return typeof uid === 'string' && uid ? uid : null;
  } catch {
    return null;
  }
}

/** Resolve the caller's stable GitHub handle from their VERIFIED uid — the cross-app key. Never
 *  accept a handle from the request body; it must come from the member doc the uid owns. */
export async function getHandle(
  db: import('firebase-admin/firestore').Firestore,
  uid: string
): Promise<string | null> {
  const snap = await db.collection('members').doc(uid).get();
  const handle = snap.exists ? (snap.data()?.handle as string | null | undefined) : null;
  return handle && handle.trim() ? handle.trim().toLowerCase() : null;
}
