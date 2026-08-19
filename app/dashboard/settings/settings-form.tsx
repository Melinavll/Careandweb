"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Business = {
  id: string;
  name: string;
  category: string | null;
  google_review_link: string | null;
  facebook_review_link: string | null;
  logo_url: string | null;
  review_threshold: number;
} | null;

export default function SettingsForm({ business }: { business: Business }) {
  const router = useRouter();

  const [name, setName] = useState(business?.name ?? "");
  const [category, setCategory] = useState(business?.category ?? "");
  const [googleReviewLink, setGoogleReviewLink] = useState(
    business?.google_review_link ?? ""
  );
  const [facebookReviewLink, setFacebookReviewLink] = useState(
    business?.facebook_review_link ?? ""
  );
  const [reviewThreshold, setReviewThreshold] = useState(
    business?.review_threshold ?? 4
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    business?.logo_url ?? null
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    if (business?.id) formData.set("businessId", business.id);
    formData.set("name", name);
    formData.set("category", category);
    formData.set("googleReviewLink", googleReviewLink);
    formData.set("facebookReviewLink", facebookReviewLink);
    formData.set("reviewThreshold", String(reviewThreshold));
    if (logoFile) formData.set("logo", logoFile);

    const response = await fetch("/api/business", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-neutral-700">
          Nom
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium text-neutral-700">
          Catégorie
        </label>
        <input
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="googleReviewLink"
          className="text-sm font-medium text-neutral-700"
        >
          Lien avis Google
        </label>
        <input
          id="googleReviewLink"
          type="url"
          value={googleReviewLink}
          onChange={(event) => setGoogleReviewLink(event.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="facebookReviewLink"
          className="text-sm font-medium text-neutral-700"
        >
          Lien avis Facebook
        </label>
        <input
          id="facebookReviewLink"
          type="url"
          value={facebookReviewLink}
          onChange={(event) => setFacebookReviewLink(event.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="reviewThreshold"
          className="text-sm font-medium text-neutral-700"
        >
          Seuil de redirection (étoiles)
        </label>
        <select
          id="reviewThreshold"
          value={reviewThreshold}
          onChange={(event) => setReviewThreshold(Number(event.target.value))}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="logo" className="text-sm font-medium text-neutral-700">
          Logo
        </label>
        {logoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoPreview}
            alt="Logo"
            className="mb-2 h-16 w-16 rounded-full object-cover"
          />
        )}
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="w-full text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
