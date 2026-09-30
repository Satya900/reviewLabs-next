-- ReviewLabs · Phase 2 schema (Reply engine & Google sync)
-- Scope: Google Business Profile OAuth connections, synced Google reviews,
-- and AI reply drafts with an approval/auto-reply workflow. See PHASES.md
-- Phase 2 for the feature list this backs.

create type google_connection_status as enum ('connected', 'needs_reauth', 'disconnected');
create type reply_language as enum ('en', 'hi', 'kn');
create type reply_draft_status as enum ('pending_approval', 'approved', 'auto_approved', 'published', 'rejected');

-- ─────────────────────────────────────────────────────────────────────────
-- Google Business Profile OAuth connections, one per outlet.
-- ─────────────────────────────────────────────────────────────────────────

create table google_connections (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null unique references outlets(id) on delete cascade,
  google_location_id text, -- Business Profile locations/{id}, set after the owner picks a location
  google_account_email text,
  access_token text not null, -- encrypted at rest via Supabase Vault in production; see lib/google.ts
  refresh_token text not null,
  token_expires_at timestamptz not null,
  status google_connection_status not null default 'connected',
  created_at timestamptz not null default now()
);

-- Per-outlet reply behavior. One row per outlet, created alongside the
-- outlet itself (defaults match the PRD: owner approves everything except
-- plain 5-star reviews with no text).
create table reply_settings (
  outlet_id uuid primary key references outlets(id) on delete cascade,
  default_language reply_language not null default 'en',
  auto_reply_5star_no_text boolean not null default true,
  auto_reply_min_stars_for_review smallint not null default 1, -- drafts below this always need manual approval regardless of the flag above
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Google reviews synced in from the Business Profile API.
-- ─────────────────────────────────────────────────────────────────────────

create table google_reviews (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references outlets(id) on delete cascade,
  google_review_id text not null,
  reviewer_name text,
  stars smallint not null check (stars between 1 and 5),
  review_text text,
  review_language text,
  google_create_time timestamptz not null,
  google_update_time timestamptz not null,
  -- Best-effort match back to the request that generated this review, so
  -- we know which customer this was without Google ever sharing identity.
  matched_request_id uuid references requests(id) on delete set null,
  matched_rating_id uuid references ratings(id) on delete set null,
  has_owner_reply boolean not null default false,
  synced_at timestamptz not null default now(),
  unique (outlet_id, google_review_id)
);

create index google_reviews_outlet_id_idx on google_reviews (outlet_id);
create index google_reviews_unreplied_idx on google_reviews (outlet_id) where has_owner_reply = false;

-- ─────────────────────────────────────────────────────────────────────────
-- AI-drafted replies. The differentiator: grounded in the business's own
-- fix log (resolved tickets), not a generic apology.
-- ─────────────────────────────────────────────────────────────────────────

create table reply_drafts (
  id uuid primary key default gen_random_uuid(),
  google_review_id uuid not null references google_reviews(id) on delete cascade,
  draft_text text not null,
  language reply_language not null,
  grounded_ticket_id uuid references tickets(id) on delete set null, -- the closed ticket this draft referenced, if any
  model_used text not null, -- which router tier produced this draft; see lib/ai/router.ts
  status reply_draft_status not null default 'pending_approval',
  published_text text, -- what actually went out, if the owner edited before publishing
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index reply_drafts_status_idx on reply_drafts (status);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

alter table google_connections enable row level security;
alter table reply_settings enable row level security;
alter table google_reviews enable row level security;
alter table reply_drafts enable row level security;

create policy google_connections_owner_all on google_connections
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

create policy reply_settings_owner_all on reply_settings
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

create policy google_reviews_owner_all on google_reviews
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

create policy reply_drafts_owner_all on reply_drafts
  for all using (google_review_id in (
    select gr.id from google_reviews gr
    join outlets o on o.id = gr.outlet_id
    join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (google_review_id in (
    select gr.id from google_reviews gr
    join outlets o on o.id = gr.outlet_id
    join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));
