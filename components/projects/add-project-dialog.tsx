"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/actions/kanban";
import { cn } from "@/lib/utils";

export function AddProjectDialog({
  onProjectAdded,
  isInColumn = false,
}: {
  onProjectAdded?: () => void;
  isInColumn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"EDITION" | "PRINTING">("EDITION");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("LOW");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await createProject({
          title: name,
          description,
          type,
          priority,
        });
        if (res?.id) {
          if (onProjectAdded) onProjectAdded();
          setOpen(false);
          setName("");
          setDescription("");
          setType("EDITION");
          setPriority("LOW");
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
              ? "w-full mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 justify-start flex flex-1"
              : "flex items-center justify-center rounded-full md:rounded-xl"
          }
        >
          <Plus className="size-4" />
          <span className={cn(!isInColumn && "hidden md:block")}>
            Ajouter un projet
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les informations du projet à créer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium">
              Nom du projet
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            {/* Type de projet et la priorité */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="type" className="block text-sm font-medium">
                  Type de projet
                </Label>
                <Select
                  value={type}
                  onValueChange={(value: "EDITION" | "PRINTING") =>
                    setType(value)
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITION">Édition</SelectItem>
                    <SelectItem value="PRINTING">Impression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="priority" className="block text-sm font-medium">
                  Priorité
                </Label>
                <Select
                  value={priority}
                  onValueChange={(
                    value: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
                  ) => setPriority(value)}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Basse</SelectItem>
                    <SelectItem value="MEDIUM">Moyenne</SelectItem>
                    <SelectItem value="HIGH">Haute</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="block text-sm font-medium">
              Description
            </Label>
            <Textarea
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
