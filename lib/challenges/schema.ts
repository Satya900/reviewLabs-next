// lib/challenges/schema.ts
import { z } from "zod";

export const ChallengeSchema = z.object({
  id: z.string().regex(/^[a-z-]+-\d{2}$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(5).max(60),
  category: z.enum([
    "hallucinated-apis",
    "logic-errors",
    "security",
    "race-conditions",
    "performance",
    "wrong-patterns",
    "dependencies",
  ]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeMinutes: z.number().int().min(1).max(10),
  framework: z.string().optional(),
  context: z.string().min(20).max(500),
  code: z.object({
    language: z.enum([
      "javascript", "typescript", "jsx", "tsx",
      "python", "sql", "bash",
    ]),
    filename: z.string().optional(),
    snippet: z.string().min(20).max(2000),
  }),
  question: z.string().min(10).max(200),
  options: z.array(z.string().min(5).max(200)).length(4),
  correctAnswerIndex: z.number().int().min(0).max(3),
  explanation: z.object({
    theBug: z.string().min(30).max(600),
    whyAIGeneratesThis: z.string().min(50).max(600),
    theFix: z.object({
      before: z.string().min(1).max(500),
      after: z.string().min(1).max(500),
      commentary: z.string().max(200).optional(),
    }),
    reviewHeuristic: z.string().min(20).max(250),
  }),
  publishedAt: z.string().datetime(),
  version: z.number().int().min(1),
});
