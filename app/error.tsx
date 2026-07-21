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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Erreur applicative
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Une erreur est survenue
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Nous n&apos;avons pas pu terminer cette action. Vous pouvez réessayer
          ou revenir au tableau de bord.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={reset}>
          Réessayer
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    </main>
  );
}
