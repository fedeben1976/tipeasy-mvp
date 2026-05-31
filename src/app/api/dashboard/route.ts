import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const profile = await prisma.receiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) return NextResponse.json({ stats: null, profile: null });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dayTips, weekTips, monthTips, lastTip] = await Promise.all([
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfDay } },
    }),
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfWeek } },
    }),
    prisma.tip.findMany({
      where: { receiverProfileId: profile.id, status: "approved", createdAt: { gte: startOfMonth } },
    }),
    prisma.tip.findFirst({
      where: { receiverProfileId: profile.id, status: "approved" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    profile: {
      id: profile.id,
      publicSlug: profile.publicSlug,
      displayName: profile.displayName,
      category: profile.category,
      publicUrl: profile.publicUrl,
      suggestedAmounts: JSON.parse(profile.suggestedAmounts),
    },
    stats: {
      todayTotal: dayTips.reduce((s, t) => s + t.amount, 0),
      weekTotal: weekTips.reduce((s, t) => s + t.amount, 0),
      monthTotal: monthTips.reduce((s, t) => s + t.amount, 0),
      todayCount: dayTips.length,
      lastTip: lastTip
        ? {
            id: lastTip.id,
            amount: lastTip.amount,
            currency: lastTip.currency,
            senderName: lastTip.senderName,
            message: lastTip.message,
            status: lastTip.status,
            createdAt: lastTip.createdAt.toISOString(),
            approvedAt: lastTip.approvedAt?.toISOString() ?? null,
          }
        : null,
    },
  });
}
