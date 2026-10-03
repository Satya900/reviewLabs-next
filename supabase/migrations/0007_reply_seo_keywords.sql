-- ReviewLabs · Phase 3: Reply SEO add-on
-- Scope: see PHASES.md Phase 3 "Reply SEO add-on (₹50/keyword/month):
-- service/area keywords woven into owner replies only — the PRD is
-- explicit this must never touch customer-submitted reviews." Keywords are
-- per-outlet (local SEO terms are location-specific), and only ever get
-- read by lib/ai/reply-draft.ts's draftReply, which only ever writes to
-- reply_drafts.draft_text (the owner's reply) — nothing in this codebase
-- has a write path to google_reviews.review_text (Google's own data,
-- read-only), so the "never touches customer reviews" rule is structurally
-- enforced, not just a prompt instruction.

create table reply_seo_keywords (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references outlets(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique (outlet_id, keyword)
);

create index reply_seo_keywords_outlet_id_idx on reply_seo_keywords (outlet_id);

alter table reply_seo_keywords enable row level security;

create policy reply_seo_keywords_owner_all on reply_seo_keywords
  for all using (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ))
  with check (outlet_id in (
    select o.id from outlets o join businesses b on b.id = o.business_id
    where b.owner_user_id = auth.uid()
  ));
