import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QRDisplay from "@/components/dashboard/QRDisplay";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QRPage() {
  const session = await getServerSession(authOptions);
  const profile = await prisma.receiverProfile.findUnique({
    where: { userId: session!.user!.id! },
  });

  if (!profile) redirect("/dashboard/profile");

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Mi QR</h1>
      </div>

      <QRDisplay
        publicUrl={profile.publicUrl}
        displayName={profile.displayName}
        slug={profile.publicSlug}
      />

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm text-amber-800 font-medium">Consejo</p>
        <p className="text-sm text-amber-700 mt-1">
          Podés mostrar este QR en tu celular, imprimirlo o pegarlo en tu espacio de trabajo.
          Cualquier persona que lo escanee podrá dejarte una propina en segundos.
        </p>
      </div>
    </div>
  );
}
