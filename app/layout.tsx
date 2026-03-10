import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const editorialSans = Source_Sans_3({
  variable: "--font-editorial-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const editorialSerif = Cormorant_Garamond({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Paginae - Editheos",
    template: "%s | Paginae - Editheos",
  },
  description:
    "Gestion de projets éditoriaux — Kanban, automatisation et collaboration pour équipes éditoriales.",
  keywords: [
    "édition",
    "projets éditoriaux",
    "kanban",
    "collaboration",
    "gestion de projet",
    "Editheos",
    "Paginae",
  ],
  authors: [{ name: "Editheos" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Paginae - Editheos",
    description:
      "Gestion de projets éditoriaux — Kanban, automatisation et collaboration pour équipes éditoriales.",
    siteName: "Paginae",
    type: "website",
    images: [
      {
        url: "/logo-editheos.webp",
        alt: "Paginae - Editheos",
      },
    ],
  },
  twitter: {
    title: "Paginae - Editheos",
    card: "summary_large_image",
    description:
      "Gestion de projets éditoriaux — Kanban, automatisation et collaboration pour équipes éditoriales.",
    images: ["/logo-editheos.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${editorialSans.variable} ${editorialSerif.variable} antialiased`}>
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ReactQueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ReactQueryProvider>
          <Toaster richColors />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
