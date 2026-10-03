-- ReviewLabs · Phase 1 security follow-up: stop exposing owner_user_id
-- publicly. 0001's business_public_read policy used `using (true)`, which
-- lets anyone query businesses and pull every column — including
-- owner_user_id — not just the (id, name, slug) the public review page
-- actually needs. The migration's own comment flagged this as a pre-launch
-- TODO; this closes it, per that comment's own suggested fix: a
-- public-safe view instead of a blanket policy on the base table.

drop policy if exists business_public_read on businesses;

-- No security_invoker: this view runs with its owner's privileges, so it
-- can read the full businesses table (bypassing RLS internally) while only
-- ever emitting these four safe columns to callers. anon/authenticated
-- never get direct table access to businesses anymore — only the owner,
-- via business_owner_all, or anyone, via this view.
create view businesses_public as
  select id, name, slug, plan
  from businesses;

grant select on businesses_public to anon, authenticated;
