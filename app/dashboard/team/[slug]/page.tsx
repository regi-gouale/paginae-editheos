import {
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EditMemberDialog } from "@/components/membres/edit-member-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getMemberBySlug } from "@/lib/actions/members";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { canManageTeam, getAccessContext } from "@/lib/auth/permissions";
import { formatDateLong } from "@/lib/utils";

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
  params: Promise<{ slug: string }>;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth");
  }

  const access = await getAccessContext();
  if (!canManageTeam(access.role)) {
    redirect("/dashboard/projects");
  }

  const resolvedParams = await params;
  const result = await getMemberBySlug(resolvedParams.slug);

  if (!result.success || !result.member) {
    notFound();
  }

  const member = result.member;

  const breadcrumbs = [
    { label: "Équipes", href: "/dashboard/team" },
    { label: member.name, href: `/dashboard/team/${member.slug}` },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/team">
                <Button variant="ghost" size="icon" className="bg-card/70">
                  <IconArrowLeft className="size-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  {member.name}
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Détail du membre et de ses permissions.
                </p>
              </div>
            </div>
            <EditMemberDialog member={member}>
              <Button variant="outline" className="rounded-full">
                <IconEdit className="size-4" />
                <span className="hidden md:ml-2 md:block">Modifier</span>
              </Button>
            </EditMemberDialog>
          </div>
        </section>

        <div className="grid gap-6">
          <Card className="surface-card-elevated rounded-4xl border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nom complet
                  </Label>
                  <p className="text-base font-medium">{member.name}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Adresse email
                  </Label>
                  <div className="flex items-center gap-2">
                    <IconMail className="size-4 text-muted-foreground" />
                    <p className="text-base">{member.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Rôle
                  </Label>
                  <div>
                    <Badge className={`${roleColors[member.role]} rounded-xl`}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Statut
                  </Label>
                  <Badge
                    variant="outline"
                    className="rounded-xl bg-green-50 text-green-700"
                  >
                    Actif
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card-elevated rounded-4xl border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCalendar className="size-5" />
                Informations temporelles
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Membre depuis
                  </Label>
                  <p className="text-base">
                    {formatDateLong(member.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Dernière modification
                  </Label>
                  <p className="text-base">
                    {formatDateLong(member.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card-elevated rounded-4xl border-border/70">
            <CardHeader>
              <CardTitle>Permissions selon le rôle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {member.role === "ADMIN" && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">
                      Administrateur - Accès complet
                    </p>
                    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <li>• Gérer tous les projets</li>
                      <li>• Administrer l&apos;équipe</li>
                      <li>• Configurer les paramètres</li>
                      <li>• Accès à toutes les fonctionnalités</li>
                    </ul>
                  </div>
                )}
                {member.role === "DESIGNER" && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">
                      Designer - Contribution design
                    </p>
                    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <li>• Voir les projets où il est assigné</li>
                      <li>
                        • Mettre à jour la partie design (mise en page,
                        impression, liens de fichiers)
                      </li>
                      <li>• Commenter les projets</li>
                    </ul>
                  </div>
                )}
                {member.role === "REVIEWER" && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">Relecteur - Révision</p>
                    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <li>• Voir les projets qui lui sont assignés</li>
                      <li>• Laisser des commentaires de relecture</li>
                      <li>• Ne peut pas modifier le projet ni valider</li>
                    </ul>
                  </div>
                )}
                {member.role === "CONTRIBUTOR" && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">
                      Contributeur - Gestion opérationnelle
                    </p>
                    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <li>• Créer et gérer les projets où il est assigné</li>
                      <li>• Gérer les fiches auteurs</li>
                      <li>
                        • Commenter, sans valider ni supprimer les projets
                      </li>
                    </ul>
                  </div>
                )}
                {member.role === "GUEST" && (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">Invité - Accès en lecture</p>
                    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <li>• Voir uniquement les projets assignés</li>
                      <li>• Accès strictement en lecture seule</li>
                      <li>• Pas de commentaire ni modification</li>
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
