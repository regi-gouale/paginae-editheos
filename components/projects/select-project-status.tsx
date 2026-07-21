"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/actions/kanban";
import type { ProjectStatus } from "@/prisma/generated/prisma/client";

interface ProjectStatusDropdownProps {
  projectId: string;
  status: ProjectStatus;
  canValidate?: boolean;
  // onStatusUpdated?: (newStatus: ProjectStatus) => void;
}

export function ProjectStatusDropdown({
  projectId,
  status,
  canValidate = false,
}: // onStatusUpdated,
ProjectStatusDropdownProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(status);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(
    null,
  );
  const [statusComment, setStatusComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  const onValueChange = async (value: ProjectStatus) => {
    if (value === selectedStatus) return;
    setPendingStatus(value);
    setStatusComment("");
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;

    const comment = statusComment.trim();
    if (!comment) {
      toast.error("Un commentaire est obligatoire pour changer le statut");
      return;
    }

    setIsSaving(true);
    try {
      await updateProject(projectId, {
        status: pendingStatus,
        statusComment: comment,
      });
      setSelectedStatus(pendingStatus);
      setIsDialogOpen(false);
      setPendingStatus(null);
      setStatusComment("");
      toast.success("Statut mis à jour");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error("Impossible de changer le statut", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Statut</Label>
      <Select
        value={selectedStatus}
        onValueChange={(value) => onValueChange(value as ProjectStatus)}
      >
        <SelectTrigger className="w-full rounded-full">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODO">À faire</SelectItem>
          <SelectItem value="IN_PROGRESS">En cours</SelectItem>
          <SelectItem value="BLOCKED">Bloqué</SelectItem>
          {canValidate ? <SelectItem value="DONE">Terminé</SelectItem> : null}
          {canValidate ? (
            <SelectItem value="REJECTED">Rejeté</SelectItem>
          ) : null}
        </SelectContent>
      </Select>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setPendingStatus(null);
            setStatusComment("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Commentaire requis</DialogTitle>
            <DialogDescription>
              Merci d'ajouter un commentaire pour justifier ce changement de
              statut.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status-change-comment">Commentaire</Label>
            <Textarea
              id="status-change-comment"
              value={statusComment}
              onChange={(event) => setStatusComment(event.target.value)}
              placeholder="Décrivez la raison du changement de statut..."
              rows={4}
              className="rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setPendingStatus(null);
                setStatusComment("");
              }}
              disabled={isSaving}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStatusChange}
              disabled={isSaving}
              className="rounded-xl"
            >
              {isSaving ? "Enregistrement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
