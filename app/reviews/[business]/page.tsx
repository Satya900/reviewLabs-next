import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getPublicBusinessReviews } from "@/lib/reviews";
import { cn } from "cn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ business: string }>;
}): Promise<Metadata> {
  const { business } = await params;
  const data = await getPublicBusinessReviews(business);
  if (!data) return {};
  return {
    title: `${data.business.name}: Reviews`,
    description: `Real customer ratings for ${data.business.name}, collected and published by ReviewLabs. Every rating stays visible, including the low ones.`,
  };
}

export default async function PublicReviewsPage({
  params,
}: {
  params: Promise<{ business: string }>;
}) {
  const { business: businessSlug } = await params;
  const data = await getPublicBusinessReviews(businessSlug);

  if (!data) notFound();

  const { business, ratings } = data;
  const count = ratings.length;
  const average = count === 0 ? 0 : ratings.reduce((sum, r) => sum + r.stars, 0) / count;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    aggregateRating:
      count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: count,
          }
        : undefined,
    review: ratings.map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.stars, bestRating: 5 },
      datePublished: r.created_at,
      ...(r.public_comment ? { reviewBody: r.public_comment } : {}),
    })),
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-6 py-12">
        {/* Structured data so this page is crawlable independent of Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-[900px]">
          <h1 className="text-display-md text-wise-ink">{business.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "size-5",
                    n <= Math.round(average) ? "fill-wise-warning text-wise-warning" : "text-wise-mute/30"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-wise-mute">
              {average.toFixed(1)} average from {count} rating{count === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-2 text-sm text-wise-mute">
            Every rating collected through ReviewLabs is shown here, including the low ones.
            Ratings are never filtered by score.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {ratings.length === 0 && (
              <Card className="p-6 text-sm text-wise-mute">No ratings yet.</Card>
            )}
            {ratings.map((r) => (
              <Card key={r.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "size-4",
                          n <= r.stars ? "fill-wise-warning text-wise-warning" : "text-wise-mute/30"
                        )}
                      />
                    ))}
                  </div>
                  <time className="text-xs text-wise-mute" dateTime={r.created_at}>
                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {r.public_comment && (
                  <p className="mt-3 text-sm text-wise-body">{r.public_comment}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
