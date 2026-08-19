"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import CopyLink from "./copy-link";

export default function RequestForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "sent" | "failed" | "none" | null
  >(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setCreatedToken(null);
    setEmailStatus(null);

    const hadEmail = email.trim().length > 0;

    const response = await fetch("/api/review-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      }),
    });

    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    setCreatedToken(data.reviewRequest.unique_token);
    setEmailStatus(hadEmail ? (data.emailSent ? "sent" : "failed") : "none");
    setName("");
    setEmail("");
    setPhone("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Nouveau lien</h2>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-1">
          <label htmlFor="customerName" className="text-sm font-medium text-neutral-700">
            Nom du client
          </label>
          <input
            id="customerName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="customerEmail" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="customerEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="customerPhone" className="text-sm font-medium text-neutral-700">
            Téléphone
          </label>
          <input
            id="customerPhone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "Générer le lien"}
        </button>
      </form>

      {createdToken && (
        <div className="space-y-2">
          {emailStatus === "sent" && (
            <p className="text-sm text-green-700">
              Lien envoyé par email au client.
            </p>
          )}
          {emailStatus === "failed" && (
            <p className="text-sm text-red-600">
              L&apos;email n&apos;a pas pu être envoyé — copie le lien manuellement.
            </p>
          )}
          <CopyLink token={createdToken} />
        </div>
      )}
    </div>
  );
}
