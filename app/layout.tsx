import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const uiSans = Inter({
  variable: "--font-ui-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const uiDisplay = Space_Grotesk({
  variable: "--font-ui-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          defer
          src="https://analytics.gouale.com/script.js"
          data-website-id="dafac991-7f83-4055-b4d4-ecd1ef6ea873"
          data-domains="paginae.cotizoo.com"
        />
      </head>
      <body className={`${uiSans.variable} ${uiDisplay.variable} antialiased`}>
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
