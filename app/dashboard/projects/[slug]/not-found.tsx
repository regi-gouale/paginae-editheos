import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectNotFound() {
  const breadcrumbs = [
    { label: "Projets", href: "/dashboard/projects" },
    { label: "Projet introuvable", href: "" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <Card className="surface-card-elevated mx-auto w-full max-w-xl rounded-2xl border-border/70 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">
              Projet introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <p className="max-w-md text-muted-foreground">
              Le projet demandé n&apos;existe pas ou a été supprimé.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/projects">Retour aux projets</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
