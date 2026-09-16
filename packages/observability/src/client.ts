import { trace } from "@opentelemetry/api";

export function getClientTracer() {
  return trace.getTracer("freight-maven-client");
}
