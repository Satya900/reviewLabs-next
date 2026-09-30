"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function SyncGoogleButton({ outletId }: { outletId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("loading");
    const res = await fetch("/api/google/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outletId }),
    });
    const data = await res.json();
    if (data.ok) {
      setMessage(`Synced ${data.synced} new review(s), drafted ${data.drafted}, auto-published ${data.autoPublished}.`);
      setStatus("idle");
      router.refresh();
    } else {
      setMessage(data.error);
      setStatus("error");
    }
  }

  return (
    <div>
      <Button size="sm" variant="outline" onClick={handleSync} disabled={status === "loading"}>
        <RefreshCw className="size-3.5" />
        {status === "loading" ? "Syncing…" : "Sync now"}
      </Button>
      {message && (
        <p className={`mt-2 text-xs ${status === "error" ? "text-wise-negative" : "text-wise-mute"}`}>{message}</p>
      )}
    </div>
  );
}
