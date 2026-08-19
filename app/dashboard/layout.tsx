import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let showBanner = false;

  if (user) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (business) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("business_id", business.id)
        .maybeSingle();

      showBanner = subscription != null && subscription.status !== "active";
    }
  }

  return (
    <>
      {showBanner && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          Ton abonnement n&apos;est pas actif.{" "}
          <Link href="/dashboard/billing" className="font-medium underline">
            Gérer mon abonnement
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
