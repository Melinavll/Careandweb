import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { token, rating, comment, customerName, customerEmail, redirectedToGoogle } =
    body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: reviewRequest } = await supabase
    .from("review_requests")
    .select("id, business_id")
    .eq("unique_token", token)
    .maybeSingle();

  let businessId = reviewRequest?.business_id ?? null;
  const reviewRequestId = reviewRequest?.id ?? null;

  if (!businessId && UUID_REGEX.test(token)) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", token)
      .maybeSingle();

    businessId = business?.id ?? null;
  }

  if (!businessId) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
  }

  const { error } = await supabase.from("reviews").insert({
    business_id: businessId,
    review_request_id: reviewRequestId,
    rating,
    comment: comment || null,
    customer_name: customerName || null,
    customer_email: customerEmail || null,
    redirected_to_google: Boolean(redirectedToGoogle),
  });

  if (error) {
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'avis." },
      { status: 500 }
    );
  }

  if (reviewRequestId) {
    await supabase
      .from("review_requests")
      .update({ status: "completed" })
      .eq("id", reviewRequestId);
  }

  return NextResponse.json({ success: true });
}
