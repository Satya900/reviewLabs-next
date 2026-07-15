# Memory — session handoff log

**Purpose:** a running log of what's actually been done and what's next, so a new session (or a new person) can resume without re-deriving context. This is a changelog, not a spec — for the living product docs, see `Phases.md` (roadmap), `Design.md` (design system as built), `Roadmap.md` (feature ideas). Update this file at the end of each work session.

**Last updated:** July 16, 2026

---

## Where things stand right now

- **Live deployment:** https://reviewlabs-next.vercel.app — one-off `vercel --prod` CLI deploy, working, all pages return 200. Vercel project: `satyabrata-mohantys-projects/reviewlabs-next`. Production domain `https://reviewlabs.space` is the target but its Vercel/GitHub connection status wasn't confirmed in this session — check before assuming it's live.
- **GitHub:** not pushed yet as of last check. Local git repo is initialized and committed (root commit `4e14a50`, 102 files) but has no remote configured. Satya is pushing manually and connecting the repo to the Vercel deployment himself.
- **Auth:** Phase 2 is now **live and tested**, not just code-complete. Supabase project created (`fkyznamwsnynatxciciy.supabase.co`), `0001_init.sql` migration run (profiles + attempts tables, RLS, auto-profile trigger all working), GitHub OAuth app registered and connected to Supabase's GitHub provider. Tested end-to-end via an ngrok tunnel (`https://damion-unperpetuated-inaccurately.ngrok-free.dev`): sign-in works, avatar shows in nav, challenge attempts are recording into the Supabase `attempts` table instead of `localStorage`. Cross-device sync and anon→signed-in progress migration were flagged as worth double-checking but not explicitly confirmed yet.
- **Content:** 40 challenges live across 7 categories (Phase 1 done).
- **Design:** full rebrand from the original dark/black "developer tool" look to a Notion-derived light/warm-paper system (v3.0 of `Design.md`). Verified visually in-browser, not just compiled.

---

## What's been done, in order

1. **Initial audit** — found the git repo was rooted at the entire home directory (`C:/Users/mohan`) instead of this project, a mocked/fake leaderboard, no working auth UI despite auth scaffolding existing, only 7 of a claimed "40+" challenges, and several real lint errors (`ChallengeBrowser` `any` cast, `MockRunner` declared-before-use, `setState`-in-`useEffect` in a few places, stray `any`s in Supabase/Shiki helpers).
2. **Planning reset** — deleted the old deadline-driven PRD/Architecture/Design/Implementation/Phases docs, replaced with `Design.md`, `Phases.md`, `Roadmap.md` reflecting reality (free forever, student-focused, no fake numbers). Leaderboard page replaced with an honest "Coming Soon" screen (mock data deleted).
3. **Phase 1 — Content depth** — authored 33 new challenges (7 → 40 total, 5–6 per category), all schema-validated and build-verified. Landing page stats now computed from `loadChallenges().length` instead of hardcoded.
4. **Phase 2 — Auth (code complete, not live)** — built `AuthProvider`/`useAuth`, `AuthButton` in the nav, `supabase/migrations/0001_init.sql` (profiles + attempts schema, RLS, auto-profile trigger), `/api/attempts` + `/api/attempts/bulk-import` routes, unified `useProgress()` hook (Supabase when signed in, localStorage when anonymous), a dismissible sign-in banner on the challenge browser, and a full "Auth setup" walkthrough in `README.md` + `.env.example`. **Not yet tested against a real backend** — no Supabase project or GitHub OAuth app exists yet.
5. **Auth method discussion** — Satya asked about dropping GitHub OAuth for a basic email/password signup form. Recommendation given: keep GitHub as the primary path (it's the anti-farming mechanism the leaderboard design depends on — "GitHub required, no fake accounts"), optionally add email/password as a *second* option later rather than replacing GitHub. **No decision made, no code changed** — still GitHub-only as built in Phase 2.
6. **Full design rebrand** — ingested `DESIGN-notion.md` (a design-system analysis of Notion's marketing site) and did a full-site visual replacement: warm off-white canvas, white cards, near-black Inter type (dropped Instrument Serif entirely), single blue structural accent (`#0075de`) reserved for CTAs/links only, a decorative "sticker" palette (purple/teal/orange/green/brown) mapped to the 7 challenge categories, pill-shaped CTAs vs. tighter 8px utility buttons, barely-there hairline+soft-shadow elevation. Code blocks deliberately stayed dark (the one carryover rule from the old system). Fixed three latent bugs while at it: `bg-surface-card`, `bg-surface-elevated`, and `text-stone` were referenced across ~50+ call sites but never actually defined in `@theme` — silently no-op on the old black canvas, now real tokens. Verified in-browser via screenshots (had to restart the dev server once — Turbopack was serving a stale CSS cache).
7. **Git + deploy** — fixed the git scoping (new repo `git init`'d inside `reviewlabs-next` itself, separate from the home-root repo), made the initial commit, deployed via `vercel --prod` CLI. GitHub push and Vercel↔GitHub connection left to Satya to do manually (in progress as of this log).

---

## Immediate next steps (priority order)

1. **Satya finishes the GitHub push + connects the repo to Vercel** (in progress) — once done, add the Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) to the Vercel project settings whenever step 2 below is done, so production auth isn't stuck in mock mode forever.
2. **Live Supabase + GitHub OAuth setup** — follow `README.md` → "Auth setup" (create Supabase project, run `supabase/migrations/0001_init.sql`, register a GitHub OAuth app, connect it in Supabase, fill `.env.local`). This is the actual blocker on Phase 2 being real instead of just code-complete.
3. **Resolve the auth-method question** (see item 5 above) — decide GitHub-only vs. GitHub + email/password, before building anything further on top of auth.
4. **Phase 3 — Real leaderboard** (per `Phases.md`) — don't start this before step 2 is live; a leaderboard needs real signed-in users to mean anything.

---

## Known debt (tracked in `Roadmap.md`, not urgent)

- Lint-only issues: `MockRunner`'s function-declared-after-use, `setState`-in-`useEffect` pattern in `Timer`/`ChallengeRunner`/`useProgress`/the mock-results page, a few stray `any`s. None break the build; worth cleaning up before the React Compiler is ever turned on.
- `framer-motion` is installed but unused — decide to use it or drop it.
- The Rewards page still describes a program with specific live-sounding details (this month's prize, rules) even though rewards are explicitly deferred until Phase 4 — flagged once, not yet softened, since Satya didn't ask for that change specifically.
