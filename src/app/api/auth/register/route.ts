import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { displayName, email, password } = await req.json();

  if (!displayName?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      displayName: displayName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    },
  });

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
