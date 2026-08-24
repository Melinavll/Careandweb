"use client";

import { useState, type FormEvent } from "react";

const STAR_VALUES = [1, 2, 3, 4, 5];

type Props = {
  token: string;
  googleReviewLink: string | null;
  reviewThreshold: number;
};

export default function ReviewForm({
  token,
  googleReviewLink,
  reviewThreshold,
}: Props) {
  const [rating, setRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  async function submitReview(payload: Record<string, unknown>) {
    return fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...payload }),
    });
  }

  async function handleStarClick(value: number) {
    setRating(value);
    setError(null);

    if (value >= reviewThreshold) {
      setShowForm(false);
      setRedirecting(true);

      try {
        await submitReview({ rating: value, redirectedToGoogle: true });
      } catch {
        // On redirige quand même vers Google même si l'enregistrement échoue.
      }

      if (googleReviewLink) {
        window.location.href = googleReviewLink;
      }
      return;
    }

    setShowForm(true);
  }

  async function handleGoogleLinkClick() {
    setError(null);
    setRedirecting(true);

    try {
      await submitReview({ rating, redirectedToGoogle: true });
    } catch {
      // On redirige quand même vers Google même si l'enregistrement échoue.
    }

    if (googleReviewLink) {
      window.location.href = googleReviewLink;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await submitReview({
      rating,
      customerName: name,
      customerEmail: email,
      comment,
      redirectedToGoogle: false,
    });

    setLoading(false);

    if (!response.ok) {
      setError("Une erreur est survenue, réessaie plus tard.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-700">
          Merci pour ton retour, il a bien été transmis à l&apos;établissement.
        </p>
        {googleReviewLink && (
          <a
            href={googleReviewLink}
            className="block text-center text-xs text-neutral-500 underline"
          >
            Tu peux aussi partager ton avis publiquement sur Google
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
            onClick={() => handleStarClick(value)}
            className="p-1"
          >
            <Star filled={value <= rating} />
          </button>
        ))}
      </div>

      {redirecting && (
        <p className="text-sm text-neutral-500">Redirection en cours...</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <p className="text-center text-sm text-neutral-600">
            Merci de nous en dire plus, nous reviendrons vers toi.
          </p>

          {googleReviewLink && (
            <button
              type="button"
              onClick={handleGoogleLinkClick}
              className="block w-full text-center text-xs text-neutral-500 underline"
            >
              Tu préfères plutôt laisser un avis public sur Google ?
            </button>
          )}

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
            <label htmlFor="email" className="text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="comment"
              className="text-sm font-medium text-neutral-700"
            >
              Commentaire
            </label>
            <textarea
              id="comment"
              required
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      )}
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-9 w-9 ${filled ? "fill-neutral-900" : "fill-neutral-200"}`}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}
