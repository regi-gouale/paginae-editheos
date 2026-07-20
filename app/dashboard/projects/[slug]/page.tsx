import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { getProjectBySlug } from "@/lib/actions/kanban";
import { auth } from "@/lib/auth/auth";
import { getAccessContext } from "@/lib/auth/permissions";
import type { ProjectWithDetails } from "@/types/kanban";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const resolvedParams = await params;

  try {
    const project = await getProjectBySlug(resolvedParams.slug);
    const access = await getAccessContext();
    const isAdmin = access.isAdmin;
    const canEditProject =
      access.role === "ADMIN" ||
      access.role === "CONTRIBUTOR" ||
      access.role === "DESIGNER";
    const canEditStatus =
      access.role === "ADMIN" || access.role === "CONTRIBUTOR";
    const canComment = access.role !== "GUEST";
    const canEditDesign = access.role === "ADMIN" || access.role === "DESIGNER";

    const breadcrumbs = [
      { label: "Projets", href: "/dashboard/projects" },
      { label: project.title, href: `/dashboard/projects/${project.slug}` },
    ];

    return (
      <div className="flex flex-col">
        <DashboardHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pt-24">
          <ProjectDetailView
            project={project as ProjectWithDetails}
            isAdmin={isAdmin}
            canEditProject={canEditProject}
            canEditStatus={canEditStatus}
            canComment={canComment}
            canEditDesign={canEditDesign}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    notFound();
  }
}
