"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import {
  assertProjectVisibility,
  assertProjectVisibilityBySlug,
  canCommentOnProject,
  canCreateProject,
  canManageProjectWork,
  canUpdateProjectPayload,
  getAccessContext,
  getProjectAssignmentScope,
} from "@/lib/auth/permissions";
import {
  createProjectNotificationForMembers,
  createUserNotification,
} from "@/lib/notifications-helpers";
import { prisma } from "@/lib/prisma";
import {
  getColumnNameFromProjectStatus,
  getProjectStatusFromColumnName,
} from "@/lib/utils";
import type { ProjectStatus } from "@/prisma/generated/prisma/client";
import type { KanbanColumnWithProjects } from "@/types/kanban";

// Get project statistics for the sidebar
export async function getProjectStats() {
  try {
    const access = await getAccessContext();
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Start of today
    const todayPlus7 = new Date();
    todayPlus7.setDate(todayPlus7.getDate() + 7);
    todayPlus7.setHours(23, 59, 59, 999); // End of the day in 7 days

    const projectScope = getProjectAssignmentScope(access);

    // Optimisation 1: Exécution groupée pour les colonnes avec comptage
    const columns = await prisma.$transaction([
      prisma.kanbanColumn.findFirst({
        where: { title: "À faire" },
        include: { _count: { select: { projects: { where: projectScope } } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "En cours" },
        include: { _count: { select: { projects: { where: projectScope } } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "Bloqué" },
        include: { _count: { select: { projects: { where: projectScope } } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "Terminé" },
        include: { _count: { select: { projects: { where: projectScope } } } },
      }),
    ]);

    // Optimisation 2: Exécution en parallèle pour les comptages indépendants
    const [dueSoonCount, membersCount] = await Promise.all([
      // Échéances bientôt
      prisma.project.count({
        where: {
          ...projectScope,
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
    const access = await getAccessContext();

    const projectScope = getProjectAssignmentScope(access);

    // Optimisation : Sélection précise des champs requis + cache
    const projects = await prisma.project.findMany({
      where: projectScope,
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
    const access = await getAccessContext();
    await assertProjectVisibility(access, data.projectId);

    if (!canManageProjectWork(access.role)) {
      throw new Error("Acces refuse pour modifier ce projet");
    }

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
    const access = await getAccessContext();
    const customField = await prisma.customField.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!customField) {
      throw new Error("Champ personnalise introuvable");
    }

    await assertProjectVisibility(access, customField.projectId);

    if (!canManageProjectWork(access.role)) {
      throw new Error("Acces refuse pour modifier ce projet");
    }

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
    const access = await getAccessContext();
    const customField = await prisma.customField.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!customField) {
      throw new Error("Champ personnalise introuvable");
    }

    await assertProjectVisibility(access, customField.projectId);

    if (!canManageProjectWork(access.role)) {
      throw new Error("Acces refuse pour modifier ce projet");
    }

    await prisma.customField.delete({
      where: { id },
    });
    revalidatePath("/dashboard/projects");
  } catch (error) {
    console.error("Error deleting custom field:", error);
    throw new Error("Failed to delete custom field");
  }
}

// Get comments for a project
export async function getProjectComments(projectId: string) {
  try {
    const access = await getAccessContext();
    await assertProjectVisibility(access, projectId);

    return await prisma.projectComment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching project comments:", error);
    throw new Error("Failed to fetch project comments");
  }
}

// Create a comment for a project
export async function createProjectComment(data: {
  projectId: string;
  content: string;
}) {
  const access = await getAccessContext();
  await assertProjectVisibility(access, data.projectId);

  if (!canCommentOnProject(access.role)) {
    throw new Error("Vous n'avez pas la permission de commenter ce projet");
  }

  const content = data.content.trim();
  if (!content) {
    throw new Error("Le commentaire ne peut pas être vide");
  }

  try {
    const comment = await prisma.projectComment.create({
      data: {
        projectId: data.projectId,
        content,
        userId: access.userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/projects/[slug]", "page");
    return comment;
  } catch (error) {
    console.error("Error creating project comment:", error);
    throw new Error("Failed to create project comment");
  }
}

// Get a specific project by ID with all details
export async function getProjectById(id: string) {
  try {
    const access = await getAccessContext();
    await assertProjectVisibility(access, id);

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
            userId: true,
          },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
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
    const access = await getAccessContext();
    await assertProjectVisibilityBySlug(access, slug);

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        authors: true,
        members: true,
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
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

// Ensure a project has a slug, creating one if necessary
export async function ensureProjectSlug(projectId: string): Promise<string> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true, title: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Return existing slug if it exists
    if (project.slug) {
      return project.slug;
    }

    // Generate new slug if none exists
    const { generateProjectSlug } = await import("@/lib/utils");
    let newSlug = generateProjectSlug(project.title);

    // Ensure uniqueness
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existingProject = await prisma.project.findUnique({
        where: { slug: newSlug },
      });

      if (!existingProject) {
        isUnique = true;
      } else {
        attempts++;
        const { generateRandomId } = await import("@/lib/utils");
        newSlug = `${project.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${generateRandomId(6)}`;
      }
    }

    if (!isUnique) {
      throw new Error("Unable to generate unique slug after 10 attempts");
    }

    // Update project with new slug
    await prisma.project.update({
      where: { id: projectId },
      data: { slug: newSlug },
    });

    revalidatePath("/dashboard/projects");
    return newSlug;
  } catch (error) {
    console.error("Error ensuring project slug:", error);
    throw new Error("Failed to ensure project slug");
  }
}

// Get all columns with their projects
export async function getKanbanData(): Promise<KanbanColumnWithProjects[]> {
  try {
    const access = await getAccessContext();

    const projectScope = getProjectAssignmentScope(access);

    // Optimisation : utiliser select pour limiter les champs retournés
    const columns = await prisma.kanbanColumn.findMany({
      orderBy: { position: "asc" },
      include: {
        projects: {
          where: projectScope,
          include: {
            authors: true,
            members: true,
            tasks: true,
            comments: true,
            customFields: true,
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
      return (await prisma.kanbanColumn.findMany({
        orderBy: { position: "asc" },
        include: {
          projects: {
            where: projectScope,
            include: {
              authors: true,
              members: true,
              tasks: true,
              comments: true,
              customFields: true,
            },
          },
        },
      })) as KanbanColumnWithProjects[];
    }

    return columns as KanbanColumnWithProjects[];
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
            comments: true,
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
  },
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
    const access = await getAccessContext();

    if (!canCreateProject(access.role)) {
      throw new Error("Vous n'avez pas la permission de creer un projet");
    }

    const { authorIds, memberIds, ...projectData } = data;

    const finalMemberIds = new Set(memberIds ?? []);
    if (access.memberId) {
      finalMemberIds.add(access.memberId);
    }

    if (!access.isAdmin && finalMemberIds.size === 0) {
      throw new Error("Vous devez etre membre pour creer un projet");
    }

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
              connect: [...finalMemberIds].map((id) => ({ id })),
            }
          : {
              connect: [...finalMemberIds].map((id) => ({ id })),
            },
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
        comments: true,
        customFields: true,
        kanbanColumn: true,
      },
    });

    // Ajouter automatiquement des tâches basées sur les templates définis
    const projectType = data.type || projectData.type;

    // Récupérer les templates de tâches pour ce type de projet
    const taskTemplates = await prisma.taskTemplate.findMany({
      where: { projectType },
      orderBy: { order: "asc" },
    });

    // Si des templates existent, les utiliser, sinon utiliser les tâches par défaut pour EDITION
    if (taskTemplates.length > 0) {
      await prisma.projectTask.createMany({
        data: taskTemplates.map((template) => ({
          title: template.title,
          projectId: project.id,
          completed: false,
        })),
      });
    } else if (projectType === "EDITION") {
      // Fallback : tâches par défaut si aucun template n'est défini
      const defaultTasks = [
        "Réception du manuscrit",
        "Première lecture éditoriale",
        "Signature du contrat",
        "Correction éditoriale",
        "Validation du texte final",
        "Création de la couverture",
        "Validation de la couverture",
        "Mise en page / Maquette",
        "Relecture BAT (Bon à Tirer)",
        "Impression",
        "Publication et diffusion",
      ];

      await prisma.projectTask.createMany({
        data: defaultTasks.map((title) => ({
          title,
          projectId: project.id,
          completed: false,
        })),
      });
    }

    // Créer des notifications pour les membres du projet
    const session = await getCurrentSession();

    if (memberIds && memberIds.length > 0) {
      await createProjectNotificationForMembers(
        project.id,
        "PROJECT_CREATED",
        `📋 Nouveau projet : ${project.title}`,
        `Un nouveau projet "${project.title}" a été créé et vous y avez été assigné(e).`,
        session?.user?.id, // Exclure le créateur
      );
    }

    // Créer une notification pour le créateur du projet (pour confirmation)
    if (session?.user?.id) {
      await createUserNotification(
        session.user.id,
        "PROJECT_CREATED",
        `✅ Projet créé : ${project.title}`,
        `Votre projet "${project.title}" a été créé avec succès.`,
        project.id,
      );
    }

    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard"); // Pour revalider aussi le dashboard principal
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
    statusComment?: string;
  },
) {
  try {
    const access = await getAccessContext();
    await assertProjectVisibility(access, id);

    if (!canUpdateProjectPayload(access.role, data)) {
      throw new Error("Vous n'avez pas la permission de modifier ce projet");
    }

    const { authorIds, statusComment, ...updateData } = data;

    // Récupérer le projet actuel pour comparaison
    const currentProject = await prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    const isStatusChange = Boolean(
      updateData.status &&
        currentProject &&
        currentProject.status !== updateData.status,
    );

    const session = await getCurrentSession();
    const trimmedStatusComment = statusComment?.trim();

    if (isStatusChange && !trimmedStatusComment) {
      throw new Error(
        "Un commentaire est obligatoire pour changer le statut du projet",
      );
    }

    if (isStatusChange && !session?.user?.id) {
      throw new Error(
        "Vous devez être connecté pour changer le statut d'un projet",
      );
    }

    // Préparer les données de mise à jour
    let finalUpdateData = { ...updateData };

    // Si le titre est modifié, générer un nouveau slug si nécessaire
    if (updateData.title && !updateData.slug) {
      const { generateProjectSlug } = await import("@/lib/utils");
      let newSlug = generateProjectSlug(updateData.title);

      // Vérifier l'unicité du slug
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const existingProject = await prisma.project.findUnique({
          where: { slug: newSlug },
        });

        if (!existingProject || existingProject.id === id) {
          isUnique = true;
        } else {
          attempts++;
          const { generateRandomId } = await import("@/lib/utils");
          newSlug = `${updateData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${generateRandomId(6)}`;
        }
      }

      if (isUnique) {
        finalUpdateData.slug = newSlug;
      }
    }

    // Si le statut est modifié, trouver automatiquement la colonne correspondante
    if (updateData.status && !updateData.columnId) {
      const columnTitle = getColumnNameFromProjectStatus(updateData.status);
      const targetColumn = await prisma.kanbanColumn.findFirst({
        where: { title: columnTitle },
      });
      if (targetColumn) {
        finalUpdateData = { ...finalUpdateData, columnId: targetColumn.id };
      }
    }

    const project = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
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

      if (isStatusChange && session?.user?.id && trimmedStatusComment) {
        await tx.projectComment.create({
          data: {
            projectId: id,
            content: trimmedStatusComment,
            userId: session.user.id,
          },
        });
      }

      return updatedProject;
    });

    // Créer une notification si des changements significatifs ont été apportés
    if (
      currentProject &&
      (updateData.title ||
        updateData.description ||
        updateData.dueDate ||
        updateData.status)
    ) {
      await createProjectNotificationForMembers(
        project.id,
        "PROJECT_UPDATED",
        `✏️ Projet mis à jour : ${project.title}`,
        `Le projet "${project.title}" a été modifié.`,
        session?.user?.id, // Exclure la personne qui a fait la modification
      );
    }

    revalidatePath("/dashboard/projects");
    return project;
  } catch (error) {
    console.error("Error updating project:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update project");
  }
}

// Move project to different column
export async function moveProject(projectId: string, columnId: string | null) {
  try {
    const access = await getAccessContext();
    await assertProjectVisibility(access, projectId);

    if (!canUpdateProjectPayload(access.role, { columnId: columnId ?? undefined })) {
      throw new Error("Vous n'avez pas la permission de deplacer ce projet");
    }

    // Récupérer le projet actuel pour comparaison
    const currentProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { kanbanColumn: true },
    });

    // Trouver la colonne de destination pour dériver le statut
    let newStatus: ProjectStatus | undefined;
    let targetColumn = null;

    if (columnId) {
      targetColumn = await prisma.kanbanColumn.findUnique({
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
        comments: true,
        customFields: true,
        kanbanColumn: true,
      },
    });

    // Créer une notification si le projet a changé de colonne
    if (
      currentProject &&
      targetColumn &&
      currentProject.columnId !== columnId
    ) {
      const session = await getCurrentSession();
      await createProjectNotificationForMembers(
        project.id,
        "PROJECT_MOVED",
        `📋 Projet déplacé : ${project.title}`,
        `Le projet "${project.title}" a été déplacé vers "${targetColumn.title}".`,
        session?.user?.id, // Exclure la personne qui a fait le déplacement
      );
    }

    revalidatePath("/dashboard/projects");
    return project;
  } catch (error) {
    console.error("Error moving project:", error);
    throw new Error("Failed to move project");
  }
}

// Delete a project (admin only)
export async function deleteProject(projectId: string) {
  try {
    const access = await getAccessContext();

    if (!access.isAdmin) {
      return {
        success: false,
        error: "Seuls les administrateurs peuvent supprimer un projet",
      };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Impossible de supprimer le projet" };
  }
}

// Create a new task for a project
export async function createProjectTask(data: {
  title: string;
  projectId: string;
  completed?: boolean;
}) {
  try {
    const access = await getAccessContext();
    await assertProjectVisibility(access, data.projectId);

    if (!canManageProjectWork(access.role)) {
      throw new Error("Acces refuse pour modifier ce projet");
    }

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
  },
) {
  try {
    const access = await getAccessContext();
    const taskToUpdate = await prisma.projectTask.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!taskToUpdate) {
      throw new Error("Tache introuvable");
    }

    await assertProjectVisibility(access, taskToUpdate.projectId);

    if (!canManageProjectWork(access.role)) {
      throw new Error("Acces refuse pour modifier ce projet");
    }

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
    const access = await getAccessContext();
    const taskToDelete = await prisma.projectTask.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!taskToDelete) {
      throw new Error("Tache introuvable");
    }

    await assertProjectVisibility(access, taskToDelete.projectId);

    if (!canManageProjectWork(access.role)) {
      throw new Error("Acces refuse pour modifier ce projet");
    }

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
  }[],
) {
  try {
    const access = await getAccessContext();

    if (!access.isAdmin) {
      throw new Error("Seuls les administrateurs peuvent appliquer les regles");
    }

    // Optimisation 1: Récupérer toutes les colonnes cibles en une seule requête
    const targetColumnIds = [
      ...new Set(projectsToMove.map((p) => p.targetColumnId)),
    ];

    const targetColumns = await prisma.kanbanColumn.findMany({
      where: { id: { in: targetColumnIds } },
      select: { id: true, title: true },
    });

    const columnMap = targetColumns.reduce(
      (map, column) => {
        map[column.id] = column;
        return map;
      },
      {} as Record<string, { id: string; title: string }>,
    );

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

        return prisma
          .$transaction(async (tx) => {
            const project = await tx.project.update({
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
            });

            await tx.projectComment.create({
              data: {
                projectId,
                userId: access.userId,
                content: `Changement automatique de statut vers "${targetColumn.title}" (règle d'automatisation).`,
              },
            });

            return {
              success: true,
              project,
              targetColumnTitle: targetColumn.title,
            };
          })
          .catch((error) => ({
            success: false,
            projectId,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          }));
      },
    );

    const results = await Promise.all(projectUpdates);

    revalidatePath("/dashboard/projects");
    return results;
  } catch (error) {
    console.error("Error applying automation rules:", error);
    throw new Error("Failed to apply automation rules");
  }
}
