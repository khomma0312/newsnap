import { defineConfig } from "drizzle-kit";

const { DATABASE_URL, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const url =
  DATABASE_URL ??
  `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD ?? "")}@${DB_HOST}/${DB_NAME}`;

export default defineConfig({
  schema:  "./src/db/schema.ts",
  out:     "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
