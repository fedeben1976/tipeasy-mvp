import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug requerido" }, { status: 400 });

  const profile = await prisma.receiverProfile.findUnique({
    where: { publicSlug: slug },
  });

  if (!profile || !profile.isActive) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    publicSlug: profile.publicSlug,
    displayName: profile.displayName,
    category: profile.category,
    description: profile.description,
    city: profile.city,
    profileImage: profile.profileImage,
    suggestedAmounts: JSON.parse(profile.suggestedAmounts),
    allowCustom: profile.allowCustom,
    minAmount: profile.minAmount,
    maxAmount: profile.maxAmount,
    currency: profile.currency,
  });
}
