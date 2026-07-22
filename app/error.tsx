"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-6 p-4 md:p-6">
      <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 text-center md:p-8">
        <div className="relative flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Erreur applicative
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Une erreur est survenue
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Nous n&apos;avons pas pu terminer cette action. Vous pouvez
            réessayer ou revenir au tableau de bord.
          </p>
        </div>
      </section>

      <section className="surface-card-elevated mx-auto flex w-full max-w-2xl items-center justify-center gap-3 rounded-2xl p-6">
        <Button type="button" onClick={reset} className="rounded-full">
          Réessayer
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </section>
    </main>
  );
}
