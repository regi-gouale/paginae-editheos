import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthorsTable } from "@/components/authors/authors-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getAuthors } from "@/lib/actions/authors";
import { auth } from "@/lib/auth/auth";
import { canManageAuthors, getAccessContext } from "@/lib/auth/permissions";

export default async function AuthorsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    redirect("/dashboard/projects");
  }

  const initialData = await getAuthors({ page: 1, limit: 10 });
  const breadcrumbs = [{ label: "Auteurs", href: "/dashboard/authors" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Gestion des auteurs
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Structurez votre base auteurs et centralisez leurs informations.
            </p>
          </div>
        </section>

        <section className="surface-card-elevated rounded-2xl p-4 md:p-6">
          <AuthorsTable initialData={initialData} />
        </section>
      </main>
    </div>
  );
}
