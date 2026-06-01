import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo payment simulation — not for production
export async function GET(req: NextRequest) {
  const tipId = req.nextUrl.searchParams.get("tipId");
  const action = req.nextUrl.searchParams.get("action") || "approve";

  if (!tipId) {
    return NextResponse.json({ error: "tipId requerido" }, { status: 400 });
  }

  const tip = await prisma.tip.findUnique({ where: { id: tipId } });
  if (!tip) return NextResponse.json({ error: "Propina no encontrada" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const profile = await prisma.receiverProfile.findUnique({
    where: { id: tip.receiverProfileId },
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Simulador de Pago — TipEasy</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 40px rgba(0,0,0,0.08);
    }
    .badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 20px;
    }
    h1 { font-size: 22px; color: #0f172a; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 28px; }
    .amount {
      font-size: 48px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .to { color: #64748b; font-size: 15px; margin-bottom: 32px; }
    .btn {
      display: block;
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      margin-bottom: 12px;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-approve { background: #10b981; color: white; }
    .btn-reject { background: #f1f5f9; color: #64748b; }
    .disclaimer { font-size: 11px; color: #94a3b8; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Modo Demo</span>
    <h1>Checkout de Pago</h1>
    <p class="subtitle">Simulador de pago para TipEasy</p>
    <div class="amount">$${tip.amount.toLocaleString("es-AR")}</div>
    <p class="to">Propina para <strong>${profile?.displayName || "receptor"}</strong></p>
    <a href="${appUrl}/api/payments/confirm?tipId=${tipId}&status=approved" class="btn btn-approve">
      ✓ Aprobar pago
    </a>
    <a href="${appUrl}/api/payments/confirm?tipId=${tipId}&status=rejected" class="btn btn-reject">
      ✕ Rechazar pago
    </a>
    <p class="disclaimer">Esta es una simulación. En producción se usaría Mercado Pago.</p>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
