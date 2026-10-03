// Pricing per reviewlabs.space.pdf > "Pricing and plans". Phase 1 wires
// Starter end-to-end; Growth/Agency/Global are listed here so the pricing
// page and dashboard upsell prompts have one shared source of truth.

export interface PlanDefinition {
  id: "starter" | "growth" | "agency" | "global";
  name: string;
  priceFirstOutlet: number;
  priceExtraOutlet: number;
  currency: "INR" | "USD";
  includes: string[];
}

export const plans: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    priceFirstOutlet: 799,
    priceExtraOutlet: 399,
    currency: "INR",
    includes: [
      "300 requests per outlet",
      "QR kit and printable standee",
      "ReviewLabs review page",
      "Recovery tickets and alerts",
      "Public review page",
      "Basic CRM",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceFirstOutlet: 1999,
    priceExtraOutlet: 699,
    currency: "INR",
    includes: [
      "1,000 requests per outlet",
      "AI reply drafts in 3 languages",
      "Auto-reply rules",
      "Fix log",
      "Themes and weekly digest",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    priceFirstOutlet: 599,
    priceExtraOutlet: 599,
    currency: "INR",
    includes: [
      "Everything in Growth",
      "White label",
      "Client billing",
      "Agency console",
      "25+ outlets",
    ],
  },
  {
    id: "global",
    name: "Global",
    priceFirstOutlet: 39,
    priceExtraOutlet: 89,
    currency: "USD",
    includes: ["Starter and Growth feature sets", "Priced for US, UK, UAE"],
  },
];

export const replySeoAddOn = {
  name: "Reply SEO add-on",
  pricePerKeywordPerMonth: 50,
  currency: "INR" as const,
  description:
    "Service and area keywords woven into owner replies, never into customer reviews.",
};

export function formatPrice(amount: number, currency: "INR" | "USD") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Consolidated monthly total across every outlet an agency owner has,
// regardless of which of their businesses each outlet belongs to — the
// "₹599/outlet" pricing PHASES.md describes for the Agency plan.
export function computeAgencyMonthlyTotal(totalOutlets: number, plan: PlanDefinition): number {
  if (totalOutlets <= 0) return 0;
  return plan.priceFirstOutlet + Math.max(0, totalOutlets - 1) * plan.priceExtraOutlet;
}

// Reply SEO add-on (PHASES.md Phase 3) total, from the keyword count a
// lib/reply-seo.ts caller already has in hand. Lives here, not in
// lib/reply-seo.ts, specifically so client components (the keyword-editor
// form) can import this pure function without pulling in that file's
// server-only Supabase data fetcher (next/headers) into the client bundle.
export function computeReplySeoMonthlyPrice(keywordCount: number): number {
  return Math.max(0, keywordCount) * replySeoAddOn.pricePerKeywordPerMonth;
}
