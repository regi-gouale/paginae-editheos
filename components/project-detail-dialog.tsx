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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getAuthors } from "@/lib/actions/authors";
import {
  createCustomField,
  createProjectTask,
  deleteCustomField,
  deleteProjectTask,
  updateCustomField,
  updateProjectTask,
} from "@/lib/actions/kanban";
import { formatDate } from "@/lib/utils";
import { Author, ProjectStatus } from "@/prisma/generated/prisma";
import type {
  KanbanColumnWithProjects,
  ProjectWithDetails,
} from "@/types/kanban";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CheckSquare,
  Copy,
  Edit,
  Plus,
  Square,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectDetailDialogProps {
  project: ProjectWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (project: ProjectWithDetails) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: ProjectWithDetails) => void;
  columns: KanbanColumnWithProjects[];
}

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onDuplicate,
}: ProjectDetailDialogProps) {
  const [editedProject, setEditedProject] = useState<ProjectWithDetails | null>(
    null
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState("");
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("");
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);

  // Charger les auteurs au montage du composant
  useEffect(() => {
    const loadAuthors = async () => {
      setIsLoadingAuthors(true);
      try {
        const response = await getAuthors({ limit: 100 }); // Charger tous les auteurs
        // Transformer les auteurs en ajoutant les champs manquants avec des valeurs par défaut
        const transformedAuthors: Author[] = response.authors.map((author) => ({
          ...author,
          biography: author.biography ?? null,
          website: author.website ?? null,
          nationality: author.nationality ?? null,
          birthDate: author.birthDate ?? null,
          createdAt: author.createdAt || new Date(),
          updatedAt: author.updatedAt || new Date(),
        }));
        setAuthors(transformedAuthors);
      } catch (error) {
        console.error("Erreur lors du chargement des auteurs:", error);
      } finally {
        setIsLoadingAuthors(false);
      }
    };

    if (open) {
      loadAuthors();
    }
  }, [open]);

  // Réinitialiser le projet édité quand le projet change
  useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
    }
  }, [project]);

  if (!project || !editedProject) {
    return null;
  }

  const handleClose = () => {
    onOpenChange(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsAddingTask(false);
    setIsAddingCustomField(false);
    setNewTaskTitle("");
    setNewCustomFieldName("");
    setNewCustomFieldValue("");
  };

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

  const handleAuthorChange = (authorId: string) => {
    const selectedAuthor = authors.find((author) => author.id === authorId);
    if (selectedAuthor) {
      const updatedProject = {
        ...editedProject,
        authors: [selectedAuthor], // Pour simplifier, on ne garde qu'un seul auteur
      };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    const updatedProject = {
      ...editedProject,
      dueDate: date || null,
    };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const toggleTask = async (taskId: string) => {
    const task = editedProject.tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      await updateProjectTask(taskId, { completed: !task.completed });
      const updatedTasks = editedProject.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const updatedProject = { ...editedProject, tasks: updatedTasks };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const newTask = await createProjectTask({
        title: newTaskTitle,
        projectId: editedProject.id,
        completed: false,
      });
      const updatedProject = {
        ...editedProject,
        tasks: [...editedProject.tasks, newTask],
      };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteProjectTask(taskId);
      const updatedTasks = editedProject.tasks.filter(
        (task) => task.id !== taskId
      );
      const updatedProject = { ...editedProject, tasks: updatedTasks };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  const addCustomField = async () => {
    if (!newCustomFieldName.trim()) return;
    try {
      const newField = await createCustomField({
        name: newCustomFieldName,
        value: newCustomFieldValue,
        projectId: editedProject.id,
      });
      const updatedProject = {
        ...editedProject,
        customFields: [...editedProject.customFields, newField],
      };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
      setNewCustomFieldName("");
      setNewCustomFieldValue("");
      setIsAddingCustomField(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du champ personnalisé:", error);
    }
  };

  const updateCustomFieldValue = async (fieldId: string, value: string) => {
    try {
      await updateCustomField(fieldId, { value });
      const updatedFields = editedProject.customFields.map((field) =>
        field.id === fieldId ? { ...field, value } : field
      );
      const updatedProject = { ...editedProject, customFields: updatedFields };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du champ personnalisé:",
        error
      );
    }
  };

  const deleteCustomFieldLocal = async (fieldId: string) => {
    try {
      await deleteCustomField(fieldId);
      const updatedFields = editedProject.customFields.filter(
        (field) => field.id !== fieldId
      );
      const updatedProject = { ...editedProject, customFields: updatedFields };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du champ personnalisé:",
        error
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedProject.title}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject,
                      title: e.target.value,
                    })
                  }
                  className="flex-1"
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTitleSave();
                    } else if (e.key === "Escape") {
                      setEditedProject({
                        ...editedProject,
                        title: project.title,
                      });
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="flex-1">{editedProject.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={editedProject.status}
                onValueChange={(value) =>
                  handleStatusChange(value as ProjectStatus)
                }
                defaultValue={editedProject.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectStatus.TODO}>À faire</SelectItem>
                  <SelectItem value={ProjectStatus.IN_PROGRESS}>
                    En cours
                  </SelectItem>
                  <SelectItem value={ProjectStatus.BLOCKED}>Bloqué</SelectItem>
                  <SelectItem value={ProjectStatus.DONE}>Terminé</SelectItem>
                  <SelectItem value={ProjectStatus.REJECTED}>Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auteur */}
            <div className="space-y-2">
              <Label>Auteur</Label>
              {isLoadingAuthors ? (
                <div className="text-sm text-muted-foreground">
                  Chargement des auteurs...
                </div>
              ) : (
                <Select
                  value={editedProject.authors[0]?.id || ""}
                  onValueChange={handleAuthorChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un auteur">
                      {editedProject.authors[0] && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {`${editedProject.authors[0].firstName} ${editedProject.authors[0].lastName}`}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {`${author.firstName} ${author.lastName}`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Date d'échéance */}
          <div className="space-y-2">
            <Label>Date d&apos;échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editedProject.dueDate
                    ? formatDate(editedProject.dueDate)
                    : "Aucune date définie"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editedProject.dueDate || undefined}
                  onSelect={handleDueDateChange}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
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
                  placeholder="Description du projet..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave}>
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedProject({
                        ...editedProject,
                        description: project.description,
                      });
                      setIsEditingDescription(false);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className="min-h-[60px] p-3 border rounded-md cursor-pointer hover:bg-muted/50"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {editedProject.description || (
                    <span className="text-muted-foreground italic">
                      Cliquez pour ajouter une description...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Tâches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Tâches ({editedProject.tasks.filter((t) => t.completed).length}/
                {editedProject.tasks.length})
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {isAddingTask && (
              <div className="flex gap-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Titre de la tâche..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTask();
                    } else if (e.key === "Escape") {
                      setIsAddingTask(false);
                      setNewTaskTitle("");
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={addTask}>
                  Ajouter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {editedProject.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 border rounded group"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTask(task.id)}
                    className="p-1 h-6 w-6"
                  >
                    {task.completed ? (
                      <CheckSquare className="h-4 w-4 text-green-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                  <span
                    className={`flex-1 ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Champs personnalisés */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Champs personnalisés
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingCustomField(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {isAddingCustomField && (
              <div className="space-y-2 p-3 border rounded">
                <Input
                  value={newCustomFieldName}
                  onChange={(e) => setNewCustomFieldName(e.target.value)}
                  placeholder="Nom du champ..."
                />
                <Input
                  value={newCustomFieldValue}
                  onChange={(e) => setNewCustomFieldValue(e.target.value)}
                  placeholder="Valeur du champ..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCustomField}>
                    Ajouter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingCustomField(false);
                      setNewCustomFieldName("");
                      setNewCustomFieldValue("");
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedProject.customFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 p-2 border rounded group"
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm">{field.name}</div>
                    <Input
                      value={field.value}
                      onChange={(e) =>
                        updateCustomFieldValue(field.id, e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCustomFieldLocal(field.id)}
                    className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onDuplicate(editedProject)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Dupliquer
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le projet &quot;
                    {editedProject.title}&quot; ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(editedProject.id);
                      handleClose();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
