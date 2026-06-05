/**
 * /api/tags  タグ CRUD
 */

import { and, asc, count, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { articleTags, tags } from '../db/schema.js';

const router = new Hono<{ Variables: { userId: string } }>();

// GET /api/tags  （記事数付き）
router.get('/', async (c) => {
  const userId = c.get('userId');

  const rows = await db
    .select({
      id: tags.id,
      userId: tags.userId,
      name: tags.name,
      articleCount: count(articleTags.articleId),
    })
    .from(tags)
    .leftJoin(articleTags, eq(articleTags.tagId, tags.id))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id, tags.userId, tags.name)
    .orderBy(asc(tags.name));

  return c.json(rows);
});

// POST /api/tags
router.post('/', async (c) => {
  const userId = c.get('userId');
  const { name } = await c.req.json<{ name: string }>();

  const [tag] = await db.insert(tags).values({ userId, name }).returning();
  return c.json(tag, 201);
});

// PUT /api/tags/:id
router.put('/:id', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const { name } = await c.req.json<{ name: string }>();

  const result = await db
    .update(tags)
    .set({ name })
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json(result[0]);
});

// DELETE /api/tags/:id
router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();

  await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));

  return c.body(null, 204);
});

export default router;
