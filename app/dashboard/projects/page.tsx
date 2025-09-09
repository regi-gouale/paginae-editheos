import { DashboardHeader } from "@/components/dashboard-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const breadcrumbs = [
    { label: "Gestion des projets", href: "/dashboard/projects" },
  ];
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
            Gestion des projets
          </h1>
          <p
            className="text-muted-foreground"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Gérez la liste des projets et leurs informations.
          </p>
        </div>
        {/* Contenu de la page de gestion des projets */}
      </main>
    </div>
  );
}
