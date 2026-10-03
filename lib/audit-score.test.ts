import { describe, expect, it } from "vitest";
import { computeAuditScore } from "./audit-score";

describe("computeAuditScore", () => {
  it("scores a strong profile as excellent with no findings beyond the positive one", () => {
    const result = computeAuditScore({ rating: 4.8, reviewCount: 120, recency: "week" });
    expect(result.grade).toBe("excellent");
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.findings).toEqual([
      "You're in solid shape. Keep the reviews flowing steadily so a slow month doesn't let a competitor pull ahead.",
    ]);
  });

  it("scores a weak profile as at_risk with multiple findings", () => {
    const result = computeAuditScore({ rating: 3.2, reviewCount: 3, recency: "6mo-plus" });
    expect(result.grade).toBe("at_risk");
    expect(result.score).toBeLessThan(40);
    expect(result.findings.length).toBeGreaterThan(1);
  });

  it("flags a sub-4.0 rating specifically", () => {
    const result = computeAuditScore({ rating: 3.9, reviewCount: 50, recency: "week" });
    expect(result.findings.some((f) => f.includes("below 4.0"))).toBe(true);
  });

  it("does not flag the rating when it's at or above 4.0", () => {
    const result = computeAuditScore({ rating: 4.0, reviewCount: 50, recency: "week" });
    expect(result.findings.some((f) => f.includes("below 4.0"))).toBe(false);
  });

  it("flags a low review count", () => {
    const result = computeAuditScore({ rating: 4.5, reviewCount: 5, recency: "week" });
    expect(result.findings.some((f) => f.includes("don't have many reviews"))).toBe(true);
  });

  it("flags stale recency (3-6mo and 6mo-plus) but not fresher recency", () => {
    const stale = computeAuditScore({ rating: 4.5, reviewCount: 50, recency: "3-6mo" });
    expect(stale.findings.some((f) => f.includes("stale"))).toBe(true);

    const fresh = computeAuditScore({ rating: 4.5, reviewCount: 50, recency: "month" });
    expect(fresh.findings.some((f) => f.includes("stale"))).toBe(false);
  });

  it("flags 'unsure' recency as its own signal", () => {
    const result = computeAuditScore({ rating: 4.5, reviewCount: 50, recency: "unsure" });
    expect(result.findings.some((f) => f.includes("trickle in"))).toBe(true);
  });

  it("clamps an out-of-range rating rather than producing a negative or >40 component score", () => {
    const over = computeAuditScore({ rating: 7, reviewCount: 50, recency: "week" });
    const atMax = computeAuditScore({ rating: 5, reviewCount: 50, recency: "week" });
    expect(over.score).toBe(atMax.score);
  });

  it("never returns a score outside 0-100", () => {
    const min = computeAuditScore({ rating: 0, reviewCount: 0, recency: "6mo-plus" });
    const max = computeAuditScore({ rating: 5, reviewCount: 200, recency: "week" });
    expect(min.score).toBeGreaterThanOrEqual(0);
    expect(max.score).toBeLessThanOrEqual(100);
  });
});
