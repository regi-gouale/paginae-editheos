"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ProjectCard } from "@/components/project-card";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import type {
  KanbanColumnWithProjects,
  ProjectWithDetails,
} from "@/types/kanban";

interface KanbanColumnProps {
  column: KanbanColumnWithProjects;
  canCreateProject: boolean;
  canMoveProject: boolean;
  onProjectClick: (project: ProjectWithDetails) => void;
}

export function KanbanColumn({
  column,
  canCreateProject,
  canMoveProject,
  onProjectClick,
}: // onDeleteColumn,
// onUpdateColumn,
KanbanColumnProps) {
  // const handleColorChange = (color: string) => {
  //   onUpdateColumn(column.id, { color });
  // };

  // Couleur d'en-tête ou par défaut
  const headerColorClass = column.color || "bg-white dark:bg-gray-800";

  return (
    <div className="shrink-0 w-full flex flex-col bg-muted rounded-4xl shadow-sm max-w-92">
      {/* En-tête de colonne */}
      <div
        className={`p-4 flex justify-between items-center border-b rounded-t-4xl ${headerColorClass}`}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 truncate">
            {column.title}
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-2 rounded-full">
            {column.projects.length}
          </span>
        </div>
      </div>

      {/* Liste des projets */}
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto rounded-2xl`}
          >
            {column.projects.map((project, index) => (
              <Draggable
                key={project.id}
                draggableId={project.id}
                index={index}
                isDragDisabled={!canMoveProject}
              >
                {(provided, snapshot) => {
                  const { style, ...draggableProps } = provided.draggableProps;
                  const draggableElement = (
                    <div
                      ref={provided.innerRef}
                      {...draggableProps}
                      {...provided.dragHandleProps}
                      style={style as CSSProperties | undefined}
                    >
                      <ProjectCard
                        project={project}
                        onClick={() => onProjectClick(project)}
                      />
                    </div>
                  );

                  if (snapshot.isDragging) {
                    return createPortal(draggableElement, document.body);
                  }

                  return draggableElement;
                }}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Bouton d'ajout de projet */}
            {canCreateProject ? (
              <AddProjectDialog onProjectAdded={() => {}} isInColumn={true} />
            ) : null}
          </div>
        )}
      </Droppable>
    </div>
  );
}
