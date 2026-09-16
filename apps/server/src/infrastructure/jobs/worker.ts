import type { Logger } from "pino";
import { TEST_JOB, type JobManager, type TestJobPayload } from "./boss.js";

export async function registerTestWorker(manager: JobManager, logger: Logger): Promise<void> {
  await manager.boss.work<TestJobPayload>(TEST_JOB, async (jobs) => {
    const job = jobs[0];
    if (!job) return;
    logger.info({ jobId: job.id, action: "phase0.test_job", outcome: "started" }, "Processing infrastructure test job");
    logger.info({ jobId: job.id, action: "phase0.test_job", outcome: "success", marker: job.data?.marker }, "Infrastructure test job completed");
  });
}
