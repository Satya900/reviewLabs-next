"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [outletName, setOutletName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, outletName, address }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(data.error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="business-name">Business name</Label>
        <Input
          id="business-name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Smile Studio Dental"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="outlet-name">First outlet name</Label>
        <Input
          id="outlet-name"
          required
          value={outletName}
          onChange={(e) => setOutletName(e.target.value)}
          placeholder="Smile Studio Dental, Indiranagar"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address (optional)</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="100 Feet Road, Indiranagar, Bengaluru"
        />
      </div>
      <Button type="submit" disabled={status === "saving"} className="mt-2">
        {status === "saving" ? "Creating…" : "Create business"}
      </Button>
      {status === "error" && <p className="text-sm text-wise-negative">{error}</p>}
    </form>
  );
}
