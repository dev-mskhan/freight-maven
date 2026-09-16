import { Redis } from "ioredis";
import type { Config } from "../../config.js";

export interface RedisConnection {
  client: Redis;
  connect(): Promise<void>;
  ping(): Promise<void>;
  close(): Promise<void>;
}

export function createRedis(config: Config): RedisConnection {
  const client = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  return {
    client,
    async connect() {
      if (client.status === "wait") await client.connect();
    },
    async ping() {
      await client.ping();
    },
    async close() {
      if (client.status !== "end") await client.quit();
    },
  };
}
