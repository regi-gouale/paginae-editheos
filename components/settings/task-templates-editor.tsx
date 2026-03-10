"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createTaskTemplate,
  deleteTaskTemplate,
  getTaskTemplates,
  updateTaskTemplate,
  reorderTaskTemplates,
} from "@/lib/actions/task-templates.action";
import { ProjectType, TaskTemplate } from "@/prisma/generated/prisma/client";
import { GripVertical, Plus, Trash2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskTemplateWithEditing = TaskTemplate & { isEditing?: boolean };

type SortableTaskItemProps = {
  template: TaskTemplateWithEditing;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: (id: string) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
};

function SortableTaskItem({
  template,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
  editTitle,
  setEditTitle,
}: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border rounded-lg bg-background group">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing">
        <GripVertical className="size-4 text-muted-foreground" />
      </div>

      {template.isEditing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit(template.id, editTitle);
              } else if (e.key === "Escape") {
                onCancelEdit(template.id);
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(template.id, editTitle)}
            className="size-8 p-0">
            <Check className="size-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancelEdit(template.id)}
            className="size-8 p-0">
            <X className="size-4 text-muted-foreground" />
          </Button>
        </>
      ) : (
        <>
          <span
            className="flex-1 cursor-pointer"
            onClick={() => onStartEdit(template.id)}>
            {template.title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="size-8 p-0 opacity-0 group-hover:opacity-100">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </>
      )}
    </div>
  );
}

type TaskTemplatesEditorProps = {
  projectType: ProjectType;
  title: string;
  description: string;
};

export function TaskTemplatesEditor({
  projectType,
  title,
  description,
}: TaskTemplatesEditorProps) {
  const [templates, setTemplates] = useState<TaskTemplateWithEditing[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadTemplates();
  }, [projectType]);

  async function loadTemplates() {
    try {
      setIsLoading(true);
      const allTemplates = await getTaskTemplates();
      const filtered = allTemplates.filter(
        (t) => t.projectType === projectType,
      );
      setTemplates(filtered);
    } catch {
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTemplate() {
    if (!newTaskTitle.trim()) return;

    try {
      await createTaskTemplate({
        title: newTaskTitle,
        projectType,
      });
      setNewTaskTitle("");
      setIsAdding(false);
      toast.success("Template ajouté avec succès");
      await loadTemplates();
    } catch {
      toast.error("Erreur lors de l'ajout du template");
    }
  }

  async function handleDeleteTemplate(id: string) {
    try {
      await deleteTaskTemplate(id);
      toast.success("Template supprimé avec succès");
      await loadTemplates();
    } catch {
      toast.error("Erreur lors de la suppression du template");
    }
  }

  function handleStartEdit(templateId: string): void {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setEditTitle(template.title);
      setTemplates(
        templates.map((t) => ({
          ...t,
          isEditing: t.id === templateId,
        })),
      );
    }
  }

  function handleCancelEdit(id: string) {
    setTemplates(
      templates.map((t) => ({
        ...t,
        isEditing: false,
      })),
    );
    setEditTitle("");
  }

  async function handleEditTemplate(id: string, title: string) {
    if (!title.trim()) return;

    try {
      await updateTaskTemplate(id, { title });
      toast.success("Template modifié avec succès");
      await loadTemplates();
      setEditTitle("");
    } catch {
      toast.error("Erreur lors de la modification du template");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = templates.findIndex((t) => t.id === active.id);
      const newIndex = templates.findIndex((t) => t.id === over.id);

      const newOrder = arrayMove(templates, oldIndex, newIndex);
      setTemplates(newOrder);

      try {
        await reorderTaskTemplates(
          newOrder.map((t: TaskTemplateWithEditing, index: number) => ({
            id: t.id,
            order: index,
          })),
        );
        toast.success("Ordre mis à jour");
      } catch {
        toast.error("Erreur lors de la réorganisation");
        await loadTemplates(); // Recharger en cas d'erreur
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">
            Chargement...
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={templates.map((t) => t.id)}
                strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <SortableTaskItem
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDelete={handleDeleteTemplate}
                      onStartEdit={handleStartEdit}
                      onCancelEdit={handleCancelEdit}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {templates.length === 0 && !isAdding && (
              <div className="text-center text-muted-foreground py-8">
                Aucun template défini. Cliquez sur &quot;Ajouter une tâche&quot;
                pour commencer.
              </div>
            )}

            {isAdding ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Nom de la tâche..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTemplate();
                    } else if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewTaskTitle("");
                    }
                  }}
                />
                <Button onClick={handleAddTemplate} size="sm">
                  <Check className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle("");
                  }}>
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="w-full">
                <Plus className="size-4 mr-2" />
                Ajouter une tâche
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
