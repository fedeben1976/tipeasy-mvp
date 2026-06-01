import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding demo data...");

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "juan@demo.com" },
    update: {},
    create: {
      email: "juan@demo.com",
      displayName: "Juan Pérez",
      passwordHash,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const profile = await prisma.receiverProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      publicSlug: "juan-perez",
      displayName: "Juan Pérez",
      category: "Mozo / Moza",
      description: "Gracias por valorar mi atención. ¡Tu propina hace la diferencia!",
      city: "Rosario",
      publicUrl: `${appUrl}/tip/juan-perez`,
      suggestedAmounts: "[500,1000,2000,5000]",
    },
  });

  // Create some demo approved tips
  const names = ["María", "Carlos", "Ana", "Pedro", null, "Lucía"];
  const amounts = [500, 1000, 2000, 1000, 500, 5000];

  for (let i = 0; i < 6; i++) {
    const daysAgo = i;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.tip.create({
      data: {
        receiverProfileId: profile.id,
        senderName: names[i],
        amount: amounts[i],
        currency: "ARS",
        status: "approved",
        paymentProvider: "mock",
        paymentProviderId: `demo_${i}`,
        createdAt,
        approvedAt: createdAt,
      },
    });
  }

  console.log(`✓ Demo user: juan@demo.com / demo1234`);
  console.log(`✓ Profile: ${appUrl}/tip/juan-perez`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
