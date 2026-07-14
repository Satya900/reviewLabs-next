// app/mock-interview/play/page.tsx
import { loadChallenges } from "@/lib/challenges/loader";
import { highlightCode } from "@/lib/shiki/highlighter";
import MockRunner from "./MockRunner";

export const dynamic = "force-dynamic";

export default async function MockPlayPage() {
  const challenges = loadChallenges();

  // Pre-render highlighted HTML for all challenges on the server
  const highlightedCodeMap: Record<string, string> = {};
  for (const c of challenges) {
    highlightedCodeMap[c.slug] = await highlightCode(
      c.code.snippet,
      c.code.language,
      c.explanation.theFix.before
    );
  }

  return (
    <MockRunner
      challenges={challenges}
      highlightedCodeMap={highlightedCodeMap}
    />
  );
}
