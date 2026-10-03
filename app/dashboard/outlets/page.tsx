import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOwnerOutletComparison } from "@/lib/outlet-comparison";

// ex-data-table-cell per DESIGN-wise.md: canvas-soft header background with
// mono-caps eyebrow typography, body-sm rows, canvas-soft row dividers —
// the system's documented multi-outlet comparison table pattern.
const headCellClass = "bg-wise-canvas-soft text-xs font-semibold uppercase tracking-wide text-wise-mute";
const rowClass = "border-b border-wise-canvas-soft text-sm";

function trendLabel(trend: number | null) {
  if (trend === null) return null;
  if (Math.abs(trend) < 0.05) return <span className="text-wise-mute">flat</span>;
  const up = trend > 0;
  return (
    <span className={up ? "text-wise-positive-deep" : "text-wise-negative"}>
      {up ? "+" : ""}
      {trend.toFixed(1)}
    </span>
  );
}

export default async function OutletsPage() {
  const { rows, demo } = await getOwnerOutletComparison();

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Outlets</h1>
      <p className="mt-2 text-wise-body">
        Side-by-side performance across every outlet, last 30 days vs. the 30 days before that.
      </p>

      {demo && (
        <Card className="mt-6 bg-wise-canvas-soft p-6 text-sm text-wise-mute">
          Connect Supabase to see real outlet comparisons here.
        </Card>
      )}

      <div className="mt-8 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className={rowClass}>
              <TableHead className={headCellClass}>Outlet</TableHead>
              <TableHead className={headCellClass}>Ratings</TableHead>
              <TableHead className={headCellClass}>Avg stars</TableHead>
              <TableHead className={headCellClass}>Tickets opened</TableHead>
              <TableHead className={headCellClass}>Tickets resolved</TableHead>
              <TableHead className={headCellClass}>SLA compliance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.outletId} className={rowClass}>
                <TableCell className="font-semibold text-wise-ink">{r.outletName}</TableCell>
                <TableCell className="text-wise-body">{r.ratingsCount}</TableCell>
                <TableCell className="text-wise-body">
                  {r.avgStars !== null ? r.avgStars.toFixed(1) : "—"} {trendLabel(r.avgStarsTrend)}
                </TableCell>
                <TableCell className="text-wise-body">{r.ticketsOpened}</TableCell>
                <TableCell className="text-wise-body">{r.ticketsResolved}</TableCell>
                <TableCell className="text-wise-body">
                  {r.slaCompliancePct !== null ? `${Math.round(r.slaCompliancePct)}%` : "—"}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className={rowClass}>
                <TableCell colSpan={6} className="text-wise-mute">
                  No outlets yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
