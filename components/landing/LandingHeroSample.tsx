// components/landing/LandingHeroSample.tsx
"use client";

import { useState } from "react";
import { Challenge } from "@/lib/challenges/types";
import McqOptions from "@/components/challenge/McqOptions";
import ExplanationPanel from "@/components/challenge/ExplanationPanel";
import { saveLocalProgress } from "@/lib/progress/localStorage";
import DifficultyBadge from "@/components/challenge/DifficultyBadge";
import CategoryTag from "@/components/challenge/CategoryTag";

interface LandingHeroSampleProps {
  challenge: Challenge;
  codeBlock: React.ReactNode;
}

export default function LandingHeroSample({
  challenge,
  codeBlock,
}: LandingHeroSampleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null || submitted) return;

    const correct = selectedIndex === challenge.correctAnswerIndex;
    setIsCorrect(correct);
    setSubmitted(true);

    saveLocalProgress({
      slug: challenge.slug,
      isCorrect: correct,
      timeSeconds: 15, // Mock time for landing page preview
      attemptedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="w-full border border-border-subt rounded-lg bg-surface-card p-8 space-y-6 [box-shadow:var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <CategoryTag category={challenge.category} />
        </div>
        <span className="text-[10px] font-sans font-medium uppercase tracking-widest bg-surface-elevated text-txt-secondary px-2.5 py-1 border border-border-subt rounded-full select-none">
          Interactive Sample
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-sans font-bold text-txt-primary tracking-tight">
          {challenge.title}
        </h3>
        <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
          {challenge.context}
        </p>
      </div>

      {/* Code block (will get reveal-bug when submitted) */}
      <div className={`relative ${submitted ? "reveal-bug" : "subtle-bug"}`}>
        {codeBlock}
      </div>

      {/* MCQ options */}
      <div className="space-y-4 pt-2">
        <h4 className="text-[10px] font-sans font-bold text-txt-primary uppercase tracking-widest">
          {challenge.question}
        </h4>
        <McqOptions
          options={challenge.options}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          correctIndex={submitted ? challenge.correctAnswerIndex : null}
          submitted={submitted}
        />
      </div>

      {/* Action Button */}
      {!submitted ? (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className={`px-5 h-9 rounded-full text-xs font-medium tracking-wide transition-all duration-150 ${
              selectedIndex === null
                ? "bg-surface-elevated text-stone border border-border-subt cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover text-txt-inverse cursor-pointer active:scale-95"
            }`}
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="pt-6 border-t border-border-subt animate-in fade-in duration-300">
          <h4 className="text-sm font-sans font-bold text-txt-primary mb-4 flex items-center gap-2">
            Result: {isCorrect ? (
              <span className="text-success">✅ Correct Answer</span>
            ) : (
              <span className="text-danger">❌ Incorrect Attempt</span>
            )}
          </h4>
          <ExplanationPanel
            explanation={challenge.explanation}
            nextSlug={null}
            prevSlug={null}
          />
        </div>
      )}
    </div>
  );
}
