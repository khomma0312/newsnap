import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema:  "./src/db/schema.ts",
  out:     "./drizzle",           // マイグレーション SQL の出力先
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
