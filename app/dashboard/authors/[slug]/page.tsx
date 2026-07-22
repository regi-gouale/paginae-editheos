import {
  IconArrowLeft,
  IconCalendar,
  IconFlag,
  IconMail,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditAuthorDialog } from "@/components/authors/edit-author-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthorBySlug } from "@/lib/actions/authors";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { canManageAuthors, getAccessContext } from "@/lib/auth/permissions";

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth");
  }

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    redirect("/dashboard/projects");
  }

  const author = await getAuthorBySlug(resolvedParams.slug);

  if (!author) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Auteurs", href: "/dashboard/authors" },
    {
      label: `${author.firstName} ${author.lastName}`,
      href: `/dashboard/authors/${author.slug}`,
    },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/authors">
                <Button variant="ghost" size="icon" className="bg-card/70">
                  <IconArrowLeft className="size-4" />
                </Button>
              </Link>
              <Avatar className="size-16 ring-2 ring-primary/15">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(author.firstName, author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  {author.firstName} {author.lastName}
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {author.email}
                </p>
              </div>
            </div>
            <EditAuthorDialog author={author} />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="surface-card-elevated rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <IconMail className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email :</span>
                </div>
                <p className="font-medium">{author.email}</p>
              </div>

              {author.nationality && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <IconFlag className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nationalité :
                    </span>
                  </div>
                  <Badge variant="secondary">{author.nationality}</Badge>
                </div>
              )}

              {author.birthDate && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Date de naissance :
                    </span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(author.birthDate), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}

              {author.website && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <IconWorld className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Site web
                    </span>
                  </div>
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {author.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="surface-card-elevated rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle>Biographie</CardTitle>
            </CardHeader>
            <CardContent>
              {author.biography ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {author.biography}
                </p>
              ) : (
                <p className="italic text-muted-foreground">
                  Aucune biographie renseignée
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Métadonnées */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Créé le :</span>
              <span>
                {format(new Date(author.createdAt), "d MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Dernière modification :
              </span>
              <span>
                {format(new Date(author.updatedAt), "d MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </span>
            </div>
          </CardContent>
        </Card> */}
      </main>
    </div>
  );
}
