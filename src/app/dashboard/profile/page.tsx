import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/dashboard/ProfileForm";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  const profile = await prisma.receiverProfile.findUnique({
    where: { userId: session!.user!.id! },
  });

  const existing = profile
    ? {
        displayName: profile.displayName,
        category: profile.category,
        description: profile.description,
        city: profile.city,
        suggestedAmounts: JSON.parse(profile.suggestedAmounts) as number[],
      }
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          {existing ? "Editar perfil" : "Crear perfil"}
        </h1>
      </div>

      {profile && (
        <a
          href={profile.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4 hover:underline"
        >
          <ExternalLink size={14} />
          Ver mi página pública
        </a>
      )}

      <Card>
        <ProfileForm existing={existing} />
      </Card>
    </div>
  );
}
