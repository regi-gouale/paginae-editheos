"use client";

import {
  IconBook,
  IconCalendar,
  IconFileText,
  IconPrinter,
  IconSquareAsterisk,
  IconSquareCheck,
} from "@tabler/icons-react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
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
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  // Determine if project is overdue for display (exclude DONE projects)
  const isOverdue = isProjectOverdueForDisplay(project.dueDate, project.status);

  const isCompleted = project.status === "DONE";
  const maxAuthors = isCompact ? 1 : 2;
  const visibleAuthors = project.authors.slice(0, maxAuthors);
  const remainingAuthorsCount = Math.max(
    project.authors.length - maxAuthors,
    0,
  );

  const priorityHaloClasses = {
    LOW: "hover:ring-1 hover:ring-emerald-500/25 hover:shadow-emerald-500/10",
    MEDIUM: "hover:ring-1 hover:ring-amber-500/25 hover:shadow-amber-500/10",
    HIGH: "hover:ring-1 hover:ring-orange-500/25 hover:shadow-orange-500/10",
    URGENT: "hover:ring-1 hover:ring-red-500/30 hover:shadow-red-500/10",
  } as const;

  useEffect(() => {
    const element = cardContainerRef.current;

    if (!element) {
      return;
    }

    const setDensityFromWidth = (width: number) => {
      // Les cartes sont plus faciles a scanner en mode compact sous ~250px.
      setIsCompact(width < 250);
    };

    setDensityFromWidth(element.getBoundingClientRect().width);

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setDensityFromWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div ref={cardContainerRef} className="mb-2">
      <Card
        className={cn(
          "group relative w-full cursor-pointer gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-3 text-left text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/25",
          isCompleted && "opacity-90",
          getPriorityBorderStyle(project.priority),
          priorityHaloClasses[project.priority],
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`Ouvrir le projet ${project.title}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                "text-foreground font-semibold leading-5",
                isCompact
                  ? "line-clamp-2 text-sm"
                  : "line-clamp-3 text-sm sm:line-clamp-2",
              )}
            >
              {project.title}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-medium">
                {project.type === "EDITION" ? (
                  <IconBook className="size-3 text-blue-600 dark:text-blue-400" />
                ) : (
                  <IconPrinter className="size-3 text-emerald-600 dark:text-emerald-400" />
                )}
                {project.type === "EDITION" ? "Edition" : "Impression"}
              </span>

              {visibleAuthors.map((author) => (
                <span
                  key={author.id}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-1"
                >
                  {author.firstName} {author.lastName}
                </span>
              ))}

              {remainingAuthorsCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 font-medium">
                  +{remainingAuthorsCount}
                </span>
              ) : null}
            </div>
          </div>

          {!isCompleted && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                getPriorityBadgeStyle(project.priority),
              )}
            >
              {getPriorityLabel(project.priority)}
            </span>
          )}
        </div>

        {!isCompleted ? (
          project.description ? (
            <p
              className={cn(
                "text-muted-foreground text-[13px] leading-5",
                isCompact
                  ? "line-clamp-2"
                  : "line-clamp-4 sm:line-clamp-3 md:line-clamp-2",
              )}
            >
              {project.description}
            </p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 italic">
              <IconFileText className="size-3" />
              Aucune description pour le moment
            </p>
          )
        ) : null}

        <div className="mt-1 flex flex-wrap gap-2">
          {project.dueDate && !isCompleted && (
            <div
              className={cn(
                "inline-flex min-h-7 flex-1 items-center gap-1 rounded-full px-2 py-1 text-xs",
                isOverdue
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400",
                "bg-muted/60",
              )}
            >
              <IconCalendar className="size-3" />
              <span className="truncate">{formatDate(project.dueDate)}</span>
            </div>
          )}

          {totalTasks > 0 && !isCompleted && (
            <div className="inline-flex min-h-7 items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              <IconSquareCheck className="size-3" />
              {completedTasks}/{totalTasks}
            </div>
          )}

          {project.customFields.length > 0 && !isCompleted && (
            <div className="inline-flex min-h-7 items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              <IconSquareAsterisk className="size-3 text-gray-500 dark:text-gray-400" />
              <span>{project.customFields.length} champs</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
