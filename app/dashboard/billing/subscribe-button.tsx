"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.url) {
      setLoading(false);
      setError(data?.error ?? "Impossible de lancer le paiement.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Redirection..." : "S'abonner"}
      </button>
    </div>
  );
}
