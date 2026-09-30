import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOwnerRatings } from "@/lib/crm";

const channelLabel: Record<string, string> = {
  google: "Google",
  private: "Private",
  both: "Google + private",
  none: "—",
};

export default async function CrmPage() {
  const { ratings } = await getOwnerRatings();

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Customers</h1>
      <p className="mt-2 text-wise-body">
        Every rating collected, in one place. This is Phase 1&apos;s basic CRM, a full contacts
        view with outlet comparisons lands in a later phase.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={r.stars < 4 ? "negative" : "positive"}>
                    {channelLabel[r.chose_channel]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-wise-body">
                  {r.public_comment ?? "—"}
                </TableCell>
                <TableCell className="text-wise-mute">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
