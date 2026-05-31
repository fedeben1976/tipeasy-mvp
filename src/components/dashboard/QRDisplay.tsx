"use client";

import { useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Share2, Download, Copy, Check } from "lucide-react";
import { useState } from "react";

interface QRDisplayProps {
  publicUrl: string;
  displayName: string;
  slug: string;
}

export default function QRDisplay({ publicUrl, displayName, slug }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({
        title: `Propina para ${displayName}`,
        text: `Dejá tu propina a ${displayName} con TipEasy`,
        url: publicUrl,
      });
    } else {
      copyLink();
    }
  }

  function downloadQR() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`TipEasy | ${slug}`, size / 2, size + 36);

      const link = document.createElement("a");
      link.download = `tipeasy-qr-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }

  return (
    <Card className="flex flex-col items-center gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 text-center">Mi QR de propinas</h2>
        <p className="text-sm text-slate-500 text-center mt-1">
          Mostralo, compartilo o imprimilo
        </p>
      </div>

      <div
        ref={qrRef}
        className="bg-white p-5 rounded-3xl border-4 border-emerald-500 shadow-xl shadow-emerald-500/20"
      >
        <QRCode
          value={publicUrl}
          size={200}
          level="H"
          fgColor="#0f172a"
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 break-all">{publicUrl}</p>
        <p className="text-xs text-slate-400 mt-1">Escaneá con la cámara del celular</p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        <button
          onClick={copyLink}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
        >
          {copied ? (
            <Check size={20} className="text-emerald-500" />
          ) : (
            <Copy size={20} />
          )}
          <span className="text-xs font-medium">{copied ? "Copiado" : "Copiar"}</span>
        </button>

        <button
          onClick={shareLink}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
        >
          <Share2 size={20} />
          <span className="text-xs font-medium">Compartir</span>
        </button>

        <button
          onClick={downloadQR}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
        >
          <Download size={20} />
          <span className="text-xs font-medium">Descargar</span>
        </button>
      </div>
    </Card>
  );
}
