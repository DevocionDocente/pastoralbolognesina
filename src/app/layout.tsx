import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { siteUrl } from "@/server/env";
import { Toaster } from "@/shared/ui/sonner";
import "./globals.css";

const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });

const DESCRIPTION = "Gestión y búsqueda inteligente de las actividades pastorales de la I.E. 6064 Francisco Bolognesi, Villa El Salvador.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: "Pastoral Bolognesina", template: "%s · Pastoral Bolognesina" },
  description: DESCRIPTION,
  openGraph: { type: "website", locale: "es_PE", siteName: "Pastoral Bolognesina", description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${body.variable} ${display.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-center" theme="light" />
      </body>
    </html>
  );
}
