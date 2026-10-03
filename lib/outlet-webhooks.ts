import crypto from "crypto";
import { hasSupabaseEnv } from "./supabase/env";
import { createSupabaseServerClient } from "./supabase/server";

// Owner-scoped (RLS via outlet_webhooks_owner_all) — creates the row on
// first access, relying on the secret column's own gen_random_bytes
// default (migration 0008), rather than generating it here.
export async function getOrCreateOutletWebhookSecret(outletId: string): Promise<string | null> {
  if (!hasSupabaseEnv) return null;

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("outlet_webhooks")
    .select("secret")
    .eq("outlet_id", outletId)
    .maybeSingle();
  if (existing) return existing.secret;

  const { data: created } = await supabase
    .from("outlet_webhooks")
    .insert({ outlet_id: outletId })
    .select("secret")
    .single();

  return created?.secret ?? null;
}

// Explicit new value here (not relying on the column default, which only
// fires on INSERT, not UPDATE) so a regenerate is a plain update rather
// than a delete-and-reinsert.
export async function regenerateOutletWebhookSecret(outletId: string): Promise<string | null> {
  if (!hasSupabaseEnv) return null;

  const supabase = await createSupabaseServerClient();
  const newSecret = crypto.randomBytes(24).toString("hex");

  const { data } = await supabase
    .from("outlet_webhooks")
    .upsert({ outlet_id: outletId, secret: newSecret }, { onConflict: "outlet_id" })
    .select("secret")
    .single();

  return data?.secret ?? null;
}
