import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTicketById } from "@/lib/tickets";
import { ResolveTicketForm } from "@/components/dashboard/resolve-ticket-form";
import { PreviewAiReply } from "@/components/dashboard/preview-ai-reply";
import { timeUntil } from "@/lib/utils/format";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm font-semibold text-wise-mute hover:text-wise-ink">
        <ArrowLeft className="size-4" /> Back to tickets
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-display-md text-wise-ink">{ticket.outletName}</h1>
        {ticket.status === "resolved" ? (
          <Badge variant="positive">Resolved</Badge>
        ) : (
          <Badge variant="negative">{timeUntil(ticket.sla_due_at)}</Badge>
        )}
      </div>

      <Card className="mt-6 p-6">
        <p className="text-sm font-semibold text-wise-mute">Rating</p>
        <p className="mt-1 text-lg">{ticket.stars ? "★".repeat(ticket.stars) + "☆".repeat(5 - ticket.stars) : "—"}</p>
      </Card>

      {ticket.status === "resolved" ? (
        <>
          <Card className="mt-4 bg-wise-primary-pale p-6">
            <p className="text-sm font-semibold text-wise-positive-deep">Fix logged</p>
            <p className="mt-1 text-wise-ink">{ticket.fix_note}</p>
          </Card>
          <Card className="mt-4 p-6">
            <p className="mb-3 text-sm text-wise-mute">
              See what the AI reply engine would draft for this review once Google is connected.
            </p>
            <PreviewAiReply ticketId={ticket.id} />
          </Card>
        </>
      ) : (
        <Card className="mt-4 p-6">
          <ResolveTicketForm ticketId={ticket.id} />
        </Card>
      )}
    </div>
  );
}
