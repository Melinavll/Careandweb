import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

type ReviewSummary = {
  rating: number;
  redirected_to_google: boolean;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!business) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Aucun établissement n&apos;est encore associé à ton compte.
        </p>
        <Link
          href="/dashboard/settings"
          className="mt-4 inline-block rounded bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          Créer mon établissement
        </Link>
        <LogoutButton />
      </main>
    );
  }

  const [{ data: allReviews }, { data: recentReviews }] = await Promise.all([
    supabase
      .from("reviews")
      .select("rating, redirected_to_google")
      .eq("business_id", business.id),
    supabase
      .from("reviews")
      .select("id, rating, comment, customer_name, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const reviews: ReviewSummary[] = allReviews ?? [];
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : null;
  const redirectedCount = reviews.filter((r) => r.redirected_to_google).length;
  const privateCount = totalReviews - redirectedCount;

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-neutral-500">{business.name}</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/requests"
            className="text-sm text-neutral-500 underline"
          >
            Liens d&apos;avis
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm text-neutral-500 underline"
          >
            Paramètres
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Note moyenne"
          value={averageRating !== null ? `${averageRating.toFixed(1)} / 5` : "—"}
        />
        <StatCard label="Total avis" value={String(totalReviews)} />
        <StatCard label="Redirigés vers Google" value={String(redirectedCount)} />
        <StatCard label="Feedback privé" value={String(privateCount)} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Derniers avis</h2>

        {recentReviews && recentReviews.length > 0 ? (
          <ul className="space-y-2">
            {(recentReviews as Review[]).map((review) => (
              <li
                key={review.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(review.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-neutral-700">{review.comment}</p>
                )}
                <p className="mt-2 text-xs text-neutral-400">
                  {review.customer_name || "Anonyme"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Aucun avis pour le moment.</p>
        )}
      </div>

      <LogoutButton />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
