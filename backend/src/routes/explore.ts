/**
 * /api/explore  NewsAPI を使ったニュース探索
 */

import { Hono } from 'hono';
import { fetchNews } from '../lib/newsapi.js';

const router = new Hono<{ Variables: { userId: string } }>();

// GET /api/explore?keyword=&category=
router.get('/', async (c) => {
  const keyword = c.req.query('keyword') ?? '';
  const category = c.req.query('category') ?? '';

  const articles = await fetchNews({ keyword, category });
  return c.json(articles);
});

export default router;
