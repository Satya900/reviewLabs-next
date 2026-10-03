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

async function sendViaResend(args: {
  to: string;
  fromName: string;
  subject: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "No email provider configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: `${args.fromName} <${process.env.EMAIL_FROM_ADDRESS || "reviews@reviewlabs.space"}>`,
        to: [args.to],
        subject: args.subject,
        text: args.text,
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
  return sendViaResend({ to: args.to, fromName: args.outletName, subject, text });
}

export async function sendReviewReminderEmail(args: SendReviewRequestEmailArgs): Promise<SendResult> {
  const { subject, text } = buildReminderEmailBody(args);
  return sendViaResend({ to: args.to, fromName: args.outletName, subject, text });
}

export type DigestOutletSection = {
  outletName: string;
  ratingsCount: number;
  avgStars: number | null;
  ticketsOpened: number;
  ticketsResolved: number;
  topThemes: { label: string; count: number }[];
};

export type SendWeeklyDigestEmailArgs = {
  to: string;
  businessName: string;
  outlets: DigestOutletSection[];
  dashboardUrl: string;
};

// Recurring automated report, not a one-time personal ask like the request/
// reminder emails above — reads like a crisp status report rather than a
// person writing, since that's what it actually is. Still run through
// /anthropic-skills:humanizer; owner-facing copy is still copy.
function buildWeeklyDigestEmailBody(args: SendWeeklyDigestEmailArgs) {
  const subject = `Your week at ${args.businessName}`;

  const outletBlocks = args.outlets.map((o) => {
    const avgStarsText = o.avgStars !== null ? `${o.avgStars.toFixed(1)} average` : "no average yet";
    const topThemesLine =
      o.topThemes.length > 0
        ? o.topThemes.map((t) => `${t.label} (${t.count})`).join(", ")
        : "No recurring themes yet";

    return [
      o.outletName,
      `${o.ratingsCount} new ratings (${avgStarsText}), ${o.ticketsOpened} tickets opened and ${o.ticketsResolved} resolved`,
      `Top themes: ${topThemesLine}`,
    ].join("\n");
  });

  const text = [
    "Hi,",
    "",
    "Here's the rundown for the past week.",
    "",
    outletBlocks.join("\n\n"),
    "",
    `Full breakdown: ${args.dashboardUrl}`,
    "",
    "ReviewLabs",
  ].join("\n");

  return { subject, text };
}

export async function sendWeeklyDigestEmail(args: SendWeeklyDigestEmailArgs): Promise<SendResult> {
  const { subject, text } = buildWeeklyDigestEmailBody(args);
  return sendViaResend({ to: args.to, fromName: "ReviewLabs", subject, text });
}

export type AuditLeadNotificationArgs = {
  to: string;
  businessName: string;
  email: string;
  score: number;
  rating: number;
  reviewCount: number;
  recencyLabel: string;
};

// Internal ops notification, not customer/owner-facing copy — a plain
// data summary so whoever's watching the inbox can follow up.
function buildAuditLeadNotificationBody(args: AuditLeadNotificationArgs) {
  const subject = `New audit lead: ${args.businessName}`;
  const text = [
    "A visitor finished the free review-health audit and asked for tips.",
    "",
    args.businessName,
    `Email: ${args.email}`,
    `Score: ${args.score}/100`,
    `Rating: ${args.rating}, ${args.reviewCount} reviews, last review ${args.recencyLabel}`,
  ].join("\n");
  return { subject, text };
}

export async function sendAuditLeadNotification(args: AuditLeadNotificationArgs): Promise<SendResult> {
  const { subject, text } = buildAuditLeadNotificationBody(args);
  return sendViaResend({ to: args.to, fromName: "ReviewLabs Audit", subject, text });
}
