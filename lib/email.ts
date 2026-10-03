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
function buildEmailBody(args: SendReviewRequestEmailArgs) {
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

export async function sendReviewRequestEmail(args: SendReviewRequestEmailArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "No email provider configured" };

  const { subject, text } = buildEmailBody(args);
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
