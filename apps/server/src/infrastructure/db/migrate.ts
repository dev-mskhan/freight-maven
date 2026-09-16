import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabase } from "./client.js";
import { loadConfig } from "../../config.js";

const database = createDatabase(loadConfig());
try {
  await database.connect();
  await migrate(database.db, { migrationsFolder: "drizzle" });
} finally {
  await database.close();
}
