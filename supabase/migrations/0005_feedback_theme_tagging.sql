-- ReviewLabs · Phase 3: feedback theme tagging + weekly digest
-- Scope: see PHASES.md Phase 3 "Feedback theme tagging... and a weekly
-- digest". theme is a closed-vocabulary label (see lib/ai/theme-extract.ts)
-- assigned asynchronously by a daily cron, not at submission time — keeps
-- the public /api/feedback endpoint free of LLM latency.

alter table private_feedback add column theme text;

-- Replaces private_feedback_outlet_id_idx: a composite leading on
-- outlet_id already serves any outlet_id-only lookup, so this is a swap,
-- not an addition. Supports the digest's "last N days for this outlet"
-- query shape, which didn't exist before this feature.
drop index if exists private_feedback_outlet_id_idx;
create index private_feedback_outlet_id_created_at_idx on private_feedback (outlet_id, created_at desc);

-- Supports the tagging cron's core query: `where theme is null`, with no
-- outlet filter — it scans across every business looking for backlog.
create index private_feedback_untagged_idx on private_feedback (created_at) where theme is null;
