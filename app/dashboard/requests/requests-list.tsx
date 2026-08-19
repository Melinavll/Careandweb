"use client";

import CopyLink from "./copy-link";

type ReviewRequest = {
  id: string;
  customer_name: string | null;
  status: string;
  created_at: string;
  unique_token: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  sent: "Envoyé",
  completed: "Complété",
  expired: "Expiré",
};

export default function RequestsList({ requests }: { requests: ReviewRequest[] }) {
  return (
    <ul className="space-y-2">
      {requests.map((request) => (
        <li
          key={request.id}
          className="space-y-2 rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-900">
              {request.customer_name || "Client anonyme"}
            </span>
            <span className="text-xs text-neutral-400">
              {STATUS_LABELS[request.status] ?? request.status}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {new Date(request.created_at).toLocaleDateString("fr-FR")}
          </p>
          <CopyLink token={request.unique_token} />
        </li>
      ))}
    </ul>
  );
}
