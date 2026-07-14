// app/api/attempts/bulk-import/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const BulkImportSchema = z.object({
  attempts: z
    .array(
      z.object({
        slug: z.string().min(1),
        isCorrect: z.boolean(),
        timeSeconds: z.number().int().min(0),
        attemptedAt: z.string(),
      })
    )
    .max(100),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = BulkImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const userId = userData.user.id;
  const { attempts } = parsed.data;

  // Only seed challenges this account doesn't already have any attempt for —
  // makes this endpoint safe to call every time SIGNED_IN fires, even across devices
  // with different stale localStorage state.
  const { data: existing } = await supabase
    .from("attempts")
    .select("challenge_slug")
    .eq("user_id", userId);

  const alreadyAttempted = new Set(
    (existing ?? []).map((row: { challenge_slug: string }) => row.challenge_slug)
  );

  const newRows = attempts
    .filter((a) => !alreadyAttempted.has(a.slug))
    .map((a) => ({
      user_id: userId,
      challenge_slug: a.slug,
      is_correct: a.isCorrect,
      time_seconds: a.timeSeconds,
      attempt_number: 1,
      attempted_at: a.attemptedAt,
    }));

  if (newRows.length > 0) {
    const { error: insertError } = await supabase.from("attempts").insert(newRows);
    if (insertError) {
      return NextResponse.json({ error: "Failed to import progress" }, { status: 500 });
    }
  }

  return NextResponse.json({ imported: newRows.length }, { status: 201 });
}
