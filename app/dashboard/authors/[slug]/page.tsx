import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarIcon,
  FlagIcon,
  GlobeIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
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
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
        {/* En-tête avec avatar et informations principales */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/authors">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(author.firstName, author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1
                  className="text-3xl font-extrabold tracking-tight"
                  style={{
                    fontFamily: "var(--font-lato)",
                  }}
                >
                  {author.firstName} {author.lastName}
                </h1>
                <p className="text-muted-foreground">{author.email}</p>
              </div>
            </div>
          </div>
          <EditAuthorDialog author={author} />
        </div>

        {/* Informations détaillées */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-x-2 flex items-center">
                <div className="flex items-center gap-2">
                  <MailIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email :</span>
                </div>
                <p className="font-medium">{author.email}</p>
              </div>

              {author.nationality && (
                <div className="space-x-2 flex items-center">
                  <div className="flex items-center gap-2">
                    <FlagIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nationalité :
                    </span>
                  </div>
                  <Badge variant="secondary">{author.nationality}</Badge>
                </div>
              )}

              {author.birthDate && (
                <div className="space-x-2 flex items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4 text-muted-foreground" />
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="size-4 text-muted-foreground" />
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

          {/* Biographie */}
          <Card>
            <CardHeader>
              <CardTitle>Biographie</CardTitle>
            </CardHeader>
            <CardContent>
              {author.biography ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {author.biography}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Aucune biographie renseignée
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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
