import { loadConfig } from "../config.js";
import { createLogger } from "../infrastructure/logger.js";
import { createJobManager } from "../infrastructure/jobs/boss.js";
import { registerTestWorker } from "../infrastructure/jobs/worker.js";

const config = loadConfig();
const logger = createLogger(config.NODE_ENV);
const jobs = createJobManager(config, logger);
await jobs.start();
await registerTestWorker(jobs, logger);
logger.info({ action: "worker.start" }, "Worker started");

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ action: "worker.shutdown", signal }, "Shutting down worker");
  await jobs.stop();
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
