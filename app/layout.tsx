import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Lato, Merriweather } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "900", "700"],
});

const meriweather = Merriweather({
  variable: "--font-meriweather",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Paginae - Editheos",
  description: "Gestion de projets éditoriaux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${lato.variable} ${meriweather.variable} antialiased`}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster richColors />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
