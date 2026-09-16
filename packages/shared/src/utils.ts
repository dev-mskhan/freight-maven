export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
