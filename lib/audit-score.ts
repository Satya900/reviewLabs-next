// Pure scoring for the free review-health audit (PHASES.md Phase 3). Self-
// report, not a live Google Places lookup — there's no Google Places API
// key configured anywhere in this project (the existing GOOGLE_CLIENT_ID/
// SECRET are OAuth for a signed-in owner's own Business Profile, a
// different API entirely), so building a live-lookup version would be
// unbuildable and untestable against missing credentials, same situation
// WhatsApp send and the Agency Razorpay flow were already in.

export type ReviewRecency = "week" | "month" | "1-3mo" | "3-6mo" | "6mo-plus" | "unsure";

export interface AuditInput {
  rating: number; // 0-5
  reviewCount: number;
  recency: ReviewRecency;
}

export type AuditGrade = "excellent" | "good" | "needs_work" | "at_risk";

export interface AuditResult {
  score: number; // 0-100
  grade: AuditGrade;
  findings: string[];
}

export const gradeLabel: Record<AuditGrade, string> = {
  excellent: "Excellent",
  good: "Good",
  needs_work: "Needs work",
  at_risk: "At risk",
};

function gradeFromScore(score: number): AuditGrade {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "needs_work";
  return "at_risk";
}

function ratingScore(rating: number): number {
  const clamped = Math.max(0, Math.min(5, rating));
  return Math.round((clamped / 5) * 40);
}

function volumeScore(reviewCount: number): number {
  if (reviewCount >= 100) return 30;
  if (reviewCount >= 50) return 28;
  if (reviewCount >= 25) return 24;
  if (reviewCount >= 10) return 18;
  if (reviewCount >= 1) return 10;
  return 0;
}

const recencyScores: Record<ReviewRecency, number> = {
  week: 30,
  month: 25,
  "1-3mo": 15,
  "3-6mo": 8,
  "6mo-plus": 2,
  unsure: 10,
};

export function computeAuditScore(input: AuditInput): AuditResult {
  const score = ratingScore(input.rating) + volumeScore(input.reviewCount) + recencyScores[input.recency];
  const grade = gradeFromScore(score);

  const findings: string[] = [];

  if (input.rating < 4.0) {
    findings.push("Your rating is below 4.0. That's the cutoff most customers use to rule a business out before they even call.");
  }
  if (input.reviewCount < 10) {
    findings.push("You don't have many reviews yet. Most customers want to see at least 10 to 20 before they trust a business.");
  }
  if (input.recency === "3-6mo" || input.recency === "6mo-plus") {
    findings.push("Your most recent review is old. A stale profile tells Google, and customers, the business might not be active anymore.");
  }
  if (input.recency === "unsure") {
    findings.push("Not knowing when your last review came in is itself a signal. Without a system to ask, reviews just trickle in whenever they feel like it.");
  }
  if (findings.length === 0) {
    findings.push("You're in solid shape. Keep the reviews flowing steadily so a slow month doesn't let a competitor pull ahead.");
  }

  return { score, grade, findings };
}
