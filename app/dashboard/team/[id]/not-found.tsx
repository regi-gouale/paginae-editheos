import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";

export default function MemberNotFound() {
  const breadcrumbs = [
    { label: "Équipes", href: "/dashboard/team" },
    { label: "Membre introuvable", href: "" },
  ];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/team">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              Retour à l&apos;équipe
            </Button>
          </Link>
        </div>

        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserX className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Membre introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground max-w-md mx-auto">
              Le membre que vous recherchez n&apos;existe pas ou a été supprimé.
              Vérifiez l&apos;URL ou retournez à la liste des membres de
              l&apos;équipe.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/team">
                <Button>Voir l&apos;équipe</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Tableau de bord</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
