import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CopyLink from "./copy-link";
import RequestForm from "./request-form";
import RequestsList from "./requests-list";

export default async function RequestsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!business) {
    return (
      <main className="mx-auto max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Demander un avis</h1>
        <p className="text-sm text-neutral-500">
          Crée d&apos;abord ton établissement dans les paramètres.
        </p>
        <Link href="/dashboard/settings" className="text-sm text-neutral-700 underline">
          Aller aux paramètres
        </Link>
      </main>
    );
  }

  const { data: requests } = await supabase
    .from("review_requests")
    .select("id, customer_name, status, created_at, unique_token")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-sm space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Demander un avis</h1>
        <Link href="/dashboard" className="text-sm text-neutral-500 underline">
          Retour
        </Link>
      </div>

      <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            Lien générique
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Le même lien pour tous tes clients — idéal en QR code affiché en
            caisse.
          </p>
        </div>
        <CopyLink token={business.id} />
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            Lien personnalisé
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Génère un lien à envoyer par SMS ou email à un client après son
            passage. En cliquant dessus, il pourra noter son expérience —
            s&apos;il met une bonne note, il sera redirigé vers ton avis
            Google ; sinon, son commentaire te reste privé.
          </p>
        </div>
        <RequestForm />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Derniers liens envoyés</h2>
        {requests && requests.length > 0 ? (
          <RequestsList requests={requests} />
        ) : (
          <p className="text-sm text-neutral-500">Aucun lien créé pour le moment.</p>
        )}
      </div>
    </main>
  );
}
