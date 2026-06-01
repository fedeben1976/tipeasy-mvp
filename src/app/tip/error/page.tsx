"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const REASONS: Record<string, string> = {
  rejected: "El pago fue rechazado.",
  cancelled: "Cancelaste el pago.",
  failed: "Hubo un error al procesar el pago.",
  not_found: "No encontramos la propina.",
};

function ErrorContent() {
  const params = useSearchParams();
  const reason = params.get("reason") || "failed";
  const slug = params.get("slug");

  const message = REASONS[reason] || "No pudimos confirmar el pago.";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">😕</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3">
          No se pudo completar
        </h1>

        <p className="text-slate-600 mb-8">{message}</p>

        <div className="flex flex-col gap-3">
          {slug && (
            <Link
              href={`/tip/${slug}`}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base transition-colors text-center block"
            >
              Intentar nuevamente
            </Link>
          )}
          <Link
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-2xl text-base transition-colors text-center block"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Si el problema persiste, intentá con otra forma de pago.
        </p>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
