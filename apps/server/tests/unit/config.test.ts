import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";

describe("configuration", () => {
  it("loads safe development defaults", () => {
    const config = loadConfig({});
    expect(config.PORT).toBe(3000);
    expect(config.DATABASE_URL).toContain("freightmaven");
  });

  it("rejects invalid configuration", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrow("Invalid environment configuration");
  });
});
