import { relations } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================================
// articles
// ============================================================
export const articles = pgTable("articles", {
  id:           uuid("id").defaultRandom().primaryKey(),
  userId:       text("user_id").notNull(),
  url:          text("url").notNull(),
  title:        text("title").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  summary:      text("summary"),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articlesRelations = relations(articles, ({ many }) => ({
  articleTags: many(articleTags),
}));

// ============================================================
// tags
// ============================================================
export const tags = pgTable(
  "tags",
  {
    id:     uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name:   text("name").notNull(),
  },
  (table) => [
    uniqueIndex("tags_user_id_name_idx").on(table.userId, table.name),
  ]
);

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

// ============================================================
// article_tags（中間テーブル）
// ============================================================
export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.tagId] }),
  ]
);

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));
