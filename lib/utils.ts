import { Priority, ProjectStatus } from "@/prisma/generated/prisma";
import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateLong(dateString: string | Date) {
  if (typeof dateString === "string") {
    dateString = new Date(dateString);
  }
  return format(dateString, "PPPP", { locale: fr });
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
  const name = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Remplace les espaces et caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ""); // Supprime les tirets en début et fin
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

/**
 * Génère un slug pour un projet à partir de son titre
 */
export function generateProjectSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Remplace les espaces et caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ""); // Supprime les tirets en début et fin
  const randomId = generateRandomId(6);
  return `${cleanTitle}-${randomId}`;
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

export const priorityLevels = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

export const projectTypes = {
  EDITION: "Édition",
  PRINTING: "Impression",
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
// Get priority-based styling
export const getPriorityBorderStyle = (priority: Priority) => {
  switch (priority) {
    case "URGENT":
      return "border-l-4 border-l-red-500";
    case "HIGH":
      return "border-l-4 border-l-orange-500";
    case "MEDIUM":
      return "border-l-4 border-l-yellow-500";
    case "LOW":
      return "border-l-4 border-l-green-500";
    default:
      return "border-l-4 border-l-gray-300";
  }
};

export const getPriorityBadgeStyle = (priority: Priority) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "HIGH":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "LOW":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getPriorityLabel = (priority: Priority) => {
  switch (priority) {
    case "URGENT":
      return "Urgente";
    case "HIGH":
      return "Élevée";
    case "MEDIUM":
      return "Moyenne";
    case "LOW":
      return "Faible";
    default:
      return "Non définie";
  }
};

export const getStatusVariant = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.DONE:
      return "default";
    case ProjectStatus.IN_PROGRESS:
      return "secondary";
    case ProjectStatus.BLOCKED:
      return "destructive";
    case ProjectStatus.REJECTED:
      return "outline";
    default:
      return "secondary";
  }
};
