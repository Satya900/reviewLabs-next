"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ReplyLanguage } from "@/lib/supabase/types";

const languages: { value: ReplyLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
];

export function ReplySettingsForm({
  outletId,
  initialLanguage,
  initialAutoReply,
}: {
  outletId: string;
  initialLanguage: ReplyLanguage;
  initialAutoReply: boolean;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);
  const [autoReply, setAutoReply] = useState(initialAutoReply);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/reply-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outletId, defaultLanguage: language, autoReply5starNoText: autoReply }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Draft language</Label>
        <div className="mt-2 flex gap-2">
          {languages.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLanguage(l.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                language === l.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-wise-canvas-soft text-wise-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-wise-ink">
        <input
          type="checkbox"
          checked={autoReply}
          onChange={(e) => setAutoReply(e.target.checked)}
          className="size-4 accent-[var(--wise-primary)]"
        />
        Auto-reply to 5-star reviews with no text
      </label>

      <Button size="sm" className="self-start" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}
