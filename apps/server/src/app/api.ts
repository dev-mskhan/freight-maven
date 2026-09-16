import { createApp } from "./factory.js";
import { loadConfig } from "../config.js";
import { createLogger } from "../infrastructure/logger.js";
import { createDatabase } from "../infrastructure/db/client.js";
import { createRedis } from "../infrastructure/redis/client.js";
import { createJobManager } from "../infrastructure/jobs/boss.js";
import { createTelemetry } from "../infrastructure/observability.js";

const config = loadConfig();
const logger = createLogger(config.NODE_ENV);
const telemetry = createTelemetry(config);
await telemetry.start();
const database = createDatabase(config);
const redis = createRedis(config);
const jobs = createJobManager(config, logger);
await database.connect();
await redis.connect();
await jobs.start();
const app = createApp({ logger, database, redis, jobs });
await app.listen({ host: config.HOST, port: config.PORT });
logger.info({ action: "api.start", port: config.PORT }, "API listening");

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ action: "api.shutdown", signal }, "Shutting down API");
  await app.close();
  await jobs.stop();
  await redis.close();
  await database.close();
  await telemetry.shutdown();
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
