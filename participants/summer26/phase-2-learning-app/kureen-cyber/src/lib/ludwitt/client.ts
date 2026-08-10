import { getLudwittConfig } from "./config";

export class LudwittApiError extends Error {
  status: number;
  error: string;
  code?: string;
  details?: unknown;

  constructor(opts: {
    status: number;
    error: string;
    description: string;
    code?: string;
    details?: unknown;
  }) {
    super(opts.description);
    this.name = "LudwittApiError";
    this.status = opts.status;
    this.error = opts.error;
    this.code = opts.code;
    this.details = opts.details;
  }
}

export async function ludwittFetch(
  path: string,
  init: RequestInit & { accessToken?: string; formBody?: Record<string, string> } = {},
): Promise<Response> {
  const { baseUrl } = getLudwittConfig();
  const headers = new Headers(init.headers);

  if (init.accessToken) {
    headers.set("Authorization", `Bearer ${init.accessToken}`);
  }

  let body = init.body;
  if (init.formBody) {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    body = new URLSearchParams(init.formBody).toString();
  } else if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: Record<string, unknown> = {};
    try {
      payload = (await response.json()) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
    throw new LudwittApiError({
      status: response.status,
      error: String(payload.error || "unknown_error"),
      description: String(
        payload.error_description || payload.message || response.statusText,
      ),
      code: payload.code ? String(payload.code) : undefined,
      details: payload.details,
    });
  }

  return response;
}
