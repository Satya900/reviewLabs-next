"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { computeReplySeoMonthlyPrice } from "@/lib/plans";
import type { ReplySeoKeyword } from "@/lib/supabase/types";

export function ReplySeoForm({
  outletId,
  initialKeywords,
}: {
  outletId: string;
  initialKeywords: ReplySeoKeyword[];
}) {
  const router = useRouter();
  const [keywords, setKeywords] = useState(initialKeywords);
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/reply-seo-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outletId, keyword }),
    });
    const data = await res.json();
    if (data.ok) {
      setKeywords((prev) => [...prev, { id: data.id, outlet_id: outletId, keyword, created_at: new Date().toISOString() }]);
      setKeyword("");
      router.refresh();
    } else {
      setError(typeof data.error === "string" ? data.error : "Could not add that keyword");
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    await fetch(`/api/reply-seo-keywords/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const monthlyPrice = computeReplySeoMonthlyPrice(keywords.length);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-wise-mute">
        Service and area keywords woven into your replies when they fit naturally, never into
        the reviews customers write.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. teeth whitening Indiranagar"
          required
        />
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Adding…" : "Add"}
        </Button>
      </form>
      {error && <p className="text-sm text-wise-negative">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <Badge key={k.id} variant="outline" className="gap-1 pr-1.5">
            {k.keyword}
            <button
              type="button"
              onClick={() => handleRemove(k.id)}
              aria-label={`Remove ${k.keyword}`}
              className="text-wise-mute hover:text-wise-negative"
            >
              ×
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && <p className="text-sm text-wise-mute">No keywords yet.</p>}
      </div>

      <p className="text-sm text-wise-mute">
        {keywords.length} keyword{keywords.length === 1 ? "" : "s"} × ₹50/month = ₹{monthlyPrice}
        /month (reference price, not billed automatically yet).
      </p>
    </div>
  );
}
