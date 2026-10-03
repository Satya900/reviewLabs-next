import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialFromName, timeUntil } from "./format";

describe("initialFromName", () => {
  it("returns the uppercased first letter", () => {
    expect(initialFromName("aditi")).toBe("A");
  });

  it("trims leading whitespace before taking the first letter", () => {
    expect(initialFromName("  rohan")).toBe("R");
  });

  it("falls back to '?' for null, undefined, or empty string", () => {
    expect(initialFromName(null)).toBe("?");
    expect(initialFromName(undefined)).toBe("?");
    expect(initialFromName("")).toBe("?");
  });
});

describe("timeUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports hours remaining for a future SLA deadline", () => {
    const sixHoursOut = new Date("2026-10-03T06:00:00.000Z").toISOString();
    expect(timeUntil(sixHoursOut)).toBe("due in 6h");
  });

  it("reports 'overdue' for a past deadline", () => {
    const threeHoursAgo = new Date("2026-10-02T21:00:00.000Z").toISOString();
    expect(timeUntil(threeHoursAgo)).toBe("3h overdue");
  });

  it("reports 'due within the hour' when under ~30 minutes remain", () => {
    // timeUntil rounds the hour count before checking it against 1, so the
    // "within the hour" branch only fires under ~30 minutes — at exactly
    // 30 minutes, Math.round(0.5) already rounds up to 1h.
    const tenMinOut = new Date("2026-10-03T00:10:00.000Z").toISOString();
    expect(timeUntil(tenMinOut)).toBe("due within the hour");
  });
});
