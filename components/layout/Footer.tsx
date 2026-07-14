// components/layout/Footer.tsx
import Link from "next/link";
import { Sparkles, Terminal } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/shared/SocialIcons";

export default function Footer() {
  return (
    <footer className="w-full bg-canvas border-t border-border-subt py-16 px-6 mt-auto select-none font-sans text-xs">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Top multi-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Status column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Terminal className="w-4.5 h-4.5 text-accent-text" />
              <span className="font-mono font-bold tracking-tight text-sm text-txt-primary">
                ReviewLabs
              </span>
            </Link>
            <p className="text-txt-tertiary leading-relaxed font-sans max-w-sm">
              Practice catching the subtle logic errors, hallucinated APIs, and security loopholes that Copilot, Cursor, and Claude Code leave in your PRs.
            </p>
            {/* Status Dot component */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border-subt rounded-full">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-sans font-medium text-txt-secondary uppercase tracking-wider">
                Status: Operational
              </span>
            </div>
          </div>

          {/* Quick links column */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-txt-primary tracking-wide uppercase text-[10px]">
              Platform
            </h4>
            <ul className="space-y-2 text-txt-tertiary">
              <li>
                <Link href="/challenges" className="hover:text-txt-primary transition-colors">
                  All Challenges
                </Link>
              </li>
              <li>
                <Link href="/mock-interview" className="hover:text-txt-primary transition-colors">
                  Mock Interview
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-txt-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-txt-primary transition-colors">
                  About the Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner & Social column */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-txt-primary tracking-wide uppercase text-[10px]">
              Partner
            </h4>
            <div className="space-y-4">
              <a
                href="#"
                className="group flex items-start gap-1.5 text-txt-tertiary hover:text-txt-primary transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-text mt-0.5" />
                <div>
                  <span className="font-semibold block text-txt-secondary group-hover:text-txt-primary">BugLens</span>
                  <span className="text-[11px] text-txt-tertiary block leading-snug">Automated PR code auditing agent.</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-subt" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-txt-tertiary">
          <div className="flex items-center gap-2">
            <span>© 2026 ReviewLabs.</span>
            <span>·</span>
            <span>
              By{" "}
              <a
                href="https://github.com/Satya900"
                target="_blank"
                rel="noopener noreferrer"
                className="text-txt-secondary hover:text-txt-primary font-medium"
              >
                @satyatechgeek
              </a>
            </span>
          </div>

          {/* Social Icons row */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Satya900"
              target="_blank"
              rel="noopener noreferrer"
              className="text-txt-tertiary hover:text-txt-primary transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-txt-tertiary hover:text-txt-primary transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-txt-tertiary hover:text-txt-primary transition-colors"
              aria-label="Twitter/X"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
