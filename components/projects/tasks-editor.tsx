"use client";

import {
  IconPlus,
  IconSquare,
  IconSquareCheck,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProjectTask,
  deleteProjectTask,
  updateProjectTask,
} from "@/lib/actions/kanban";
import type { ProjectTask } from "@/prisma/generated/prisma/client";

// Composant réutilisable pour le bouton d'ajout
type AddTaskButtonProps = {
  onAddClick: () => void;
  isDetailView?: boolean;
  taskCount?: number;
  completedCount?: number;
};

function AddTaskButton({
  onAddClick,
  isDetailView = false,
  taskCount = 0,
  completedCount = 0,
}: AddTaskButtonProps) {
  if (isDetailView) {
    return (
      <div className="flex items-center justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddClick}
          className="rounded-xl"
        >
          <IconPlus className="size-4 mr-1" />
          Ajouter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-2">
      <Label className="text-base font-semibold">
        Tâches {taskCount > 0 ? `${completedCount}/${taskCount}` : ""}
      </Label>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddClick}
        className="rounded-xl"
      >
        <IconPlus className="size-4 mr-1" />
        Ajouter
      </Button>
    </div>
  );
}
type TaskAdderProps = {
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  onAddTask: () => void;
  onCancel: () => void;
  isDetailView?: boolean;
};

function TaskAdder({
  newTaskTitle,
  setNewTaskTitle,
  onAddTask,
  onCancel,
  isDetailView = false,
}: TaskAdderProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onAddTask();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="Nouvelle tâche"
        autoFocus
        onKeyDown={handleKeyDown}
        className={`rounded-xl ${isDetailView ? "" : "flex-1"}`}
      />
      <Button size="sm" onClick={onAddTask} className="rounded-xl">
        Ajouter
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onCancel}
        className="rounded-xl"
      >
        Annuler
      </Button>
    </div>
  );
}

type ProjectTasksEditorProps = {
  projectId: string;
  tasks?: ProjectTask[];
  isDetailView?: boolean;
};

export function ProjectTasksEditor({
  projectId,
  tasks,
  isDetailView,
}: ProjectTasksEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editedTasks, setEditedTasks] = useState<ProjectTask[]>(tasks || []);

  useEffect(() => {
    setEditedTasks(tasks || []);
  }, [tasks]);

  const onAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const createdTask = await createProjectTask({
      title: newTaskTitle,
      projectId,
      completed: false,
    });
    // Réinitialiser les états après ajout
    setNewTaskTitle("");
    setIsAdding(false);
    setEditedTasks((prev) => [...prev, createdTask]);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTaskTitle("");
  };

  const onToggleTask = async (taskId: string) => {
    const task = editedTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Mise à jour optimiste de l'état local d'abord
    setEditedTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    );

    try {
      // Puis mise à jour en base de données
      await updateProjectTask(taskId, { completed: !task.completed });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      setEditedTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: task.completed } : t,
        ),
      );
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  const onDeleteTask = async (taskId: string) => {
    // Mise à jour optimiste de l'état local d'abord
    const originalTasks = editedTasks;
    setEditedTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      // Puis suppression en base de données
      await deleteProjectTask(taskId);
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setEditedTasks(originalTasks);
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bouton d'ajout conditionnel */}
      {!isAdding && (
        <AddTaskButton
          onAddClick={() => setIsAdding(true)}
          isDetailView={isDetailView}
          taskCount={editedTasks.length}
          completedCount={editedTasks.filter((t) => t.completed).length}
        />
      )}

      {/* Formulaire d'ajout de tâche */}
      {isAdding && (
        <TaskAdder
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          onAddTask={onAddTask}
          onCancel={handleCancelAdd}
          isDetailView={isDetailView}
        />
      )}

      {/* Liste des tâches */}
      <div className="mt-4 space-y-2">
        {editedTasks?.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-2 border rounded-xl group"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleTask(task.id)}
              className="p-1 size-6"
            >
              {task.completed ? (
                <IconSquareCheck className="size-4 text-green-600" />
              ) : (
                <IconSquare className="size-4" />
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
              onClick={() => onDeleteTask(task.id)}
              className="p-1 size-6 opacity-0 group-hover:opacity-100"
            >
              <IconTrash className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
