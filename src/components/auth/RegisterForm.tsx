"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "No se pudo crear la cuenta. Intentá nuevamente.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Nombre completo"
        name="displayName"
        value={form.displayName}
        onChange={handleChange}
        placeholder="Juan Pérez"
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mínimo 6 caracteres"
        required
        autoComplete="new-password"
      />

      <Input
        label="Repetir contraseña"
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Repetí la contraseña"
        required
        autoComplete="new-password"
      />

      <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
        Crear cuenta gratis
      </Button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
