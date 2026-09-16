import postgres, { type Sql } from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql as drizzleSql } from "drizzle-orm";
import type { Config } from "../../config.js";
import { schema } from "./schema.js";

export interface Database {
  client: Sql;
  db: PostgresJsDatabase<typeof schema>;
  connect(): Promise<void>;
  ping(): Promise<void>;
  close(): Promise<void>;
}

export function createDatabase(config: Config): Database {
  const client = postgres(config.DATABASE_URL, { max: 10, idle_timeout: 20, connect_timeout: 5 });
  const db = drizzle(client, { schema });
  return {
    client,
    db,
    async connect() {
      await client`select 1`;
    },
    async ping() {
      await db.execute(drizzleSql`select 1`);
    },
    async close() {
      await client.end({ timeout: 5 });
    },
  };
}
