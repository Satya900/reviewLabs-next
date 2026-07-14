# Design — ReviewLabs (as built)

**Version:** 3.0 — full rebrand from the dark-only "developer tool" system to a Notion-derived light design system. Documents what's actually shipped, not an aspirational spec.
**Date:** July 15, 2026

---

## 1. What changed and why

Version 2.0 of this document described a pure-black, dark-only, white-accent aesthetic. That's gone. The site now runs a light, warm-paper design system adapted from an analysis of Notion's marketing site (source: `DESIGN-notion.md`), because the product needed to feel less like a terminal and more like an inviting, readable practice space — closer to a well-organized desk in daylight than a code editor at night.

**One deliberate carry-over from the old system:** code blocks stay dark, always, regardless of the light page around them. Notion's own system doesn't define code display (their marketing site has none), so this is ReviewLabs' own rule, kept because it works — a dark editor window on a light page reads as "real code," not themed content.

Update this file whenever the visual system changes again. A design doc that lies is worse than no design doc — that was the whole reason v2.0 existed, and the same discipline applies here.

---

## 2. Design brief

ReviewLabs should feel like a calm, well-organized place to practice — confident but not cold, readable first, decorated second.

**Feels like:** a warm paper document, quietly confident, one clear accent, personality carried by color used sparingly and deliberately.
**Does not feel like:** a terminal, a SaaS dashboard, a bootcamp landing page, or a page that paints every action in a different color.

---

## 3. Color system (`app/globals.css`)

No dark mode currently — this is a single light theme, forced consistently (the old dark-only forcing pattern is now a light-only forcing pattern, same mechanism, flipped values).

```css
/* Surfaces */
--bg-canvas:          #f6f5f4   /* warm paper page background */
--bg-surface:         #ffffff   /* white — nav, cards, inputs */
--bg-surface-card:    #ffffff   /* same white, used explicitly by card components */
--bg-surface-elevated: #faf9f8  /* subtle warm-grey tint for hover states */
--bg-code:            #0d1117   /* code blocks — always dark, never themed */

/* Ink scale */
--text-primary:   rgba(0,0,0,0.95)
--text-secondary: #31302e
--text-tertiary:  #615d59
--text-faint:     #a39e98
--text-inverse:   #ffffff       /* text on the blue accent button */

/* Hairlines */
--border-subtle:  #e6e6e6
--border-default: #dddddd
--border-strong:  #c2c2c2

/* Accent — the single structural color */
--accent-primary: #0075de
--accent-hover:   #005bab

/* Reserved for a single dark hero "night" moment, not yet used on a page */
--secondary: #213183

/* Semantic — doubles as the "sticker" decorative source */
--success: #1aae39   /* also Notion's sticker green */
--danger:  #dc2626    /* standard red; Notion's own system has no dedicated danger color */
--warning: #dd5b00    /* also Notion's sticker orange */
```

### The one hard rule
`--accent-primary` (#0075de) is reserved for structural actions only: primary CTAs, links, focus/selection states. It never appears decoratively. This is carried over directly from the source analysis and is the single most important discipline in the system — breaking it is what makes a "one accent color" system stop working.

### Decorative sticker palette
Category tags and landing-page category icons pull from a wider decorative set that never touches CTAs or structural fills — purple (`#d6b6f6` / deep `#391c57`), teal (`#2a9d99`), orange (`#dd5b00` / deep `#793400`), green (`#1aae39`), brown (`#523410`), plus danger red (`#dc2626`) as the one semantic exception. Current category → color mapping (`components/challenge/CategoryTag.tsx`):

| Category | Color |
|---|---|
| Hallucinated APIs | Purple |
| Logic errors | Teal |
| Security | Red (semantic — security bugs are "danger," not decoration) |
| Race conditions | Orange |
| Performance | Green |
| Wrong patterns | Brown |
| Dependencies | Neutral stone/grey |

Sky (`#62aef0`) and pink (`#ff64c8`) aren't used for category tags (7 categories, 9 sticker colors) — sky is used for the "Why AI Generates This" explanation callout; pink is unused, available for a future accent moment.

---

## 4. Typography

**Single family: Inter**, loaded via `next/font/google`. The old Instrument Serif display face is gone entirely — Notion's own system uses no serif and no separate display face, just weight and tracking contrast within Inter. JetBrains Mono is kept, but scoped to code only (code blocks, filenames, timers/scores where tabular-nums matters).

- **`.font-display`** (new utility, replaces the old `.font-serif-display`): Inter, weight 700, `-0.03em` letter-spacing, 1.05 line-height. Used for every page `<h1>`/hero headline. This is the system's one expressive lever — heavy weight + tight negative tracking, no serif, no italic.
- **`.font-sans-humanist`**: Inter with `-0.01em` tracking, used for body copy throughout — slightly tighter than default Inter, unchanged in spirit from v2.0.
- Body/UI text stays at regular weight; the contrast between 700-weight headlines and 400-weight body is the hierarchy signal, not size alone.

---

## 5. Shape and elevation

### Radius scale (`--radius-*` in `@theme`, retargets the existing `rounded-md`/`rounded-lg`/etc. classes sitewide)
| Token | Value | Use |
|---|---|---|
| `rounded-xs` | 4px | (not yet used — reserved for form fields per source spec) |
| `rounded-sm` | 5px | (not yet used) |
| `rounded-md` | 8px | Filter chips, secondary badges, small buttons |
| `rounded-lg` | 12px | Cards, code blocks, category tiles |
| `rounded-xl` | 16px | (not yet used) |
| `rounded-full` | 9999px | Every primary/secondary CTA, nav "Start Practice," pill badges |

**The pill-vs-tight contrast is deliberate**: marketing-weight CTAs (landing hero buttons, "Start Practicing," mock-interview "Start Session," MCQ submit) are pill-shaped; smaller in-context controls (filter chips, dropdowns) stay at the tighter 8px radius. This mirrors the source system's own distinction between `button-primary`/`button-secondary` (pill) and `button-utility` (8px).

### Elevation
Two barely-there shadow levels, defined as CSS variables (`--shadow-soft`, `--shadow-elevated`) since Tailwind arbitrary values don't handle multi-layer comma lists cleanly — applied via `[box-shadow:var(--shadow-soft)]`. Most cards use a hairline border alone; shadow is reserved for genuinely raised elements (dropdown menus, the landing hero's sample-challenge card, primary CTA buttons).

**No heavy drop shadows anywhere.** If something needs a shadow, it's one of these two layered soft stacks, never a single hard `box-shadow`.

---

## 6. Components (as implemented)

- **Buttons**: Primary = solid `--accent-primary` fill, white text, pill. Secondary = white surface, hairline border, pill, soft shadow. Utility (filter chips, sort dropdown) = 8px radius, bordered, no shadow.
- **MCQ options** (`McqOptions.tsx`): this required a real rework, not just a token swap — the old "selected" state was a white border/fill on black, which is invisible on a white background. Selected state is now `border-accent` + `bg-accent-subtle`; correct/wrong post-submit states are unchanged conceptually (success/danger tint), just retargeted to the new hex values.
- **Code block** (`CodeBlock.tsx`, and the inline duplicate in `MockRunner.tsx`): unchanged structurally — traffic-light dots, optional filename tab, Shiki GitHub Dark theme — but the chrome header is now an explicit dark tone (`#161b22`) instead of `bg-surface-card`, since that class now resolves to white and would break the "code is always dark" rule if left as-is.
- **Category tag / difficulty badge**: token-driven, see the color mapping table above.
- **Explanation panel**: four tinted callouts (bug=red, why-AI=sky blue, fix=neutral card with red/green diff blocks, heuristic=orange), same four-section structure as before, new palette.
- **Nav**: white surface (not warm-paper, for contrast against the page) at 90% opacity + blur, hairline bottom border. "Start Practice" is pill-shaped.

---

## 7. Fixed while rebranding (latent bugs, not new debt)

Three Tailwind utility classes were referenced across ~50+ call sites in the old codebase but **never actually defined** in `@theme` — `bg-surface-card`, `bg-surface-elevated`/`hover:bg-surface-elevated`, and `text-stone` all silently resolved to nothing. This likely went unnoticed because on the old pure-black canvas, an unstyled (transparent) card blending into a black page looked accidentally correct. All three are now properly defined tokens. If a future rebrand flips the theme again, grep for any class used in components but absent from `@theme` before assuming "it must already be styled."

---

## 8. What's genuinely unresolved

- **`framer-motion` is still unused** (carried over from v2.0's note — still true, still worth a decision).
- **No dark mode exists now**, mirroring the exact inverse of v2.0's complaint. If dark mode is wanted later, build it as a real toggle with its own full token set — don't half-wire it.
- **The dark hero "night" band** (`--secondary`, #213183) from the source system is defined as a token but not used anywhere yet — it's reserved for a single full-bleed inverted hero moment per the source spec's own restraint rule ("a single dark island, not repeated bands"). Don't reach for it as a general dark surface.
- **Sticker pink (`#ff64c8`) is unused.** Available for whichever new decorative moment needs it next — don't force it in without a reason.
