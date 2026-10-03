import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import { mockRequests, mockOutlet } from "./mock-data";
import type { ReviewRequest, RequestChannel } from "./supabase/types";

export type RequestWithOutlet = ReviewRequest & { outletName: string };

export async function getOwnerRequests(): Promise<{ requests: RequestWithOutlet[]; demo: boolean }> {
  if (!hasSupabaseEnv) {
    return {
      requests: mockRequests.map((r) => ({ ...r, outletName: mockOutlet.name })),
      demo: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { requests: [], demo: false };

  // RLS (requests_owner_all) already scopes this to the signed-in owner's outlets.
  const { data } = await supabase
    .from("requests")
    .select("*, outlets(name)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (ReviewRequest & { outlets: { name: string } | null })[];

  return {
    requests: rows.map((r) => ({ ...r, outletName: r.outlets?.name ?? "" })),
    demo: false,
  };
}

export async function createReviewRequest(input: {
  outletId: string;
  channel: Extract<RequestChannel, "email" | "whatsapp">;
  customerName: string | null;
  customerContact: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!hasSupabaseEnv) {
    return { ok: true, id: "demo-request" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // RLS (requests_owner_all) enforces that outletId belongs to the signed-in
  // owner before this insert is allowed to go through.
  const { data, error } = await supabase
    .from("requests")
    .insert({
      outlet_id: input.outletId,
      channel: input.channel,
      customer_name: input.customerName,
      customer_contact: input.customerContact,
      status: "sent",
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "Could not save the request" };
  return { ok: true, id: data.id };
}
