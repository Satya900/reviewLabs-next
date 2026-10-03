import { routedChatCompletion } from "./router";

// Closed vocabulary, not freeform AI text — a free-text label would never
// group cleanly ("rude staff" vs "Staff rudeness" vs "staff was rude" for
// the same complaint), which would defeat the entire point of "recurring
// themes". Private feedback can be praise or complaint at any star count
// (see components/review/review-flow.tsx — "Tell us privately" isn't
// gated to low ratings), so both valences are represented here.
export const FEEDBACK_THEMES = [
  "long_wait",
  "rude_staff",
  "pricing_too_high",
  "cleanliness_issue",
  "poor_communication",
  "booking_difficulty",
  "quality_issue",
  "other_complaint",
  "friendly_staff",
  "great_value",
  "quick_service",
  "clean_facility",
  "good_communication",
  "easy_booking",
  "great_quality",
  "other_praise",
] as const;

export type FeedbackTheme = (typeof FEEDBACK_THEMES)[number];

export interface ExtractThemeInput {
  stars: number;
  whatWentWrong: string | null;
  whatWouldFixIt: string | null;
}

function fallbackTheme(stars: number): FeedbackTheme {
  return stars < 4 ? "other_complaint" : "other_praise";
}

// Exported separately from extractFeedbackTheme so the validation/fallback
// logic is testable without a live AI provider — see lib/ai/theme-extract.test.ts.
export function normalizeThemeOutput(rawText: string, stars: number): FeedbackTheme {
  const normalized = rawText.trim().toLowerCase().replace(/[^a-z_]/g, "");
  return (FEEDBACK_THEMES as readonly string[]).includes(normalized)
    ? (normalized as FeedbackTheme)
    : fallbackTheme(stars);
}

export async function extractFeedbackTheme(
  input: ExtractThemeInput
): Promise<{ theme: FeedbackTheme; modelUsed: string } | null> {
  const system = [
    "Classify this customer feedback into exactly one theme from this list:",
    FEEDBACK_THEMES.join(", ") + ".",
    "Output only the theme key, nothing else — no punctuation, no explanation.",
    "If nothing fits well, use other_complaint for negative feedback or other_praise for positive feedback.",
  ].join(" ");

  const user = [
    `Star rating: ${input.stars}`,
    input.whatWentWrong ? `What went wrong: ${input.whatWentWrong}` : null,
    input.whatWouldFixIt ? `What would fix it: ${input.whatWouldFixIt}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await routedChatCompletion([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  if (!result) return null;

  return { theme: normalizeThemeOutput(result.text, input.stars), modelUsed: result.modelUsed };
}
