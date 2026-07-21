import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Erreur 404
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Cette page est introuvable
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Le contenu que vous recherchez n&apos;existe pas ou n&apos;est plus
          disponible.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/projects">Voir les projets</Link>
        </Button>
      </div>
    </main>
  );
}
