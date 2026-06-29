"use client";

import {
  BookUser,
  Calendar,
  CheckSquare,
  Printer,
  SquareAsteriskIcon,
} from "lucide-react";
import {
  cn,
  formatDate,
  getPriorityBadgeStyle,
  getPriorityBorderStyle,
  getPriorityLabel,
  isProjectOverdueForDisplay,
} from "@/lib/utils";
import type { ProjectWithDetails } from "@/types/kanban";

interface ProjectCardProps {
  project: ProjectWithDetails;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const completedTasks = project.tasks.filter((task) => task.completed).length;
  const totalTasks = project.tasks.length;

  // Determine if project is overdue for display (exclude DONE projects)
  const isOverdue = isProjectOverdueForDisplay(project.dueDate, project.status);

  const isCompleted = project.status === "DONE";

  return (
    <button
      type="button"
      className={cn(
        "mb-2 w-full p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group text-left",
        getPriorityBorderStyle(project.priority),
      )}
      onClick={onClick}>
      {project.authors.length > 0 && (
        <div className="flex items-center space-x-1 gap-2">
          {project.type === "EDITION" ? (
            <BookUser className="size-3 text-blue-600 dark:text-blue-400 mx-2" />
          ) : (
            <Printer className="size-3 text-green-600 dark:text-green-400 mx-2" />
          )}

          {project.authors.map((author) => (
            <div
              key={author.id}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl">
              {author.firstName} {author.lastName}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-start mt-1">
        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
          {project.title}
        </h4>
        {!isCompleted && (
          <div
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0",
              getPriorityBadgeStyle(project.priority),
            )}>
            {getPriorityLabel(project.priority)}
          </div>
        )}
      </div>

      {project.description && !isCompleted && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-3">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {project.dueDate && !isCompleted && (
          <div
            className={cn(
              "flex flex-1 items-center text-xs",
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400",
              "bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl",
            )}>
            <Calendar className="size-3 mr-1" />
            <span className="truncate">{formatDate(project.dueDate)}</span>
          </div>
        )}

        {totalTasks > 0 && !isCompleted && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl">
            <CheckSquare className="size-3 mr-1" />
            {completedTasks}/{totalTasks}
          </div>
        )}

        {project.customFields.length > 0 && !isCompleted && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-xl gap-2">
            <SquareAsteriskIcon className="size-3 text-gray-500 dark:text-gray-400" />
            <span>{project.customFields.length} champs</span>
          </div>
        )}
      </div>
    </button>
  );
}
