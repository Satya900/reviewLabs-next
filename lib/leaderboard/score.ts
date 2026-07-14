// lib/leaderboard/score.ts
import { CompletedChallenge } from "../progress/localStorage";

export function calculateScore(attempts: CompletedChallenge[]): number {
  if (attempts.length === 0) return 0;
  
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const totalAttempts = attempts.length;
  
  // Score formula: (correct_first_try * 10.0) * (correct_first_try / total_attempts)
  const score = correctCount * 10.0 * (correctCount / totalAttempts);
  return Math.round(score * 10) / 10; // Round to 1 decimal place
}
