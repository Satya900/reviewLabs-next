// app/challenges/[slug]/ChallengeRunner.tsx
"use client";

import { useState, useEffect } from "react";
import { Challenge } from "@/lib/challenges/types";
import Timer from "@/components/challenge/Timer";
import DifficultyBadge from "@/components/challenge/DifficultyBadge";
import CategoryTag from "@/components/challenge/CategoryTag";
import McqOptions from "@/components/challenge/McqOptions";
import ExplanationPanel from "@/components/challenge/ExplanationPanel";
import { saveLocalProgress } from "@/lib/progress/localStorage";
import { useProgress } from "@/lib/progress/useProgress";
import { useAuth } from "@/lib/supabase/AuthProvider";

interface ChallengeRunnerProps {
  challenge: Challenge;
  prevSlug: string | null;
  nextSlug: string | null;
  codeBlock: React.ReactNode;
}

function saveAttempt(
  isSignedIn: boolean,
  slug: string,
  isCorrect: boolean,
  timeSeconds: number
) {
  if (isSignedIn) {
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeSlug: slug, isCorrect, timeSeconds }),
    }).catch((err) => console.error("Failed to save attempt:", err));
  } else {
    saveLocalProgress({
      slug,
      isCorrect,
      timeSeconds,
      attemptedAt: new Date().toISOString(),
    });
  }
}

export default function ChallengeRunner({
  challenge,
  prevSlug,
  nextSlug,
  codeBlock,
}: ChallengeRunnerProps) {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrectAttempt, setIsCorrectAttempt] = useState(false);

  // Reset the runner whenever the user navigates to a different challenge.
  useEffect(() => {
    setSelectedIndex(null);
    setSubmitted(false);
    setStartTime(Date.now());
    setTimeElapsed(0);
  }, [challenge.slug]);

  // Once progress has loaded, reveal the explanation immediately for challenges
  // already solved (locally or, for signed-in users, in Supabase).
  useEffect(() => {
    if (progressLoading) return;
    const solvedChallenge = progress.find((p) => p.slug === challenge.slug);
    if (solvedChallenge) {
      setSubmitted(true);
      setIsCorrectAttempt(solvedChallenge.isCorrect);
    }
  }, [challenge.slug, progress, progressLoading]);

  const handleSubmit = () => {
    if (selectedIndex === null || submitted) return;

    const correct = selectedIndex === challenge.correctAnswerIndex;
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);
    setTimeElapsed(timeSeconds);
    setSubmitted(true);
    setIsCorrectAttempt(correct);

    saveAttempt(Boolean(user), challenge.slug, correct, timeSeconds);
  };

  const handleTimerExpire = () => {
    if (submitted) return;
    setSubmitted(true);
    setIsCorrectAttempt(false);
    saveAttempt(Boolean(user), challenge.slug, false, challenge.timeMinutes * 60);
  };

  return (
    <div className="flex-1 flex flex-col pb-20 select-none">
      {/* 1. Timer Bar (sticky at the top, active until submitted) */}
      {!submitted && (
        <Timer
          totalSeconds={challenge.timeMinutes * 60}
          onExpire={handleTimerExpire}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pt-10 space-y-8">
        {/* Challenge Header Metas */}
        <div className="flex flex-wrap items-center gap-3">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <CategoryTag category={challenge.category} />
          {challenge.framework && (
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-border-subt bg-surface-elevated text-xs font-sans font-medium text-txt-secondary select-none">
              {challenge.framework}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl text-txt-primary">
            {challenge.title}
          </h1>
          <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
            {challenge.context}
          </p>
        </div>

        {/* Code Block Container */}
        <div className={`relative ${submitted ? "reveal-bug" : ""}`}>
          {codeBlock}
        </div>

        {/* Question & Options */}
        <div className="space-y-4 pt-4">
          <h2 className="text-[10px] font-sans font-bold text-txt-primary uppercase tracking-widest">
            {challenge.question}
          </h2>
          <McqOptions
            options={challenge.options}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            correctIndex={submitted ? challenge.correctAnswerIndex : null}
            submitted={submitted}
          />
        </div>

        {/* Action Button */}
        {!submitted && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={selectedIndex === null}
              className={`px-6 h-10 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
                selectedIndex === null
                  ? "bg-surface-elevated text-stone border border-border-subt cursor-not-allowed"
                  : "bg-accent hover:bg-accent-hover text-txt-inverse cursor-pointer active:scale-95"
              }`}
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Explanation Panel */}
        {submitted && (
          <ExplanationPanel
            explanation={challenge.explanation}
            prevSlug={prevSlug}
            nextSlug={nextSlug}
          />
        )}
      </main>
    </div>
  );
}
