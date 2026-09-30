"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function BillingPanel() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/billing/subscribe", { method: "POST" });
    const data = await res.json();

    if (!data.ok) {
      setStatus("error");
      setError(data.error);
      return;
    }

    setStatus("idle");
    const razorpay = new window.Razorpay({
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "ReviewLabs",
      description: "Starter plan, first outlet",
      theme: { color: "#9fe870" },
    });
    razorpay.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Button onClick={handleSubscribe} disabled={status === "loading"}>
        {status === "loading" ? "Starting checkout…" : "Subscribe to Starter"}
      </Button>
      {status === "error" && <p className="mt-3 text-sm text-wise-negative">{error}</p>}
    </>
  );
}
