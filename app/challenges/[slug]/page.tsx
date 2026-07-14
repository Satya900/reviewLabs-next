// app/challenges/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getChallengeBySlug, loadChallenges } from "@/lib/challenges/loader";
import CodeBlock from "@/components/challenge/CodeBlock";
import ChallengeRunner from "./ChallengeRunner";

// Enable static pre-rendering
export async function generateStaticParams() {
  const challenges = loadChallenges();
  return challenges.map((c) => ({
    slug: c.slug,
  }));
}

interface ChallengePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    notFound();
  }

  // Find surrounding challenges for previous/next navigation
  const allChallenges = loadChallenges();
  const index = allChallenges.findIndex((c) => c.slug === slug);
  const prevSlug = index < allChallenges.length - 1 ? allChallenges[index + 1].slug : null;
  const nextSlug = index > 0 ? allChallenges[index - 1].slug : null;

  // Pre-render Shiki CodeBlock on server side
  const codeBlockElement = (
    <CodeBlock
      code={challenge.code.snippet}
      language={challenge.code.language}
      filename={challenge.code.filename}
      buggyText={challenge.explanation.theFix.before}
    />
  );

  return (
    <ChallengeRunner
      challenge={challenge}
      prevSlug={prevSlug}
      nextSlug={nextSlug}
      codeBlock={codeBlockElement}
    />
  );
}
