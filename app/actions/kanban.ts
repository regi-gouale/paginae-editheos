"use server";

import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/prisma/generated/prisma";
import { revalidatePath } from "next/cache";

// Get all columns with their projects
export async function getKanbanData() {
  try {
    const columns = await prisma.kanbanColumn.findMany({
      orderBy: { position: "asc" },
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

    console.log("Kanban columns fetched:", columns);

    if (columns.length === 0) {
      // Crée les colonnes Kanban
      await Promise.all([
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
      const newColumns = await prisma.kanbanColumn.findMany({
        orderBy: { position: "asc" },
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
      return newColumns;
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
  }
) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data,
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
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { columnId },
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

// Get all authors for project assignment
export async function getAuthors() {
  try {
    return await prisma.author.findMany({
      orderBy: { lastName: "asc" },
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw new Error("Failed to fetch authors");
  }
}

// Get all members for project assignment
export async function getMembers() {
  try {
    return await prisma.member.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    throw new Error("Failed to fetch members");
  }
}
