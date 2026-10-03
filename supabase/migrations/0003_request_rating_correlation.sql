-- ReviewLabs · Phase 2 follow-up: request <-> review correlation
-- Scope: the half of PHASES.md Phase 2's "Match incoming Google reviews
-- back to the request that generated them" that happens on ReviewLabs' own
-- side — when a customer's rating is linked back to the email/WhatsApp
-- request that sent them to /r/{slug}, flip that request to 'completed'.
--
-- Mirrors fn_open_ticket_for_low_rating exactly: security-definer, fires
-- once on the initiating insert. This means the anon client behind the
-- public /api/feedback route never needs UPDATE access on `requests` —
-- there is still no anon policy on that table, intentionally.
create or replace function fn_complete_request_on_rating()
returns trigger as $$
begin
  if new.request_id is not null then
    update requests
    set status = 'completed'
    where id = new.request_id
      and outlet_id = new.outlet_id; -- guards against a spoofed/foreign request_id
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_complete_request_on_rating
  after insert on ratings
  for each row
  execute function fn_complete_request_on_rating();
