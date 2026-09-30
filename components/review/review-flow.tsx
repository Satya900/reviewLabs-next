"use client";

import { useState } from "react";
import { Star, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "cn";
import type { Outlet } from "@/lib/supabase/types";

export function ReviewFlow({ outlet }: { outlet: Outlet }) {
  const [stars, setStars] = useState<number | null>(null);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [googleDone, setGoogleDone] = useState(false);
  const [privateDone, setPrivateDone] = useState(false);
  const [showPrivateForm, setShowPrivateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketOpened, setTicketOpened] = useState<boolean | null>(null);
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [whatWouldFixIt, setWhatWouldFixIt] = useState("");

  const googleUrl =
    outlet.google_maps_url ??
    `https://www.google.com/search?q=${encodeURIComponent(outlet.name + " reviews")}`;

  async function submit(choseChannel: "google" | "private" | "both", answers?: Record<string, string>) {
    if (!stars) return;
    setSubmitting(true);
    try {
      // One visit is one rating row: the first action creates it, a second
      // action (doing both Google and private) updates that same row via
      // ratingId instead of inserting a duplicate.
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletSlug: outlet.slug, ratingId, stars, choseChannel, answers }),
      });
      const data = await res.json();
      if (data.ok) {
        setTicketOpened(data.ticketOpened);
        if (data.ratingId) setRatingId(data.ratingId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleClick() {
    window.open(googleUrl, "_blank", "noopener,noreferrer");
    setGoogleDone(true);
    void submit(privateDone ? "both" : "google");
  }

  async function handlePrivateSubmit() {
    setPrivateDone(true);
    setShowPrivateForm(false);
    await submit(googleDone ? "both" : "private", {
      what_went_wrong: whatWentWrong,
      what_would_fix_it: whatWouldFixIt,
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <p className="text-center text-sm font-semibold text-wise-mute">{outlet.name}</p>
      <h1 className="mt-2 text-center text-2xl font-bold text-wise-ink">
        How was your visit today?
      </h1>

      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setStars(n)}
            className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-9",
                stars !== null && n <= stars
                  ? "fill-wise-warning text-wise-warning"
                  : "text-wise-mute/40"
              )}
            />
          </button>
        ))}
      </div>

      {stars !== null && (
        <div className="mt-8 flex flex-col gap-3">
          {/* Both actions are shown at every rating, with equal weight — this
              is a hard product rule, not a UI default: see PHASES.md Phase 1
              and DESIGN-wise.md "Do's" (one dominant CTA, never suppressed). */}
          <Button onClick={handleGoogleClick} disabled={submitting} className="w-full">
            {googleDone ? (
              <>
                <CheckCircle2 className="size-4" /> Posted on Google
              </>
            ) : (
              <>
                Post on Google <ExternalLink className="size-4" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPrivateForm(true)}
            disabled={submitting || privateDone}
            className="w-full"
          >
            {privateDone ? "Thanks, we got your note" : "Tell us privately"}
          </Button>
        </div>
      )}

      {showPrivateForm && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-wise-canvas-soft p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="went-wrong">What went wrong?</Label>
            <Textarea
              id="went-wrong"
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              rows={3}
              placeholder="Tell us in a sentence or two."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="would-fix">What would fix it?</Label>
            <Textarea
              id="would-fix"
              value={whatWouldFixIt}
              onChange={(e) => setWhatWouldFixIt(e.target.value)}
              rows={2}
              placeholder="Optional, but it helps the owner more than a star rating alone."
            />
          </div>
          <Button onClick={handlePrivateSubmit} disabled={submitting || !whatWentWrong}>
            Send to the owner
          </Button>
        </div>
      )}

      {privateDone && ticketOpened !== null && (
        <p className="mt-4 text-center text-sm text-wise-body">
          {ticketOpened
            ? "The owner has been alerted and is working on a fix."
            : "Thanks for letting us know. It's been saved for the owner to review."}
        </p>
      )}
    </Card>
  );
}
