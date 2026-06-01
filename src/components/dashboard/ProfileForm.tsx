"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "Mozo / Moza",
  "Camarero/a",
  "Delivery",
  "Peluquero/a",
  "Barbero/a",
  "Guía turístico",
  "Personal de hotel",
  "Valet parking",
  "Artista callejero",
  "Músico",
  "Entrenador personal",
  "Masajista",
  "Personal de limpieza",
  "Atención al cliente",
  "Otro",
];

const PRESET_AMOUNTS = [
  [500, 1000, 2000, 5000],
  [1000, 2000, 5000, 10000],
  [200, 500, 1000, 2000],
];

interface ProfileFormProps {
  existing?: {
    displayName: string;
    category: string;
    description: string | null;
    city: string | null;
    suggestedAmounts: number[];
  } | null;
}

export default function ProfileForm({ existing }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: existing?.displayName ?? "",
    category: existing?.category ?? "",
    description: existing?.description ?? "",
    city: existing?.city ?? "",
  });
  const [suggestedAmounts, setSuggestedAmounts] = useState<number[]>(
    existing?.suggestedAmounts ?? [500, 1000, 2000, 5000]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const method = existing ? "PUT" : "POST";
    const res = await fetch("/api/profile", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, suggestedAmounts }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "No se pudo guardar el perfil.");
      return;
    }

    router.push("/dashboard/qr");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Nombre visible"
        name="displayName"
        value={form.displayName}
        onChange={handleChange}
        placeholder="Juan Pérez"
        required
        hint="Este es el nombre que verán quienes te quieran dar propina."
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Categoría / Rol</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Seleccioná tu rol</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Mensaje corto (opcional)
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Gracias por valorar mi atención..."
          maxLength={200}
          rows={2}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>

      <Input
        label="Ciudad (opcional)"
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="Buenos Aires"
      />

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700">Montos sugeridos (ARS)</label>
        {PRESET_AMOUNTS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSuggestedAmounts(preset)}
            className={`text-left px-4 py-3 rounded-2xl border-2 text-sm transition-all ${
              JSON.stringify(suggestedAmounts) === JSON.stringify(preset)
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {preset.map((a) => formatCurrency(a)).join(" · ")}
          </button>
        ))}
      </div>

      <Button type="submit" size="lg" fullWidth loading={loading}>
        {existing ? "Guardar cambios" : "Crear mi perfil"}
      </Button>
    </form>
  );
}
