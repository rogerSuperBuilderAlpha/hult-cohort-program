export interface LudwittPublicUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: 'ludwitt';
}

export interface LudwittCreditsBalance {
  spendableCents: number;
  spendableFormatted: string;
  balanceCents: number;
  balanceFormatted: string;
  lastUsageAt?: string;
}

export interface AiMessageResponse {
  content?: { type: string; text: string }[];
  'x-ludwitt-credits'?: {
    chargedCostCents: number;
    newBalanceCents: number;
    transactionId: string;
  };
  error?: string;
  error_description?: string;
  code?: string;
  details?: {
    topUpUrl?: string;
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export async function startLudwittOAuth(codeChallenge: string): Promise<{ state: string; authorizeUrl: string }> {
  return apiFetch('/api/auth/start', {
    method: 'POST',
    body: JSON.stringify({ codeChallenge }),
  });
}

export async function completeLudwittOAuth(
  code: string,
  state: string,
  codeVerifier: string,
): Promise<{ user: LudwittPublicUser }> {
  return apiFetch('/api/auth/callback', {
    method: 'POST',
    body: JSON.stringify({ code, state, codeVerifier }),
  });
}

export async function fetchLudwittSession(): Promise<LudwittPublicUser | null> {
  try {
    const data = await apiFetch<{ user: LudwittPublicUser }>('/api/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export async function logoutLudwitt(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST', body: '{}' });
}

export async function fetchLudwittCredits(): Promise<LudwittCreditsBalance> {
  return apiFetch('/api/ludwitt/credits/balance');
}

export async function askAiTutor(
  prompt: string,
  context: { lessonTitle: string; courseTitle: string },
): Promise<AiMessageResponse> {
  const res = await fetch('/api/ludwitt/ai/messages', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a patient tutor helping a student understand lesson material. Keep answers concise and encouraging.',
      messages: [
        {
          role: 'user',
          content: `Course: ${context.courseTitle}\nLesson: ${context.lessonTitle}\n\nStudent question: ${prompt}`,
        },
      ],
    }),
  });
  return res.json() as Promise<AiMessageResponse>;
}
