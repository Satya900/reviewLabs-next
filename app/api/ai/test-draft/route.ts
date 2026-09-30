import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { draftReply } from "@/lib/ai/reply-draft";
import { hasAnyAiProviderConfigured } from "@/lib/ai/router";

const payloadSchema = z.object({ ticketId: z.string() });

// Lets an owner preview reply quality against a real resolved ticket's fix
// log before Google is even connected — doesn't touch google_reviews or
// reply_drafts, this is a throwaway preview, not a real draft.
export async function POST(request: Request) {
  if (!hasAnyAiProviderConfigured()) {
    return NextResponse.json(
      { ok: false, error: "No AI provider configured yet. Add ZAI_API_KEY, CEREBRAS_API_KEY, or GROQ_API_KEY to .env." },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Missing ticketId" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const { data: ticket } = await supabase
    .from("tickets")
    .select("*, ratings(stars, public_comment), outlets(name)")
    .eq("id", parsed.data.ticketId)
    .single();

  if (!ticket) return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });

  const row = ticket as unknown as {
    fix_note: string | null;
    ratings: { stars: number; public_comment: string | null } | null;
    outlets: { name: string } | null;
  };

  const draft = await draftReply({
    businessName: row.outlets?.name ?? "the business",
    reviewerName: null,
    stars: row.ratings?.stars ?? 3,
    reviewText: row.ratings?.public_comment ?? null,
    fixNote: row.fix_note,
    language: "en",
  });

  if (!draft) {
    return NextResponse.json({ ok: false, error: "All AI providers failed or are unreachable" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, text: draft.text, modelUsed: draft.modelUsed });
}
