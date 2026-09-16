import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app/factory.js";
import { createLogger } from "../../src/infrastructure/logger.js";

describe("API foundation", () => {
  it("serves health and correlates request IDs", async () => {
    const app = createApp({ logger: createLogger("test") });
    const response = await app.inject({ method: "GET", url: "/health", headers: { "x-correlation-id": "corr-123" } });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    await app.close();
  });

  it("uses a stable error envelope", async () => {
    const app = createApp({ logger: createLogger("test") });
    const response = await app.inject({ method: "GET", url: "/phase0/test-error", headers: { "x-correlation-id": "corr-456" } });
    expect(response.statusCode).toBe(409);
    expect(response.json().error).toMatchObject({ code: "CONFLICT", requestId: "corr-456" });
    await app.close();
  });
});
