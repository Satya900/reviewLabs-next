// components/challenge/DifficultyBadge.tsx
import { Difficulty } from "@/lib/challenges/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  let dotColorClass = "bg-success";
  if (difficulty === "medium") {
    dotColorClass = "bg-warning";
  } else if (difficulty === "hard") {
    dotColorClass = "bg-danger";
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium select-none bg-surface-elevated text-txt-secondary border border-border-subt"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
      <span className="lowercase">{difficulty}</span>
    </span>
  );
}
