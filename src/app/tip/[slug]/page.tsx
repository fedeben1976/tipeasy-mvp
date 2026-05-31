import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/ui/Avatar";
import TipForm from "@/components/tip/TipForm";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { PublicProfile } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.receiverProfile.findUnique({
    where: { publicSlug: slug },
  });
  if (!profile) return { title: "TipEasy" };
  return {
    title: `Propina para ${profile.displayName} — TipEasy`,
    description: `Dejá una propina digital a ${profile.displayName} (${profile.category}) con TipEasy.`,
  };
}

export default async function PublicTipPage({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.receiverProfile.findUnique({
    where: { publicSlug: slug },
  });

  if (!profile || !profile.isActive) notFound();

  const publicProfile: PublicProfile = {
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
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top bar */}
      <div className="flex items-center justify-center py-4 px-6">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">T</span>
          </div>
          <span className="font-bold text-slate-600 text-sm">TipEasy</span>
        </div>
      </div>

      {/* Profile card */}
      <div className="max-w-sm mx-auto px-4 pt-4 pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-4">
          {/* Profile header */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-6 text-center">
            <Avatar
              name={profile.displayName}
              image={profile.profileImage}
              size="xl"
              className="mx-auto mb-4 ring-4 ring-white/30"
            />
            <h1 className="text-2xl font-black text-white">{profile.displayName}</h1>
            <p className="text-emerald-100 font-medium mt-1">{profile.category}</p>
            {profile.city && (
              <div className="flex items-center justify-center gap-1 mt-2 text-emerald-200 text-sm">
                <MapPin size={12} />
                {profile.city}
              </div>
            )}
          </div>

          {/* Description */}
          {profile.description && (
            <div className="px-6 py-4 border-b border-slate-50">
              <p className="text-slate-600 text-center text-sm leading-relaxed">
                &ldquo;{profile.description}&rdquo;
              </p>
            </div>
          )}

          {/* Tip form */}
          <div className="p-6">
            <TipForm profile={publicProfile} />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Pagos seguros con TipEasy
        </p>
      </div>
    </main>
  );
}
