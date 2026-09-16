import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GenericContainer, Wait, type StartedTestContainer } from "testcontainers";
import { createDatabase } from "../../src/infrastructure/db/client.js";
import { createRedis } from "../../src/infrastructure/redis/client.js";
import type { Config } from "../../src/config.js";

describe("infrastructure containers", () => {
  let postgres: StartedTestContainer;
  let redis: StartedTestContainer;
  let database: ReturnType<typeof createDatabase>;
  let redisConnection: ReturnType<typeof createRedis>;

  beforeAll(async () => {
    postgres = await new GenericContainer("postgres:16")
      .withEnvironment({
        POSTGRES_DB: "freightmaven",
        POSTGRES_USER: "freightmaven",
        POSTGRES_PASSWORD: "freightmaven",
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forListeningPorts())
      .start();
    redis = await new GenericContainer("redis:7.2-alpine").withExposedPorts(6379).withWaitStrategy(Wait.forListeningPorts()).start();
    const config = {
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: 3000,
      DATABASE_URL: `postgres://freightmaven:freightmaven@${postgres.getHost()}:${postgres.getMappedPort(5432)}/freightmaven`,
      REDIS_URL: `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`,
      PG_BOSS_SCHEMA: "pgboss",
      OTEL_SERVICE_NAME: "freight-maven-test",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://127.0.0.1:4318",
    } satisfies Config;
    database = createDatabase(config);
    redisConnection = createRedis(config);
    await database.connect();
    await redisConnection.connect();
  }, 120_000);

  afterAll(async () => {
    await redisConnection?.close();
    await database?.close();
    await redis?.stop();
    await postgres?.stop();
  });

  it("connects to PostgreSQL through Drizzle", async () => {
    await expect(database.ping()).resolves.toBeUndefined();
  });

  it("connects to Redis and responds to ping", async () => {
    await expect(redisConnection.ping()).resolves.toBeUndefined();
  });
});
