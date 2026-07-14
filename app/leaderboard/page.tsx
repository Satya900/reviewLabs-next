// app/leaderboard/page.tsx
import Link from "next/link";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Leaderboard — ReviewLabs",
  description: "The ReviewLabs leaderboard is coming soon. Sign-in and monthly rankings launch once the community grows.",
};

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-28 text-center space-y-6 select-none">
      <div className="p-3.5 bg-black/[0.05] text-txt-primary border border-border-subt rounded-full w-fit mx-auto">
        <Trophy className="w-7 h-7" />
      </div>

      <h1 className="font-display text-5xl sm:text-6xl text-txt-primary">
        Coming Soon
      </h1>

      <p className="text-sm text-txt-secondary max-w-md mx-auto font-sans-humanist tracking-wide leading-relaxed">
        The reviewer leaderboard goes live once GitHub sign-in ships and real practice activity starts rolling in.
        No fake rankings in the meantime — just an honest &ldquo;not yet.&rdquo;
      </p>

      <div className="pt-4">
        <Link
          href="/challenges"
          className="inline-flex items-center justify-center px-6 h-11 rounded-full text-sm font-sans font-semibold bg-accent hover:bg-accent-hover text-txt-inverse transition-colors [box-shadow:var(--shadow-soft)] active:scale-95 cursor-pointer"
        >
          Start Practicing Instead
        </Link>
      </div>
    </div>
  );
}
