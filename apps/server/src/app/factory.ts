import Fastify, { type FastifyInstance } from "fastify";
import { trace, type Span } from "@opentelemetry/api";
import type { Logger } from "pino";
import type { Database } from "../infrastructure/db/client.js";
import type { RedisConnection } from "../infrastructure/redis/client.js";
import type { JobManager } from "../infrastructure/jobs/boss.js";
import { AppError, type ErrorEnvelope } from "../shared/errors.js";

declare module "fastify" {
  interface FastifyRequest {
    correlationId: string;
    phase0Span?: Span;
  }
}

export interface AppDependencies {
  logger: Logger;
  database?: Database;
  redis?: RedisConnection;
  jobs?: JobManager;
}

export function createApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({
    loggerInstance: deps.logger,
    requestIdHeader: "x-request-id",
    genReqId: (request) => request.headers["x-request-id"]?.toString() ?? crypto.randomUUID(),
  }) as unknown as FastifyInstance;

  app.decorateRequest("correlationId", "");
  app.addHook("onRequest", async (request) => {
    const correlationId = request.headers["x-correlation-id"]?.toString() ?? request.id;
    request.correlationId = correlationId;
    request.log = request.log.child({ requestId: request.id, correlationId });
    const span = trace.getTracer("freight-maven").startSpan(`${request.method} ${request.url}`);
    span.setAttribute("request.id", request.id);
    span.setAttribute("correlation.id", correlationId);
    request.phase0Span = span;
  });
  app.addHook("onResponse", async (request) => {
    request.phase0Span?.end();
  });

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error instanceof AppError ? error.statusCode : getStatusCode(error);
    const code = error instanceof AppError ? error.code : statusCode < 500 ? "VALIDATION_ERROR" : "INTERNAL_ERROR";
    const message = error instanceof AppError || statusCode < 500
      ? error instanceof Error ? error.message : "Request failed"
      : "Internal server error";
    request.log.error({ err: error, action: "http.request", outcome: "error" }, message);
    const body: ErrorEnvelope = {
      error: {
        code,
        message,
        requestId: request.correlationId,
      },
    };
    return reply.status(statusCode).send(body);
  });

  app.get("/health", async () => ({ status: "ok" }));
  app.get("/ready", async (_request, reply) => {
    const checks: Record<string, "ok" | "failed"> = {};
    await check("postgres", deps.database?.ping(), checks);
    await check("redis", deps.redis?.ping(), checks);
    await check("pgboss", deps.jobs?.ping(), checks);
    const ready = Object.values(checks).every((value) => value === "ok");
    return reply.status(ready ? 200 : 503).send({ status: ready ? "ok" : "not_ready", checks });
  });
  app.get("/", async (request) => ({ service: "freight-maven", requestId: request.correlationId }));
  app.get("/phase0/test-error", async () => {
    throw new AppError("CONFLICT", "Phase 0 test error", 409);
  });
  app.post("/phase0/test-job", async (request, reply) => {
    if (!deps.jobs) throw new AppError("INTERNAL_ERROR", "Job infrastructure is not configured", 500);
    const jobId = await deps.jobs.publishTestJob({ marker: request.correlationId });
    return reply.code(202).send({ jobId, requestId: request.correlationId });
  });
  return app;
}

function getStatusCode(error: unknown): number {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === "number" && statusCode >= 400 && statusCode <= 599) return statusCode;
  }
  return 500;
}

async function check(name: string, operation: Promise<unknown> | undefined, checks: Record<string, "ok" | "failed">): Promise<void> {
  if (!operation) {
    checks[name] = "failed";
    return;
  }
  try {
    await operation;
    checks[name] = "ok";
  } catch {
    checks[name] = "failed";
  }
}
