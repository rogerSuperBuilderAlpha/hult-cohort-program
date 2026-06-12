const DEFAULT_ERROR =
  'Something went wrong submitting your application. Try again in a few minutes or email cohort@hult.edu.';

export async function readApplicationApiError(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const json = (await res.json()) as { error?: unknown };
      if (typeof json.error === 'string' && json.error.trim()) {
        return json.error;
      }
    } catch {
      // Fall through to status-based messages.
    }
  }

  switch (res.status) {
    case 401:
      return 'Sign in with GitHub to apply.';
    case 409:
      return 'We already have an application on file for this email or GitHub account. Email cohort@hult.edu if you need to update it.';
    case 503:
      return 'Applications are temporarily unavailable. Try again in a few minutes.';
    case 400:
      return 'Please check the form for missing or invalid fields.';
    default:
      if (res.status >= 500) {
        return 'Our server hit an error saving your application. Try again in a minute or email cohort@hult.edu.';
      }
      return DEFAULT_ERROR;
  }
}
