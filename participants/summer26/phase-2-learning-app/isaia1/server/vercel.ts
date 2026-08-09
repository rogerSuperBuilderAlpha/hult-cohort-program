import type { ApiRequest, ApiResponse } from './types';

type Handler = (req: ApiRequest, res: ApiResponse) => Promise<void>;

interface VercelLikeRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelLikeResponse {
  status(code: number): VercelLikeResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string | string[]): void;
  end(body?: string): void;
}

export function createVercelHandler(handler: Handler) {
  return async (req: VercelLikeRequest, res: VercelLikeResponse) => {
    const apiReq: ApiRequest = {
      method: req.method,
      headers: req.headers,
      body:
        req.method === 'GET' || req.body == null
          ? undefined
          : typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body),
    };

    const apiRes: ApiResponse = {
      status(code: number) {
        res.status(code);
        return this;
      },
      json(body: unknown) {
        res.json(body);
      },
      setHeader(name: string, value: string | string[]) {
        res.setHeader(name, value);
      },
      end(body?: string) {
        res.end(body);
      },
    };

    await handler(apiReq, apiRes);
  };
}
