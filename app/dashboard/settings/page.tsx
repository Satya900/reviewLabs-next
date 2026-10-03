import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOwnerOutletConnection } from "@/lib/replies";
import { getOutletSeoKeywords } from "@/lib/reply-seo";
import { getOrCreateOutletWebhookSecret } from "@/lib/outlet-webhooks";
import { hasGoogleEnv } from "@/lib/google";
import { ReplySettingsForm } from "@/components/dashboard/reply-settings-form";
import { ReplySeoForm } from "@/components/dashboard/reply-seo-form";
import { WebhookSettings } from "@/components/dashboard/webhook-settings";
import { SyncGoogleButton } from "@/components/dashboard/sync-google-button";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const data = await getOwnerOutletConnection();
  const seoKeywords = data ? await getOutletSeoKeywords(data.outlet.id) : [];
  const webhookSecret = data ? await getOrCreateOutletWebhookSecret(data.outlet.id) : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl =
    data && webhookSecret ? `${appUrl}/api/webhooks/booking/${data.outlet.id}?secret=${webhookSecret}` : null;

  return (
    <div className="max-w-xl">
      <h1 className="text-display-md text-wise-ink">Settings</h1>

      {connected && (
        <p className="mt-4 rounded-xl bg-wise-primary-pale p-3 text-sm text-wise-positive-deep">
          Google Business Profile connected.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-wise-negative-bg p-3 text-sm text-white">
          Couldn&apos;t connect Google ({error}). Try again.
        </p>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-wise-ink">Google Business Profile</p>
          {data?.connection?.status === "connected" ? (
            <Badge variant="positive">Connected</Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )}
        </div>

        {!data ? (
          <p className="mt-3 text-sm text-wise-mute">Connect Supabase and sign in to manage this.</p>
        ) : !hasGoogleEnv() ? (
          <p className="mt-3 text-sm text-wise-mute">
            Google OAuth isn&apos;t configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to
            .env to enable this.
          </p>
        ) : data.connection?.status === "connected" ? (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-sm text-wise-mute">{data.connection.google_location_id ?? "No location selected"}</p>
            <SyncGoogleButton outletId={data.outlet.id} />
          </div>
        ) : (
          <Button className="mt-3" size="sm" asChild>
            <Link href={`/api/google/connect?outletId=${data.outlet.id}`}>Connect Google</Link>
          </Button>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <p className="mb-4 font-semibold text-wise-ink">Reply drafting</p>
        {data ? (
          <ReplySettingsForm
            outletId={data.outlet.id}
            initialLanguage={data.settings?.default_language ?? "en"}
            initialAutoReply={data.settings?.auto_reply_5star_no_text ?? true}
          />
        ) : (
          <p className="text-sm text-wise-mute">Connect Supabase and sign in to manage this.</p>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <p className="mb-4 font-semibold text-wise-ink">Reply SEO keywords</p>
        {data ? (
          <ReplySeoForm outletId={data.outlet.id} initialKeywords={seoKeywords} />
        ) : (
          <p className="text-sm text-wise-mute">Connect Supabase and sign in to manage this.</p>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <p className="mb-4 font-semibold text-wise-ink">Booking webhook</p>
        {data && webhookUrl ? (
          <WebhookSettings outletId={data.outlet.id} initialWebhookUrl={webhookUrl} baseUrl={appUrl} />
        ) : (
          <p className="text-sm text-wise-mute">Connect Supabase and sign in to manage this.</p>
        )}
      </Card>
    </div>
  );
}
