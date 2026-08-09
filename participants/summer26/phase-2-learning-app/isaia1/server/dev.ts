import https from 'https';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { dispatchApi } from './handlers';
import { getLocalHttpsCredentials } from './https';
import type { ApiRequest, ApiResponse } from './types';

const PORT = 3000;

async function startDevServer() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());

  app.use('/api', async (req, res, next) => {
    const pathname = `/api${req.path}`;
    const apiReq: ApiRequest = {
      method: req.method,
      headers: req.headers as ApiRequest['headers'],
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body ?? {}),
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

    const handled = await dispatchApi(pathname, apiReq, apiRes);
    if (!handled) next();
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const credentials = await getLocalHttpsCredentials();
  https.createServer(credentials, app).listen(PORT, () => {
    console.log(`LearnHub dev server running at https://localhost:${PORT}`);
  });
}

startDevServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
