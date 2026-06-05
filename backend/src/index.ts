import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';

import { logger } from './lib/logger.js';
import { authMiddleware } from './middleware/auth.js';
import articlesRouter from './routes/articles.js';
import authRouter from './routes/auth.js';
import exploreRouter from './routes/explore.js';
import tagsRouter from './routes/tags.js';

const app = new Hono();

// ミドルウェア
app.use('*', (c, next) => {
  if (c.req.path === '/health') {
    return next();
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Hono v4 internal generic mismatch
  return honoLogger()(c, next);
});
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);

// 認証不要エンドポイント
app.route('/api/auth', authRouter);

// 認証保護エンドポイント
app.use('/api/articles/*', authMiddleware);
app.use('/api/tags/*', authMiddleware);
app.use('/api/explore/*', authMiddleware);
app.route('/api/articles', articlesRouter);
app.route('/api/tags', tagsRouter);
app.route('/api/explore', exploreRouter);

// ヘルスチェック
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = 3001;
logger.info({ port }, 'Backend started');

serve({ fetch: app.fetch, port });
