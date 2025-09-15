"use client";

import { cn, formatDate, isProjectOverdueForDisplay } from "@/lib/utils";
import { Priority } from "@/prisma/generated/prisma";
import type { ProjectWithDetails } from "@/types/kanban";
import { BookUser, Calendar, CheckSquare, Printer } from "lucide-react";

interface ProjectCardProps {
  project: ProjectWithDetails;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const completedTasks = project.tasks.filter((task) => task.completed).length;
  const totalTasks = project.tasks.length;

  // Determine if project is overdue for display (exclude DONE projects)
  const isOverdue = isProjectOverdueForDisplay(project.dueDate, project.status);

  // Get priority-based styling
  const getPriorityBorderStyle = (priority: Priority) => {
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

  const getPriorityBadgeStyle = (priority: Priority) => {
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

  const getPriorityLabel = (priority: Priority) => {
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

  return (
    <div
      className={cn(
        "mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group",
        getPriorityBorderStyle(project.priority)
      )}
      onClick={onClick}
    >
      {project.authors.length > 0 && (
        <div className="flex items-center space-x-1">
          {project.type === "EDITION" ? (
            <BookUser className="size-3 text-blue-600 dark:text-blue-400 mx-2" />
          ) : (
            <Printer className="size-3 text-green-600 dark:text-green-400 mx-2" />
          )}

          {project.authors.map((author) => (
            <div
              key={author.id}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl"
            >
              {author.firstName} {author.lastName}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
          {project.title}
        </h4>
        <div
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0",
            getPriorityBadgeStyle(project.priority)
          )}
        >
          {getPriorityLabel(project.priority)}
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-3">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {project.dueDate && (
          <div
            className={cn(
              "flex flex-1 items-center text-xs",
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400",
              "bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl"
            )}
          >
            <Calendar className="size-3 mr-1" />
            <span className="truncate">{formatDate(project.dueDate)}</span>
          </div>
        )}

        {totalTasks > 0 && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl">
            <CheckSquare className="size-3 mr-1" />
            {completedTasks}/{totalTasks}
          </div>
        )}

        {project.customFields.map(
          (field) =>
            field.value && (
              <div
                key={field.id}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl"
              >
                {field.name}:{" "}
                {field.value.toString().length > 10
                  ? field.value.toString().slice(0, 10) + "..."
                  : field.value.toString()}
              </div>
            )
        )}
      </div>
    </div>
  );
}
