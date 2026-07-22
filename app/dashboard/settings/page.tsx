import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TaskTemplatesEditor } from "@/components/settings/task-templates-editor";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { canManageTeam, getAccessContext } from "@/lib/auth/permissions";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) redirect("/auth");

  const access = await getAccessContext();
  if (!canManageTeam(access.role)) {
    redirect("/dashboard/projects");
  }

  const breadcrumbs = [{ label: "Paramètres", href: "/dashboard/settings" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Paramètres
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Définissez les configurations globales de votre espace de travail.
            </p>
          </div>
        </section>

        <section className="surface-card-elevated rounded-2xl p-4 md:p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Configurez les tâches par défaut pour chaque type de projet
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <TaskTemplatesEditor
              projectType="EDITION"
              title="Projets d'édition"
              description="Définissez les tâches par défaut pour les nouveaux projets d'édition"
            />

            <TaskTemplatesEditor
              projectType="PRINTING"
              title="Projets d'impression"
              description="Définissez les tâches par défaut pour les nouveaux projets d'impression"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
