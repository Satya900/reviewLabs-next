"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";
import { computeAuditScore, gradeLabel, type AuditGrade, type ReviewRecency } from "@/lib/audit-score";

const recencyOptions: { value: ReviewRecency; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "1-3mo", label: "1-3 months ago" },
  { value: "3-6mo", label: "3-6 months ago" },
  { value: "6mo-plus", label: "6+ months ago" },
  { value: "unsure", label: "Not sure" },
];

const gradeColor: Record<AuditGrade, string> = {
  excellent: "text-wise-positive-deep",
  good: "text-wise-ink-deep",
  needs_work: "text-wise-warning-deep",
  at_risk: "text-wise-negative",
};

export function AuditForm() {
  const [businessName, setBusinessName] = useState("");
  const [rating, setRating] = useState("4.0");
  const [reviewCount, setReviewCount] = useState("");
  const [recency, setRecency] = useState<ReviewRecency>("month");
  const [result, setResult] = useState<ReturnType<typeof computeAuditScore> | null>(null);

  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");

  function handleScore(e: React.FormEvent) {
    e.preventDefault();
    const parsedRating = Number(rating);
    const parsedCount = Number(reviewCount);
    if (Number.isNaN(parsedRating) || Number.isNaN(parsedCount)) return;
    setResult(computeAuditScore({ rating: parsedRating, reviewCount: parsedCount, recency }));
  }

  async function handleLeadCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    setLeadStatus("saving");
    try {
      const res = await fetch("/api/audit/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName || "Unnamed business",
          email,
          rating: Number(rating),
          reviewCount: Number(reviewCount),
          recency,
        }),
      });
      const data = await res.json();
      setLeadStatus(data.ok ? "sent" : "error");
    } catch {
      setLeadStatus("error");
    }
  }

  if (result) {
    return (
      <Card className="border border-wise-ink/10 p-8">
        <p className="text-sm font-semibold text-wise-mute">{businessName || "Your review health"}</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className={cn("text-5xl font-extrabold", gradeColor[result.grade])}>{result.score}</span>
          <span className="text-lg text-wise-mute">/100</span>
          <span className={cn("text-lg font-bold", gradeColor[result.grade])}>{gradeLabel[result.grade]}</span>
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {result.findings.map((finding, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-wise-body">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wise-ink/40" />
              {finding}
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-wise-canvas-soft pt-6">
          {leadStatus === "sent" ? (
            <p className="text-sm font-semibold text-wise-positive-deep">
              Thanks — we&apos;ll be in touch with tips for your score.
            </p>
          ) : (
            <form onSubmit={handleLeadCapture} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="audit-email">Want tips to improve this score?</Label>
                <Input
                  id="audit-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                />
              </div>
              <Button type="submit" disabled={leadStatus === "saving"}>
                {leadStatus === "saving" ? "Sending…" : "Email me tips"}
              </Button>
            </form>
          )}
          {leadStatus === "error" && (
            <p className="mt-2 text-sm text-wise-negative">Couldn&apos;t save that, try again.</p>
          )}
        </div>

        <Button variant="outline" size="sm" className="mt-6" onClick={() => setResult(null)}>
          Check another business
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border border-wise-ink/10 p-8">
      <form onSubmit={handleScore} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="audit-business-name">Business name (optional)</Label>
          <Input
            id="audit-business-name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Smile Studio Dental"
          />
        </div>
        <div>
          <Label htmlFor="audit-rating">Current Google rating</Label>
          <Input
            id="audit-rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            required
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="audit-review-count">Total reviews</Label>
          <Input
            id="audit-review-count"
            type="number"
            min={0}
            step={1}
            required
            value={reviewCount}
            onChange={(e) => setReviewCount(e.target.value)}
            placeholder="e.g. 18"
          />
        </div>
        <div>
          <Label htmlFor="audit-recency">Last review</Label>
          <select
            id="audit-recency"
            value={recency}
            onChange={(e) => setRecency(e.target.value as ReviewRecency)}
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {recencyOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" className="mt-2">
          Check my score
        </Button>
      </form>
    </Card>
  );
}
