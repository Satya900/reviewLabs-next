import { describe, expect, it } from "vitest";
import { computeAgencyMonthlyTotal, computeReplySeoMonthlyPrice, formatPrice, plans, replySeoAddOn } from "./plans";

const agencyPlan = plans.find((p) => p.id === "agency")!;

describe("formatPrice", () => {
  it("formats INR with no decimal places", () => {
    expect(formatPrice(799, "INR")).toBe("₹799");
  });

  it("formats USD with no decimal places", () => {
    expect(formatPrice(39, "USD")).toBe("$39");
  });

  it("formats larger INR amounts with Indian digit grouping", () => {
    expect(formatPrice(199900, "INR")).toBe("₹1,99,900");
  });
});

describe("plans", () => {
  it("includes exactly the four documented tiers", () => {
    expect(plans.map((p) => p.id)).toEqual(["starter", "growth", "agency", "global"]);
  });

  it("prices the Starter plan per the PRD (₹799 first outlet, ₹399 extra)", () => {
    const starter = plans.find((p) => p.id === "starter");
    expect(starter?.priceFirstOutlet).toBe(799);
    expect(starter?.priceExtraOutlet).toBe(399);
    expect(starter?.currency).toBe("INR");
  });

  it("prices Global in USD for the US/UK/UAE markets", () => {
    const global = plans.find((p) => p.id === "global");
    expect(global?.currency).toBe("USD");
  });
});

describe("computeAgencyMonthlyTotal", () => {
  it("returns 0 for zero outlets", () => {
    expect(computeAgencyMonthlyTotal(0, agencyPlan)).toBe(0);
  });

  it("returns exactly priceFirstOutlet for a single outlet", () => {
    expect(computeAgencyMonthlyTotal(1, agencyPlan)).toBe(agencyPlan.priceFirstOutlet);
  });

  it("computes the first-outlet-plus-extras total at the PRD's 25-outlet threshold", () => {
    expect(computeAgencyMonthlyTotal(25, agencyPlan)).toBe(599 + 24 * 599);
  });

  it("is exactly 599 * totalOutlets for the Agency tier specifically, since its first and extra prices are equal", () => {
    expect(agencyPlan.priceFirstOutlet).toBe(agencyPlan.priceExtraOutlet);
    for (const n of [1, 5, 25, 50]) {
      expect(computeAgencyMonthlyTotal(n, agencyPlan)).toBe(599 * n);
    }
  });
});

describe("computeReplySeoMonthlyPrice", () => {
  it("is 0 for zero keywords", () => {
    expect(computeReplySeoMonthlyPrice(0)).toBe(0);
  });

  it("matches the PRD's ₹50/keyword/month rate", () => {
    expect(replySeoAddOn.pricePerKeywordPerMonth).toBe(50);
    expect(computeReplySeoMonthlyPrice(1)).toBe(50);
    expect(computeReplySeoMonthlyPrice(5)).toBe(250);
  });

  it("clamps a negative count to 0 rather than returning a negative price", () => {
    expect(computeReplySeoMonthlyPrice(-3)).toBe(0);
  });
});
