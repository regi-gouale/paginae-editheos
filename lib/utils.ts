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
