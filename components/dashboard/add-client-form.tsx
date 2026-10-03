"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddClientForm({ showConsequenceCopy }: { showConsequenceCopy: boolean }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [outletName, setOutletName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/agency/add-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, outletName, address }),
    });
    const data = await res.json();
    if (data.ok) {
      setBusinessName("");
      setOutletName("");
      setAddress("");
      setStatus("idle");
      router.refresh();
    } else {
      setError(data.error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-business-name">Client business name</Label>
        <Input
          id="client-business-name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Glow Skin Clinic"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-outlet-name">First outlet name</Label>
        <Input
          id="client-outlet-name"
          required
          value={outletName}
          onChange={(e) => setOutletName(e.target.value)}
          placeholder="Glow Skin Clinic, Koramangala"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-address">Address (optional)</Label>
        <Input
          id="client-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="80 Feet Road, Koramangala, Bengaluru"
        />
      </div>

      {showConsequenceCopy && (
        <p className="text-sm text-wise-mute">
          Adding a second business switches on white-label branding for all your businesses —
          your own name replaces ReviewLabs on customer-facing pages.
        </p>
      )}

      <Button type="submit" disabled={status === "saving"} className="mt-2 self-start">
        {status === "saving" ? "Adding…" : "Add client"}
      </Button>
      {status === "error" && <p className="text-sm text-wise-negative">{error}</p>}
    </form>
  );
}
