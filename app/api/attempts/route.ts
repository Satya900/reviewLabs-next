// app/api/attempts/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const AttemptSchema = z.object({
  challengeSlug: z.string().min(1),
  isCorrect: z.boolean(),
  timeSeconds: z.number().int().min(0),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = AttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const userId = userData.user.id;
  const { challengeSlug, isCorrect, timeSeconds } = parsed.data;

  // Best-effort rate limit, checked against the DB (not in-memory) so it holds up
  // across serverless invocations: max 10 attempts per user per rolling minute.
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("attempted_at", oneMinuteAgo);

  if ((recentCount ?? 0) >= 10) {
    return NextResponse.json({ error: "Too many attempts — slow down" }, { status: 429 });
  }

  const { count: priorAttempts } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("challenge_slug", challengeSlug);

  const { error: insertError } = await supabase.from("attempts").insert({
    user_id: userId,
    challenge_slug: challengeSlug,
    is_correct: isCorrect,
    time_seconds: timeSeconds,
    attempt_number: (priorAttempts ?? 0) + 1,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
