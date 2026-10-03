import { createSupabaseServiceRoleClient } from "./supabase/server";
import { sendReviewReminderEmail } from "./email";
import type { ReviewRequest } from "./supabase/types";

// PHASES.md Phase 1 scopes this to "email request flow with one reminder."
// WhatsApp requests only ever produce a wa.me link for the owner to send
// themselves (no WhatsApp Business API — see app/api/requests/route.ts),
// so there's no server-side channel to automate a WhatsApp reminder
// through. This only ever touches email requests.
const REMINDER_DELAY_HOURS = 24;

// Called on a schedule (see app/api/cron/send-request-reminders), same
// pattern as lib/google-sync.ts's syncAllConnectedOutlets: each request's
// failure is isolated so one bad send doesn't block the rest of the batch.
export async function sendDueReminders(): Promise<{
  reminded: number;
  errors: { requestId: string; error: string }[];
}> {
  const supabase = createSupabaseServiceRoleClient();
  const cutoff = new Date(Date.now() - REMINDER_DELAY_HOURS * 60 * 60 * 1000).toISOString();

  // Never reminds a request twice: status moves 'sent' -> 'reminded' below,
  // and this query only ever selects requests still at 'sent'.
  const { data } = await supabase
    .from("requests")
    .select("*, outlets(name, slug)")
    .eq("channel", "email")
    .eq("status", "sent")
    .lte("created_at", cutoff);

  const dueRequests = (data ?? []) as unknown as (ReviewRequest & {
    outlets: { name: string; slug: string } | null;
  })[];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let reminded = 0;
  const errors: { requestId: string; error: string }[] = [];

  for (const request of dueRequests) {
    if (!request.outlets || !request.customer_contact) continue;

    // Same ?req= correlation as the original request (app/api/requests) and
    // the trigger in supabase/migrations/0003 — a reminder that gets acted
    // on still links back to this request and flips it to 'completed'.
    const reviewUrl = `${appUrl}/r/${request.outlets.slug}?req=${request.id}`;
    const result = await sendReviewReminderEmail({
      to: request.customer_contact,
      customerName: request.customer_name,
      outletName: request.outlets.name,
      reviewUrl,
    });

    if (!result.ok) {
      errors.push({ requestId: request.id, error: result.error });
      continue;
    }

    await supabase
      .from("requests")
      .update({ status: "reminded", reminder_sent_at: new Date().toISOString() })
      .eq("id", request.id);

    reminded += 1;
  }

  return { reminded, errors };
}
