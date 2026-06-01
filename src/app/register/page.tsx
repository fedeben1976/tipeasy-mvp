import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-black text-base">T</span>
            </div>
            <span className="font-black text-2xl text-slate-900">TipEasy</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Creá tu cuenta</h1>
          <p className="text-slate-500 mt-1">Gratis, sin tarjeta de crédito</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
