import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { receiverProfileId, amount, currency, senderName, message } = await req.json();

  if (!receiverProfileId || !amount) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const profile = await prisma.receiverProfile.findUnique({
    where: { id: receiverProfileId },
  });

  if (!profile || !profile.isActive) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }

  if (amount < profile.minAmount || amount > profile.maxAmount) {
    return NextResponse.json(
      { error: `El monto debe estar entre ${profile.minAmount} y ${profile.maxAmount}.` },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  const tip = await prisma.tip.create({
    data: {
      receiverProfileId,
      senderUserId: session?.user?.id || null,
      senderName: senderName?.trim() || null,
      amount,
      currency: currency || profile.currency,
      message: message?.trim() || null,
      status: "pending",
    },
  });

  // In demo mode, simulate payment directly
  // With real Mercado Pago, create a preference and return paymentUrl
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!process.env.MP_ACCESS_TOKEN) {
    // Demo mode: simulate payment flow
    const simulateUrl = `${appUrl}/api/payments/simulate?tipId=${tip.id}`;
    return NextResponse.json({ tipId: tip.id, paymentUrl: simulateUrl });
  }

  // Mercado Pago integration would go here
  return NextResponse.json({ tipId: tip.id });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const profile = await prisma.receiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) return NextResponse.json({ tips: [] });

  const tips = await prisma.tip.findMany({
    where: { receiverProfileId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ tips });
}
