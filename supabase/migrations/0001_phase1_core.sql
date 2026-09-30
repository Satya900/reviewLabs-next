-- ReviewLabs · Phase 1 schema (Collect & Recover)
-- Scope: everything v1 needs per PHASES.md. Google sync / AI reply tables
-- are deliberately not here — they land in the Phase 2 migration.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Businesses & outlets
-- ─────────────────────────────────────────────────────────────────────────

create type plan_tier as enum ('starter', 'growth', 'agency', 'global');

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plan plan_tier not null default 'starter',
  timezone text not null default 'Asia/Kolkata',
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table outlets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  address text,
  google_maps_url text,
  created_at timestamptz not null default now(),
  unique (business_id, slug)
);

-- Public-facing lookup: reviewlabs.space/r/{outlet_slug}
create unique index outlets_slug_idx on outlets (slug);

-- ─────────────────────────────────────────────────────────────────────────
-- Collection: one QR/email/WhatsApp request per customer visit
-- ─────────────────────────────────────────────────────────────────────────

create type request_channel as enum ('qr', 'email', 'whatsapp');
create type request_status as enum ('sent', 'reminded', 'opened', 'completed', 'expired');

create table requests (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references outlets(id) on delete cascade,
  channel request_channel not null,
  customer_name text,
  customer_contact text, -- email or phone, optional (QR scans can be anonymous)
  status request_status not null default 'sent',
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index requests_outlet_id_idx on requests (outlet_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Ratings: the 1–5 star tap on the ReviewLabs page.
-- The Google button is shown at every rating — enforced in app logic, not
-- the schema, but "chose_channel" records what the customer actually did.
-- ─────────────────────────────────────────────────────────────────────────

create type rating_channel_choice as enum ('google', 'private', 'both', 'none');

create table ratings (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references outlets(id) on delete cascade,
  request_id uuid references requests(id) on delete set null,
  stars smallint not null check (stars between 1 and 5),
  chose_channel rating_channel_choice not null default 'none',
  is_public boolean not null default true, -- shown on the public review page; never hidden for low ratings
  -- Optional short comment the customer is fine posting publicly. Distinct
  -- from private_feedback.answers, which must never surface on the public
  -- page — that separation is the entire point of the private channel.
  public_comment text,
  created_at timestamptz not null default now()
);

create index ratings_outlet_id_idx on ratings (outlet_id);
create index ratings_created_at_idx on ratings (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- Private feedback: the 2–3 follow-up questions unhappy customers answer
-- instead of / alongside posting publicly.
-- ─────────────────────────────────────────────────────────────────────────

create table private_feedback (
  id uuid primary key default gen_random_uuid(),
  rating_id uuid not null references ratings(id) on delete cascade,
  outlet_id uuid not null references outlets(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb, -- { "what_went_wrong": "...", "what_would_fix_it": "..." }
  created_at timestamptz not null default now()
);

create index private_feedback_outlet_id_idx on private_feedback (outlet_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Recovery tickets: opened automatically for ratings under 4.
-- ─────────────────────────────────────────────────────────────────────────

create type ticket_status as enum ('open', 'in_progress', 'resolved');

create table tickets (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references outlets(id) on delete cascade,
  rating_id uuid not null references ratings(id) on delete cascade,
  private_feedback_id uuid references private_feedback(id) on delete set null,
  status ticket_status not null default 'open',
  sla_due_at timestamptz not null,
  fix_note text, -- what the owner actually did — becomes reply-draft context in Phase 2
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index tickets_outlet_id_status_idx on tickets (outlet_id, status);

-- Auto-open a ticket whenever a rating under 4 comes in.
create or replace function fn_open_ticket_for_low_rating()
returns trigger as $$
begin
  if new.stars < 4 then
    insert into tickets (outlet_id, rating_id, sla_due_at)
    values (new.outlet_id, new.id, now() + interval '24 hours');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_open_ticket_for_low_rating
  after insert on ratings
  for each row
  execute function fn_open_ticket_for_low_rating();

-- ─────────────────────────────────────────────────────────────────────────
-- Billing: Razorpay subscription mirror (Phase 1 wires Starter only).
-- ─────────────────────────────────────────────────────────────────────────

create type subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled');

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  razorpay_subscription_id text unique,
  plan plan_tier not null default 'starter',
  outlet_count int not null default 1,
  status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_business_id_idx on subscriptions (business_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

alter table businesses enable row level security;
alter table outlets enable row level security;
alter table requests enable row level security;
alter table ratings enable row level security;
alter table private_feedback enable row level security;
alter table tickets enable row level security;
alter table subscriptions enable row level security;

-- Owners see/manage only their own business.
create policy business_owner_all on businesses
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Business name/slug must be readable by anyone hitting the public review
-- page or a QR link. NOTE: this also exposes owner_user_id at the row level;
-- before real launch, swap this for a public-safe view that only selects
-- (id, name, slug, plan) instead of relaxing RLS on the base table.
create policy business_public_read on businesses
  for select using (true);

create policy outlet_owner_all on outlets
  for all using (business_id in (select id from businesses where owner_user_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_user_id = auth.uid()));

-- Outlet name/slug/address must be readable publicly: QR codes and the
-- public review page both resolve an outlet before any auth exists.
create policy outlets_public_read on outlets
  for select using (true);

create policy requests_owner_all on requests
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

-- Ratings: owners manage everything for their outlets; anon (the customer on
-- the public review page) may only read rows marked is_public = true.
create policy ratings_owner_all on ratings
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

create policy ratings_public_read on ratings
  for select using (is_public = true);

-- Anonymous customers may insert a rating for any outlet (the whole point of
-- the public collection flow) but cannot read or update other customers' rows.
create policy ratings_anon_insert on ratings
  for insert to anon
  with check (true);

create policy private_feedback_owner_all on private_feedback
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

create policy private_feedback_anon_insert on private_feedback
  for insert to anon
  with check (true);

create policy tickets_owner_all on tickets
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));

create policy subscriptions_owner_read on subscriptions
  for select using (business_id in (select id from businesses where owner_user_id = auth.uid()));
