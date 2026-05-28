import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { authMiddleware } from "./middleware/auth.js";
import articlesRouter from "./routes/articles.js";
import tagsRouter from "./routes/tags.js";
import exploreRouter from "./routes/explore.js";
import authRouter from "./routes/auth.js";

const app = new Hono();

// ミドルウェア
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

// 認証不要エンドポイント
app.route("/auth", authRouter);

// 認証保護エンドポイント
app.use("/api/*", authMiddleware);
app.route("/api/articles", articlesRouter);
app.route("/api/tags", tagsRouter);
app.route("/api/explore", exploreRouter);

// ヘルスチェック
app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(3001);
console.log(`Backend listening on port ${port}`);

serve({ fetch: app.fetch, port });
