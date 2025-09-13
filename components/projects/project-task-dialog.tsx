"use client";

import { Label } from "@/components/ui/label";
import {
  createProjectTask,
  deleteProjectTask,
  updateProjectTask,
} from "@/lib/actions/kanban";
import { ProjectTask } from "@/prisma/generated/prisma";
import { CheckSquare, Plus, Square, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ProjectTaskDialogProps {
  projectId: string;
  tasks?: ProjectTask[];
}

export function ProjectTaskDialog({
  projectId,
  tasks,
}: ProjectTaskDialogProps) {
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
    setNewTaskTitle("");
    setIsAdding(false);

    setEditedTasks((prev) => [...prev, createdTask]);
  };

  const onToggleTask = async (taskId: string) => {
    const task = tasks?.find((t) => t.id === taskId);
    if (!task) return;

    await updateProjectTask(taskId, { completed: !task.completed });
  };

  const onDeleteTask = async (taskId: string) => {
    await deleteProjectTask(taskId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-base font-semibold">Tâches 3/8</Label>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="size-4 mr-1" />
          Ajouter
        </Button>
      </div>
      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nouvelle tâche"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddTask();
                setIsAdding(false);
                setNewTaskTitle("");
              } else if (e.key === "Escape") {
                setIsAdding(false);
                setNewTaskTitle("");
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              // Handle save action here
              setIsAdding(false);
              setNewTaskTitle("");
            }}
          >
            Ajouter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAdding(false);
              setNewTaskTitle("");
            }}
          >
            Annuler
          </Button>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {editedTasks &&
          editedTasks.map((task) => (
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
                  <CheckSquare className="size-4 text-green-600" />
                ) : (
                  <Square className="size-4" />
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
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
