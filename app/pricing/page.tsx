import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { plans, replySeoAddOn, formatPrice } from "@/lib/plans";

const comparisonRows = [
  { outlets: "1 outlet", smartReviewer: 399, reviewLabs: 799 },
  { outlets: "5 outlets", smartReviewer: 1595, reviewLabs: 2395 },
  { outlets: "10 outlets", smartReviewer: 3090, reviewLabs: 4390 },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="px-6 py-16 text-center">
          <h1 className="text-display-xl text-wise-ink">Simple pricing, however many outlets you run.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-wise-body">
            Public prices, billed monthly. Cancel anytime. Yearly plans include two free
            months plus a QR standee and an NFC tap card.
          </p>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => {
              const featured = plan.id === "growth";
              return (
                <Card
                  key={plan.id}
                  className={
                    featured
                      ? "border-0 bg-wise-ink p-6 text-white"
                      : "p-6"
                  }
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-bold ${featured ? "text-white" : "text-wise-ink"}`}>
                      {plan.name}
                    </h3>
                    {featured && <Badge variant="default">Most picked</Badge>}
                  </div>
                  <div className="mt-4">
                    <span className={`text-3xl font-extrabold ${featured ? "text-wise-primary" : "text-wise-ink"}`}>
                      {formatPrice(plan.priceFirstOutlet, plan.currency)}
                    </span>
                    <span className={`text-sm ${featured ? "text-white/70" : "text-wise-mute"}`}>
                      {" "}/mo, first outlet
                    </span>
                  </div>
                  <p className={`mt-1 text-xs ${featured ? "text-white/60" : "text-wise-mute"}`}>
                    {formatPrice(plan.priceExtraOutlet, plan.currency)}/mo per extra outlet
                  </p>
                  <ul className="mt-6 flex flex-col gap-2 text-sm">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 size-4 shrink-0 ${featured ? "text-wise-primary" : "text-wise-positive"}`}
                        />
                        <span className={featured ? "text-white/90" : "text-wise-body"}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={featured ? "default" : i === 0 ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.id === "starter" ? "/dashboard" : "#"}>
                      {plan.id === "starter" ? "Start free for 30 days" : "Talk to us"}
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>

          <p className="mx-auto mt-6 max-w-[1200px] text-center text-sm text-wise-mute">
            {replySeoAddOn.name}: {formatPrice(replySeoAddOn.pricePerKeywordPerMonth, replySeoAddOn.currency)}
            /keyword/month. {replySeoAddOn.description}
          </p>
        </section>

        {/* Positioning + comparison table */}
        <section className="bg-card px-6 py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-display-md text-wise-ink">
              Priced between ₹399 tools and $300 suites.
            </h2>
            <p className="mt-3 max-w-2xl text-wise-body">
              It&apos;s the only option in that range that is compliant by design, recovers
              unhappy customers, and writes replies grounded in what the business actually
              changed.
            </p>

            <div className="mt-8 overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-wise-canvas-soft">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-wise-mute">Setup</th>
                    <th className="px-4 py-3 font-semibold text-wise-mute">SmartReviewer</th>
                    <th className="px-4 py-3 font-semibold text-wise-mute">ReviewLabs Starter</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.outlets} className="border-t border-foreground/5">
                      <td className="px-4 py-3">{row.outlets}</td>
                      <td className="px-4 py-3">₹{row.smartReviewer.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 font-semibold text-wise-ink">
                        ₹{row.reviewLabs.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-wise-mute">
              The gap stays at 1.4x to 2x instead of 3x to 5x. A recovery loop and policy
              safety justify the difference: SmartReviewer&apos;s AI-written, keyword-seeded
              reviews conflict with Google&apos;s 2026 policy, and ReviewLabs is the safe
              replacement.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
