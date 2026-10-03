"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WebhookSettings({
  outletId,
  initialWebhookUrl,
  baseUrl,
}: {
  outletId: string;
  initialWebhookUrl: string;
  baseUrl: string;
}) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/outlet-webhooks/${outletId}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setWebhookUrl(`${baseUrl}/api/webhooks/booking/${outletId}?secret=${data.secret}`);
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-wise-mute">
        Paste this URL into your booking or billing tool&apos;s webhook settings. On a completed
        visit, POST <code className="text-xs">{"{ customerName, customerEmail }"}</code> and
        we&apos;ll email a review request automatically.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={webhookUrl} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={handleRegenerate} disabled={regenerating}>
        {regenerating ? "Regenerating…" : "Regenerate secret"}
      </Button>
    </div>
  );
}
