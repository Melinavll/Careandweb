"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const EXPORT_SIZE = 1024;

export default function BusinessQrCode({ businessId }: { businessId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [link, setLink] = useState(`/r/${businessId}`);

  useEffect(() => {
    setLink(`${window.location.origin}/r/${businessId}`);
  }, [businessId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, link, {
      width: EXPORT_SIZE,
      margin: 2,
    })
      .then(() => {
        // The library sets an inline style matching EXPORT_SIZE, which
        // overrides the Tailwind display size below — reset it.
        canvas.style.width = "";
        canvas.style.height = "";
      })
      .catch(() => {});
  }, [link]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-code-avis.png";
    link.click();
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">QR code</h2>
        <p className="mt-1 text-xs text-neutral-500">
          À imprimer et afficher en caisse pour recueillir les avis.
        </p>
      </div>

      <canvas ref={canvasRef} className="mx-auto h-40 w-40 rounded" />

      <button
        type="button"
        onClick={handleDownload}
        className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white"
      >
        Télécharger en PNG
      </button>
    </div>
  );
}
