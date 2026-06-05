/**
 * /api/articles  記事 CRUD
 */

import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { articleTags, articles } from '../db/schema.js';
import { generateSummary } from '../lib/bedrock.js';
import { fetchOgp } from '../lib/ogp.js';

const router = new Hono<{ Variables: { userId: string } }>();

// GET /api/articles
router.get('/', async (c) => {
  const userId = c.get('userId');

  const rows = await db.query.articles.findMany({
    where: eq(articles.userId, userId),
    orderBy: (articles, { desc }) => [desc(articles.createdAt)],
    with: {
      articleTags: {
        columns: {},
        with: { tag: true },
      },
    },
  });

  return c.json(
    rows.map(({ articleTags: ats, ...rest }) => ({
      ...rest,
      tags: ats.map((at) => at.tag),
    }))
  );
});

// GET /api/articles/:id
router.get('/:id', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();

  const row = await db.query.articles.findFirst({
    where: and(eq(articles.id, id), eq(articles.userId, userId)),
    with: {
      articleTags: {
        columns: {},
        with: { tag: true },
      },
    },
  });

  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  const { articleTags: ats, ...rest } = row;
  return c.json({ ...rest, tags: ats.map((at) => at.tag) });
});

// POST /api/articles
router.post('/', async (c) => {
  const userId = c.get('userId');
  const { url } = await c.req.json<{ url: string }>();

  const ogp = await fetchOgp(url);
  const summary = await generateSummary(ogp.title, ogp.description);

  const [article] = await db
    .insert(articles)
    .values({ userId, url, title: ogp.title, thumbnailUrl: ogp.image, summary })
    .returning();

  return c.json({ ...article, tags: [] }, 201);
});

// DELETE /api/articles/:id
router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();

  await db.delete(articles).where(and(eq(articles.id, id), eq(articles.userId, userId)));

  return c.body(null, 204);
});

// POST /api/articles/:id/summarize  要約再生成
router.post('/:id/summarize', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();

  const row = await db.query.articles.findFirst({
    where: and(eq(articles.id, id), eq(articles.userId, userId)),
    with: {
      articleTags: {
        columns: {},
        with: { tag: true },
      },
    },
  });
  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  const summary = await generateSummary(row.title, '');

  const [updated] = await db.update(articles).set({ summary }).where(eq(articles.id, id)).returning();

  const { articleTags: ats } = row;
  return c.json({ ...updated, tags: ats.map((at) => at.tag) });
});

// POST /api/articles/:id/tags/:tagId
router.post('/:id/tags/:tagId', async (c) => {
  const { id, tagId } = c.req.param();

  await db.insert(articleTags).values({ articleId: id, tagId }).onConflictDoNothing();

  return c.body(null, 204);
});

// DELETE /api/articles/:id/tags/:tagId
router.delete('/:id/tags/:tagId', async (c) => {
  const { id, tagId } = c.req.param();

  await db.delete(articleTags).where(and(eq(articleTags.articleId, id), eq(articleTags.tagId, tagId)));

  return c.body(null, 204);
});

export default router;
