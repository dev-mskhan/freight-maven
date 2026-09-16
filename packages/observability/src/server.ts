import pino, { type Logger } from "pino";
import { trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import type { Env } from "@freight-maven/env";

export function createLogger(config: Pick<Env, "NODE_ENV" | "LOG_LEVEL"> | string): Logger {
  const environment = typeof config === "string" ? config : config.NODE_ENV;
  const level = typeof config === "string" ? process.env.LOG_LEVEL ?? "info" : config.LOG_LEVEL;
  return pino({
    level,
    base: { service: "freight-maven", environment },
    redact: ["password", "token", "authorization", "DATABASE_URL", "REDIS_URL"],
  });
}

export function createTelemetry(config: Pick<Env, "OTEL_SERVICE_NAME" | "OTEL_EXPORTER_OTLP_ENDPOINT">): NodeSDK {
  return new NodeSDK({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: config.OTEL_SERVICE_NAME }),
    traceExporter: new OTLPTraceExporter({ url: `${config.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces` }),
  });
}

export function startSpan(name: string) {
  return trace.getTracer("freight-maven").startSpan(name);
}
