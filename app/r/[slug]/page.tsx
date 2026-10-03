import { notFound } from "next/navigation";
import { ReviewFlow } from "@/components/review/review-flow";
import { getOutletBySlug } from "@/lib/outlets";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ req?: string }>;
}) {
  const { slug } = await params;
  const { req } = await searchParams;
  const outlet = await getOutletBySlug(slug);

  if (!outlet) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-wise-canvas-soft px-4 py-12">
      <ReviewFlow outlet={outlet} requestId={req ?? null} />
    </main>
  );
}
