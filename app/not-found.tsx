import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-6 p-4 md:p-6">
      <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 text-center md:p-8">
        <div className="relative flex flex-col gap-2">
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
      </section>

      <section className="surface-card-elevated mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Vous pouvez revenir à votre espace de travail ou ouvrir le Kanban.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/projects">Voir les projets</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
