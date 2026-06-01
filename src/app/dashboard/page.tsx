import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QrCode, Plus } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import TipList from "@/components/dashboard/TipList";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { TipSummary } from "@/types";

async function getDashboardData(userId: string) {
  const profile = await prisma.receiverProfile.findUnique({
    where: { userId },
  });

  if (!profile) return { profile: null, stats: null, recentTips: [] };

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dayTips, weekTips, monthTips, recentTipsRaw] = await Promise.all([
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfDay } },
    }),
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfWeek } },
    }),
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfMonth } },
    }),
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    profile,
    stats: {
      todayTotal: dayTips.reduce((s, t) => s + t.amount, 0),
      weekTotal: weekTips.reduce((s, t) => s + t.amount, 0),
      monthTotal: monthTips.reduce((s, t) => s + t.amount, 0),
      todayCount: dayTips.length,
    },
    recentTips: recentTipsRaw.map((t) => ({
      id: t.id,
      amount: t.amount,
      currency: t.currency,
      senderName: t.senderName,
      message: t.message,
      status: t.status as TipSummary["status"],
      createdAt: t.createdAt.toISOString(),
      approvedAt: t.approvedAt?.toISOString() ?? null,
    })),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { profile, stats, recentTips } = await getDashboardData(session!.user!.id!);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-500 text-sm">Bienvenido</p>
          <h1 className="text-2xl font-black text-slate-900">
            {session?.user?.name?.split(" ")[0] ?? "Hola"} 👋
          </h1>
        </div>
        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
          <span className="text-white font-black text-sm">T</span>
        </div>
      </div>

      {!profile ? (
        /* No profile yet */
        <Card className="text-center py-8">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Creá tu perfil
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Para empezar a recibir propinas, necesitás crear tu perfil público con tu QR único.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl hover:bg-emerald-600 transition-colors"
          >
            <Plus size={18} />
            Crear mi perfil
          </Link>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatsCard
              label="Hoy"
              value={stats!.todayTotal}
              count={stats!.todayCount}
              accent
            />
            <StatsCard label="Esta semana" value={stats!.weekTotal} />
            <StatsCard
              label="Este mes"
              value={stats!.monthTotal}
              className="col-span-2"
            />
          </div>

          {/* Quick QR */}
          <Link href="/dashboard/qr">
            <Card className="flex items-center gap-4 mb-4 hover:border-emerald-200 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <QrCode size={24} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">Mi QR de propinas</p>
                <p className="text-sm text-slate-500">Mostrar, compartir o descargar</p>
              </div>
              <div className="text-slate-400 text-lg">›</div>
            </Card>
          </Link>

          {/* Recent tips */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Últimas propinas</h2>
              <Link
                href="/dashboard/history"
                className="text-sm text-emerald-600 font-semibold"
              >
                Ver todo
              </Link>
            </div>
            <TipList tips={recentTips} />
          </Card>
        </>
      )}
    </div>
  );
}
