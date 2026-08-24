import Link from "next/link";
import { stripe } from "@/lib/stripe";

async function getPrice() {
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID!);
    const amount = (price.unit_amount ?? 0) / 100;
    const formatted = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: price.currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    const interval = price.recurring?.interval === "year" ? "an" : "mois";
    return { formatted, interval };
  } catch {
    return null;
  }
}

const PROBLEMS = [
  "Les clients satisfaits ne pensent presque jamais à laisser un avis spontanément.",
  "Un client mécontent, lui, en laisse un en quelques minutes — et il reste visible pendant des années.",
  "Demander un avis en salle est gênant, chronophage, et vite oublié en plein coup de feu.",
];

const STEPS = [
  {
    title: "QR code ou email",
    description:
      "Le client scanne un QR code en caisse, ou reçoit un lien par email après son passage.",
  },
  {
    title: "Il note son expérience",
    description: "1 à 5 étoiles, en 2 secondes, depuis son téléphone.",
  },
  {
    title: "Routing intelligent",
    description:
      "Bonne note → redirection vers votre fiche Google. Note plus basse → commentaire privé, jamais publié.",
  },
];

const BENEFITS = [
  {
    title: "Plus de visibilité Google",
    description: "Plus d'avis positifs, mieux référencé dans les recherches locales.",
  },
  {
    title: "E-réputation protégée",
    description: "Les retours négatifs restent entre vous et le client, jamais en public.",
  },
  {
    title: "Zéro effort",
    description: "Automatisé de bout en bout — aucune relance manuelle à faire.",
  },
];

const FEATURES = [
  "QR code et liens personnalisés illimités",
  "Tableau de bord avec statistiques en temps réel",
  "Redirection Google automatique",
  "Feedback privé pour les avis négatifs",
];

export default async function Home() {
  const price = await getPrice();

  return (
    <main className="bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-neutral-900">
            Mon Saas Avis
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-neutral-600 underline">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded bg-neutral-900 px-3 py-2 text-white"
            >
              Inscription
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
          Transformez vos clients satisfaits en avis Google — automatiquement
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          Conçu pour les restaurateurs : orientez vos clients contents vers
          votre fiche Google, récupérez les retours discrets en privé, sans y
          penser.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded bg-neutral-900 px-6 py-3 text-sm font-medium text-white"
        >
          Essayer gratuitement
        </Link>
      </section>

      <section className="border-t border-neutral-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold text-neutral-900">
            Le problème
          </h2>
          <ul className="mt-8 space-y-4">
            {PROBLEMS.map((problem) => (
              <li
                key={problem}
                className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-700"
              >
                {problem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-semibold text-neutral-900">
            Comment ça marche
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                  {index + 1}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-semibold text-neutral-900">
            Pourquoi mon-saas-avis
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-sm rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <h2 className="text-lg font-semibold text-neutral-900">Tarif</h2>
          <p className="mt-4 text-4xl font-semibold text-neutral-900">
            {price ? price.formatted : "—"}
            {price && (
              <span className="text-base font-normal text-neutral-500">
                {" "}
                / {price.interval}
              </span>
            )}
          </p>
          <ul className="mt-6 space-y-2 text-left text-sm text-neutral-600">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span>✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-6 block rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Essayer gratuitement
          </Link>
        </div>
      </section>
    </main>
  );
}
