import { TipSummary } from "@/types";
import { formatCurrency, timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

const statusConfig = {
  approved: { label: "Recibida", color: "text-emerald-600 bg-emerald-50" },
  pending: { label: "Pendiente", color: "text-amber-600 bg-amber-50" },
  processing: { label: "Procesando", color: "text-blue-600 bg-blue-50" },
  rejected: { label: "Rechazada", color: "text-red-600 bg-red-50" },
  cancelled: { label: "Cancelada", color: "text-slate-500 bg-slate-50" },
  failed: { label: "Fallida", color: "text-red-600 bg-red-50" },
  refunded: { label: "Devuelta", color: "text-violet-600 bg-violet-50" },
};

interface TipListProps {
  tips: TipSummary[];
  emptyMessage?: string;
}

export default function TipList({ tips, emptyMessage = "Todavía no recibiste propinas." }: TipListProps) {
  if (tips.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-5xl mb-3">💸</div>
        <p className="text-base">{emptyMessage}</p>
        <p className="text-sm mt-1">Compartí tu QR para empezar a recibir propinas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-50">
      {tips.map((tip) => {
        const status = statusConfig[tip.status] ?? statusConfig.pending;
        return (
          <div key={tip.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <Avatar name={tip.senderName || "?"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {tip.senderName || "Cliente anónimo"}
              </p>
              {tip.message && (
                <p className="text-sm text-slate-500 truncate">&ldquo;{tip.message}&rdquo;</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">{timeAgo(tip.createdAt)}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="font-bold text-slate-900">
                {formatCurrency(tip.amount, tip.currency)}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
