import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { RegisterSW } from "@/components/pwa/register-sw";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OfficeBiz — Serviços Empresariais",
  description:
    "Plataforma completa para oferecer serviços empresariais com sua própria marca.",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OfficeBiz",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", inter.variable, geistMono.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <RegisterSW />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
