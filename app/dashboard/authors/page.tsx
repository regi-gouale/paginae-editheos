import { getAuthors } from "@/app/actions/authors";
import { AuthorsTable } from "@/components/authors-table";
import { DashboardHeader } from "@/components/dashboard-header";
import { auth } from "@/lib/auth";
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
      <main className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-comfortaa)",
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
