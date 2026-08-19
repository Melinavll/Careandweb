"use client";

import { useEffect, useState } from "react";

export default function CopyLink({ token }: { token: string }) {
  const [link, setLink] = useState(`/r/${token}`);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLink(`${window.location.origin}/r/${token}`);
  }, [token]);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 rounded border border-neutral-200 p-2">
      <span className="flex-1 truncate text-xs text-neutral-600">{link}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded bg-neutral-900 px-2 py-1 text-xs text-white"
      >
        {copied ? "Copié !" : "Copier"}
      </button>
    </div>
  );
}
