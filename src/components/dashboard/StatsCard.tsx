import { cn, formatCurrency } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  count?: number;
  currency?: string;
  accent?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatsCard({
  label,
  value,
  count,
  currency = "ARS",
  accent = false,
  icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5 flex flex-col gap-2",
        accent
          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          : "bg-white border border-slate-100",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", accent ? "text-emerald-100" : "text-slate-500")}>
          {label}
        </span>
        {icon && (
          <span className={cn(accent ? "text-emerald-200" : "text-slate-300")}>{icon}</span>
        )}
      </div>
      <p className={cn("text-2xl font-bold", accent ? "text-white" : "text-slate-900")}>
        {formatCurrency(value, currency)}
      </p>
      {count !== undefined && (
        <p className={cn("text-xs", accent ? "text-emerald-100" : "text-slate-400")}>
          {count} {count === 1 ? "propina" : "propinas"}
        </p>
      )}
    </div>
  );
}
