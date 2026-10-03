import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingPanel } from "@/components/dashboard/billing-panel";
import { getOwnerSubscription } from "@/lib/billing";
import { getOwnerAgencyClients } from "@/lib/agency";
import { hasRazorpayEnv } from "@/lib/razorpay";
import { plans, formatPrice, computeAgencyMonthlyTotal } from "@/lib/plans";

export default async function BillingPage() {
  const { subscription, demo } = await getOwnerSubscription();
  const { clients, isAgency } = await getOwnerAgencyClients();
  const starter = plans[0];
  const agencyPlan = plans.find((p) => p.id === "agency")!;

  const totalOutlets = clients.reduce((sum, c) => sum + c.outlets.length, 0);
  const agencyTotal = computeAgencyMonthlyTotal(totalOutlets, agencyPlan);

  return (
    <div className="max-w-xl">
      <h1 className="text-display-md text-wise-ink">Billing</h1>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-wise-ink">{starter.name} plan</p>
            <p className="text-sm text-wise-mute">
              {formatPrice(starter.priceFirstOutlet, starter.currency)}/mo, first outlet
            </p>
          </div>
          {subscription ? (
            <Badge variant={subscription.status === "active" ? "positive" : "warning"}>
              {subscription.status}
            </Badge>
          ) : (
            <Badge variant="outline">No active plan</Badge>
          )}
        </div>

        <div className="mt-6">
          {demo ? (
            <p className="text-sm text-wise-mute">
              Connect Supabase to link billing to a real business.
            </p>
          ) : !hasRazorpayEnv ? (
            <p className="text-sm text-wise-mute">
              Razorpay isn&apos;t configured yet. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and
              RAZORPAY_PLAN_ID_STARTER to .env to enable checkout.
            </p>
          ) : subscription && subscription.status !== "cancelled" ? (
            <p className="text-sm text-wise-mute">
              Your plan renews automatically. To cancel or change it, contact support.
            </p>
          ) : (
            <BillingPanel />
          )}
        </div>
      </Card>

      {isAgency && (
        <Card className="mt-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-wise-ink">Agency pricing</p>
              <p className="text-sm text-wise-mute">
                {totalOutlets} outlet{totalOutlets === 1 ? "" : "s"} across {clients.length}{" "}
                businesses, {formatPrice(agencyTotal, agencyPlan.currency)}/mo at{" "}
                {formatPrice(agencyPlan.priceFirstOutlet, agencyPlan.currency)}/outlet
              </p>
            </div>
            <Badge variant="outline">Reference only</Badge>
          </div>
          {totalOutlets < 25 && (
            <p className="mt-4 text-sm text-wise-mute">
              Agency pricing applies at 25+ outlets across your businesses — you currently have{" "}
              {totalOutlets}.
            </p>
          )}
          <p className="mt-4 text-sm text-wise-mute">
            Consolidated Agency checkout isn&apos;t wired up yet — this is a preview of what
            you&apos;d pay, not a live subscription.
          </p>
        </Card>
      )}
    </div>
  );
}
