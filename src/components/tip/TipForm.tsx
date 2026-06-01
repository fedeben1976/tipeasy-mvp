"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicProfile } from "@/types";
import AmountSelector from "./AmountSelector";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";

interface TipFormProps {
  profile: PublicProfile;
}

export default function TipForm({ profile }: TipFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverProfileId: profile.id,
          amount,
          currency: profile.currency,
          senderName: senderName.trim() || null,
          message: message.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No pudimos procesar tu propina. Intentá nuevamente.");
        setLoading(false);
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/tip/success?tipId=${data.tipId}&amount=${amount}&name=${encodeURIComponent(profile.displayName)}`);
      }
    } catch {
      setError("Error de conexión. Verificá tu internet e intentá nuevamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-slate-500 mb-3">Elegí tu propina</p>
        <AmountSelector
          suggestedAmounts={profile.suggestedAmounts}
          allowCustom={profile.allowCustom}
          minAmount={profile.minAmount}
          maxAmount={profile.maxAmount}
          currency={profile.currency}
          value={amount}
          onChange={setAmount}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Tu nombre (opcional)"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="¿Cómo te llamás?"
          maxLength={60}
        />
        <Input
          label="Mensaje (opcional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Gracias por la atención..."
          maxLength={200}
        />
      </div>

      {amount && (
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <Avatar name={profile.displayName} image={profile.profileImage} size="sm" />
          <div className="flex-1">
            <p className="text-sm text-slate-500">Propina para</p>
            <p className="font-semibold text-slate-900">{profile.displayName}</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(amount, profile.currency)}
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={!amount}
        loading={loading}
      >
        Enviar propina
      </Button>
    </form>
  );
}
