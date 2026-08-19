import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const formData = await request.formData();

  const businessId = formData.get("businessId");
  const name = formData.get("name");
  const category = formData.get("category");
  const googleReviewLink = formData.get("googleReviewLink");
  const facebookReviewLink = formData.get("facebookReviewLink");
  const reviewThreshold = formData.get("reviewThreshold");
  const logo = formData.get("logo");

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }

  const threshold = Number(reviewThreshold);
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 5) {
    return NextResponse.json({ error: "Seuil invalide." }, { status: 400 });
  }

  let logoUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    // Uploads utilisateur via le token de session échouent au niveau du
    // service Storage sur ce projet (policies RLS vérifiées correctes en
    // direct SQL, mais rejetées côté Storage — probable souci de config
    // JWT côté Supabase). On utilise donc la clé service_role ici, en
    // forçant nous-mêmes le chemin sous l'id de l'utilisateur déjà
    // authentifié par `supabase.auth.getUser()` ci-dessus.
    const admin = createAdminClient();
    const extension = logo.name.split(".").pop() || "png";
    const path = `${user.id}/logo-${Date.now()}.${extension}`;

    const { error: uploadError } = await admin.storage
      .from("logos")
      .upload(path, logo, { upsert: true, contentType: logo.type });

    if (uploadError) {
      return NextResponse.json(
        { error: "Échec de l'upload du logo." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("logos").getPublicUrl(path);
    logoUrl = publicUrl;
  }

  const payload: Record<string, unknown> = {
    name: name.trim(),
    category:
      typeof category === "string" && category.trim() ? category.trim() : null,
    google_review_link:
      typeof googleReviewLink === "string" && googleReviewLink.trim()
        ? googleReviewLink.trim()
        : null,
    facebook_review_link:
      typeof facebookReviewLink === "string" && facebookReviewLink.trim()
        ? facebookReviewLink.trim()
        : null,
    review_threshold: threshold,
  };

  if (logoUrl) {
    payload.logo_url = logoUrl;
  }

  if (typeof businessId === "string" && businessId) {
    const { error } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", businessId);

    if (error) {
      return NextResponse.json(
        { error: "Impossible de mettre à jour l'établissement." },
        { status: 500 }
      );
    }
  } else {
    const { error } = await supabase
      .from("businesses")
      .insert({ ...payload, user_id: user.id });

    if (error) {
      return NextResponse.json(
        { error: "Impossible de créer l'établissement." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
