import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";
import { getOwnerBusinessId } from "@/lib/business";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  if (!hasSupabaseEnv) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const existingBusinessId = await getOwnerBusinessId();
  if (existingBusinessId) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-wise-canvas-soft px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-wise-ink">Set up your business</h1>
        <p className="mt-2 text-sm text-wise-body">
          One business, one outlet to start. You can add more outlets later.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </Card>
    </main>
  );
}
