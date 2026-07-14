// lib/challenges/types.ts

export type Category =
  | "hallucinated-apis"
  | "logic-errors"
  | "security"
  | "race-conditions"
  | "performance"
  | "wrong-patterns"
  | "dependencies";

export type Difficulty = "easy" | "medium" | "hard";

export type Language =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "python"
  | "sql"
  | "bash";

export interface Challenge {
  // Metadata
  id: string;                    // e.g., "hallucinated-apis-01"
  slug: string;                  // e.g., "the-phantom-module"
  title: string;                 // e.g., "The phantom module"
  category: Category;
  difficulty: Difficulty;
  timeMinutes: number;           // Time budget for the timer
  framework?: string;            // e.g., "React", "Next.js", "Express"

  // Challenge content
  context: string;               // Scenario context
  code: {
    language: Language;
    filename?: string;           // Displayed in code block header
    snippet: string;             // The actual buggy code
  };

  // Answer
  question: string;              // MCQ question
  options: string[];             // Exactly 4 options
  correctAnswerIndex: number;    // 0-3

  // Explanation (revealed after answer)
  explanation: {
    theBug: string;              // What is wrong and what breaks
    whyAIGeneratesThis: string;  // Explains the LLM training pattern
    theFix: {
      before: string;            // Code that gets crossed out / replaced
      after: string;             // Code that gets highlighted / corrected
      commentary?: string;       // Optional 1-liner explanation
    };
    reviewHeuristic: string;     // Takeaway rule of thumb (one sentence)
  };

  // Meta
  publishedAt: string;           // ISO date string
  version: number;               // Bumped when challenge details change
}
