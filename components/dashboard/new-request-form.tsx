"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Outlet } from "@/lib/supabase/types";

type Channel = "email" | "whatsapp";

const channels: { value: Channel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

export function NewRequestForm({ outlets }: { outlets: Outlet[] }) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [channel, setChannel] = useState<Channel>("email");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ waLink?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId, channel, customerName, customerContact }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Check the form — something didn't look right."
        );
        return;
      }
      setSent({ waLink: data.waLink });
      setCustomerName("");
      setCustomerContact("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        {sent.waLink ? (
          <>
            <p className="text-sm font-semibold text-wise-positive-deep">
              Request saved. Open WhatsApp to send it.
            </p>
            <a
              href={sent.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[var(--wise-primary-active)]"
            >
              Open WhatsApp
            </a>
          </>
        ) : (
          <p className="text-sm font-semibold text-wise-positive-deep">Request emailed to the customer.</p>
        )}
        <Button variant="outline" size="sm" className="self-start" onClick={() => setSent(null)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="outlet">Outlet</Label>
        <select
          id="outlet"
          value={outletId}
          onChange={(e) => setOutletId(e.target.value)}
          className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          required
        >
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Channel</Label>
        <div className="mt-2 flex gap-2">
          {channels.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setChannel(c.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                channel === c.value ? "bg-primary text-primary-foreground" : "bg-wise-canvas-soft text-wise-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="customer-name">Customer name</Label>
        <Input
          id="customer-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Aditi"
          required
        />
      </div>

      <div>
        <Label htmlFor="customer-contact">
          {channel === "email" ? "Customer email" : "Customer WhatsApp number"}
        </Label>
        <Input
          id="customer-contact"
          type={channel === "email" ? "email" : "tel"}
          value={customerContact}
          onChange={(e) => setCustomerContact(e.target.value)}
          placeholder={channel === "email" ? "aditi@example.com" : "98765 43210"}
          required
        />
      </div>

      {error && <p className="text-sm text-wise-negative">{error}</p>}

      <Button type="submit" disabled={submitting || !outletId} className="self-start">
        {submitting ? "Sending…" : channel === "email" ? "Send email request" : "Get WhatsApp link"}
      </Button>
    </form>
  );
}
