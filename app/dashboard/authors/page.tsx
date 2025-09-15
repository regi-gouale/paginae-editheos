import { AuthorsTable } from "@/components/authors/authors-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getAuthors } from "@/lib/actions/authors";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthorsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const initialData = await getAuthors({ page: 1, limit: 10 });
  const breadcrumbs = [{ label: "Auteurs", href: "/dashboard/authors" }];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
        <div className="space-y-2">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-lato)",
            }}
          >
            Gestion des auteurs
          </h1>
          <p className="text-muted-foreground">
            Gérez la liste des auteurs et leurs informations.
          </p>
        </div>
        <AuthorsTable initialData={initialData} />
      </main>
    </div>
  );
}
