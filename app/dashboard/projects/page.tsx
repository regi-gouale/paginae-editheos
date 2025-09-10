import { getKanbanData } from "@/app/actions/kanban";
import AddProjectDialog from "@/components/add-project-dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { KanbanBoard } from "@/components/kanban-board";
import { auth } from "@/lib/auth";
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
      // Add other task properties as needed
    })),
  })) as KanbanColumnWithProjects[];

  const breadcrumbs = [
    { label: "Gestion des projets", href: "/dashboard/projects" },
  ];

  return (
    <div className="flex flex-col">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
        <AddProjectDialog />
      </div>
      <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KanbanBoard initialColumns={columns} />
      </main>
    </div>
  );
}
