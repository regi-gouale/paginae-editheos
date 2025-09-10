"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  CustomField,
  ProjectStatus,
  ProjectTask,
} from "@/prisma/generated/prisma";
import type {
  KanbanColumnWithProjects,
  ProjectWithDetails,
} from "@/types/kanban";
import { randomUUID } from "crypto";
import {
  Calendar,
  CheckSquare,
  Copy,
  Edit,
  Plus,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

interface ProjectDetailsSidebarProps {
  project: ProjectWithDetails;
  onClose: () => void;
  onUpdate: (project: ProjectWithDetails) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: ProjectWithDetails) => void;
  columns: KanbanColumnWithProjects[];
}

export function ProjectDetailSidebar({
  project,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
}: ProjectDetailsSidebarProps) {
  const [editedProject, setEditedProject] = useState<ProjectWithDetails>({
    ...project,
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState("");
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("");
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);

  const handleTitleSave = () => {
    if (editedProject.title.trim()) {
      onUpdate(editedProject);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionSave = () => {
    onUpdate(editedProject);
    setIsEditingDescription(false);
  };

  const handleStatusChange = (status: ProjectStatus) => {
    const updatedProject = { ...editedProject, status };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    const updatedProject = {
      ...editedProject,
      dueDate: date ?? null,
    };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = editedProject.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const updatedProject = { ...editedProject, tasks: updatedTasks };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: ProjectTask = {
      id: `task-${randomUUID()}`,
      title: newTaskTitle,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: editedProject.id,
    };

    const updatedTasks = {
      ...editedProject,
      tasks: [...editedProject.tasks, newTask],
    };

    setEditedProject(updatedTasks);
    onUpdate(updatedTasks);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const deleteTask = (taskId: string) => {
    const updatedTask = editedProject.tasks.filter(
      (task) => task.id !== taskId
    );

    const updatedProject = { ...editedProject, tasks: updatedTask };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const addCustomField = () => {
    if (!newCustomFieldName.trim()) return;

    const newField: CustomField = {
      id: `field-${randomUUID()}`,
      name: newCustomFieldName,
      value: newCustomFieldValue,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: editedProject.id,
    };

    const updatedProject = {
      ...editedProject,
      customFields: [...editedProject.customFields, newField],
    };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
    setNewCustomFieldName("");
    setNewCustomFieldValue("");
    setIsAddingCustomField(false);
  };

  const updateCustomField = (fieldId: string, value: string) => {
    const updatedFields = editedProject.customFields.map((field) =>
      field.id === fieldId ? { ...field, value } : field
    );
    const updatedProject = { ...editedProject, customFields: updatedFields };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const deleteCustomField = (fieldId: string) => {
    const updatedFields = editedProject.customFields.filter(
      (field) => field.id !== fieldId
    );
    const updatedProject = { ...editedProject, customFields: updatedFields };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const handleDeleteProject = () => {
    onDelete(editedProject.id);
  };

  const handleDuplicateProject = () => {
    onDuplicate(editedProject);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg border-l dark:border-gray-700 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold">Détails du projet</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Titre */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <Input
                  value={editedProject.title}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject,
                      title: e.target.value,
                    })
                  }
                  className="text-lg font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleTitleSave}>
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    variant={"outline"}
                    onClick={() => setIsEditingTitle(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium dark:text-gray-200">
                  {editedProject.title}
                </h3>
                <Button
                  variant={"ghost"}
                  size="icon"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Statut
            </Label>
            <Select
              value={editedProject.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.title}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date d'échéance */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Date d'échéance
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  <Calendar className="size-4 mr-2" />
                  {editedProject.dueDate ? (
                    formatDate(editedProject.dueDate)
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
                align="start"
              >
                <CalendarComponent
                  mode="single"
                  selected={
                    editedProject.dueDate
                      ? new Date(editedProject.dueDate)
                      : undefined
                  }
                  onSelect={handleDueDateChange}
                  autoFocus
                  className="dark:bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              {!isEditingDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <Edit className="h-3 w-3 mr-1" /> Modifier
                </Button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editedProject.description || ""}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Ajoouter une description"
                  rows={4}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave}>
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDescription(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md min-h-[60px]">
                {editedProject.description || "No description provided."}
              </div>
            )}
          </div>

          <Separator className="dark:border-gray-700" />

          {/* Tâches */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tâches
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Ajouter
              </Button>
            </div>

            {isAddingTask && (
              <div className="mb-3 space-y-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Titre de la tâche"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addTask}>
                    Ajouter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingTask(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedProject.tasks.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune tâche pour ce projet.
                </p>
              ) : (
                editedProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 mr-2"
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.completed ? (
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      <span
                        className={`text-sm ${
                          task.completed
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "dark:text-gray-200"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="dark:border-gray-700" />

          {/* Champs personnalisés */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Champs personnalisés
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingCustomField(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Ajouter
              </Button>
            </div>

            {isAddingCustomField && (
              <div className="mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newCustomFieldName}
                    onChange={(e) => setNewCustomFieldName(e.target.value)}
                    placeholder="Nom du champ"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                  <Input
                    value={newCustomFieldValue}
                    onChange={(e) => setNewCustomFieldValue(e.target.value)}
                    placeholder="Valeur du champ"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCustomField}>
                    Ajouter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingCustomField(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedProject.customFields.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun champ personnalisé pour ce projet.
                </p>
              ) : (
                editedProject.customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
                      <div className="text-sm font-medium dark:text-gray-200">
                        {field.name}:
                      </div>
                      <Input
                        value={field.value || ""}
                        onChange={(e) =>
                          updateCustomField(field.id, e.target.value)
                        }
                        className="h-7 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => deleteCustomField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t dark:border-gray-700 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 dark:border-gray-600 dark:text-gray-200"
          onClick={handleDuplicateProject}
        >
          <Copy className="h-4 w-4 mr-2" /> Dupliquer
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer le projet
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-gray-200">
                Êtes-vous sûr ?
              </AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-400">
                Cette action ne peut pas être annulée. Cela supprimera
                définitivement le projet et toutes ses sous-tâches.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
