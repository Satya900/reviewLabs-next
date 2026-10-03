import { describe, expect, it } from "vitest";
import { computeAvgStars, computeSlaCompliancePct } from "./outlet-comparison";

describe("computeAvgStars", () => {
  it("averages a list of star ratings", () => {
    expect(computeAvgStars([{ stars: 5 }, { stars: 3 }, { stars: 4 }])).toBeCloseTo(4, 5);
  });

  it("returns null for an empty list rather than NaN", () => {
    expect(computeAvgStars([])).toBeNull();
  });

  it("handles a single rating", () => {
    expect(computeAvgStars([{ stars: 2 }])).toBe(2);
  });
});

describe("computeSlaCompliancePct", () => {
  const now = new Date("2026-10-03T12:00:00.000Z").getTime();

  it("returns null when there are no SLA-eligible tickets", () => {
    // Still open, deadline hasn't passed yet — not eligible either way.
    const tickets = [
      { status: "open", sla_due_at: "2026-10-04T12:00:00.000Z", resolved_at: null },
    ];
    expect(computeSlaCompliancePct(tickets, now)).toBeNull();
  });

  it("counts a resolved-before-deadline ticket as compliant", () => {
    const tickets = [
      {
        status: "resolved",
        sla_due_at: "2026-10-03T10:00:00.000Z",
        resolved_at: "2026-10-03T09:00:00.000Z",
      },
    ];
    expect(computeSlaCompliancePct(tickets, now)).toBe(100);
  });

  it("counts a resolved-after-deadline ticket as non-compliant", () => {
    const tickets = [
      {
        status: "resolved",
        sla_due_at: "2026-10-03T08:00:00.000Z",
        resolved_at: "2026-10-03T09:00:00.000Z",
      },
    ];
    expect(computeSlaCompliancePct(tickets, now)).toBe(0);
  });

  it("counts a still-open ticket past its deadline as non-compliant", () => {
    const tickets = [
      { status: "open", sla_due_at: "2026-10-02T12:00:00.000Z", resolved_at: null },
    ];
    expect(computeSlaCompliancePct(tickets, now)).toBe(0);
  });

  it("excludes a still-open ticket within its deadline from the denominator", () => {
    const tickets = [
      {
        status: "resolved",
        sla_due_at: "2026-10-03T10:00:00.000Z",
        resolved_at: "2026-10-03T09:00:00.000Z",
      },
      // Not yet due — shouldn't count against the outlet.
      { status: "open", sla_due_at: "2026-10-05T12:00:00.000Z", resolved_at: null },
    ];
    expect(computeSlaCompliancePct(tickets, now)).toBe(100);
  });

  it("computes a mixed compliance percentage", () => {
    const tickets = [
      { status: "resolved", sla_due_at: "2026-10-03T10:00:00.000Z", resolved_at: "2026-10-03T09:00:00.000Z" }, // compliant
      { status: "resolved", sla_due_at: "2026-10-03T08:00:00.000Z", resolved_at: "2026-10-03T09:00:00.000Z" }, // missed
      { status: "open", sla_due_at: "2026-10-02T12:00:00.000Z", resolved_at: null }, // overdue, missed
      { status: "resolved", sla_due_at: "2026-10-03T11:00:00.000Z", resolved_at: "2026-10-03T10:00:00.000Z" }, // compliant
    ];
    expect(computeSlaCompliancePct(tickets, now)).toBe(50);
  });
});
