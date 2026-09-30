import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOwnerTickets } from "@/lib/tickets";
import { timeUntil } from "@/lib/utils/format";

function statusBadge(status: string, slaDueAt: string) {
  if (status === "resolved") return <Badge variant="positive">Resolved</Badge>;
  const overdue = new Date(slaDueAt).getTime() < Date.now();
  if (overdue) return <Badge variant="negative">Overdue</Badge>;
  if (status === "in_progress") return <Badge variant="warning">In progress</Badge>;
  return <Badge variant="negative">Open</Badge>;
}

export default async function TicketsPage() {
  const { tickets } = await getOwnerTickets();
  const open = tickets.filter((t) => t.status !== "resolved");
  const resolved = tickets.filter((t) => t.status === "resolved");

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Recovery tickets</h1>
      <p className="mt-2 text-wise-body">
        Every rating under 4 stars opens a ticket here automatically. Fix it, log what you
        did, and the note becomes reply context once Google sync is on (Phase 2).
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-wise-mute">
        Open ({open.length})
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {open.length === 0 && (
          <Card className="bg-wise-canvas-soft p-6 text-sm text-wise-mute">
            Nothing open. New low ratings will show up here the moment they come in.
          </Card>
        )}
        {open.map((t) => (
          <Link key={t.id} href={`/dashboard/tickets/${t.id}`}>
            <Card className="bg-wise-canvas-soft p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-wise-ink">
                    {t.stars ? "★".repeat(t.stars) : ""} {t.outletName}
                  </p>
                  <p className="mt-1 text-sm text-wise-body">
                    Opened {new Date(t.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · {timeUntil(t.sla_due_at)}
                  </p>
                </div>
                {statusBadge(t.status, t.sla_due_at)}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-wise-mute">
        Resolved ({resolved.length})
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {resolved.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-wise-ink">{t.outletName}</p>
                <p className="mt-1 text-sm text-wise-body">{t.fix_note}</p>
              </div>
              {statusBadge(t.status, t.sla_due_at)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
