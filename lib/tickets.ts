import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import { mockTickets, mockOutlet } from "./mock-data";
import type { Ticket } from "./supabase/types";

export type TicketWithOutlet = Ticket & { outletName: string; stars?: number };

export async function getOwnerTickets(): Promise<{ tickets: TicketWithOutlet[]; demo: boolean }> {
  if (!hasSupabaseEnv) {
    return {
      tickets: mockTickets.map((t) => ({ ...t, outletName: mockOutlet.name })),
      demo: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { tickets: [], demo: false };

  // RLS (tickets_owner_all) already scopes this to the signed-in owner's outlets.
  const { data } = await supabase
    .from("tickets")
    .select("*, outlets(name), ratings(stars)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (Ticket & {
    outlets: { name: string } | null;
    ratings: { stars: number } | null;
  })[];

  return {
    tickets: rows.map((t) => ({ ...t, outletName: t.outlets?.name ?? "", stars: t.ratings?.stars })),
    demo: false,
  };
}

export async function getTicketById(id: string): Promise<TicketWithOutlet | null> {
  if (!hasSupabaseEnv) {
    const mock = mockTickets.find((t) => t.id === id);
    return mock ? { ...mock, outletName: mockOutlet.name } : null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tickets")
    .select("*, outlets(name), ratings(stars)")
    .eq("id", id)
    .single();

  if (!data) return null;
  const row = data as unknown as Ticket & { outlets: { name: string } | null; ratings: { stars: number } | null };
  return { ...row, outletName: row.outlets?.name ?? "", stars: row.ratings?.stars };
}
