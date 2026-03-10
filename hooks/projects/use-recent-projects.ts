import { getRecentProjects } from "@/lib/actions/kanban";
import type { $Enums } from "@/prisma/generated/prisma/client";
import { useEffect, useState } from "react";

export interface RecentProject {
  id: string;
  title: string;
  status: $Enums.ProjectStatus;
  priority: $Enums.Priority;
  type: $Enums.ProjectType;
  dueDate?: Date | null;
  author?: {
    name: string;
    email: string;
    image?: string;
  };
  updatedAt: Date;
}

export function useRecentProjects(limit = 5) {
  const [projects, setProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getRecentProjects(limit);
        setProjects(projectsData);
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [limit]);

  return { projects, loading };
}
