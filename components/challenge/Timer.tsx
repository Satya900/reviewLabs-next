// components/challenge/Timer.tsx
"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  totalSeconds: number;
  onExpire: () => void;
  isPaused?: boolean;
}

export default function Timer({ totalSeconds, onExpire, isPaused = false }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, isPaused, onExpire]);

  const percentage = (secondsLeft / totalSeconds) * 100;
  const isWarning = percentage <= 20 && percentage > 10;
  const isDanger = percentage <= 10;

  // Determine progress bar color
  let barColorClass = "bg-accent";
  if (isDanger) {
    barColorClass = "bg-danger";
  } else if (isWarning) {
    barColorClass = "bg-warning";
  }

  // Format time (MM:SS)
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="sticky top-16 z-30 w-full bg-canvas/80 backdrop-blur-md border-b border-border-subt select-none">
      <div className="flex items-center justify-between px-4 py-2 max-w-3xl mx-auto h-12">
        <span className="text-[10px] font-sans font-bold text-txt-tertiary uppercase tracking-widest">
          Time Remaining
        </span>
        <span
          className={`font-mono text-xs font-semibold tabular-nums px-2.5 py-1 rounded border ${
            isDanger
              ? "text-danger bg-danger-subtle border-danger/20"
              : isWarning
              ? "text-warning bg-warning-subtle border-warning/20"
              : "text-txt-primary bg-surface-elevated border-border-subt"
          }`}
        >
          {formattedTime}
        </span>
      </div>
      <div className="w-full h-[2px] bg-border-subt">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
