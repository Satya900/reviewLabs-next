# Phases — ReviewLabs

**Version:** 2.0
**Date:** July 14, 2026

---

## 1. Product overview

**Mission:** give the tech student community a free, no-signup-required place to practice spotting the bugs AI coding tools (Copilot, Cursor, Claude Code, ChatGPT) leave behind — hallucinated APIs, logic errors, security holes, race conditions, performance traps, wrong patterns, dependency/environment mismatches.

**Who it's for:** primarily students and early-career developers building interview-ready code review instincts. Practicing devs sharpening PR-review judgment are a secondary audience.

**Core principles — non-negotiable:**
- **Free forever.** No pricing tier, no paywall, ever.
- **Works with zero signup.** The core practice loop (browse → attempt → read explanation) never requires an account. Auth is additive, not a gate.
- **No fake numbers.** Stats shown on the site (challenge count, leaderboard, rewards) must reflect what's actually true right now — not aspirational totals. This document exists partly because the previous version of the plan drifted from that rule (landing page claimed "40+ challenges" while 7 existed).
- **Ship real features, not placeholders that look real.** A "coming soon" screen beats a leaderboard full of fake usernames.

This document replaces the original v1 planning set (PRD/Architecture/Design/Implementation/Phases written for a hard July 31, 2026 launch deadline). That deadline framing is gone — this is now an ongoing build, not a 17-day sprint. Phases below are sequenced by dependency, not by calendar day.

---

## 2. Where things actually stand today (July 14, 2026)

Built and working:
- Core challenge loop: browse, filter, attempt, submit, see explanation, localStorage progress — solid, no known bugs.
- Mock interview mode (3 random challenges, 10-minute combined timer, results + share) — functional.
- Landing page, challenge browser, about, rewards (static copy) pages.
- Design system (dark-only, black/white + neon semantic colors) — see Design.md.
- **40 challenges live** (5–6 per category, `data/challenges/`) — Phase 1 content target hit on July 14, 2026. Landing page stat is computed from `loadChallenges().length`, not hardcoded, so it can't drift from reality again.

Phase 1 (content depth) is done as of this write-up. The remaining phases below (2–5) are what's left.

Not yet real, despite scaffolding existing in the codebase:
- **Auth.** Supabase OAuth callback route and client/server helpers exist, but there is no "Sign in with GitHub" button anywhere in the UI. Nobody can actually sign in today.
- **Leaderboard.** Was previously rendering hardcoded fake users — now replaced with a "Coming Soon" placeholder until auth + a real scoring backend exist. Don't re-introduce mock data; wait for Phase 3 below.
- **Rewards.** Copy describes a live monthly program with specific prizes and rules. Treat this as a preview of intent, not a live promise, until Phase 4 actually ships it — revisit the copy before that's misleading to a real visitor.

---

## 3. Phase 1 — Content depth ✅ done (July 14, 2026)

**Goal:** enough real, high-quality challenges that the practice loop is worth a student's repeat visits.

- [x] Grow from 7 to 40 challenges, roughly balanced across all 7 categories (5–6 each, up from 1 each).
- [x] Each new challenge follows the existing JSON schema (`lib/challenges/schema.ts`) and the existing explanation structure (the bug / why AI generates this / the fix / review heuristic).
- [x] Difficulty distribution spot-checked — a mix of easy/medium/hard in every category, not defaulting to easy.
- [x] Landing page stat now computed from `loadChallenges().length` instead of hardcoded, so it can't drift from reality again.
- [x] Full `next build` passes — all 40 challenge pages statically generate, Zod schema validates cleanly, no duplicate ids/slugs.

**Why this came first:** auth and leaderboard are pointless without enough content to make repeat visits and competition meaningful. Content depth is the actual product; everything else is infrastructure around it.

**Next up:** Phase 2 (Auth) below — nothing else is blocking it now.

---

## 4. Phase 2 — Auth (GitHub sign-in) — code complete, pending live setup

**Goal:** a student can sign in with GitHub, and their progress follows them across devices. Signing in stays optional — the whole point of this platform is that practicing never requires it.

- [x] Built `AuthButton` in `Nav.tsx` — "Sign in with GitHub" when signed out, avatar + dropdown (sign out) when signed in. Wired into both the desktop nav and mobile drawer.
- [x] `AuthProvider` (`lib/supabase/AuthProvider.tsx`) wraps the app, tracks session state, and exposes `useAuth()`.
- [x] `supabase/migrations/0001_init.sql` — `profiles` + `attempts` schema, RLS policies, auto-profile-on-signup trigger.
- [x] `/api/attempts` (POST, session-validated, DB-backed rate limit) and `/api/attempts/bulk-import` (POST, idempotent per-slug) — both build cleanly and return 401 correctly when no session exists.
- [x] `useProgress()` hook unifies the progress source: Supabase for signed-in users (so it follows them across devices), `localStorage` for anonymous users — used by both the challenge browser and the challenge runner.
- [x] On `SIGNED_IN`, `AuthProvider` automatically migrates existing `localStorage` progress into Supabase via the bulk-import endpoint.
- [x] Non-blocking, dismissible "sign in to keep your progress across devices" banner added to the challenge browser.
- [x] `next build`, `tsc --noEmit` pass clean; all routes verified live (200) on the dev server.

**Not yet true:** none of this has run against a real Supabase project or GitHub OAuth app — those don't exist yet. The code is written to gracefully no-op in "mock mode" (current state) so the rest of the site keeps working, but the actual acceptance test below can't pass until the manual setup in `README.md` → "Auth setup" is done.

**Acceptance test (do this once real credentials are in `.env.local`):** sign out, complete 3 challenges anonymously, sign in with GitHub, confirm those 3 attempts now show up under your account (check the `attempts` table in Supabase), sign in on a second browser/incognito window and see the same progress.

---

## 5. Phase 3 — Real leaderboard

**Goal:** replace the "Coming Soon" placeholder with an actual leaderboard backed by real signed-in users' attempts. Do not build this before Phase 2 — a leaderboard with no real auth is just more mock data with extra steps.

- [ ] `/api/leaderboard` (GET) — queries Supabase for top performers this month, using the scoring formula already implemented in `lib/leaderboard/score.ts` (correct-first-try weighted by accuracy).
- [ ] `/leaderboard` page reads from that route (server component, cached briefly) instead of client-side mock data.
- [ ] Show the current signed-in user's rank even if they're outside the top 10.
- [ ] Keep the score formula visible and explained on the page — transparency matters for a competitive feature aimed at students.
- [ ] Launch threshold: don't flip this on until there are enough real signed-in users that a leaderboard isn't just "Satya, alone." A handful of real users beats zero fake ones.

---

## 6. Phase 4 — Rewards (only once users are actually here)

**Goal:** turn the leaderboard into something worth climbing, without overpromising before there's an audience.

- [ ] Once Phase 3 has real monthly activity, decide the first prize (matches the existing Rewards page tone: stickers, T-shirt, small dev gear — India shipping to start, matches Satya's stated budget ceiling).
- [ ] Update `/rewards` copy to describe the *current* month's real program, not placeholder specifics — pull the "This month's reward" block from data, not hardcoded JSX, so it doesn't silently go stale.
- [ ] Winner announcement flow: manual first (DM the winner via their GitHub-associated email), automate later if volume justifies it.
- [ ] Keep the reward budget small and sustainable — this is a free community tool, not a growth-hacking prize wheel.

---

## 7. Phase 5 — Growth & community

Deferred until Phases 1–4 are solid. See `Roadmap.md` for the full menu of ideas (community submissions, content formats, additional practice modes, SEO/content marketing, etc.) — that document is where new feature ideas get proposed and triaged, so this phases document doesn't need to be rewritten every time someone has an idea.

---

## 8. Sequencing rule

Don't skip ahead. Auth before leaderboard. Leaderboard before rewards. Content depth can run in parallel with all of it — it's the one workstream with no dependencies, so it should never stall waiting on the others.

If something has to slip, slip growth features, not the free/no-signup core loop. That loop is the actual product.
