import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProvider from "@/components/layout/SessionProvider";

export const metadata: Metadata = {
  title: "TipEasy — Propinas digitales",
  description: "La forma más fácil de dar y recibir propinas digitales mediante QR.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "TipEasy",
    description: "Escaneá, elegí y agradecé.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-slate-50">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
