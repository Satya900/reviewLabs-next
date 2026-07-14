# Roadmap — Ideas for improving ReviewLabs

**Version:** 1.0
**Date:** July 14, 2026

This is a living menu of ideas, not a committed backlog. When one of these gets scheduled, it moves into `Phases.md` with real acceptance criteria. Nothing here is promised to users. Keep additions honest about effort vs. payoff — this is a free, community-first tool built by one person; ruthless prioritization beats a long feature list.

---

## 1. Near-term, low-effort wins

Things that improve the existing loop without new infrastructure:

- ~~Compute the challenge count instead of hardcoding it.~~ Done in Phase 1 — the landing page now reads `loadChallenges().length`.
- **Fix the outstanding lint errors** (`MockRunner`'s function-declared-after-use, `setState`-in-`useEffect` in `Timer`, `ChallengeRunner`, `useProgress`, and the results page, stray `any`s in the Supabase/Shiki helpers). None are breaking today, but they're exactly the patterns the React Compiler will refuse once it's turned on. `ChallengeRunner`'s case is the textbook one: switch to `key={challenge.slug}` on the parent's render of `<ChallengeRunner>` so navigation remounts it instead of reset-via-effect.
- **Decide on `framer-motion`.** It's installed but unused anywhere in the app. Either spend an afternoon using it for the explanation-panel reveal / page transitions, or drop the dependency.
- **Decide on light mode.** The CSS has dead branches for it (`prefers-color-scheme`, `.light` class) that are currently overridden to always render dark. Either commit to dark-only and delete the dead code, or actually build it — half-wired is the worst of both.
- **A "why is the leaderboard/rewards page like this" note** isn't needed once Phase 2–4 in `Phases.md` ship, but until then, keep the Coming Soon and Rewards pages honest about what's live vs. planned.

---

## 2. Content & learning experience

The core value is the challenge content — most improvement ideas should serve that.

- **More answer formats.** Today every challenge is 4-option MCQ. Two formats from the original plan are still worth doing: line-highlight ("click the buggy line in the code") and free-text ("type the fix"). Line-highlight is probably the higher-leverage one — it tests actual bug-spotting instead of pattern-matching against 4 options.
- **Difficulty progression / skill tracking per category.** Students want to know "I'm weak at race-conditions" — the mock-interview results page already computes a "weak spot" from a 3-challenge sample; extend that logic to run across a user's full history once auth + real progress data exist.
- **A daily/weekly featured challenge** on the landing page — gives returning visitors a reason to come back without needing gamification bling (streaks, confetti) that the Design.md explicitly rules out.
- **Explanations sourced from real PR bugs.** The About page already claims challenges are "curated from real-world PR bugs" — if that's aspirational today, either make it literally true (screenshot-redacted real examples, with permission) or soften the claim.
- **Difficulty calibration pass** once there's real attempt data — some "easy" challenges may turn out hard in practice and vice versa; let data correct authoring intuition.

---

## 3. Student & community-specific features

Since the primary audience is the tech student community specifically:

- **College coding club packs.** A shareable "assign this set of 10 challenges to your club" link — zero backend needed if it's just a filtered `/challenges` URL with a curated slug list.
- **Community challenge submissions** (already flagged as "phase 4, not v1" in the original PRD — still true). Needs moderation tooling before it's safe to open up; don't rush this.
- **Study-group / pair-review mode.** Two students look at the same challenge and discuss before answering — no infra beyond a shared link with a synced session; could be a nice differentiator from solo-practice sites like LeetCode.
- **Printable/exportable "weak spots" summary** a student could bring to an interview-prep session or share with a mentor.
- **Discord or similar community space** — only once there's enough traffic to sustain it (mirrors the original plan's "Month 3" gate). A dead Discord is worse than no Discord.

---

## 4. Growth & distribution

- **SEO fundamentals** — unique meta/OG per challenge, sitemap (already scaffolded via `app/sitemap.ts`/`robots.ts`), structured data on challenge pages. High leverage for a free tool that lives or dies on organic discovery.
- **Shareable mock-interview results** — already exists; keep iterating on the share card design since it's the main viral loop.
- **Blog / short write-ups** on specific AI bug patterns (e.g. "why every AI agent gets `useEffect` cleanup wrong") — doubles as SEO content and as a way to preview new challenge categories before authoring the full interactive version.
- **A lightweight public API or embeddable widget** ("embed a ReviewLabs challenge of the day on your blog/README") — good long-term distribution lever, low priority until core content and auth are solid.

---

## 5. Technical health

- **Zod/schema validation stays strict** as content scales — the current fail-the-build-on-invalid-JSON behavior (`lib/challenges/loader.ts`) is good; keep it, but consider a `--report-all` dev mode that lists every invalid file instead of stopping at the first one, since authoring 40+ challenges means hitting validation errors often.
- **Rate limiting on `/api/attempts`** once it exists (Phase 2) — the original PRD called for max 10/minute per user; don't skip this when building the real endpoint, since leaderboard integrity depends on it.
- **Accessibility pass** once the UI stabilizes post-auth: keyboard nav through the full challenge flow, screen-reader labels on icon-only buttons, contrast check on the neon-on-black palette (thin amber/red text on near-black can get close to AA contrast limits — worth an explicit check, not an assumption).

---

## 6. Explicitly not doing (for now)

Carried forward from the original plan because the reasoning still holds:
- No pricing tier, ever — free forever is the whole premise.
- No AI/LLM integration in the product itself — all challenge content stays pre-authored and human-reviewed, since the product's credibility rests on the explanations being *correct*, not generated.
- No mobile app — responsive web is enough for this audience.
- No gamification bling (streaks, badges-for-badges'-sake, confetti) — conflicts with the "developer tool, not a quiz app" design brief in `Design.md`.
