// lib/progress/useProgress.ts
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getLocalProgress, CompletedChallenge } from "./localStorage";

interface AttemptRow {
  challenge_slug: string;
  is_correct: boolean;
  time_seconds: number;
  attempted_at: string;
}

// The attempts table stores every attempt as its own row (retries included).
// Collapse that into one effective entry per challenge, mirroring how
// saveLocalProgress treats anonymous progress: a later correct attempt
// supersedes an earlier incorrect one, otherwise the most recent wins.
function collapseAttempts(rows: AttemptRow[]): CompletedChallenge[] {
  const bySlug = new Map<string, CompletedChallenge>();

  for (const row of rows) {
    const candidate: CompletedChallenge = {
      slug: row.challenge_slug,
      isCorrect: row.is_correct,
      timeSeconds: row.time_seconds,
      attemptedAt: row.attempted_at,
    };
    const existing = bySlug.get(row.challenge_slug);

    if (!existing) {
      bySlug.set(row.challenge_slug, candidate);
    } else if (!existing.isCorrect && candidate.isCorrect) {
      bySlug.set(row.challenge_slug, candidate);
    } else if (
      existing.isCorrect === candidate.isCorrect &&
      candidate.attemptedAt > existing.attemptedAt
    ) {
      bySlug.set(row.challenge_slug, candidate);
    }
  }

  return Array.from(bySlug.values());
}

// Signed-in users' progress lives in Supabase and follows them across devices;
// anonymous users' progress stays in localStorage, exactly as before.
export function useProgress() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<CompletedChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("attempts")
          .select("challenge_slug, is_correct, time_seconds, attempted_at")
          .eq("user_id", user.id);

        if (cancelled) return;
        setProgress(collapseAttempts((data ?? []) as AttemptRow[]));
        setLoading(false);
      } else {
        await Promise.resolve(); // stay consistently async, mirroring the signed-in branch
        if (cancelled) return;
        setProgress(getLocalProgress());
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { progress, loading };
}
