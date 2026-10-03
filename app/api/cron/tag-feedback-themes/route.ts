import { NextResponse } from "next/server";
import { tagUntaggedFeedback } from "@/lib/themes";

// A loop of up to 50 sequential LLM calls is real work — be explicit
// rather than trusting the framework default.
export const maxDuration = 60;

// Scheduled entry point, same shape as the other /api/cron/* routes: any
// external scheduler hits this on a timer with
// `Authorization: Bearer ${CRON_SECRET}`. Runs daily via GitHub Actions
// (not vercel.json — already at Vercel Hobby's 2-cron cap).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 501 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await tagUntaggedFeedback();
  return NextResponse.json({ ok: true, ...result });
}
