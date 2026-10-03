import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import { mockOutlet } from "./mock-data";

export interface OutletComparisonRow {
  outletId: string;
  outletName: string;
  ratingsCount: number;
  avgStars: number | null;
  avgStarsTrend: number | null; // delta vs. the immediately preceding window of the same length
  ticketsOpened: number;
  ticketsResolved: number;
  slaCompliancePct: number | null;
}

type TicketSlaRow = { status: string; sla_due_at: string; resolved_at: string | null };

export function computeAvgStars(ratings: { stars: number }[]): number | null {
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
}

// SLA-eligible: tickets with a decided outcome — either resolved (met or
// missed its deadline) or still open but already past sla_due_at (a missed
// deadline is still a decided outcome). Tickets still legitimately in
// progress and within their window are excluded rather than counted
// against the outlet for something not yet due.
export function computeSlaCompliancePct(tickets: TicketSlaRow[], now: number): number | null {
  const eligible = tickets.filter(
    (t) => t.resolved_at !== null || new Date(t.sla_due_at).getTime() < now
  );
  if (eligible.length === 0) return null;

  const compliant = eligible.filter(
    (t) => t.resolved_at !== null && new Date(t.resolved_at).getTime() <= new Date(t.sla_due_at).getTime()
  );
  return (compliant.length / eligible.length) * 100;
}

export async function getOwnerOutletComparison(
  days = 30
): Promise<{ rows: OutletComparisonRow[]; demo: boolean }> {
  if (!hasSupabaseEnv) {
    return {
      rows: [
        {
          outletId: mockOutlet.id,
          outletName: mockOutlet.name,
          ratingsCount: 4,
          avgStars: 4,
          avgStarsTrend: 0.3,
          ticketsOpened: 2,
          ticketsResolved: 1,
          slaCompliancePct: 50,
        },
      ],
      demo: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { rows: [], demo: false };

  // RLS (outlet_owner_all / tickets_owner_all / ratings_owner_all) already
  // scopes every query below to the signed-in owner's outlets.
  const { data: outlets } = await supabase.from("outlets").select("id, name").order("created_at");

  const now = Date.now();
  const windowStart = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
  const prevWindowStart = new Date(now - 2 * days * 24 * 60 * 60 * 1000).toISOString();

  const rows: OutletComparisonRow[] = [];

  for (const outlet of outlets ?? []) {
    const [{ data: ratings }, { data: prevRatings }, { data: tickets }] = await Promise.all([
      supabase.from("ratings").select("stars").eq("outlet_id", outlet.id).gte("created_at", windowStart),
      supabase
        .from("ratings")
        .select("stars")
        .eq("outlet_id", outlet.id)
        .gte("created_at", prevWindowStart)
        .lt("created_at", windowStart),
      supabase
        .from("tickets")
        .select("status, sla_due_at, resolved_at")
        .eq("outlet_id", outlet.id)
        .gte("created_at", windowStart),
    ]);

    const ratingRows = ratings ?? [];
    const avgStars = computeAvgStars(ratingRows);
    const prevAvgStars = computeAvgStars(prevRatings ?? []);
    const avgStarsTrend = avgStars !== null && prevAvgStars !== null ? avgStars - prevAvgStars : null;

    const ticketRows = (tickets ?? []) as TicketSlaRow[];

    rows.push({
      outletId: outlet.id,
      outletName: outlet.name,
      ratingsCount: ratingRows.length,
      avgStars,
      avgStarsTrend,
      ticketsOpened: ticketRows.length,
      ticketsResolved: ticketRows.filter((t) => t.status === "resolved").length,
      slaCompliancePct: computeSlaCompliancePct(ticketRows, now),
    });
  }

  return { rows, demo: false };
}
