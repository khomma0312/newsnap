import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const { DATABASE_URL, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL } = process.env;

const connectionString =
  DATABASE_URL ??
  `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD ?? "")}@${DB_HOST}/${DB_NAME}${DB_SSL === "true" ? "?ssl=true" : ""}`;

const client = postgres(connectionString, {
  ...(DB_SSL === "true" && { ssl: { rejectUnauthorized: false } }),
});

export const db = drizzle(client, { schema });
