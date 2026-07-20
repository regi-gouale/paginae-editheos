"use server";

import { revalidatePath } from "next/cache";
import { canManageTeam, getAccessContext } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import type { ProjectType } from "@/prisma/generated/prisma/client";

async function assertCanManageTaskTemplates() {
  const access = await getAccessContext();
  if (!canManageTeam(access.role)) {
    throw new Error("Acces refuse");
  }
}

// Récupérer tous les templates de tâches
export async function getTaskTemplates() {
  try {
    await assertCanManageTaskTemplates();
    const templates = await prisma.taskTemplate.findMany({
      orderBy: [{ projectType: "asc" }, { order: "asc" }],
    });
    return templates;
  } catch (error) {
    console.error("Error fetching task templates:", error);
    throw new Error("Impossible de récupérer les templates de tâches");
  }
}

// Récupérer les templates par type de projet
async function _getTaskTemplatesByType(projectType: ProjectType) {
  try {
    await assertCanManageTaskTemplates();
    const templates = await prisma.taskTemplate.findMany({
      where: { projectType },
      orderBy: { order: "asc" },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching task templates by type:", error);
    throw new Error("Impossible de récupérer les templates de tâches");
  }
}

// Créer un nouveau template
export async function createTaskTemplate(data: {
  title: string;
  projectType: ProjectType;
  order?: number;
}) {
  try {
    await assertCanManageTaskTemplates();
    // Si l'ordre n'est pas spécifié, le mettre à la fin
    if (data.order === undefined) {
      const maxOrder = await prisma.taskTemplate.findFirst({
        where: { projectType: data.projectType },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      data.order = maxOrder ? maxOrder.order + 1 : 0;
    }

    const template = await prisma.taskTemplate.create({
      data,
    });

    revalidatePath("/dashboard/settings");
    return template;
  } catch (error) {
    console.error("Error creating task template:", error);
    throw new Error("Impossible de créer le template de tâche");
  }
}

// Mettre à jour un template
export async function updateTaskTemplate(
  id: string,
  data: {
    title?: string;
    order?: number;
  },
) {
  try {
    await assertCanManageTaskTemplates();
    const template = await prisma.taskTemplate.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/settings");
    return template;
  } catch (error) {
    console.error("Error updating task template:", error);
    throw new Error("Impossible de mettre à jour le template de tâche");
  }
}

// Supprimer un template
export async function deleteTaskTemplate(id: string) {
  try {
    await assertCanManageTaskTemplates();
    await prisma.taskTemplate.delete({
      where: { id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task template:", error);
    throw new Error("Impossible de supprimer le template de tâche");
  }
}

// Réordonner les templates
export async function reorderTaskTemplates(
  templates: { id: string; order: number }[],
) {
  try {
    await assertCanManageTaskTemplates();
    // Utiliser une transaction pour mettre à jour tous les templates en une fois
    await prisma.$transaction(
      templates.map((template) =>
        prisma.taskTemplate.update({
          where: { id: template.id },
          data: { order: template.order },
        }),
      ),
    );

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error reordering task templates:", error);
    throw new Error("Impossible de réorganiser les templates de tâches");
  }
}

// Remplacer tous les templates pour un type de projet donné
async function _replaceTaskTemplatesForType(
  projectType: ProjectType,
  titles: string[],
) {
  try {
    await assertCanManageTaskTemplates();
    await prisma.$transaction(async (tx) => {
      // Supprimer tous les templates existants pour ce type
      await tx.taskTemplate.deleteMany({
        where: { projectType },
      });

      // Créer les nouveaux templates
      await tx.taskTemplate.createMany({
        data: titles.map((title, index) => ({
          title,
          projectType,
          order: index,
        })),
      });
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error replacing task templates:", error);
    throw new Error("Impossible de remplacer les templates de tâches");
  }
}
