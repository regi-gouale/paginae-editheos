"use client";

import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAlerts } from "@/hooks/use-alerts";
import { ProjectStatus } from "@/prisma/generated/prisma";
import type {
  KanbanColumnWithProjects,
  ProjectWithDetails,
} from "@/types/kanban";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { randomUUID } from "crypto";
import { MoreHorizontal, Palette, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const { showSuccess, showError } = useAlerts();

  const handleAddProject = async () => {
    if (!newProjectTitle.trim()) return;

    const newProject: ProjectWithDetails = {
      id: `project-${randomUUID()}`,
      title: newProjectTitle,
      description: newProjectDescription || "",
      columnId: column.id,
      authors: [],
      members: [],
      tasks: [],
      customFields: [],
      createdAt: new Date(),
      updatedAt: new Date(),

      status: ProjectStatus.TODO,
      dueDate: null,
    };

    onAddProject(column.id, newProject);
    setNewProjectTitle("");
    setNewProjectDescription("");
    setIsAddingProject(false);
  };

  const handleColorChange = (color: string) => {
    onUpdateColumn(column.id, { color });
  };

  // const handleDeleteColumn = async () => {
  //   if (column.projects.length > 0) {
  //     showError(
  //       "Impossible de supprimer",
  //       "Cette colonne contient des projets. Déplacez-les d'abord."
  //     );
  //     return;
  //   }

  //   try {
  //     await deleteKanbanColumn(column.id);
  //     showSuccess(
  //       "Colonne supprimée",
  //       `La colonne "${column.title}" a été supprimée.`
  //     );
  //   } catch (error) {
  //     showError("Erreur", "Impossible de supprimer la colonne.");
  //   }
  // };

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
            {/* <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un projet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau projet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="projectTitle"
                      className="text-sm font-medium"
                    >
                      Titre du projet
                    </label>
                    <Input
                      id="projectTitle"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="Entrez le titre du projet"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="projectDescription"
                      className="text-sm font-medium"
                    >
                      Description (optionnelle)
                    </label>
                    <Textarea
                      id="projectDescription"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Entrez la description du projet"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingProject(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleAddProject}>Créer le projet</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog> */}
            {isAddingProject ? (
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border dark:border-gray-700">
                <Label htmlFor="project-title" className="dark:text-gray-200">
                  Titre du projet
                </Label>
                <Input
                  id="project-title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Entrez le titre du projet"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <Label
                  htmlFor="project-description"
                  className="dark:text-gray-200"
                >
                  Description (optionnelle)
                </Label>
                <Textarea
                  id="project-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Entrez la description du projet"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddProject}>
                    Ajouter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingProject(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 justify-start"
                onClick={() => setIsAddingProject(true)}
              >
                <Plus className="mr-2 size-4" /> Ajouter un projet
              </Button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
