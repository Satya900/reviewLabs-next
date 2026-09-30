"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ResolveTicketForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [fixNote, setFixNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolved, setResolved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixNote }),
      });
      if (res.ok) {
        setResolved(true);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (resolved) {
    return (
      <p className="text-sm font-semibold text-wise-positive-deep">
        Marked as resolved. This note becomes reply context once Google sync is on.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Label htmlFor="fix-note">What did you do to fix it?</Label>
      <Textarea
        id="fix-note"
        value={fixNote}
        onChange={(e) => setFixNote(e.target.value)}
        rows={3}
        placeholder="e.g. Moved afternoon bookings to staggered 20-minute slots."
        required
      />
      <Button type="submit" disabled={submitting || !fixNote} className="self-start">
        {submitting ? "Saving…" : "Mark as resolved"}
      </Button>
    </form>
  );
}
