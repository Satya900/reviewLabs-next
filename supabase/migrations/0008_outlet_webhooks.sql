-- ReviewLabs · Phase 3: inbound webhook for billing/booking tool integrations
-- Scope: see PHASES.md Phase 3 "Inbound webhook for billing/booking tool
-- integrations" — the bullet names no specific partner, so this is a
-- generic authenticated endpoint any external booking/billing tool can
-- POST a completed-visit event to, which creates an email review request
-- (app/api/webhooks/booking/[outletId]). WhatsApp isn't supported here:
-- there's no WhatsApp Business API configured anywhere in this project, and
-- unlike the dashboard's own request flow there's no human present at
-- webhook-delivery time to click an open-WhatsApp link.
--
-- Secret lives in its own table, not a column on outlets, so it's never
-- accidentally selected alongside the rest of an outlet's fields (outlets
-- is frequently read with select("*") throughout the app) and never has a
-- public-read path the way businesses_public does for other outlet data.
create table outlet_webhooks (
  outlet_id uuid primary key references outlets(id) on delete cascade,
  secret text not null default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now()
);

alter table outlet_webhooks enable row level security;

create policy outlet_webhooks_owner_all on outlet_webhooks
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));
