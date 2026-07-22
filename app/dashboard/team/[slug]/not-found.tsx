import { IconArrowLeft, IconUserX } from "@tabler/icons-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberNotFound() {
  const breadcrumbs = [
    { label: "Équipes", href: "/dashboard/team" },
    { label: "Membre introuvable", href: "" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/team">
            <Button variant="ghost" size="sm">
              <IconArrowLeft className="size-4 mr-2" />
              Retour à l&apos;équipe
            </Button>
          </Link>
        </div>

        <Card className="surface-card-elevated rounded-2xl border-border/70 py-12 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <IconUserX className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">
              Membre introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="mx-auto flex max-w-md flex-col gap-4">
            <p className="text-muted-foreground">
              Le membre que vous recherchez n&apos;existe pas ou a été supprimé.
              Vérifiez l&apos;URL ou retournez à la liste des membres de
              l&apos;équipe.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/dashboard/team">
                <Button className="rounded-full">Voir l&apos;équipe</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-full">
                  Tableau de bord
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
