// Transactional email for review requests, via Resend. Raw fetch, no SDK
// dependency — same "no new package for one API call" choice as lib/google.ts.

export const hasEmailEnv = Boolean(process.env.RESEND_API_KEY);

export type SendReviewRequestEmailArgs = {
  to: string;
  customerName: string | null;
  outletName: string;
  reviewUrl: string;
};

type SendResult = { ok: true } | { ok: false; error: string };

// Written to read like the outlet owner asking personally, not a marketing
// template — run through /anthropic-skills:humanizer, since a generic-sounding
// first draft is what landed a test send in Gmail's Promotions tab.
function buildRequestEmailBody(args: SendReviewRequestEmailArgs) {
  const greeting = args.customerName ? `Hi ${args.customerName},` : "Hi,";
  const subject = `Thanks for visiting ${args.outletName}`;
  const text = [
    greeting,
    "",
    "Thanks for coming in. If you've got a minute, I'd really appreciate a quick review:",
    args.reviewUrl,
    "",
    "It helps more than you'd think.",
    "",
    args.outletName,
  ].join("\n");
  return { subject, text };
}

// The one automatic follow-up (never more than one — see lib/reminders.ts)
// for a request that's still 'sent' after REMINDER_DELAY_HOURS. Same
// humanizer discipline as the first email.
function buildReminderEmailBody(args: SendReviewRequestEmailArgs) {
  const greeting = args.customerName ? `Hi ${args.customerName},` : "Hi,";
  const subject = `Quick follow-up from ${args.outletName}`;
  const text = [
    greeting,
    "",
    "Just checking back in. If you get a minute, I'd still love to hear about your visit:",
    args.reviewUrl,
    "",
    "No pressure, just didn't want this to get buried.",
    "",
    args.outletName,
  ].join("\n");
  return { subject, text };
}

async function sendViaResend(subject: string, text: string, args: SendReviewRequestEmailArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "No email provider configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: `${args.outletName} <${process.env.EMAIL_FROM_ADDRESS || "reviews@reviewlabs.space"}>`,
        to: [args.to],
        subject,
        text,
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend: ${await res.text()}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Resend request failed" };
  }
}

export async function sendReviewRequestEmail(args: SendReviewRequestEmailArgs): Promise<SendResult> {
  const { subject, text } = buildRequestEmailBody(args);
  return sendViaResend(subject, text, args);
}

export async function sendReviewReminderEmail(args: SendReviewRequestEmailArgs): Promise<SendResult> {
  const { subject, text } = buildReminderEmailBody(args);
  return sendViaResend(subject, text, args);
}
