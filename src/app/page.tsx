import Link from "next/link";
import { QrCode, Zap, Shield, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">T</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">TipEasy</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 max-w-lg mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Zap size={12} />
          Propinas digitales, simples y rápidas
        </div>

        <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">
          Escaneá,{" "}
          <span className="text-emerald-500">elegí</span>
          <br />
          y agradecé.
        </h1>

        <p className="text-slate-500 text-lg leading-relaxed mb-10">
          TipEasy permite dar y recibir propinas digitales con un simple código QR.
          Sin efectivo, sin complicaciones.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 text-center block"
          >
            Crear mi perfil gratis
          </Link>
          <Link
            href="/login"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 px-8 rounded-2xl text-base transition-all duration-200 text-center block"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Demo visual */}
      <section className="px-6 pb-12 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full -translate-y-20 translate-x-20" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center font-bold text-lg">
                J
              </div>
              <div>
                <p className="font-bold">Juan Pérez</p>
                <p className="text-emerald-400 text-sm">Mozo · Rosario</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Gracias por valorar mi atención.
            </p>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">
              Elegí tu propina
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["$500", "$1.000", "$2.000", "$5.000"].map((a, i) => (
                <div
                  key={a}
                  className={`py-3 rounded-xl text-center font-bold text-sm ${
                    i === 1
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {a}
                </div>
              ))}
            </div>
            <div className="bg-emerald-500 rounded-xl py-3 text-center font-bold">
              Enviar propina
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-lg mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              icon: <QrCode size={24} />,
              title: "Tu QR personal",
              description: "Generá tu QR único para compartir donde quieras.",
            },
            {
              icon: <Zap size={24} />,
              title: "Menos de 15 segundos",
              description: "El proceso completo, desde escanear hasta confirmar.",
            },
            {
              icon: <Shield size={24} />,
              title: "Pago seguro",
              description:
                "Integración con Mercado Pago. Siempre confirmado desde servidor.",
            },
            {
              icon: <Smartphone size={24} />,
              title: "Mobile first",
              description:
                "Diseñado para celular. Funciona desde cualquier navegador.",
            },
          ].map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl"
            >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-16 max-w-lg mx-auto text-center">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-black mb-2">Empezá ahora</h2>
          <p className="text-emerald-100 mb-6">
            Creá tu perfil gratis en segundos y empezá a recibir propinas hoy.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-emerald-700 font-bold py-3 px-8 rounded-2xl text-base hover:bg-emerald-50 transition-colors"
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </section>

      <footer className="text-center pb-8 text-slate-400 text-sm">
        <p>© 2026 TipEasy · La forma moderna de decir gracias</p>
      </footer>
    </main>
  );
}
