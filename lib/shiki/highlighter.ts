// lib/shiki/highlighter.ts
import { createHighlighter, type Highlighter } from "shiki";

let highlighterInstance: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  highlighterInstance = await createHighlighter({
    themes: ["github-dark"],
    langs: ["javascript", "typescript", "jsx", "tsx", "python", "sql", "bash"],
  });

  return highlighterInstance;
}

function getHastText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (node.children) {
    return node.children.map(getHastText).join("");
  }
  return "";
}

export async function highlightCode(
  code: string,
  lang: string,
  buggyText?: string
): Promise<string> {
  const highlighter = await getHighlighter();
  const transformers: any[] = [];

  if (buggyText) {
    transformers.push({
      name: "bug-highlighter",
      line(node: any) {
        const text = getHastText(node);
        const cleanText = text.replace(/\s+/g, " ").trim();
        const cleanBuggy = buggyText.replace(/\s+/g, " ").trim();

        if (cleanBuggy && cleanText.includes(cleanBuggy)) {
          this.addClassToHast(node, "shiki-buggy-line");
        }
      },
    });
  }

  try {
    return highlighter.codeToHtml(code, {
      lang,
      theme: "github-dark",
      transformers,
    });
  } catch (error) {
    console.error(`Shiki highlight error for language ${lang}:`, error);
    // Fallback if formatting fails
    return `<pre class="shiki"><code>${code}</code></pre>`;
  }
}
