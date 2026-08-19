import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { customerName, customerEmail, customerPhone } = body;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!business) {
    return NextResponse.json(
      { error: "Crée d'abord ton établissement." },
      { status: 400 }
    );
  }

  const { data: reviewRequest, error } = await supabase
    .from("review_requests")
    .insert({
      business_id: business.id,
      customer_name:
        typeof customerName === "string" && customerName.trim()
          ? customerName.trim()
          : null,
      customer_email:
        typeof customerEmail === "string" && customerEmail.trim()
          ? customerEmail.trim()
          : null,
      customer_phone:
        typeof customerPhone === "string" && customerPhone.trim()
          ? customerPhone.trim()
          : null,
      status: "sent",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Impossible de créer le lien." },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviewRequest });
}
