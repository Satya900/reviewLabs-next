import Link from "next/link";
import { redirect } from "next/navigation";
import { Ticket, Users, QrCode, Send, CreditCard, MessageSquareText, Settings, Tags } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOwnerBusinessId } from "@/lib/business";

const navItems = [
  { href: "/dashboard", label: "Tickets", icon: Ticket },
  { href: "/dashboard/replies", label: "Reply drafts", icon: MessageSquareText },
  { href: "/dashboard/crm", label: "Customers", icon: Users },
  { href: "/dashboard/themes", label: "Themes", icon: Tags },
  { href: "/dashboard/qr", label: "QR kit", icon: QrCode },
  { href: "/dashboard/requests", label: "Requests", icon: Send },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseEnv) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const businessId = await getOwnerBusinessId();
    if (!businessId) redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-wise-canvas-soft">
      <aside className="hidden w-60 flex-col border-r border-foreground/5 bg-card p-4 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-extrabold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
            RL
          </span>
          ReviewLabs
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-wise-ink hover:bg-wise-canvas-soft"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        {!hasSupabaseEnv && (
          <div className="bg-wise-warning px-6 py-2 text-center text-sm font-semibold text-wise-warning-content">
            Demo mode: no Supabase project connected. Data here is sample data, see
            .env.example to go live.
          </div>
        )}
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
