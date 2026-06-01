"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, QrCode, History, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/qr", label: "Mi QR", icon: QrCode },
  { href: "/dashboard/history", label: "Historial", icon: History },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 min-w-[60px]",
                active
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn("text-xs font-medium", active && "font-semibold")}>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-2xl text-slate-400 hover:text-red-500 transition-colors min-w-[60px]"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}
