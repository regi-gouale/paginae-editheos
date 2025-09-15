import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { ProjectsBoard } from "@/components/projects/board";
import { getKanbanData } from "@/lib/actions/kanban";
import { auth } from "@/lib/auth/auth";
import { KanbanColumnWithProjects } from "@/types/kanban";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  // Récupérer les données du Kanban
  const kanbanData = await getKanbanData();

  // Transform the data to match Column[] interface
  const columns = kanbanData.map((column) => ({
    id: column.id,
    title: column.title,
    color: column.color,
    projects: column.projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description || "",
      tasks: project.tasks,
      customFields: project.customFields,
      dueDate: project.dueDate,
      status: project.status,
      authors: project.authors,
      members: project.members,
      priority: project.priority,
      type: project.type,
      // Add other project properties as needed
    })),
  })) as KanbanColumnWithProjects[];

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
              }}
            >
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
