import { describe, expect, it } from "vitest";
import { formatPrice, plans } from "./plans";

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
