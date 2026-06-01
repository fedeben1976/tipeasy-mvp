"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/Input";

interface AmountSelectorProps {
  suggestedAmounts: number[];
  allowCustom: boolean;
  minAmount: number;
  maxAmount: number;
  currency: string;
  value: number | null;
  onChange: (amount: number | null) => void;
}

export default function AmountSelector({
  suggestedAmounts,
  allowCustom,
  minAmount,
  maxAmount,
  currency,
  value,
  onChange,
}: AmountSelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  function selectPreset(amount: number) {
    setCustomMode(false);
    setCustomValue("");
    onChange(amount);
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomValue(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= minAmount && num <= maxAmount) {
      onChange(num);
    } else {
      onChange(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {suggestedAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => selectPreset(amount)}
            className={cn(
              "py-4 px-2 rounded-2xl border-2 font-bold text-lg transition-all duration-200",
              !customMode && value === amount
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 scale-[1.02] shadow-md shadow-emerald-500/20"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
            )}
          >
            {formatCurrency(amount, currency)}
          </button>
        ))}

        {allowCustom && (
          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              onChange(null);
            }}
            className={cn(
              "col-span-2 py-4 px-2 rounded-2xl border-2 font-semibold text-base transition-all duration-200",
              customMode
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300"
            )}
          >
            Otro monto
          </button>
        )}
      </div>

      {customMode && (
        <Input
          label={`Monto (mín. ${formatCurrency(minAmount, currency)})`}
          type="number"
          inputMode="numeric"
          value={customValue}
          onChange={handleCustomChange}
          placeholder="Ingresá el monto"
          min={minAmount}
          max={maxAmount}
          autoFocus
        />
      )}
    </div>
  );
}
