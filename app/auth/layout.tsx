import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Paginae — Authentification",
  description: "Authentification à Paginae — gestion de projets éditoriaux.",
  alternates: { canonical: "/auth" },
  openGraph: {
    title: "Paginae — Authentification",
    description: "Authentification à Paginae — gestion de projets éditoriaux.",
    type: "website",
    siteName: "Paginae",
  },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-6 p-4 md:p-6">
      <section className="mx-auto w-full max-w-4xl rounded-4xl p-4 md:p-6">
        <Suspense>{children}</Suspense>
      </section>
    </main>
  );
}
