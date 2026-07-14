// app/challenges/page.tsx
import { loadChallenges } from "@/lib/challenges/loader";
import ChallengeBrowser from "./ChallengeBrowser";

export const metadata = {
  title: "Browse Practice Challenges — ReviewLabs",
  description: "Explore our collection of AI-generated code review challenges, filtered by category and difficulty.",
};

export default async function ChallengesPage() {
  const challenges = loadChallenges();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12">
      <div className="space-y-3 mb-10 select-none">
        <h1 className="font-display text-4xl sm:text-5xl text-txt-primary">
          Practice Challenges
        </h1>
        <p className="text-sm text-txt-secondary max-w-xl font-sans-humanist tracking-wide leading-relaxed">
          Sharpen your code review heuristics by identifying subtle bugs, race conditions, and hallucinated APIs inside pre-authored snippets.
        </p>
      </div>

      <ChallengeBrowser challenges={challenges} />
    </div>
  );
}
