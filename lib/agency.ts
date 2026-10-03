import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";
import { getOwnerBusinesses } from "./business";
import { mockBusiness, mockOutlet } from "./mock-data";
import type { Outlet } from "./supabase/types";

export interface AgencyClient {
  businessId: string;
  businessName: string;
  businessSlug: string;
  outlets: Outlet[];
}

export async function getOwnerAgencyClients(): Promise<{
  clients: AgencyClient[];
  isAgency: boolean;
  demo: boolean;
}> {
  if (!hasSupabaseEnv) {
    return {
      clients: [
        {
          businessId: mockBusiness.id,
          businessName: mockBusiness.name,
          businessSlug: mockBusiness.slug,
          outlets: [mockOutlet],
        },
      ],
      isAgency: false,
      demo: true,
    };
  }

  const businesses = await getOwnerBusinesses();
  if (businesses.length === 0) return { clients: [], isAgency: false, demo: false };

  const supabase = await createSupabaseServerClient();
  // RLS (outlet_owner_all) already scopes this to the signed-in owner's
  // outlets, across every business they have — one query, grouped by
  // business_id in memory below, rather than one query per business.
  const { data: outlets } = await supabase.from("outlets").select("*").order("created_at");

  const outletsByBusiness = new Map<string, Outlet[]>();
  for (const outlet of outlets ?? []) {
    const list = outletsByBusiness.get(outlet.business_id) ?? [];
    list.push(outlet);
    outletsByBusiness.set(outlet.business_id, list);
  }

  const clients: AgencyClient[] = businesses.map((b) => ({
    businessId: b.id,
    businessName: b.name,
    businessSlug: b.slug,
    outlets: outletsByBusiness.get(b.id) ?? [],
  }));

  // Derived live, every call — never persisted, never read from
  // businesses.plan. Self-corrects if a business is later removed.
  return { clients, isAgency: clients.length > 1, demo: false };
}
