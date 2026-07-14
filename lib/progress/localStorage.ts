// lib/progress/localStorage.ts

export interface CompletedChallenge {
  slug: string;
  isCorrect: boolean;
  timeSeconds: number;
  attemptedAt: string;
}

export function getLocalProgress(): CompletedChallenge[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("reviewlabs_progress");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read progress from localStorage:", e);
    return [];
  }
}

export function saveLocalProgress(item: CompletedChallenge) {
  if (typeof window === "undefined") return;
  try {
    const progress = getLocalProgress();
    const existingIndex = progress.findIndex((p) => p.slug === item.slug);
    if (existingIndex > -1) {
      // Keep the first attempt if it was correct to protect leaderboard integrity
      if (!progress[existingIndex].isCorrect && item.isCorrect) {
        progress[existingIndex] = item;
      }
    } else {
      progress.push(item);
    }
    localStorage.setItem("reviewlabs_progress", JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress to localStorage:", e);
  }
}

export function isChallengeCompletedLocal(slug: string): boolean {
  const progress = getLocalProgress();
  return progress.some((p) => p.slug === slug);
}
