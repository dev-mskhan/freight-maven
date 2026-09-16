import type { FastifyInstance } from "fastify";
import { startSpan } from "@freight-maven/observability/server";

export function registerRequestContext(app: FastifyInstance): void {
  app.addHook("onRequest", async (request) => {
    const correlationId = request.headers["x-correlation-id"]?.toString() ?? request.id;
    request.correlationId = correlationId;
    request.log = request.log.child({ requestId: request.id, correlationId });
    const span = startSpan(`${request.method} ${request.url}`);
    span.setAttribute("request.id", request.id);
    span.setAttribute("correlation.id", correlationId);
    request.phase0Span = span;
  });
  app.addHook("onResponse", async (request) => {
    request.phase0Span?.end();
  });
}
