# ReviewLabs — 5-Phase Build Plan

Source: `reviewlabs.space.pdf` (Product Document, Sep 30 2026) · Design system: `DESIGN-wise.md`

This plan maps the PRD's three releases (v1/v2/v3) and its roadmap milestones (Week 1 → Month 12) into five build phases. Every phase that ships user-facing copy — landing page, empty states, onboarding, reply templates, pricing page — ends with a **humanizer pass** (`/anthropic-skills:humanizer`) before that copy goes live. Nothing here has been built yet; this is the plan, not a status report.

---

## Phase 1 — Foundation & the Collect/Recover Loop
**Weeks 1–6 · maps to PRD "v1 Collect and recover" · No Google API required**

### Goal
Stand up the stack, get 10 pilot outlets (Bengaluru dental/skin clinics) live on free 30-day trials, and prove the core loop: customer rates → happy path to Google, unhappy path to a private ticket the owner can close.

### Build tasks
- **Infra**: Next.js (App Router, TypeScript) + Tailwind + shadcn/ui, installable PWA shell. Supabase project (Postgres + RLS, Auth, Queues, pg_cron, Edge Functions, Vault, Storage). Cloudflare Turnstile, Sentry, PostHog wired in from day one.
- **Week 1 milestone**: apply for Google Business Profile API access (long lead time — start immediately even though v1 doesn't need it); register `reviewlabs.space` transactional email sending (Brevo primary, Resend overflow).
- **Collection surfaces**: QR code generator + printable standee artwork; email request flow with one reminder; WhatsApp click-to-chat links. All three point to one ReviewLabs page.
- **ReviewLabs review page** (`reviewlabs.space/r/{business}`): 1–5 star rating, two equal-weight buttons (Google / private) shown at every rating — never hide the Google option from low raters (hard product rule). Private path asks 2–3 short follow-up questions.
- **Recovery loop**: ratings under 4 open a ticket, alert the owner via Web Push, start an SLA timer. Owner dashboard has a "fix it" flow that logs the resolution outcome.
- **Public review page** (`reviewlabs.space/reviews/{business}`): structured data (schema.org Review/AggregateRating), shows all ratings including low ones — never hidden.
- **Owner dashboard (v1 shape)**: phone-first, one queue (open tickets) to start; basic CRM for saved ratings ≥4 with no text.
- **Billing**: Razorpay Subscriptions wired for the Starter plan (₹799/mo first outlet, ₹399/extra outlet).

### Design system application (per `DESIGN-wise.md`)
- Marketing landing page (`reviewlabs.space`) as a `hero-band` on `canvas-soft`, headline in `display-xl`/`display-mega` Wise Sans 900, single lime-green `button-primary` CTA ("Start free trial" / "Get my QR code").
- Customer-facing review page: large touch targets (≥48px per the spacing/touch-target spec), `button-primary` for the 1–5 star action, `card-content` white card on sage canvas for the follow-up questions.
- Owner dashboard ticket cards use `card-feature-sage` for open tickets, `badge-negative` for unresolved/overdue SLA, `badge-positive` once a fix is logged.
- Pricing section reuses `ex-pricing-tier` / `ex-pricing-tier-featured` (Starter as default tier, Growth as the polarity-flipped featured tier once Phase 2 pricing exists).

### Copy that needs a humanizer pass before launch
Landing page hero/subhead, pricing table copy, QR standee microcopy, review-page prompts ("How was your visit today?"), ticket/empty-state copy in the dashboard. Run each through `/anthropic-skills:humanizer` after drafting — this is new copy, not a cleanup of anything live.

### Exit criteria
10 pilot outlets live and collecting. Google button shown at every rating with zero exceptions logged. Recovery tickets closing with an owner-entered fix note.

---

## Phase 2 — The Reply Engine & Google Sync
**Weeks 7–10 · maps to PRD "v2 Reply" · Google API required**

This is the PRD's stated differentiator: replies grounded in the business's own fix log and closed tickets, not generic apologies.

### Build tasks
- Google Business Profile OAuth connect per outlet; Cloud Pub/Sub subscription for new-review events; live review sync into Supabase.
- Match incoming Google reviews back to the request that generated them (QR/email/WhatsApp send → review correlation).
- AI reply drafting via the router: Z.ai GLM-4.7-Flash first, falling back to Qwen3-32B on Cerebras, then Qwen3-32B on Groq. Drafts read the fix log and closed-ticket outcomes as grounding context so a reply can truthfully reference a real change ("we moved to staggered slots this month").
- Languages: English, Hindi, Kannada.
- Approval rules engine: owner sets thresholds for what auto-publishes vs. what needs a tap-to-approve; 5-star reviews with no text can auto-reply without a human step.
- Owner dashboard grows to its full three-queue shape: tickets to fix, reply drafts to approve, weekly digest preview.

### Design system application
- Reply-approval cards: `card-content` with the draft reply in `body-md`, a `button-primary` "Publish" and `button-tertiary` "Edit" side by side — matches the Wise pattern of one dominant lime action against a neutral secondary.
- Language toggle as a small `nav-link`-style segmented control, not a new accent color (per the "no second brand accent" rule).
- Auto-reply status surfaces as `badge-positive` ("Auto-replied") vs `badge-negative` ("Needs approval") consistent with Phase 1's ticket badges.

### Copy needing a humanizer pass
The AI reply *templates and guardrail prompts* themselves are the product's core deliverable, not marketing copy — but any canned fallback reply text, onboarding copy for the "connect your Google profile" flow, and approval-rule explainer text should go through humanizer once drafted, since this is the first time customer-facing AI-generated text (the reviews the owner reads back) appears in the product.

### Exit criteria
Week 10 milestone: v2 live, Google sync and AI replies running for all active pilots. Reply drafts consistently reference real fix-log entries, not generic language.

---

## Phase 3 — Growth Intelligence & Multi-Outlet
**Weeks 11–16 · maps to PRD "v3 Grow" · Google API partially required**

### Build tasks
- Feedback theme tagging (clustering private-feedback text into recurring complaint/praise themes) and a weekly digest email/push summarizing them per outlet.
- Multi-outlet comparison views for the Multi-location plan (3–50 outlets): side-by-side rating trends, ticket volume, SLA compliance.
- Agency console: white-label branding, per-client outlet grouping, consolidated billing for the Agency plan (₹599/outlet at 25+ outlets).
- Reply SEO add-on (₹50/keyword/month): service/area keywords woven into *owner* replies only — the PRD is explicit this must never touch customer-submitted reviews.
- Inbound webhook for billing/booking tool integrations.
- Free review-health audit page — a lead-gen tool, not gated behind login, that scores a business's existing Google review health.

### Design system application
- Multi-outlet comparison table uses `ex-data-table-cell` (mono-caps eyebrow header, `body-sm` rows, `canvas-soft` header background) — the Wise system's documented data-table pattern.
- Agency console reuses `ex-app-shell-row` for client/outlet sidebar navigation with the lime `activeIndicator`.
- Weekly digest email template: `content-band` white section on the marketing-site equivalent, keeping the same Wise Sans/Inter pairing used everywhere else so the product feels like one brand end to end.
- Free audit page is itself a marketing surface — full `hero-band` treatment, since its job is top-of-funnel lead gen.

### Copy needing a humanizer pass
Weekly digest narrative text (the "what customers praised/complained about" summary), agency console onboarding copy, and — critically — the free review-health audit page's result copy, since that page is public-facing and often a prospect's first contact with the product. Draft, then humanize, before it's indexed by Google.

### Exit criteria
Week 16 milestone: 10 paying outlets, one agency on a paid pilot. Theme tagging producing digests pilot owners actually open (tracked — this is one of the day-90 kill-criteria signals).

---

## Phase 4 — Commercial Launch & the Day-90 Decision
**Weeks 17–26 (through the PRD's Day-90 checkpoint and toward Month 6)**

This phase is less "new features," more "prove the business," matching the PRD's own kill-criteria framing.

### Build tasks
- Finish the public marketing site properly: full competitor-positioning section (SmartReviewer AI, Advizr Media, ReviewPilot, Famepilot, Birdeye, NiceJob comparisons), the "priced between ₹399 tools and $300 suites, compliant by design" positioning statement, and the pricing page with the Starter/Growth/Agency/Reply-SEO tiers plus the yearly-plan QR-standee-and-NFC-card bundle incentive.
- Direct-sales motion: outbound to Bengaluru dental/skin clinics (the launch wedge), agency outreach for the first paid pilot.
- Resolve the `reviewlabs.space` domain conflict flagged in the PRD's risk table (it was earlier earmarked for "Paylane") — confirm domain ownership before printing any more QR standees.
- Instrument the three kill-criteria metrics directly in the dashboard/analytics so the day-90 decision is a number lookup, not a guess: outlets paying, % of pilot owners opening recovery alerts weekly, agency paid-pilot status.

### Design system application
- Competitor comparison table: same `ex-data-table-cell` pattern from Phase 3, reused for brand consistency rather than inventing a new table style.
- Pricing page promotional annual-plan card gets the `card-feature-dark` treatment (ink background, lime-green text) — the Wise system reserves this polarity-flip specifically for promotional moments, which the yearly-plan incentive is.
- Positioning statement lives in a `content-band` directly under the pricing table, `display-md` headline, no more than the system's one lime CTA per section.

### Copy needing a humanizer pass
This is the heaviest copy phase: full marketing site (competitor comparisons, pricing page, positioning statement, outbound sales scripts/email templates). All of it should be drafted and then run through `/anthropic-skills:humanizer` before publishing — this is the first content actual prospects and Google's crawlers will read at volume, so it's the highest-stakes place for AI-sounding text to slip through.

### Exit criteria (the PRD's own kill/pivot test — apply it literally at day 90)
**Kill or pivot if**: fewer than 10 outlets pay, fewer than 30% of pilot owners open recovery alerts weekly, or no agency has agreed to a paid pilot. If none of those trip, continue to Phase 5.

---

## Phase 5 — Scale, Defend, Expand
**Month 6 → Month 24 · toward the PRD's Base/Bull growth scenarios**

### Build tasks
- Push toward the Month 12 milestone of 200 paying outlets; track against the PRD's Bear (15/60/180 outlets)/Base (40/200/700)/Bull (80/500/2,000) scenarios at months 6/12/24.
- Global plan: $39/$89-per-outlet tiers for US/UK/UAE, reusing the Starter/Growth feature sets — this is a pricing/localization exercise, not new core product.
- Defensibility work directly answering the PRD's named "biggest outside threat" (Google building its own request/QR/alert tools into Business Profile natively): deepen the recovery loop, context-aware reply quality, and multi-outlet reporting, since the PRD's own bet is Google won't build those for small businesses.
- Agency channel scaling toward the Bull scenario's "15+ agencies reselling."
- Monitor the named risk items continuously rather than one-time: free AI/email tier shrinkage (adapters already isolated in `lib/` per the PRD's stated mitigation, paid fallbacks costing cents/1,000 calls), SMB churn (target: keep under the 3–5%/month the PRD models, via yearly plans + the "customers recovered" monthly report), and founder time-split (the PRD explicitly time-boxes this to a 90-day test — revisit at each subsequent checkpoint).

### Design system application
- Localized (US/UK/UAE) marketing pages reuse every token as-is — the Wise system's whole point is one consistent brand voice, so international pages should not reskin, only retranslate.
- "Customers recovered" monthly report (the churn-mitigation deliverable named in the PRD's risk table) uses the same `content-band` + `badge-positive` pattern already established in Phase 1/2, giving owners a familiar visual language for their retention-driving artifact.

### Copy needing a humanizer pass
Localized marketing copy per region (US/UK/UAE — tone and idiom differ, so this isn't a straight translation), the recurring "customers recovered" report narrative, and agency-facing white-label sales collateral. Treat each new region/report template as new copy requiring its own humanizer pass, not a one-time global fix.

### Exit criteria
Track monthly against the Base scenario (₹1,000 blended revenue/outlet, 40 outlets by month 6, 200 by month 12, 700 by month 24). Re-run the kill-criteria-style check at each milestone: is churn under control, is the agency channel actually producing signed clients, is Google's native feature rollout eating the product's reason to exist.

---

## Cross-phase notes

- **Design consistency**: every phase reuses the same ~10 Wise-derived component tokens (`button-primary`, `card-content`/`card-feature-*`, `badge-positive`/`badge-negative`, `hero-band`, `content-band`, `ex-data-table-cell`) rather than introducing new visual language per feature. That's the point of having `DESIGN-wise.md` — treat it as the single source of truth for every UI decision across all 5 phases, not just the marketing site.
- **Humanizer is a gate, not a one-time task**: any time new user-facing copy is drafted in any phase — dashboard microcopy, marketing pages, reply templates, reports — draft it, then run `/anthropic-skills:humanizer` on it before it ships. Since there is no existing website content today, there's nothing to retroactively fix; the discipline is to never let undoctored AI-drafted copy reach a live surface in the first place.
- **The v1/v2/v3 PRD releases map to Phases 1–3**; Phases 4–5 are this plan's addition, turning the PRD's roadmap/outlook/risk sections into concrete phases rather than leaving them as narrative.
