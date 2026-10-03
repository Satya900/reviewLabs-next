import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOwnerOutlets } from "@/lib/outlets";
import { getOwnerRequests } from "@/lib/requests";
import { NewRequestForm } from "@/components/dashboard/new-request-form";
import type { RequestStatus } from "@/lib/supabase/types";

const statusBadge: Record<RequestStatus, "positive" | "warning" | "negative"> = {
  sent: "warning",
  reminded: "warning",
  opened: "warning",
  completed: "positive",
  expired: "negative",
};

export default async function RequestsPage() {
  const [outlets, { requests, demo }] = await Promise.all([getOwnerOutlets(), getOwnerRequests()]);

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Requests</h1>
      <p className="mt-2 max-w-2xl text-wise-body">
        Send a review request by email, or generate a WhatsApp link to send yourself. Every request is
        saved here so you can track what went out.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="p-6">
          {outlets.length === 0 ? (
            <p className="text-sm text-wise-mute">Add an outlet from onboarding first.</p>
          ) : (
            <NewRequestForm outlets={outlets} />
          )}
        </Card>

        <div className="flex flex-col gap-3">
          {demo && (
            <Card className="bg-wise-canvas-soft p-6 text-sm text-wise-mute">
              Connect Supabase to see real request history here.
            </Card>
          )}
          {!demo && requests.length === 0 && (
            <Card className="bg-wise-canvas-soft p-6 text-sm text-wise-mute">No requests sent yet.</Card>
          )}
          {requests.map((r) => (
            <Card key={r.id} className="flex flex-row items-center justify-between p-4">
              <div>
                <p className="font-semibold text-wise-ink">{r.customer_name ?? "Customer"}</p>
                <p className="text-xs text-wise-mute">
                  {r.outletName} · {r.channel} · {r.customer_contact}
                </p>
              </div>
              <Badge variant={statusBadge[r.status]}>{r.status}</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
