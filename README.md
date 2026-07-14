This is [ReviewLabs](https://reviewlabs.space) — a free, interactive platform for practicing how to spot the bugs AI coding tools leave behind. Built with [Next.js](https://nextjs.org).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The core practice loop (browse, attempt, and review challenges) works immediately with zero setup — progress is tracked in `localStorage` and no account is required.

Auth (GitHub sign-in + cross-device progress sync) needs a Supabase project — see below. Without it, the app runs fine in "mock mode": every Supabase call becomes a harmless no-op and the sign-in button silently does nothing.

## Auth setup (Supabase + GitHub OAuth)

This gets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` working end-to-end. Takes about 10 minutes.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project (pick a region close to your users — Singapore or Mumbai for an India-focused audience).
2. In the Supabase dashboard, go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
3. Copy `.env.example` to `.env.local` in the project root and paste those two values in:
   ```bash
   cp .env.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   `.env.local` is gitignored — never commit real credentials.

### 2. Run the database schema

1. In the Supabase dashboard, open the **SQL Editor**.
2. Paste the full contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) and run it.
3. This creates the `profiles` and `attempts` tables, a trigger that auto-creates a profile from GitHub metadata on first sign-in, and the row-level security policies that keep each user's attempts private to them.

### 3. Register a GitHub OAuth app

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. **Homepage URL:** `http://localhost:3000` for local dev (use your real domain once deployed).
3. **Authorization callback URL:** use the callback URL Supabase shows you in the next step — it looks like `https://your-project-ref.supabase.co/auth/v1/callback`.
4. Save, then copy the generated **Client ID** and **Client Secret**.

### 4. Connect GitHub to Supabase Auth

1. In the Supabase dashboard, go to **Authentication → Providers → GitHub**.
2. Enable it, and paste in the Client ID and Client Secret from step 3.
3. Save.

### 5. Verify it works

1. Restart the dev server so it picks up `.env.local`: `npm run dev`.
2. Click **Sign in with GitHub** in the nav. You should land back on the site signed in, with your GitHub avatar showing.
3. As a signed-out user, complete a couple of challenges (progress saves to `localStorage`). Then sign in — that progress should migrate into your account automatically (check the `attempts` table in Supabase's Table Editor).
4. Sign in on a second browser or incognito window — your completed challenges should show as done there too, since progress now reads from Supabase instead of `localStorage` once signed in.

### Deploying

Add the same three environment variables in your hosting provider's dashboard (e.g. Vercel → Project Settings → Environment Variables), update the GitHub OAuth app's homepage URL and `NEXT_PUBLIC_SITE_URL` to your real domain, and redeploy.

## Project structure

- `app/` — pages and API routes (Next.js App Router)
- `components/` — UI components, organized by feature
- `data/challenges/` — the challenge content itself, one JSON file per challenge, validated against `lib/challenges/schema.ts` at build time
- `lib/` — data loading, auth, progress tracking, scoring
- `supabase/migrations/` — SQL schema for the Supabase project
- `Planning/` — living product docs: `Phases.md` (roadmap), `Design.md` (design system as actually built), `Roadmap.md` (feature ideas)

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Auth docs](https://supabase.com/docs/guides/auth)
