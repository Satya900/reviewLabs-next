import { routedChatCompletion } from "./router";
import type { ReplyLanguage } from "@/lib/supabase/types";

const languageNames: Record<ReplyLanguage, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
};

export interface DraftReplyInput {
  businessName: string;
  reviewerName: string | null;
  stars: number;
  reviewText: string | null;
  fixNote: string | null;
  language: ReplyLanguage;
}

// The differentiator the PRD names explicitly: a draft that can truthfully
// reference what the business actually changed, not a generic apology.
export async function draftReply(
  input: DraftReplyInput
): Promise<{ text: string; modelUsed: string } | null> {
  const system = [
    `You write short owner replies to Google Business reviews for "${input.businessName}".`,
    `Reply in ${languageNames[input.language]}.`,
    "Be specific and factual, never generic or templated.",
    input.fixNote
      ? "A concrete fix is on file below: reference it plainly, in one sentence, without over-apologizing."
      : "No specific fix is on file: thank the customer sincerely without inventing a fix that wasn't made.",
    "Keep the whole reply under 60 words. Sign off warmly but without excess exclamation points.",
    "Never promise something the business didn't actually do.",
  ].join(" ");

  const user = [
    `Customer: ${input.reviewerName ?? "a customer"}`,
    `Rating: ${input.stars} star${input.stars === 1 ? "" : "s"}`,
    input.reviewText ? `Review text: "${input.reviewText}"` : "Review text: (no text, star rating only)",
    input.fixNote
      ? `What the business actually did to fix this: ${input.fixNote}`
      : "No specific fix on file for this review.",
    "Write the owner's reply now. Output only the reply text, nothing else.",
  ].join("\n");

  return routedChatCompletion([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
}
