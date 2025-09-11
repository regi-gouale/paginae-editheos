"use client";

import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { ProjectStatus } from "@/prisma/generated/prisma";
import type { ProjectWithDetails } from "@/types/kanban";
import { Calendar, CheckSquare, Copy } from "lucide-react";

interface ProjectCardProps {
  project: ProjectWithDetails;
  onClick: () => void;
  onDuplicate: () => void;
}

export function ProjectCard({
  project,
  onClick,
  onDuplicate,
}: ProjectCardProps) {
  const completedTasks = project.tasks.filter((task) => task.completed).length;
  const totalTasks = project.tasks.length;

  // Determine if project is overdue
  const isOverdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    project.status !== ProjectStatus.TODO;

  const handleDuplicate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDuplicate();
  };

  // console.log("Rendering ProjectCard:", project.title, project.dueDate);

  return (
    <div
      className="mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
          {project.title}
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDuplicate}
          title="Dupliquer le projet"
        >
          <Copy className="size-3" />
        </Button>
      </div>
      {project.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {project.dueDate && (
          <div
            className={cn(
              "flex items-center text-xs",
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400",
              "bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md"
            )}
          >
            <Calendar className="size-3 mr-1" />
            {formatDate(project.dueDate)}
          </div>
        )}

        {totalTasks > 0 && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
            <CheckSquare className="size-3 mr-1" />
            {completedTasks}/{totalTasks}
          </div>
        )}

        {project.customFields.map(
          (field) =>
            field.value && (
              <div
                key={field.id}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md"
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
