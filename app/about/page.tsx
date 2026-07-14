// app/about/page.tsx
import { Globe, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/shared/SocialIcons";

export const metadata = {
  title: "About Satyabrata & ReviewLabs",
  description: "Learn about the mission behind ReviewLabs: helping developers transition from passive AI code acceptors to critical reviewers.",
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-16 space-y-16 select-none">
      {/* 1. Header */}
      <div className="space-y-4">
        <h1 className="font-display text-4xl sm:text-5xl text-txt-primary">
          The ReviewLabs Mission
        </h1>
        <p className="text-base text-txt-secondary leading-relaxed font-sans-humanist tracking-wide">
          AI coding tools generate code in seconds. But reviewing that code requires sharp engineering heuristics. We built ReviewLabs to make code reviewing a core interactive practice skill.
        </p>
      </div>

      {/* 2. Biography Section */}
      <div className="p-8 border border-border-subt rounded-lg bg-surface-card flex flex-col md:flex-row gap-6 items-start">
        {/* Creator Identity Details */}
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-medium select-none bg-surface-elevated text-txt-secondary border border-border-subt">
              The Creator
            </span>
            <h2 className="text-xl font-sans font-bold text-txt-primary tracking-tight">Satyabrata Mohanty</h2>
            <p className="text-xs text-txt-tertiary font-mono">@satyatechgeek · software developer</p>
          </div>

          <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
            Hey! I am Satya. I&rsquo;ve spent years building developer tooling, and recently noticed a concerning trend: developers are hitting Tab to accept AI suggestions faster than they can critically evaluate them.
          </p>
          
          <p className="text-sm text-txt-secondary leading-relaxed font-sans-humanist">
            This creates a new skill gap. Junior developers push PRs filled with subtle bugs because their AI told them it works. Seniors have to catch these before they make it to production. ReviewLabs is designed to build the pattern recognition needed to catch LLM bugs quickly.
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://github.com/Satya900"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-txt-secondary hover:text-txt-primary border border-border-subt px-3 py-1.5 rounded-full hover:bg-surface-elevated hover:border-border-def transition-all"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-txt-secondary hover:text-txt-primary border border-border-subt px-3 py-1.5 rounded-full hover:bg-surface-elevated hover:border-border-def transition-all"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              LinkedIn
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-txt-secondary hover:text-txt-primary border border-border-subt px-3 py-1.5 rounded-full hover:bg-surface-elevated hover:border-border-def transition-all"
            >
              <TwitterIcon className="w-3.5 h-3.5" />
              Twitter/X
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-txt-secondary hover:text-txt-primary border border-border-subt px-3 py-1.5 rounded-full hover:bg-surface-elevated hover:border-border-def transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          </div>
        </div>
      </div>

      {/* 3. Core Philosophy Q&A */}
      <div className="space-y-8">
        <h3 className="text-[10px] font-sans font-bold text-txt-primary border-b border-border-subt pb-3 uppercase tracking-widest">
          Why ReviewLabs?
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-txt-primary tracking-tight">LeetCode is for writing, ReviewLabs is for reading.</h4>
            <p className="text-xs text-txt-secondary leading-relaxed font-sans-humanist">
              Most platforms focus on writing code. But in professional settings, engineers spend 70% of their time reading and reviewing code. In an era where AI drafts the initial version of everything, the premium skill shifts from writing boilerplate to correcting flaws.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-txt-primary tracking-tight">Is this a commercial product?</h4>
            <p className="text-xs text-txt-secondary leading-relaxed font-sans-humanist">
              No. ReviewLabs is 100% free and open-source. No subscription, no paywalls, ever. It is built as a pure educational workspace to support the developer community in India and globally.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-txt-primary tracking-tight">How do we pick the challenges?</h4>
            <p className="text-xs text-txt-secondary leading-relaxed font-sans-humanist">
              All challenges are curated from real-world PR bugs generated by Copilot, Cursor, or ChatGPT in real repositories. We categorize them into distinct developer heuristics so you can learn why they happen and how to correct them.
            </p>
          </div>
        </div>
      </div>

      {/* 4. BugLens callout */}
      <div className="flex gap-4 p-5 rounded-lg bg-surface-card border border-border-subt text-xs leading-relaxed text-txt-secondary">
        <Sparkles className="w-5 h-5 text-accent-text flex-shrink-0 mt-0.5" />
        <div className="font-sans-humanist">
          <span className="font-bold text-txt-primary">Wait, what is BugLens?</span> ReviewLabs is an interactive training ground. If you&rsquo;re looking for an automated assistant that helps catch these exact bugs inside your GitHub PR workflows, check out{" "}
          <a
            href="#"
            className="font-semibold text-txt-primary hover:underline"
          >
            BugLens
          </a>
          , our companion code-auditing project.
        </div>
      </div>
    </div>
  );
}
