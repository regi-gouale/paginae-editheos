import { ProjectStatus } from "@/prisma/generated/prisma";
import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date) {
  if (typeof dateString === "string") {
    dateString = new Date(dateString);
  }
  return format(dateString, "PPP", { locale: fr });
}

export function generateRandomId(length: number = 8): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Génère un slug pour un auteur à partir de son prénom et nom
 */
export function generateAuthorSlug(
  firstName: string,
  lastName: string
): string {
  const name = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // Supprime les espaces et caractères spéciaux
  const randomId = generateRandomId(5);
  return `${name}-${randomId}`;
}

/**
 * Génère un slug pour un membre à partir de son nom
 */
export function generateMemberSlug(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, ""); // Supprime les espaces et caractères spéciaux
  const randomId = generateRandomId(5);
  return `${cleanName}-${randomId}`;
}

export const getProjectStatusFromColumnName = (
  columnTitle: string
): ProjectStatus => {
  switch (columnTitle) {
    case "À faire":
      return ProjectStatus.TODO;
    case "En cours":
      return ProjectStatus.IN_PROGRESS;
    case "Bloqué":
      return ProjectStatus.BLOCKED;
    case "Terminé":
      return ProjectStatus.DONE;
    case "Rejeté":
      return ProjectStatus.REJECTED;
    default:
      return ProjectStatus.TODO;
  }
};

export const getColumnNameFromProjectStatus = (
  status: ProjectStatus
): string => {
  switch (status) {
    case ProjectStatus.TODO:
      return "À faire";
    case ProjectStatus.IN_PROGRESS:
      return "En cours";
    case ProjectStatus.BLOCKED:
      return "Bloqué";
    case ProjectStatus.DONE:
      return "Terminé";
    case ProjectStatus.REJECTED:
      return "Rejeté";
    default:
      return "À faire";
  }
};

export function getPriorityLabel(level: keyof typeof priorityLevels) {
  return priorityLevels[level];
}

export const priorityLevels = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

/**
 * Vérifie si un projet est en retard pour l'affichage
 * Les projets terminés ne sont jamais considérés comme en retard pour l'affichage
 */
export function isProjectOverdueForDisplay(
  dueDate: Date | string | null | undefined,
  status?: ProjectStatus
): boolean {
  if (!dueDate || status === ProjectStatus.DONE) return false;
  return new Date(dueDate) < new Date();
}
