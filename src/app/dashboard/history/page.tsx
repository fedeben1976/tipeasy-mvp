import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TipList from "@/components/dashboard/TipList";
import StatsCard from "@/components/dashboard/StatsCard";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TipSummary } from "@/types";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  const profile = await prisma.receiverProfile.findUnique({
    where: { userId: session!.user!.id! },
  });

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-slate-500">Primero creá tu perfil para ver el historial.</p>
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allTips, monthTips] = await Promise.all([
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfMonth } },
    }),
  ]);

  const tips: TipSummary[] = allTips.map((t) => ({
    id: t.id,
    amount: t.amount,
    currency: t.currency,
    senderName: t.senderName,
    message: t.message,
    status: t.status as TipSummary["status"],
    createdAt: t.createdAt.toISOString(),
    approvedAt: t.approvedAt?.toISOString() ?? null,
  }));

  const monthTotal = monthTips.reduce((s, t) => s + t.amount, 0);
  const allTimeTotal = allTips
    .filter((t) => t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Historial completo</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatsCard label="Este mes" value={monthTotal} accent />
        <StatsCard label="Total histórico" value={allTimeTotal} />
      </div>

      <Card>
        <h2 className="font-bold text-slate-900 mb-4">Todas las propinas</h2>
        <TipList tips={tips} />
      </Card>
    </div>
  );
}
