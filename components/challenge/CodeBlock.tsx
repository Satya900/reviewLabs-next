// components/challenge/CodeBlock.tsx
import { highlightCode } from "@/lib/shiki/highlighter";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  buggyText?: string;
  reveal?: boolean;
  subtle?: boolean;
}

export default async function CodeBlock({
  code,
  language,
  filename,
  buggyText,
  reveal = false,
  subtle = false,
}: CodeBlockProps) {
  const highlightedHtml = await highlightCode(code, language, buggyText);

  return (
    <div
      className={`border border-border-subt rounded-lg overflow-hidden bg-code-bg text-[13px] font-mono flex flex-col ${
        reveal ? "reveal-bug" : ""
      } ${subtle ? "subtle-bug" : ""}`}
    >
      {/* Header Chrome: Traffic Lights & Tab — stays dark like a real editor title bar,
          independent of the light page theme around it. */}
      <div className="border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5 flex items-center justify-between select-none">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-success opacity-80" />
        </div>

        {/* Filename tab */}
        {filename && (
          <div className="text-[11px] font-mono text-txt-code bg-code-bg px-3 py-1 rounded border border-white/6 font-medium">
            {filename}
          </div>
        )}
      </div>

      {/* Code Well */}
      <div 
        className="relative overflow-x-auto flex-1"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
