// components/challenge/CategoryTag.tsx
import { Category } from "@/lib/challenges/types";
import { Ghost, Bug, ShieldAlert, Shuffle, Zap, Puzzle, Package } from "lucide-react";

interface CategoryTagProps {
  category: Category;
  showIcon?: boolean;
}

export const categoryLabels: Record<Category, string> = {
  "hallucinated-apis": "Hallucinated APIs",
  "logic-errors": "Logic Errors",
  "security": "Security",
  "race-conditions": "Race Conditions",
  "performance": "Performance",
  "wrong-patterns": "Wrong Patterns",
  "dependencies": "Dependencies",
};

export default function CategoryTag({ category, showIcon = true }: CategoryTagProps) {
  let colorClass = "";
  let Icon = Package;

  switch (category) {
    case "hallucinated-apis":
      colorClass = "bg-[#d6b6f6]/25 text-[#391c57] border-[#d6b6f6]/60";
      Icon = Ghost;
      break;
    case "logic-errors":
      colorClass = "bg-[#2a9d99]/8 text-[#2a9d99] border-[#2a9d99]/25";
      Icon = Bug;
      break;
    case "security":
      colorClass = "bg-danger-subtle text-danger-text border-[#dc2626]/25";
      Icon = ShieldAlert;
      break;
    case "race-conditions":
      colorClass = "bg-[#dd5b00]/8 text-[#793400] border-[#dd5b00]/25";
      Icon = Shuffle;
      break;
    case "performance":
      colorClass = "bg-success-subtle text-success-text border-[#1aae39]/25";
      Icon = Zap;
      break;
    case "wrong-patterns":
      colorClass = "bg-[#523410]/6 text-[#523410] border-[#523410]/20";
      Icon = Puzzle;
      break;
    case "dependencies":
      colorClass = "bg-black/[0.04] text-txt-tertiary border-border-subt";
      Icon = Package;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-sans font-medium select-none ${colorClass}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {categoryLabels[category]}
    </span>
  );
}
