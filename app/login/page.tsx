import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/dashboard/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-wise-canvas-soft px-4">
      <Card className="w-full max-w-sm p-8">
        <Link href="/" className="text-sm font-semibold text-wise-mute hover:text-wise-ink">
          ← ReviewLabs
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-wise-ink">Owner sign in</h1>
        {hasSupabaseEnv ? (
          <div className="mt-6">
            <LoginForm />
          </div>
        ) : (
          <p className="mt-6 text-sm text-wise-body">
            No Supabase project is connected yet, so sign-in is disabled. The dashboard runs
            in demo mode instead.{" "}
            <Link href="/dashboard" className="font-semibold text-wise-ink underline">
              View the demo dashboard →
            </Link>
          </p>
        )}
      </Card>
    </main>
  );
}
