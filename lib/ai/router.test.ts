import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configuredProviderNames, hasAnyAiProviderConfigured } from "./router";

const KEYS = ["ZAI_API_KEY", "CEREBRAS_API_KEY", "GROQ_API_KEY"] as const;
let originalValues: Record<string, string | undefined>;

// providers() reads these directly from process.env on every call, so each
// test starts from a known-empty baseline and the real environment is
// restored afterward rather than leaking into other test files.
beforeEach(() => {
  originalValues = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (originalValues[k] === undefined) delete process.env[k];
    else process.env[k] = originalValues[k];
  }
});

describe("hasAnyAiProviderConfigured", () => {
  it("is false when no provider key is set", () => {
    expect(hasAnyAiProviderConfigured()).toBe(false);
  });

  it("is true when at least one provider key is set", () => {
    process.env.GROQ_API_KEY = "test-key";
    expect(hasAnyAiProviderConfigured()).toBe(true);
  });
});

describe("configuredProviderNames", () => {
  it("returns an empty list when nothing is configured", () => {
    expect(configuredProviderNames()).toEqual([]);
  });

  it("returns only the configured providers, in router priority order", () => {
    process.env.GROQ_API_KEY = "test-key";
    process.env.ZAI_API_KEY = "test-key";
    // zai is tried before groq regardless of which env vars were set in
    // which order — the list order mirrors the fallthrough priority.
    expect(configuredProviderNames()).toEqual(["zai", "groq"]);
  });

  it("includes all three when fully configured", () => {
    process.env.ZAI_API_KEY = "a";
    process.env.CEREBRAS_API_KEY = "b";
    process.env.GROQ_API_KEY = "c";
    expect(configuredProviderNames()).toEqual(["zai", "cerebras", "groq"]);
  });
});
