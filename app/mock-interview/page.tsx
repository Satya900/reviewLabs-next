// app/mock-interview/page.tsx
import { loadChallenges } from "@/lib/challenges/loader";
import { Sparkles, Timer, ShieldAlert, Ban } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mock Interview Mode — ReviewLabs",
  description: "Simulate a real-time technical code review interview. Solve 3 random challenges in 10 minutes.",
};

export default async function MockInterviewIntroPage() {
  const challenges = loadChallenges();
  const hasEnoughChallenges = challenges.length >= 3;

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-20 space-y-10 select-none">
      <div className="text-center space-y-4">
        <div className="p-3 bg-black/[0.05] text-txt-primary border border-border-subt rounded-full w-fit mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-txt-primary">
          Code Review Interview
        </h1>
        <p className="text-sm text-txt-secondary leading-relaxed max-w-sm mx-auto font-sans-humanist tracking-wide">
          Test your code review reflexes under pressure. Simulate a technical round with randomly selected code snippets.
        </p>
      </div>

      {/* Rules Board */}
      <div className="border border-border-subt bg-surface-card rounded-lg p-8 space-y-6">
        <h3 className="text-[10px] font-sans font-bold text-txt-primary uppercase tracking-widest">
          Interview Rules
        </h3>
        
        <div className="space-y-5 text-xs text-txt-secondary font-sans-humanist">
          <div className="flex gap-3.5 items-start">
            <Timer className="w-4.5 h-4.5 text-accent-text flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-sans font-bold text-txt-primary block mb-1">10-Minute Combined Timer</span>
              You have exactly 10 minutes to review and submit answers for all three challenges.
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <ShieldAlert className="w-4.5 h-4.5 text-accent-text flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-sans font-bold text-txt-primary block mb-1">Randomized Challenges</span>
              The engine will compile 3 random snippets covering different categories and difficulty levels.
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <Ban className="w-4.5 h-4.5 text-accent-text flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-sans font-bold text-txt-primary block mb-1">Strict Flow</span>
              No hints. No backtrack navigation. Expirations count as wrong attempts. Explanations are revealed only at the very end.
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      {hasEnoughChallenges ? (
        <div className="text-center pt-2">
          <Link
            href="/mock-interview/play"
            className="block w-full text-center bg-accent hover:bg-accent-hover text-txt-inverse text-sm font-sans font-semibold py-3.5 rounded-full transition-colors [box-shadow:var(--shadow-soft)] cursor-pointer"
          >
            Start Mock Interview
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-md bg-danger-subtle border border-[#dc2626]/20 text-xs text-danger-text text-center font-sans-humanist">
          Mock Interview is disabled. You need to author at least 3 challenges in the repository first.
        </div>
      )}
    </div>
  );
}
