"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProject } from "@/lib/actions/kanban";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";

export default function AddProjectDialog({
  onProjectAdded,
  isInColumn = false,
}: {
  onProjectAdded?: () => void;
  isInColumn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await createProject({ title: name, description });
        if (res && res.id) {
          if (onProjectAdded) onProjectAdded();
          setOpen(false);
          setName("");
          setDescription("");
          // Actualiser la page des projets
          window.location.reload();
        } else {
          setError("Erreur lors de la création du projet.");
        }
      } catch (err) {
        setError(`Erreur lors de la création du projet. : ${err}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isInColumn ? "ghost" : "default"}
          className={
            isInColumn
              ? "w-full mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 justify-start"
              : ""
          }
        >
          <Plus className="mr-1 size-4" />
          Ajouter un projet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les informations du projet à créer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Nom du projet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création..." : "Créer le projet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
