import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const profile = await prisma.receiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const existing = await prisma.receiverProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya tenés un perfil creado." }, { status: 409 });
  }

  const { displayName, category, description, city, suggestedAmounts } = await req.json();

  if (!displayName?.trim() || !category?.trim()) {
    return NextResponse.json({ error: "Nombre y categoría son obligatorios." }, { status: 400 });
  }

  const slug = await generateUniqueSlug(displayName, async (s) => {
    const exists = await prisma.receiverProfile.findUnique({ where: { publicSlug: s } });
    return !!exists;
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${appUrl}/tip/${slug}`;

  const profile = await prisma.receiverProfile.create({
    data: {
      userId: session.user.id,
      publicSlug: slug,
      displayName: displayName.trim(),
      category: category.trim(),
      description: description?.trim() || null,
      city: city?.trim() || null,
      publicUrl,
      suggestedAmounts: JSON.stringify(suggestedAmounts || [500, 1000, 2000, 5000]),
    },
  });

  return NextResponse.json({ profile }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { displayName, category, description, city, suggestedAmounts } = await req.json();

  const profile = await prisma.receiverProfile.update({
    where: { userId: session.user.id },
    data: {
      displayName: displayName?.trim(),
      category: category?.trim(),
      description: description?.trim() || null,
      city: city?.trim() || null,
      suggestedAmounts: JSON.stringify(suggestedAmounts || [500, 1000, 2000, 5000]),
    },
  });

  return NextResponse.json({ profile });
}
