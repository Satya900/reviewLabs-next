import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { AuditForm } from "@/components/audit/audit-form";

export const metadata: Metadata = {
  title: "Free review health audit",
  description:
    "Check your Google review rating, volume, and recency against what actually makes customers trust a local business.",
};

export default function AuditPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero — hero-band per DESIGN-wise.md: canvas-soft background,
            full treatment since this page's job is top-of-funnel lead gen. */}
        <section className="bg-wise-canvas-soft px-6 py-16 lg:py-24">
          <div className="mx-auto grid max-w-[1100px] items-start gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <Badge variant="secondary" className="mb-6">
                Free, no account needed
              </Badge>
              <h1 className="text-display-xl text-wise-ink">How healthy is your Google review profile?</h1>
              <p className="mt-6 max-w-xl text-lg text-wise-body">
                Enter your current rating, review count, and when your last review came in.
                You&apos;ll get a score out of 100 and a few specific things to fix, right now,
                no sign-up.
              </p>
            </div>
            <AuditForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
