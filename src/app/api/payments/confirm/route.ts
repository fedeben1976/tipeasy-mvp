import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const tipId = req.nextUrl.searchParams.get("tipId");
  const status = req.nextUrl.searchParams.get("status");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!tipId) {
    return NextResponse.redirect(`${appUrl}/tip/error`);
  }

  const tip = await prisma.tip.findUnique({
    where: { id: tipId },
    include: { receiverProfile: true },
  });

  if (!tip) {
    return NextResponse.redirect(`${appUrl}/tip/error`);
  }

  // Idempotency: if already processed, redirect accordingly
  if (tip.status === "approved") {
    return NextResponse.redirect(
      `${appUrl}/tip/success?tipId=${tipId}&amount=${tip.amount}&name=${encodeURIComponent(tip.receiverProfile.displayName)}`
    );
  }

  if (status === "approved") {
    await prisma.tip.update({
      where: { id: tipId },
      data: { status: "approved", approvedAt: new Date(), paymentProviderId: `demo_${tipId}` },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: tip.receiverProfile.userId,
        type: "tip_received",
        title: "¡Recibiste una propina!",
        body: `${tip.senderName || "Un cliente"} te envió una propina de $${tip.amount.toLocaleString("es-AR")}.`,
        metadata: JSON.stringify({ tipId }),
      },
    });

    return NextResponse.redirect(
      `${appUrl}/tip/success?tipId=${tipId}&amount=${tip.amount}&name=${encodeURIComponent(tip.receiverProfile.displayName)}`
    );
  } else {
    await prisma.tip.update({
      where: { id: tipId },
      data: { status: "rejected", rejectedAt: new Date(), failureReason: "Pago rechazado por el usuario" },
    });

    return NextResponse.redirect(
      `${appUrl}/tip/error?reason=rejected&slug=${tip.receiverProfile.publicSlug}`
    );
  }
}
