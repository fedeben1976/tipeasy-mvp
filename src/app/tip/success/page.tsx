"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

function SuccessContent() {
  const params = useSearchParams();
  const amount = parseInt(params.get("amount") || "0", 10);
  const name = params.get("name") || "el receptor";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-6 py-12">
      <div
        className={`w-full max-w-sm text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Animated checkmark */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              className={`transition-all duration-500 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              <path
                d="M14 28L24 38L42 18"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Floating emojis */}
          {visible && (
            <>
              {["🎉", "✨", "💚", "⭐"].map((emoji, i) => (
                <span
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    top: i < 2 ? "-10px" : "70px",
                    left: i % 2 === 0 ? "-20px" : "auto",
                    right: i % 2 !== 0 ? "-20px" : "auto",
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1.5s",
                  }}
                >
                  {emoji}
                </span>
              ))}
            </>
          )}
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          ¡Propina enviada!
        </h1>

        {amount > 0 && (
          <p className="text-5xl font-black text-emerald-500 mb-4">
            {formatCurrency(amount)}
          </p>
        )}

        <p className="text-slate-600 text-lg mb-2">
          Gracias por reconocer el trabajo de
        </p>
        <p className="text-xl font-bold text-slate-900 mb-8">{name}</p>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 mb-8 text-left">
          <p className="text-sm font-medium text-slate-500 mb-3">Tu propina</p>
          <div className="flex justify-between items-center">
            <span className="text-slate-700">Para</span>
            <span className="font-semibold text-slate-900">{name}</span>
          </div>
          {amount > 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-slate-700">Monto</span>
              <span className="font-bold text-emerald-600">{formatCurrency(amount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-700">Estado</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              ✓ Enviada
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="w-full block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base transition-colors text-center"
        >
          Listo
        </Link>

        <p className="text-xs text-slate-400 mt-6">
          ¿Querés recibir propinas también?{" "}
          <Link href="/register" className="text-emerald-600 font-medium hover:underline">
            Creá tu perfil gratis
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
