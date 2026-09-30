"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function PreviewAiReply({ ticketId }: { ticketId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<{ text: string; modelUsed: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePreview() {
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/ai/test-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    });
    const data = await res.json();
    if (data.ok) {
      setResult({ text: data.text, modelUsed: data.modelUsed });
      setStatus("idle");
    } else {
      setError(data.error);
      setStatus("error");
    }
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handlePreview} disabled={status === "loading"}>
        <Sparkles className="size-3.5" />
        {status === "loading" ? "Drafting…" : "Preview AI reply"}
      </Button>
      {result && (
        <div className="mt-3 rounded-xl bg-wise-canvas-soft p-4">
          <p className="text-sm text-wise-ink">{result.text}</p>
          <p className="mt-2 text-xs text-wise-mute">via {result.modelUsed}</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-wise-negative">{error}</p>}
    </div>
  );
}
