// app/mock-interview/play/MockRunner.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Challenge } from "@/lib/challenges/types";
import McqOptions from "@/components/challenge/McqOptions";
import DifficultyBadge from "@/components/challenge/DifficultyBadge";
import CategoryTag from "@/components/challenge/CategoryTag";
import { Timer as TimerIcon, ChevronRight, Play } from "lucide-react";

interface MockRunnerProps {
  challenges: Challenge[];
  highlightedCodeMap: Record<string, string>;
}

export interface MockSessionResult {
  id: string;
  score: number;
  timeSeconds: number;
  attempts: {
    slug: string;
    title: string;
    category: string;
    difficulty: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    timeTaken: number;
  }[];
  createdAt: string;
}

export default function MockRunner({ challenges, highlightedCodeMap }: MockRunnerProps) {
  const router = useRouter();
  const [selectedChallenges, setSelectedChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes
  const [startTime, setStartTime] = useState(0);
  const [challengeStartTimes, setChallengeStartTimes] = useState<Record<string, number>>({});
  const [challengeTimesTaken, setChallengeTimesTaken] = useState<Record<string, number>>({});
  const [isStarted, setIsStarted] = useState(false);

  // Initialize session
  const initializeSession = () => {
    // Pick 3 random challenges from different categories if possible
    const shuffled = [...challenges].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    // Sort selected by difficulty: easy -> medium -> hard
    const diffWeights = { easy: 1, medium: 2, hard: 3 };
    selected.sort((a, b) => diffWeights[a.difficulty] - diffWeights[b.difficulty]);

    setSelectedChallenges(selected);
    setStartTime(Date.now());
    
    // Set start time for first challenge
    const now = Date.now();
    setChallengeStartTimes({
      [selected[0].slug]: now
    });
    
    setIsStarted(true);
  };

  // Timer effect
  useEffect(() => {
    if (!isStarted || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishSession(true); // Auto-finish on expire
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, secondsLeft]);

  // Handle submit for current challenge
  const handleNextChallenge = () => {
    const currentChallenge = selectedChallenges[currentIndex];
    const now = Date.now();
    const prevChallengeStart = challengeStartTimes[currentChallenge.slug] || startTime;
    const timeTaken = Math.round((now - prevChallengeStart) / 1000);

    // Save time taken for this challenge
    setChallengeTimesTaken((prev) => ({
      ...prev,
      [currentChallenge.slug]: timeTaken
    }));

    if (currentIndex < selectedChallenges.length - 1) {
      const nextChallenge = selectedChallenges[currentIndex + 1];
      setChallengeStartTimes((prev) => ({
        ...prev,
        [nextChallenge.slug]: now
      }));
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 3!
      handleFinishSession(false);
    }
  };

  // Compile and redirect to results
  const handleFinishSession = (expired = false) => {
    const finalAnswers = { ...selectedAnswers };
    const finalTimes = { ...challengeTimesTaken };
    const now = Date.now();

    // If session finished normally, calculate the last challenge's time
    if (!expired && selectedChallenges[currentIndex]) {
      const currentChallenge = selectedChallenges[currentIndex];
      const prevChallengeStart = challengeStartTimes[currentChallenge.slug] || startTime;
      finalTimes[currentChallenge.slug] = Math.round((now - prevChallengeStart) / 1000);
    }

    // Auto-fill unanswered questions with -1 if expired
    selectedChallenges.forEach((c) => {
      if (finalAnswers[c.slug] === undefined) {
        finalAnswers[c.slug] = -1;
      }
      if (finalTimes[c.slug] === undefined) {
        finalTimes[c.slug] = 0;
      }
    });

    // Calculate score
    let score = 0;
    const attempts = selectedChallenges.map((c) => {
      const isCorrect = finalAnswers[c.slug] === c.correctAnswerIndex;
      if (isCorrect) score += 1;

      return {
        slug: c.slug,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        selectedIndex: finalAnswers[c.slug],
        correctIndex: c.correctAnswerIndex,
        isCorrect,
        timeTaken: finalTimes[c.slug],
      };
    });

    const totalTimeTaken = Math.round((now - startTime) / 1000);
    const sessionId = `session_${Math.random().toString(36).substring(2, 11)}`;

    const resultObject: MockSessionResult = {
      id: sessionId,
      score,
      timeSeconds: totalTimeTaken,
      attempts,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage
    localStorage.setItem(`mock_result_${sessionId}`, JSON.stringify(resultObject));

    // Redirect to results page
    router.push(`/mock-interview/results/${sessionId}`);
  };

  // Format time
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (!isStarted) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center space-y-8 select-none">
        <h2 className="text-xl font-sans font-bold text-txt-primary tracking-tight">Ready to begin your session?</h2>
        <p className="text-xs text-txt-secondary leading-relaxed font-sans-humanist">
          The 10-minute timer starts immediately upon clicking the button below. Ensure you have a quiet environment.
        </p>
        <button
          onClick={initializeSession}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-txt-inverse text-xs font-semibold py-3.5 rounded-full transition-colors cursor-pointer [box-shadow:var(--shadow-soft)]"
        >
          <Play className="w-4 h-4" />
          Start Session Now
        </button>
      </div>
    );
  }

  const currentChallenge = selectedChallenges[currentIndex];
  if (!currentChallenge) return null;

  const currentSelected = selectedAnswers[currentChallenge.slug] ?? null;
  const isLast = currentIndex === selectedChallenges.length - 1;

  return (
    <div className="flex-grow flex flex-col pb-20 select-none">
      {/* Timer Header */}
      <div className="sticky top-16 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border-subt select-none">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-3xl mx-auto h-12">
          <span className="text-[10px] font-sans font-bold text-txt-tertiary uppercase tracking-widest flex items-center gap-1.5">
            <TimerIcon className="w-4 h-4 text-accent-text" />
            Interview Session
          </span>
          <span className="text-[10px] font-sans font-bold text-txt-tertiary uppercase tracking-widest">
            Snippet {currentIndex + 1} of {selectedChallenges.length}
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums px-2.5 py-1 rounded border text-txt-primary bg-surface-elevated border-border-subt">
            {formattedTime}
          </span>
        </div>
        <div className="w-full h-[2px] bg-border-subt">
          <div
            className="h-full bg-accent transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 600) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pt-10 space-y-8">
        {/* Metas */}
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={currentChallenge.difficulty} />
          <CategoryTag category={currentChallenge.category} />
          {currentChallenge.framework && (
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-border-subt bg-surface-elevated text-xs font-sans font-medium text-txt-secondary">
              {currentChallenge.framework}
            </span>
          )}
        </div>

        {/* Context */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl text-txt-primary">
            {currentChallenge.title}
          </h1>
          <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
            {currentChallenge.context}
          </p>
        </div>

        {/* CodeBlock (rendered from pre-highlighted map with Window Chrome) */}
        <div className="border border-border-subt rounded-lg overflow-hidden bg-code-bg text-[13px] font-mono flex flex-col">
          {/* Header Chrome — stays dark like a real editor title bar */}
          <div className="border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-success opacity-80" />
            </div>
            {currentChallenge.code.filename && (
              <div className="text-[11px] font-mono text-txt-code bg-code-bg px-3 py-1 rounded border border-white/6 font-medium">
                {currentChallenge.code.filename}
              </div>
            )}
          </div>
          <div
            className="relative overflow-x-auto flex-1"
            dangerouslySetInnerHTML={{ __html: highlightedCodeMap[currentChallenge.slug] }}
          />
        </div>

        {/* MCQ Question */}
        <div className="space-y-4 pt-4">
          <h2 className="text-[10px] font-sans font-bold text-txt-primary uppercase tracking-widest">
            {currentChallenge.question}
          </h2>
          <McqOptions
            options={currentChallenge.options}
            selectedIndex={currentSelected}
            onSelect={(idx) =>
              setSelectedAnswers((prev) => ({
                ...prev,
                [currentChallenge.slug]: idx,
              }))
            }
            correctIndex={null}
            submitted={false}
          />
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleNextChallenge}
            disabled={currentSelected === null}
            className={`flex items-center gap-1 px-5 h-10 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
              currentSelected === null
                ? "bg-surface-elevated text-stone border border-border-subt cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover text-txt-inverse cursor-pointer active:scale-95"
            }`}
          >
            {isLast ? "Finish Interview" : "Next Snippet"}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </main>
    </div>
  );
}
