// components/challenge/ExplanationPanel.tsx
"use client";

import { AlertTriangle, Bot, CheckCircle, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ExplanationPanelProps {
  explanation: {
    theBug: string;
    whyAIGeneratesThis: string;
    theFix: {
      before: string;
      after: string;
      commentary?: string;
    };
    reviewHeuristic: string;
  };
  nextSlug?: string | null;
  prevSlug?: string | null;
}

export default function ExplanationPanel({
  explanation,
  nextSlug,
  prevSlug,
}: ExplanationPanelProps) {
  return (
    <div className="mt-10 space-y-6 border-t border-border-subt pt-8 animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
      <h3 className="text-lg font-sans font-bold text-txt-primary tracking-tight">Review Explanation</h3>

      {/* 1. The Bug */}
      <div className="flex gap-4 p-5 rounded-lg bg-danger-subtle border border-[#dc2626]/15">
        <div className="text-danger flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[10px] font-sans font-bold text-danger uppercase tracking-widest mb-1.5">
            The Bug
          </h4>
          <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
            {explanation.theBug}
          </p>
        </div>
      </div>

      {/* 2. Why AI Generates This */}
      <div className="flex gap-4 p-5 rounded-lg bg-[#62aef0]/10 border border-[#62aef0]/25">
        <div className="text-[#2a72c9] flex-shrink-0 mt-0.5">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[10px] font-sans font-bold text-[#2a72c9] uppercase tracking-widest mb-1.5">
            Why AI Generates This
          </h4>
          <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
            {explanation.whyAIGeneratesThis}
          </p>
        </div>
      </div>

      {/* 3. The Fix (Visual Diff) */}
      <div className="flex gap-4 p-5 rounded-lg bg-surface-card border border-border-subt">
        <div className="text-success flex-shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-sans font-bold text-success-text uppercase tracking-widest mb-3">
            The Fix
          </h4>
          <div className="space-y-3 font-mono text-xs overflow-x-auto">
            {/* Before (Buggy) */}
            <div className="p-4 rounded bg-danger-subtle border border-[#dc2626]/15 text-txt-secondary relative">
              <span className="absolute right-3 top-3 px-1.5 py-0.5 text-[9px] uppercase font-bold text-danger-text bg-white/60 border border-[#dc2626]/25 rounded select-none">
                Before
              </span>
              <pre className="line-through opacity-70 select-none pr-14 leading-relaxed font-mono">{explanation.theFix.before}</pre>
            </div>
            {/* After (Fixed) */}
            <div className="p-4 rounded bg-success-subtle border border-[#1aae39]/15 text-success-text relative">
              <span className="absolute right-3 top-3 px-1.5 py-0.5 text-[9px] uppercase font-bold text-success-text bg-white/60 border border-[#1aae39]/25 rounded select-none">
                After
              </span>
              <pre className="font-semibold pr-14 leading-relaxed font-mono">{explanation.theFix.after}</pre>
            </div>
          </div>
          {explanation.theFix.commentary && (
            <p className="text-xs text-txt-tertiary mt-3 italic font-sans-humanist">
              {explanation.theFix.commentary}
            </p>
          )}
        </div>
      </div>

      {/* 4. Review Heuristic */}
      <div className="flex gap-4 p-5 rounded-lg bg-warning-subtle border border-[#dd5b00]/20">
        <div className="text-warning-text flex-shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[10px] font-sans font-bold text-warning-text uppercase tracking-widest mb-1.5">
            Review Heuristic
          </h4>
          <p className="text-sm font-semibold text-warning-text leading-relaxed font-sans-humanist">
            {explanation.reviewHeuristic}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-border-subt mt-8">
        {prevSlug ? (
          <Link
            href={`/challenges/${prevSlug}`}
            className="flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary border border-border-subt hover:border-border-def bg-surface-elevated px-4 h-9 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
        ) : (
          <div />
        )}

        {nextSlug ? (
          <Link
            href={`/challenges/${nextSlug}`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-accent hover:bg-accent-hover text-txt-inverse px-5 h-9 rounded-full transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 text-xs font-semibold bg-accent hover:bg-accent-hover text-txt-inverse px-5 h-9 rounded-full transition-colors"
          >
            Browse All
          </Link>
        )}
      </div>
    </div>
  );
}
