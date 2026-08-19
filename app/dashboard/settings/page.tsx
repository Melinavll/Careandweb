import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BusinessQrCode from "./business-qr-code";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, category, google_review_link, facebook_review_link, logo_url, review_threshold"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {business ? "Modifier mon établissement" : "Créer mon établissement"}
        </h1>
        <Link href="/dashboard" className="text-sm text-neutral-500 underline">
          Retour
        </Link>
      </div>
      <SettingsForm business={business} />
      {business && <BusinessQrCode businessId={business.id} />}
    </main>
  );
}
