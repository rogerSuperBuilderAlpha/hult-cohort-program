export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type HultApiClientOptions = {
  baseUrl: string;
  idToken?: string;
};

export class HultApiClient {
  private baseUrl: string;
  private idToken?: string;

  constructor(options: HultApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.idToken = options.idToken?.trim() || undefined;
  }

  hasToken(): boolean {
    return Boolean(this.idToken);
  }

  private headers(auth: boolean): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (auth) {
      if (!this.idToken) {
        throw new ApiError(
          401,
          'Missing HULT_ID_TOKEN. Sign in at the cohort site with GitHub, then set your Firebase ID token in MCP env. Call get_auth_instructions for steps.'
        );
      }
      headers.Authorization = `Bearer ${this.idToken}`;
    }
    return headers;
  }

  async json<T>(
    path: string,
    init: RequestInit & { auth?: boolean; jsonBody?: unknown } = {}
  ): Promise<T> {
    const { auth = false, jsonBody, ...rest } = init;
    const headers = { ...this.headers(auth), ...(rest.headers as Record<string, string>) };

    if (jsonBody !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers,
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : rest.body,
    });

    let body: { error?: string } & T;
    try {
      body = (await res.json()) as typeof body;
    } catch {
      throw new ApiError(res.status, res.statusText || 'Invalid JSON response');
    }

    if (!res.ok) {
      throw new ApiError(res.status, body.error || res.statusText || 'Request failed');
    }

    return body;
  }
}
