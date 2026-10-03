import { describe, expect, it } from "vitest";
import { isValidWebhookSecret } from "./webhook-auth";

describe("isValidWebhookSecret", () => {
  it("accepts a matching secret", () => {
    expect(isValidWebhookSecret("abc123", "abc123")).toBe(true);
  });

  it("rejects a mismatched secret", () => {
    expect(isValidWebhookSecret("abc124", "abc123")).toBe(false);
  });

  it("rejects a null/missing secret", () => {
    expect(isValidWebhookSecret(null, "abc123")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidWebhookSecret("", "abc123")).toBe(false);
  });

  it("rejects a shorter secret rather than throwing (timingSafeEqual requires equal buffer lengths)", () => {
    expect(isValidWebhookSecret("abc", "abc123")).toBe(false);
  });

  it("rejects a longer secret rather than throwing", () => {
    expect(isValidWebhookSecret("abc123xyz", "abc123")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isValidWebhookSecret("ABC123", "abc123")).toBe(false);
  });
});
