"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ReplyDraftWithReview } from "@/lib/replies";

export function ReplyDraftCard({ draft }: { draft: ReplyDraftWithReview }) {
  const router = useRouter();
  const [text, setText] = useState(draft.draft_text);
  const [submitting, setSubmitting] = useState<"publish" | "reject" | null>(null);
  const [done, setDone] = useState<"published" | "rejected" | null>(null);

  async function handlePublish() {
    setSubmitting("publish");
    const res = await fetch(`/api/replies/${draft.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setDone("published");
      router.refresh();
    }
    setSubmitting(null);
  }

  async function handleReject() {
    setSubmitting("reject");
    const res = await fetch(`/api/replies/${draft.id}/reject`, { method: "POST" });
    if (res.ok) {
      setDone("rejected");
      router.refresh();
    }
    setSubmitting(null);
  }

  if (done) {
    return (
      <Card className="p-5 text-sm text-wise-mute">
        {done === "published" ? "Published to Google." : "Rejected."}
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-wise-ink">{draft.outletName}</span>
        <span>{"★".repeat(draft.stars)}{"☆".repeat(5 - draft.stars)}</span>
      </div>
      {draft.reviewText && <p className="mt-2 text-sm text-wise-body">&ldquo;{draft.reviewText}&rdquo;</p>}
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="mt-3" />
      <p className="mt-1 text-xs text-wise-mute">via {draft.model_used}</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handlePublish} disabled={submitting !== null}>
          {submitting === "publish" ? "Publishing…" : "Publish to Google"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReject} disabled={submitting !== null}>
          Reject
        </Button>
      </div>
    </Card>
  );
}
