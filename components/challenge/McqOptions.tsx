// components/challenge/McqOptions.tsx
"use client";

interface McqOptionsProps {
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  correctIndex: number | null;
  submitted: boolean;
}

export default function McqOptions({
  options,
  selectedIndex,
  onSelect,
  correctIndex,
  submitted,
}: McqOptionsProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correctIndex === index;
        const isWrong = submitted && isSelected && !isCorrect;

        let borderClass = "border-border-subt";
        let bgClass = "bg-surface-card";
        let hoverClass = "hover:border-border-def hover:bg-surface-elevated";
        let opacityClass = "opacity-100";
        let cursorClass = "cursor-pointer";

        if (submitted) {
          cursorClass = "cursor-default";
          hoverClass = ""; // disable hover styles after submission

          if (isCorrect) {
            borderClass = "border-success";
            bgClass = "bg-success-subtle";
          } else if (isWrong) {
            borderClass = "border-danger";
            bgClass = "bg-danger-subtle";
          } else {
            // Option was not selected and is not correct
            opacityClass = "opacity-50";
            borderClass = "border-border-subt";
            bgClass = "bg-surface-card";
          }
        } else if (isSelected) {
          borderClass = "border-accent";
          bgClass = "bg-accent-subtle";
        }

        return (
          <div
            key={index}
            onClick={() => !submitted && onSelect(index)}
            className={`flex items-start gap-3.5 p-4 rounded-md border-2 transition-all duration-150 ${borderClass} ${bgClass} ${hoverClass} ${opacityClass} ${cursorClass} select-none`}
          >
            {/* Visual Radio Bullet */}
            <div className="flex items-center justify-center mt-1 flex-shrink-0">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  submitted && isCorrect
                    ? "border-success bg-success"
                    : submitted && isWrong
                    ? "border-danger bg-danger"
                    : isSelected
                    ? "border-accent bg-accent"
                    : "border-border-def bg-transparent"
                }`}
              >
                {(isSelected || (submitted && (isCorrect || isWrong))) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Option Text */}
            <div className="flex-1 text-sm font-medium leading-relaxed text-txt-primary">
              {option}
            </div>
          </div>
        );
      })}
    </div>
  );
}
