-- ReviewLabs · Phase 3: free review-health audit lead capture
-- Scope: see PHASES.md Phase 3 "Free review-health audit page... a lead-gen
-- tool, not gated behind login". The scoring itself is a pure client-side
-- calculator (lib/audit-score.ts) with no DB involvement — this table only
-- captures the opt-in "email me tips" step after a visitor already sees
-- their free score, so nothing here gates the free tool itself.

create table audit_leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  email text not null,
  rating numeric not null,
  review_count int not null,
  recency text not null,
  score int not null,
  created_at timestamptz not null default now()
);

alter table audit_leads enable row level security;

-- Public can submit a lead; nobody (not even the owner role, since leads
-- aren't scoped to any business) can read them back through the API. The
-- operator reads this table directly via the Supabase dashboard or the
-- service-role key, same as the email notification sent on each insert.
create policy audit_leads_anon_insert on audit_leads
  for insert to anon
  with check (true);
