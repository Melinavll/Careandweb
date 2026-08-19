import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ManageSubscriptionButton from "./manage-subscription-button";
import SubscribeButton from "./subscribe-button";

const NEEDS_ATTENTION_STATUSES = ["past_due", "unpaid"];
const ENDED_STATUSES = ["canceled", "incomplete_expired"];

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  unpaid: "Impayé",
  paused: "En pause",
};

export default async function BillingPage() {
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
        <h1 className="text-2xl font-semibold text-neutral-900">Abonnement</h1>
        <p className="text-sm text-neutral-500">
          Crée d&apos;abord ton établissement.
        </p>
        <Link href="/dashboard/settings" className="text-sm text-neutral-700 underline">
          Aller aux paramètres
        </Link>
      </main>
    );
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("business_id", business.id)
    .maybeSingle();

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const needsAttention =
    !!subscription && NEEDS_ATTENTION_STATUSES.includes(subscription.status);
  const hasEnded =
    !subscription || ENDED_STATUSES.includes(subscription.status);

  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Abonnement</h1>
        <Link href="/dashboard" className="text-sm text-neutral-500 underline">
          Retour
        </Link>
      </div>

      <div className="space-y-2 rounded-lg border border-neutral-200 p-4">
        {subscription ? (
          <>
            <p className="text-sm text-neutral-900">
              Statut :{" "}
              <span className="font-medium">
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </span>
            </p>
            {subscription.current_period_end && (
              <p className="text-xs text-neutral-500">
                {isActive ? "Renouvellement" : "Fin"} le{" "}
                {new Date(subscription.current_period_end).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-neutral-500">Aucun abonnement actif.</p>
        )}
      </div>

      {needsAttention && (
        <p className="text-sm text-red-600">
          Ton dernier paiement a échoué. Mets à jour ton moyen de paiement
          pour éviter une interruption de service.
        </p>
      )}

      {hasEnded ? (
        <SubscribeButton />
      ) : (
        <ManageSubscriptionButton
          label={
            needsAttention
              ? "Mettre à jour mon moyen de paiement"
              : "Gérer mon abonnement"
          }
        />
      )}
    </main>
  );
}
