import { PgBoss } from "pg-boss";
import type { Logger } from "pino";
import type { Config } from "../../config.js";

export const TEST_JOB = "phase0.test";
export type TestJobPayload = { marker: string };

export interface JobManager {
  boss: PgBoss;
  start(): Promise<void>;
  ping(): Promise<void>;
  publishTestJob(payload?: TestJobPayload): Promise<string | null>;
  stop(): Promise<void>;
}

export function createJobManager(config: Config, logger: Logger): JobManager {
  const boss = new PgBoss({
    connectionString: config.DATABASE_URL,
    schema: config.PG_BOSS_SCHEMA,
  });
  boss.on("error", (error: Error) => logger.error({ err: error, action: "pgboss.error" }, "pg-boss error"));
  return {
    boss,
    async start() {
      await boss.start();
      await boss.createQueue(TEST_JOB, { retryLimit: 3, retryDelay: 2 });
    },
    async ping() {
      await boss.getQueues();
    },
    async publishTestJob(payload = { marker: "phase0" }) {
      return boss.send(TEST_JOB, payload);
    },
    async stop() {
      await boss.stop({ graceful: true });
    },
  };
}
