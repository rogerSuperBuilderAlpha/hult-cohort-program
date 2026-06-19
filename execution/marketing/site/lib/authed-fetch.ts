export async function authedFetch<T>(
  getIdToken: () => Promise<string | null>,
  url: string,
  init: RequestInit = {},
  fallbackError = 'Request failed.'
): Promise<T> {
  const idToken = await getIdToken();
  if (!idToken) {
    throw new Error('Your session expired. Sign in again.');
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${idToken}`,
    },
  });

  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(json.error || fallbackError);
  }
  return json;
}
