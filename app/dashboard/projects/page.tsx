import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { ProjectsBoard } from "@/components/projects/board";
import { getKanbanData } from "@/lib/actions/kanban";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const columns = await getKanbanData();

  const breadcrumbs = [{ label: "Projets", href: "/dashboard/projects" }];

  return (
    <div className="flex flex-col">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pt-24">
        <div>
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1
              className="text-3xl font-extrabold tracking-tight line-clamp-1"
              style={{
                fontFamily: "var(--font-lato)",
              }}>
              Gestion des projets
            </h1>
            <AddProjectDialog />
          </div>
        </div>
        <ProjectsBoard initialColumns={columns} />
        {/* <KanbanBoard initialColumns={columns} /> */}
      </main>
    </div>
  );
}
