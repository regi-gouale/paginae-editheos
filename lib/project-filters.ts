import { ProjectFilters } from "@/components/projects/project-filters";
import { KanbanColumnWithProjects, ProjectWithDetails } from "@/types/kanban";

/**
 * Filtre les projets selon les critères spécifiés
 */
export function filterProjects(
  projects: ProjectWithDetails[],
  filters: ProjectFilters
): ProjectWithDetails[] {
  return projects.filter((project) => {
    // Filtre par statut
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(project.status)
    ) {
      return false;
    }

    // Filtre par type
    if (filters.types.length > 0 && !filters.types.includes(project.type)) {
      return false;
    }

    // Filtre par priorité
    if (
      filters.priorities.length > 0 &&
      !filters.priorities.includes(project.priority)
    ) {
      return false;
    }

    // Filtre par date d'échéance (dans les X jours)
    if (filters.dueDays.length > 0 && project.dueDate) {
      const now = new Date();
      const dueDate = new Date(project.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Vérifie si la date d'échéance est dans une des plages sélectionnées
      const isInRange = filters.dueDays.some((days) => {
        return diffDays >= 0 && diffDays <= days;
      });

      if (!isInRange) {
        return false;
      }
    }

    // Filtre par recherche de nom (insensible à la casse)
    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim().toLowerCase();
      const projectTitle = project.title.toLowerCase();
      const projectDescription = (project.description || "").toLowerCase();

      // Recherche dans le titre et la description
      if (
        !projectTitle.includes(searchTerm) &&
        !projectDescription.includes(searchTerm)
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Applique les filtres à une liste de colonnes Kanban
 */
export function filterKanbanColumns(
  columns: KanbanColumnWithProjects[],
  filters: ProjectFilters
): KanbanColumnWithProjects[] {
  return columns.map((column) => ({
    ...column,
    projects: filterProjects(column.projects, filters),
  }));
}
