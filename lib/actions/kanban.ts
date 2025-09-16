"use server";

import { prisma } from "@/lib/prisma";
import {
  getColumnNameFromProjectStatus,
  getProjectStatusFromColumnName,
} from "@/lib/utils";
import type { ProjectStatus } from "@/prisma/generated/prisma";
import { revalidatePath } from "next/cache";

// Get project statistics for the sidebar
export async function getProjectStats() {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Start of today
    const todayPlus7 = new Date();
    todayPlus7.setDate(todayPlus7.getDate() + 7);
    todayPlus7.setHours(23, 59, 59, 999); // End of the day in 7 days

    // Optimisation 1: Exécution groupée pour les colonnes avec comptage
    const columns = await prisma.$transaction([
      prisma.kanbanColumn.findFirst({
        where: { title: "À faire" },
        include: { _count: { select: { projects: true } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "En cours" },
        include: { _count: { select: { projects: true } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "Bloqué" },
        include: { _count: { select: { projects: true } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "Terminé" },
        include: { _count: { select: { projects: true } } },
      }),
    ]);

    // Optimisation 2: Exécution en parallèle pour les comptages indépendants
    const [dueSoonCount, membersCount] = await Promise.all([
      // Échéances bientôt
      prisma.project.count({
        where: {
          dueDate: {
            gte: startOfToday,
            lte: todayPlus7,
          },
        },
      }),
      // Total des membres
      prisma.member.count(),
    ]);

    // Extraire les comptages des colonnes
    const [todoColumn, inProgressColumn, blockedColumn, completedColumn] =
      columns;

    return {
      todo: todoColumn?._count?.projects || 0,
      inProgress: inProgressColumn?._count?.projects || 0,
      blocked: blockedColumn?._count?.projects || 0,
      completed: completedColumn?._count?.projects || 0,
      dueSoon: dueSoonCount || 0,
      totalMembers: membersCount,
    };
  } catch (error) {
    console.error("Error getting project stats:", error);
    return {
      todo: 0,
      inProgress: 0,
      blocked: 0,
      completed: 0,
      dueSoon: 0,
    };
  }
}

// Get recent projects for the dashboard
export async function getRecentProjects(limit = 5) {
  try {
    // Optimisation : Sélection précise des champs requis + cache
    const projects = await prisma.project.findMany({
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        type: true,
        dueDate: true,
        updatedAt: true,
        authors: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
          take: 1, // Optimisation : Ne récupérer que le premier auteur directement
        },
      },
      cacheStrategy: { ttl: 60, swr: 120 }, // Cache pour 1 minute, stale while revalidate pour 2 minutes
    });

    // Transformer les données au format attendu
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      priority: project.priority,
      type: project.type,
      dueDate: project.dueDate,
      author: project.authors[0]
        ? {
            name: `${project.authors[0].firstName} ${project.authors[0].lastName}`,
            email: project.authors[0].email,
            image: undefined,
          }
        : undefined,
      updatedAt: project.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting recent projects:", error);
    return [];
  }
}

// Create a custom field for a project
export async function createCustomField(data: {
  name: string;
  value: string;
  projectId: string;
}) {
  try {
    const field = await prisma.customField.create({
      data,
    });
    revalidatePath("/dashboard/projects");
    return field;
  } catch (error) {
    console.error("Error creating custom field:", error);
    throw new Error("Failed to create custom field");
  }
}

// Update a custom field
export async function updateCustomField(id: string, data: { value?: string }) {
  try {
    const field = await prisma.customField.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/projects");
    return field;
  } catch (error) {
    console.error("Error updating custom field:", error);
    throw new Error("Failed to update custom field");
  }
}

// Delete a custom field
export async function deleteCustomField(id: string) {
  try {
    await prisma.customField.delete({
      where: { id },
    });
    revalidatePath("/dashboard/projects");
  } catch (error) {
    console.error("Error deleting custom field:", error);
    throw new Error("Failed to delete custom field");
  }
}

// Get a specific project by ID with all details
export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        authors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            biography: true,
            website: true,
            nationality: true,
            birthDate: true,
            slug: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            slug: true,
          },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        customFields: {
          orderBy: { name: "asc" },
        },
        kanbanColumn: {
          select: {
            id: true,
            title: true,
            color: true,
            position: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to fetch project");
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        authors: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            biography: true,
            website: true,
            createdAt: true,
            updatedAt: true,
            slug: true,
            nationality: true,
            birthDate: true,
          },
        },
        members: {
          select: {
            id: true,
            email: true,
            slug: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        customFields: {
          orderBy: { name: "asc" },
        },
        kanbanColumn: {
          select: {
            id: true,
            title: true,
            color: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    throw new Error("Failed to fetch project by slug");
  }
}

// Get all columns with their projects
export async function getKanbanData() {
  try {
    // Optimisation : utiliser select pour limiter les champs retournés
    const columns = await prisma.kanbanColumn.findMany({
      orderBy: { position: "asc" },
      include: {
        projects: {
          include: {
            authors: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                // Exclure les champs moins utilisés comme biography, website, etc.
              },
            },
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            tasks: true, // Nécessaire pour les règles d'automatisation
            customFields: true, // Nécessaire pour l'affichage
            // Optimisation : Ne pas re-inclure kanbanColumn car nous avons déjà cette information
          },
        },
      },
    });

    if (columns.length === 0) {
      // Optimisation : Utiliser une transaction pour créer toutes les colonnes en une seule opération DB
      await prisma.$transaction([
        prisma.kanbanColumn.create({
          data: {
            title: "À faire",
            color: "bg-blue-50 dark:bg-blue-900/30",
            position: 0,
          },
        }),
        prisma.kanbanColumn.create({
          data: {
            title: "En cours",
            color: "bg-yellow-50 dark:bg-yellow-900/30",
            position: 1,
          },
        }),
        prisma.kanbanColumn.create({
          data: {
            title: "Bloqué",
            color: "bg-orange-50 dark:bg-orange-900/30",
            position: 2,
          },
        }),
        prisma.kanbanColumn.create({
          data: {
            title: "Terminé",
            color: "bg-green-50 dark:bg-green-900/30",
            position: 3,
          },
        }),
        prisma.kanbanColumn.create({
          data: {
            title: "Rejeté",
            color: "bg-red-50 dark:bg-red-900/30",
            position: 4,
          },
        }),
      ]);

      // Récupérer les colonnes nouvellement créées
      return await prisma.kanbanColumn.findMany({
        orderBy: { position: "asc" },
        include: {
          projects: {
            include: {
              authors: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              members: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              tasks: true,
              customFields: true,
            },
          },
        },
      });
    }

    return columns;
  } catch (error) {
    console.error("Error fetching kanban data:", error);
    throw new Error("Failed to fetch kanban data");
  }
}

// Create a new column
export async function createKanbanColumn(data: {
  title: string;
  color?: string;
  position: number;
}) {
  try {
    const column = await prisma.kanbanColumn.create({
      data,
      include: {
        projects: {
          include: {
            authors: true,
            members: true,
            tasks: true,
            customFields: true,
            kanbanColumn: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    return column;
  } catch (error) {
    console.error("Error creating column:", error);
    throw new Error("Failed to create column");
  }
}

// Update a column
export async function updateKanbanColumn(
  id: string,
  data: {
    title?: string;
    color?: string;
    position?: number;
  }
) {
  try {
    const column = await prisma.kanbanColumn.update({
      where: { id },
      data,
      include: {
        projects: {
          include: {
            authors: true,
            members: true,
            tasks: true,
            customFields: true,
            kanbanColumn: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    return column;
  } catch (error) {
    console.error("Error updating column:", error);
    throw new Error("Failed to update column");
  }
}

// Delete a column
export async function deleteKanbanColumn(id: string) {
  try {
    // First, move all projects to no column
    await prisma.project.updateMany({
      where: { columnId: id },
      data: { columnId: null },
    });

    // Then delete the column
    await prisma.kanbanColumn.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
  } catch (error) {
    console.error("Error deleting column:", error);
    throw new Error("Failed to delete column");
  }
}

// Create a new project
export async function createProject(data: {
  title: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: Date;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  type?: "EDITION" | "PRINTING";
  columnId?: string;
  authorIds?: string[];
  memberIds?: string[];
}) {
  try {
    const { authorIds, memberIds, ...projectData } = data;

    const columnTodo = await prisma.kanbanColumn.findFirst({
      where: { title: "À faire" },
    });
    const project = await prisma.project.create({
      data: {
        ...projectData,
        authors: authorIds
          ? {
              connect: authorIds.map((id) => ({ id })),
            }
          : undefined,
        members: memberIds
          ? {
              connect: memberIds.map((id) => ({ id })),
            }
          : undefined,
        columnId: columnTodo?.id,
        slug: `${data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${Math.random()
          .toString(36)
          .substring(2, 8)}`,
      },
      include: {
        authors: true,
        members: true,
        tasks: true,
        customFields: true,
        kanbanColumn: true,
      },
    });

    revalidatePath("/dashboard/projects");
    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}

// Update a project
export async function updateProject(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: ProjectStatus;
    dueDate?: Date;
    columnId?: string;
    authorIds?: string[];
    slug?: string;
    fileUrl?: string;
  }
) {
  try {
    const { authorIds, ...updateData } = data;

    // Si le statut est modifié, trouver automatiquement la colonne correspondante
    let finalUpdateData = { ...updateData };
    if (updateData.status && !updateData.columnId) {
      const columnTitle = getColumnNameFromProjectStatus(updateData.status);
      const targetColumn = await prisma.kanbanColumn.findFirst({
        where: { title: columnTitle },
      });
      if (targetColumn) {
        finalUpdateData = { ...finalUpdateData, columnId: targetColumn.id };
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...finalUpdateData,
        ...(authorIds && {
          authors: {
            set: authorIds.map((authorId) => ({ id: authorId })),
          },
        }),
      },
      include: {
        authors: true,
        members: true,
        tasks: true,
        customFields: true,
        kanbanColumn: true,
      },
    });

    revalidatePath("/dashboard/projects");
    return project;
  } catch (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }
}

// Move project to different column
export async function moveProject(projectId: string, columnId: string | null) {
  try {
    // Trouver la colonne de destination pour dériver le statut
    let newStatus: ProjectStatus | undefined;

    if (columnId) {
      const targetColumn = await prisma.kanbanColumn.findUnique({
        where: { id: columnId },
      });

      if (targetColumn) {
        newStatus = getProjectStatusFromColumnName(targetColumn.title);
      }
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        columnId,
        ...(newStatus && { status: newStatus }),
      },
      include: {
        authors: true,
        members: true,
        tasks: true,
        customFields: true,
        kanbanColumn: true,
      },
    });

    revalidatePath("/dashboard/projects");
    return project;
  } catch (error) {
    console.error("Error moving project:", error);
    throw new Error("Failed to move project");
  }
}

// Create a new task for a project
export async function createProjectTask(data: {
  title: string;
  projectId: string;
  completed?: boolean;
}) {
  try {
    const task = await prisma.projectTask.create({
      data,
    });

    revalidatePath("/dashboard/projects");
    return task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

// Update a task
export async function updateProjectTask(
  id: string,
  data: {
    title?: string;
    completed?: boolean;
  }
) {
  try {
    const task = await prisma.projectTask.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/projects");
    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}

// Delete a project task
export async function deleteProjectTask(id: string) {
  try {
    await prisma.projectTask.delete({
      where: { id },
    });
    revalidatePath("/dashboard/projects");
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}

// Get all authors for project assignment with caching
export async function getAuthors() {
  try {
    // Utilisation d'Accelerate pour le cache
    return await prisma.author.findMany({
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        // Exclure les champs moins utilisés pour réduire la taille des données
      },
      cacheStrategy: { ttl: 300, swr: 600 }, // Cache pour 5 minutes, stale while revalidate pour 10 minutes
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw new Error("Failed to fetch authors");
  }
}

// Get all members for project assignment with caching
export async function getMembers() {
  try {
    // Utilisation d'Accelerate pour le cache
    return await prisma.member.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      cacheStrategy: { ttl: 300, swr: 600 }, // Cache pour 5 minutes, stale while revalidate pour 10 minutes
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    throw new Error("Failed to fetch members");
  }
}

// Apply automation rules to move projects based on conditions
export async function applyAutomationRules(
  projectsToMove: {
    projectId: string;
    targetColumnId: string;
  }[]
) {
  try {
    // Optimisation 1: Récupérer toutes les colonnes cibles en une seule requête
    const targetColumnIds = [
      ...new Set(projectsToMove.map((p) => p.targetColumnId)),
    ];

    const targetColumns = await prisma.kanbanColumn.findMany({
      where: { id: { in: targetColumnIds } },
      select: { id: true, title: true },
    });

    const columnMap = targetColumns.reduce((map, column) => {
      map[column.id] = column;
      return map;
    }, {} as Record<string, { id: string; title: string }>);

    // Optimisation 2: Exécuter les mises à jour dans une transaction
    const projectUpdates = projectsToMove.map(
      ({ projectId, targetColumnId }) => {
        const targetColumn = columnMap[targetColumnId];

        if (!targetColumn) {
          return {
            success: false,
            projectId,
            error: `Colonne de destination non trouvée : ${targetColumnId}`,
          };
        }

        const newStatus = getProjectStatusFromColumnName(targetColumn.title);

        return prisma.project
          .update({
            where: { id: projectId },
            data: {
              columnId: targetColumnId,
              status: newStatus,
            },
            select: {
              id: true,
              title: true,
              status: true,
              // Sélection plus limitée pour améliorer les performances
              authors: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          })
          .then((project) => ({
            success: true,
            project,
            targetColumnTitle: targetColumn.title,
          }))
          .catch((error) => ({
            success: false,
            projectId,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          }));
      }
    );

    const results = await Promise.all(projectUpdates);

    revalidatePath("/dashboard/projects");
    return results;
  } catch (error) {
    console.error("Error applying automation rules:", error);
    throw new Error("Failed to apply automation rules");
  }
}
