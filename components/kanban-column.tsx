"use client";

import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  KanbanColumnWithProjects,
  ProjectWithDetails,
} from "@/types/kanban";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Palette, Trash2 } from "lucide-react";
import { useState } from "react";
import AddProjectDialog from "./add-project-dialog";

// Couleurs prédéfinies pour les colonnes
const COLUMN_COLORS = [
  { name: "Défaut", value: "bg-white dark:bg-gray-800" },
  { name: "Bleu", value: "bg-blue-50 dark:bg-blue-900/30" },
  { name: "Vert", value: "bg-green-50 dark:bg-green-900/30" },
  { name: "Jaune", value: "bg-yellow-50 dark:bg-yellow-900/30" },
  { name: "Violet", value: "bg-purple-50 dark:bg-purple-900/30" },
  { name: "Rose", value: "bg-pink-50 dark:bg-pink-900/30" },
  { name: "Orange", value: "bg-orange-50 dark:bg-orange-900/30" },
  { name: "Cyan", value: "bg-cyan-50 dark:bg-cyan-900/30" },
];

interface KanbanColumnProps {
  column: KanbanColumnWithProjects;
  onAddProject: (columnId: string, project: ProjectWithDetails) => void;
  onProjectClick: (project: ProjectWithDetails) => void;
  onDeleteColumn: () => void;
  onUpdateColumn: (
    columnId: string,
    data: Partial<KanbanColumnWithProjects>
  ) => void;
  onDuplicateProject: (project: ProjectWithDetails, columnId: string) => void;
}

export function KanbanColumn({
  column,
  onAddProject,
  onProjectClick,
  onDeleteColumn,
  onUpdateColumn,
  onDuplicateProject,
}: KanbanColumnProps) {
  // const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  // const { showSuccess, showError } = useAlerts();

  // const handleAddProject = async () => {
  //   if (!newProjectTitle.trim()) return;

  //   const newProject: ProjectWithDetails = {
  //     id: `project-${randomUUID()}`,
  //     title: newProjectTitle,
  //     description: newProjectDescription || "",
  //     columnId: column.id,
  //     authors: [],
  //     members: [],
  //     tasks: [],
  //     customFields: [],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),

  //     status: ProjectStatus.TODO,
  //     dueDate: null,
  //   };

  //   onAddProject(column.id, newProject);
  //   setNewProjectTitle("");
  //   setNewProjectDescription("");
  //   // setIsAddingProject(false);
  // };

  const handleColorChange = (color: string) => {
    onUpdateColumn(column.id, { color });
  };

  // Couleur d'en-tête ou par défaut
  const headerColorClass = column.color || "bg-white dark:bg-gray-800";

  return (
    <div className="shrink-0 w-fit flex flex-col bg-muted rounded-lg shadow-sm max-w-92">
      {/* En-tête de colonne */}
      <div
        className={`p-4 flex justify-between items-center border-b rounded-t-lg ${headerColorClass}`}
      >
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 truncate">
            {column.title}
          </h3>
          <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
            {column.projects.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Sélecteur de couleur */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                <Palette className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Couleur de la colonne</h4>
                <div className="grid grid-cols-4 gap-2">
                  {COLUMN_COLORS.map((color) => (
                    <Button
                      key={color.value}
                      className={`h-8 w-full rounded-md ${color.value} border hover:opacity-80 transition-opacity`}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDeleteColumn}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="size-4 mr-2" />
                Supprimer la colonne
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Liste des projets */}
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto`}
          >
            {column.projects.map((project, index) => (
              <Draggable
                key={project.id}
                draggableId={project.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ProjectCard
                      project={project}
                      onClick={() => onProjectClick(project)}
                      onDuplicate={() => onDuplicateProject(project, column.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Bouton d'ajout de projet */}
            <AddProjectDialog onProjectAdded={() => {}} isInColumn={true} />
          </div>
        )}
      </Droppable>
    </div>
  );
}
