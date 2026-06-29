import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TaskTemplatesEditor } from "@/components/settings/task-templates-editor";
import { getCurrentSession } from "@/lib/auth/auth-lib";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) redirect("/auth");

  const breadcrumbs = [{ label: "Paramètres", href: "/dashboard/settings" }];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-6xl pt-24">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Configurez les tâches par défaut pour chaque type de projet
          </p>
        </div>

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
      </main>
    </div>
  );
}
