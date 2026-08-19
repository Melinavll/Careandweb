import { createAdminClient } from "@/lib/supabase/admin";
import ReviewForm from "./review-form";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Business = {
  id: string;
  name: string;
  logo_url: string | null;
  google_review_link: string | null;
  review_threshold: number;
};

export default async function PublicReviewPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createAdminClient();
  const { token } = params;

  const { data: reviewRequest } = await supabase
    .from("review_requests")
    .select(
      "id, businesses(id, name, logo_url, google_review_link, review_threshold)"
    )
    .eq("unique_token", token)
    .maybeSingle();

  let business = (reviewRequest?.businesses as unknown as Business | null) ?? null;

  if (!business && UUID_REGEX.test(token)) {
    const { data } = await supabase
      .from("businesses")
      .select("id, name, logo_url, google_review_link, review_threshold")
      .eq("id", token)
      .maybeSingle();

    business = data;
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <p className="text-center text-sm text-neutral-500">
          Ce lien n&apos;est plus valide.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          {business.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="mx-auto h-16 w-16 rounded-full object-cover"
            />
          )}
          <h1 className="text-xl font-semibold text-neutral-900">
            {business.name}
          </h1>
          <p className="text-sm text-neutral-500">
            Comment évaluez-vous votre expérience ?
          </p>
        </div>

        <ReviewForm
          token={token}
          googleReviewLink={business.google_review_link}
          reviewThreshold={business.review_threshold}
        />
      </div>
    </main>
  );
}
