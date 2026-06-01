import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mercado Pago webhook handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ ok: true });
    }

    // Query Mercado Pago for real payment status
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      return NextResponse.json({ error: "No se pudo consultar el pago" }, { status: 500 });
    }

    const payment = await mpRes.json();
    const externalRef = payment.external_reference;

    if (!externalRef) return NextResponse.json({ ok: true });

    const tip = await prisma.tip.findUnique({ where: { id: externalRef } });
    if (!tip) return NextResponse.json({ ok: true });

    // Idempotency check
    if (tip.status === "approved") return NextResponse.json({ ok: true });

    const status =
      payment.status === "approved"
        ? "approved"
        : payment.status === "rejected"
        ? "rejected"
        : payment.status === "cancelled"
        ? "cancelled"
        : "pending";

    await prisma.tip.update({
      where: { id: tip.id },
      data: {
        status,
        paymentProviderId: String(paymentId),
        approvedAt: status === "approved" ? new Date() : undefined,
        rejectedAt: status === "rejected" ? new Date() : undefined,
        failureReason: payment.status_detail || null,
      },
    });

    if (status === "approved") {
      const profile = await prisma.receiverProfile.findUnique({
        where: { id: tip.receiverProfileId },
      });
      if (profile) {
        await prisma.notification.create({
          data: {
            userId: profile.userId,
            type: "tip_received",
            title: "¡Recibiste una propina!",
            body: `${tip.senderName || "Un cliente"} te envió $${tip.amount.toLocaleString("es-AR")}.`,
            metadata: JSON.stringify({ tipId: tip.id }),
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
