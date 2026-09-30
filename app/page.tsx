import Link from "next/link";
import { QrCode, ShieldCheck, MessageSquareText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { mockPublicRatings } from "@/lib/mock-data";

const segments = [
  {
    title: "Single clinics, salons, cafes",
    detail: "One bad review costs real bookings.",
    plan: "Starter",
  },
  {
    title: "Chains and franchises, 3 to 50 outlets",
    detail: "Compare outlets, standardize replies, catch problems per location.",
    plan: "Growth",
  },
  {
    title: "Local marketing agencies",
    detail: "Resell under your own brand to clients.",
    plan: "Agency",
  },
  {
    title: "US, UK, UAE small businesses",
    detail: "A self-serve alternative to $300+ tools, coming soon.",
    plan: "Global",
  },
];

const steps = [
  {
    icon: QrCode,
    title: "Collect",
    body: "One QR code, email, or WhatsApp link per customer. The Google button and the private feedback option sit side by side at every rating, every time.",
  },
  {
    icon: ShieldCheck,
    title: "Recover",
    body: "A rating under 4 stars opens a ticket automatically. The owner gets alerted, the fix gets logged, and nothing sits unread in a group chat.",
  },
  {
    icon: MessageSquareText,
    title: "Reply",
    body: "AI drafts a reply to every Google review using what the business actually knows, like the fix it made or the ticket it closed, and the owner publishes it in one tap.",
  },
];

const neverDoes = [
  "Hide the Google option from customers who rate you low",
  "Write a review for a customer",
  "Offer rewards in exchange for reviews",
  "Hide low ratings on your public review page",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero — hero-band per DESIGN-wise.md: canvas-soft background, display-mega headline */}
        <section className="px-6 py-16 lg:py-24">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge variant="secondary" className="mb-6">
                For clinics, salons, and chains that live or die by their Google rating
              </Badge>
              <h1 className="text-display-mega text-wise-ink">
                More Google reviews.{" "}
                <span className="block">Faster fixes for unhappy customers.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-wise-body">
                ReviewLabs helps local businesses get more Google reviews, catch unhappy
                customers before they post in public, and reply to every review in minutes,
                without review gating or AI-written reviews: the two tactics Google now
                penalizes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    Start free for 30 days <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
            </div>

            {/* Signature interactive card, standing in for the currency-converter-card slot */}
            <Card className="border border-wise-ink/10 p-6">
              <p className="text-sm font-semibold text-wise-mute">Live preview: reviewlabs.space/r/smile-studio</p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-wise-canvas-soft py-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="text-3xl">
                    {n <= 5 ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-wise-body">
                How was your visit today?
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="default" size="sm">
                  Post on Google
                </Button>
                <Button variant="outline" size="sm">
                  Tell us privately
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Problem framing */}
        <section className="bg-card px-6 py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-display-md text-wise-ink">
              Reviews decide who gets picked, and the bar keeps rising.
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-wise-body">
              41% of consumers now always read reviews before choosing a local business, up
              from 29% a year ago. 31% only use businesses rated 4.5 stars or higher. Google&apos;s
              April 2026 policy update banned the two shortcuts most review tools were built
              around: gating out unhappy customers, and writing reviews with AI. ReviewLabs
              doesn&apos;t need either one. It collects real reviews, tracks the fix when something
              goes wrong, and drafts replies that reference what the business actually did.
            </p>
          </div>
        </section>

        {/* Three things it does */}
        <section id="how-it-works" className="px-6 py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-display-md text-wise-ink">Three things ReviewLabs does</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <Card key={step.title} className="bg-wise-canvas-soft p-6">
                  <step.icon className="size-8 text-wise-ink-deep" strokeWidth={1.75} />
                  <h3 className="mt-4 text-xl font-bold text-wise-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-wise-body">{step.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What ReviewLabs never does */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1200px] rounded-xl bg-wise-ink px-8 py-12 text-wise-primary">
            <h2 className="text-display-md text-white">What ReviewLabs never does</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {neverDoes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-wise-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Who it's for */}
        <section id="who-its-for" className="bg-card px-6 py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-display-md text-wise-ink">Who it&apos;s for</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {segments.map((segment) => (
                <Card key={segment.title} className="p-6">
                  <Badge variant="positive">{segment.plan} plan</Badge>
                  <h3 className="mt-4 font-bold text-wise-ink">{segment.title}</h3>
                  <p className="mt-2 text-sm text-wise-body">{segment.detail}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Public review proof, sourced from the public review page data shape */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-display-md text-wise-ink">Every review, good or bad, stays public</h2>
            <p className="mt-2 text-wise-body">A live look at reviewlabs.space/reviews/smile-studio-dental.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {mockPublicRatings.map((r) => (
                <Card key={r.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                    <span className="text-xs text-wise-mute">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-wise-body">{r.public_comment}</p>
                  <p className="mt-2 text-xs font-semibold text-wise-mute">{r.customer_initial}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="bg-wise-canvas-soft px-6 py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 rounded-xl bg-card p-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-display-md text-wise-ink">
                Priced for a single clinic. Built to scale to fifty.
              </h2>
              <p className="mt-2 max-w-xl text-wise-body">
                Starter plans start at ₹799 a month for your first outlet. Pay monthly and
                cancel anytime, no annual contract required.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/pricing">
                See full pricing <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
