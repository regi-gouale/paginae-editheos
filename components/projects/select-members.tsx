"use client";

import { IconPlus, IconUsers } from "@tabler/icons-react";
import { useEffect, useEffectEvent, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useAlerts } from "@/hooks/use-alerts";
import { updateProject } from "@/lib/actions/kanban";
import { getMembers } from "@/lib/actions/members";
import type { Member } from "@/prisma/generated/prisma/client";

type ProjectMembersSelectorProps = {
  projectId: string;
  selectedMembers?: Member[];
  onMembersUpdated?: (members: Member[]) => void;
};

export function ProjectMembersSelector({
  projectId,
  selectedMembers = [],
  onMembersUpdated,
}: ProjectMembersSelectorProps) {
  const { showError, showSuccess } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    selectedMembers.map((member) => member.id),
  );
  const handleLoadError = useEffectEvent(() => {
    showError(
      "Erreur lors du chargement des collaborateurs",
      "Impossible de récupérer la liste de l'équipe.",
    );
  });

  useEffect(() => {
    setSelectedMemberIds(selectedMembers.map((member) => member.id));
  }, [selectedMembers]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const response = await getMembers({ limit: 100 });

        if (isCancelled) {
          return;
        }

        setMembers(response.members as Member[]);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Erreur lors du chargement des collaborateurs:", error);
        handleLoadError();
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMembers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updatedProject = await updateProject(projectId, {
        memberIds: selectedMemberIds,
      });

      onMembersUpdated?.(updatedProject.members);
      setIsOpen(false);
      showSuccess("Collaborateurs mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des collaborateurs:", error);
      showError(
        "Erreur lors de la mise à jour des collaborateurs",
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setSelectedMemberIds(selectedMembers.map((member) => member.id));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <IconPlus className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Gérer les collaborateurs du projet</DialogTitle>
          <DialogDescription>
            Sélectionnez un ou plusieurs membres de l'équipe à associer à ce
            projet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Collaborateurs assignés</Label>
            <p className="text-sm text-muted-foreground">
              {selectedMemberIds.length} collaborateur
              {selectedMemberIds.length > 1 ? "s" : ""} sélectionné
              {selectedMemberIds.length > 1 ? "s" : ""}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Chargement des collaborateurs...
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun collaborateur disponible.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-xl border">
              <div className="flex flex-col gap-1 p-2">
                {members.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);

                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(member.id)}
                        className="mt-1"
                      />
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="rounded-full bg-muted p-2 text-muted-foreground">
                          <IconUsers className="size-4" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {member.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
