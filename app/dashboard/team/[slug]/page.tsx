import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EditMemberDialog } from "@/components/membres/edit-member-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getMemberBySlug } from "@/lib/actions/members";
import { auth } from "@/lib/auth/auth";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Edit, Mail, User } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const roleLabels = {
  ADMIN: "Administrateur",
  DESIGNER: "Designer",
  REVIEWER: "Relecteur",
  CONTRIBUTOR: "Contributeur",
  GUEST: "Invité",
};

const roleColors = {
  ADMIN: "bg-red-100 text-red-800",
  DESIGNER: "bg-blue-100 text-blue-800",
  REVIEWER: "bg-green-100 text-green-800",
  CONTRIBUTOR: "bg-yellow-100 text-yellow-800",
  GUEST: "bg-gray-100 text-gray-800",
};

export default async function MemberDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const result = await getMemberBySlug(params.slug);

  if (!result.success || !result.member) {
    notFound();
  }

  const member = result.member;

  const breadcrumbs = [
    { label: "Équipes", href: "/dashboard/team" },
    { label: member.name, href: `/dashboard/team/${member.slug}` },
  ];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/team">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight"
                style={{
                  fontFamily: "var(--font-lato)",
                }}
              >
                {member.name}
              </h1>
            </div>
          </div>
          <EditMemberDialog member={member}>
            <Button variant={"outline"} className="rounded-full md:rounded-xl">
              <Edit className="size-4" />
              <span className="hidden md:ml-2 md:block">Modifier</span>
            </Button>
          </EditMemberDialog>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nom complet
                  </Label>
                  <p className="text-base font-medium">{member.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Adresse email
                  </Label>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <p className="text-base">{member.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Rôle
                  </Label>
                  <div>
                    <Badge className={`${roleColors[member.role]} rounded-xl`}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Statut
                  </Label>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 rounded-xl"
                  >
                    Actif
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Informations temporelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Membre depuis
                  </Label>
                  <p className="text-base">{formatDate(member.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Dernière modification
                  </Label>
                  <p className="text-base">{formatDate(member.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ici on pourrait ajouter d'autres cartes avec des statistiques ou informations supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions selon le rôle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {member.role === "ADMIN" && (
                  <div className="space-y-2">
                    <p className="font-medium">
                      Administrateur - Accès complet
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Gérer tous les projets</li>
                      <li>• Administrer l&apos;équipe</li>
                      <li>• Configurer les paramètres</li>
                      <li>• Accès à toutes les fonctionnalités</li>
                    </ul>
                  </div>
                )}
                {member.role === "DESIGNER" && (
                  <div className="space-y-2">
                    <p className="font-medium">Designer - Création et design</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Créer et modifier des projets</li>
                      <li>• Gérer les ressources visuelles</li>
                      <li>• Collaborer sur les designs</li>
                    </ul>
                  </div>
                )}
                {member.role === "REVIEWER" && (
                  <div className="space-y-2">
                    <p className="font-medium">
                      Relecteur - Révision et validation
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Réviser les projets</li>
                      <li>• Approuver ou rejeter</li>
                      <li>• Ajouter des commentaires</li>
                    </ul>
                  </div>
                )}
                {member.role === "CONTRIBUTOR" && (
                  <div className="space-y-2">
                    <p className="font-medium">
                      Contributeur - Participation aux projets
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Contribuer aux projets assignés</li>
                      <li>• Modifier le contenu</li>
                      <li>• Collaboration limitée</li>
                    </ul>
                  </div>
                )}
                {member.role === "GUEST" && (
                  <div className="space-y-2">
                    <p className="font-medium">Invité - Accès en lecture</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Consulter les projets partagés</li>
                      <li>• Accès en lecture seule</li>
                      <li>• Pas de modification</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
