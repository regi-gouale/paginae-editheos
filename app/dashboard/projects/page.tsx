import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { ProjectsBoard } from "@/components/projects/board";
import { getKanbanData } from "@/lib/actions/kanban";
import { auth } from "@/lib/auth/auth";
import { canCreateProject, getAccessContext } from "@/lib/auth/permissions";

export default async function ProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const access = await getAccessContext();
  const isAdmin = access.isAdmin;
  const canCreate = canCreateProject(access.role);
  const canMoveProject =
    access.role === "ADMIN" || access.role === "CONTRIBUTOR";
  const canEditProject =
    access.role === "ADMIN" ||
    access.role === "CONTRIBUTOR" ||
    access.role === "DESIGNER";
  const canEditStatus =
    access.role === "ADMIN" || access.role === "CONTRIBUTOR";
  const canComment = access.role !== "GUEST";
  const canEditDesign = access.role === "ADMIN" || access.role === "DESIGNER";

  const columns = await getKanbanData();

  const breadcrumbs = [{ label: "Projets", href: "/dashboard/projects" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="line-clamp-1 text-2xl font-black tracking-tight sm:text-3xl">
                Gestion des projets
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Pilotez vos projets éditoriaux, les priorités et les statuts en
                temps réel.
              </p>
            </div>
            {canCreate ? <AddProjectDialog /> : null}
          </div>
        </section>

        <ProjectsBoard
          initialColumns={columns}
          isAdmin={isAdmin}
          canCreateProject={canCreate}
          canMoveProject={canMoveProject}
          canEditProject={canEditProject}
          canEditStatus={canEditStatus}
          canEditDesign={canEditDesign}
          canComment={canComment}
        />
      </main>
    </div>
  );
}
