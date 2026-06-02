import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const { DATABASE_URL, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL } = process.env;

const connectionString =
  DATABASE_URL ??
  `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD ?? "")}@${DB_HOST}/${DB_NAME}${DB_SSL === "true" ? "?ssl=true" : ""}`;

const client = postgres(connectionString, {
  max: 1,
  ...(DB_SSL === "true" && { ssl: { rejectUnauthorized: false } }),
});
const db = drizzle(client);

migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => {
    console.log("Migration succeeded");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
