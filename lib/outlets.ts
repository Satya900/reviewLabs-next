import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseAnonClient } from "./supabase/anon";
import { createSupabaseServerClient } from "./supabase/server";
import { mockOutlet } from "./mock-data";
import type { Outlet } from "./supabase/types";

export async function getOutletBySlug(slug: string): Promise<Outlet | null> {
  if (!hasSupabaseEnv) {
    // Demo mode: any slug resolves to the one seeded demo outlet so the
    // QR/email/WhatsApp links in the dashboard are always clickable.
    return { ...mockOutlet, slug };
  }

  const supabase = createSupabaseAnonClient();
  const { data } = await supabase.from("outlets").select("*").eq("slug", slug).single();
  return data ?? null;
}

// The owner's own outlets, scoped by RLS (outlet_owner_all) to whoever is
// signed in. Used by dashboard pages like /dashboard/qr that need "my
// outlet" rather than a public lookup by slug.
export async function getOwnerOutlets(): Promise<Outlet[]> {
  if (!hasSupabaseEnv) return [mockOutlet];

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from("outlets").select("*").order("created_at");
  return data ?? [];
}
