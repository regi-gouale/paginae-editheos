"use client";
import { ProjectCustomFieldsEditor } from "@/components/projects/custom-fields-editor";
import { ProjectDescriptionDialog } from "@/components/projects/description-dialog";
import ProjectTitleEditor from "@/components/projects/input-title";
import { DeadlineSelectorPopover } from "@/components/projects/popover-due-date";
import { AuthorSelectionDropdown } from "@/components/projects/select-author";
import { ProjectStatusDropdown } from "@/components/projects/select-project-status";
import { ProjectTasksEditor } from "@/components/projects/tasks-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAlerts } from "@/hooks/use-alerts";
import { deleteProject } from "@/lib/actions/kanban";
import { getPriorityLabel } from "@/lib/utils";
import { ProjectWithDetails } from "@/types/kanban";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectDetailDialogProps {
  project: ProjectWithDetails | null;
  open: boolean;
  isAdmin: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailDialog({
  project,
  open,
  isAdmin,
  onOpenChange,
}: ProjectDetailDialogProps) {
  const { confirm, showError, showSuccess } = useAlerts();
  const router = useRouter();
  const [editedProject, setEditedProject] = useState<ProjectWithDetails | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
    }
  }, [project]);

  const handleDeleteProject = async () => {
    if (!editedProject) {
      return;
    }

    const confirmed = await confirm(
      `Êtes-vous sûr de vouloir supprimer le projet \"${editedProject.title}\" ? Cette action est irréversible.`,
      {
        title: "Supprimer le projet",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      },
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteProject(editedProject.id);

      if (result.success) {
        showSuccess("Projet supprimé avec succès");
        onOpenChange(false);
        router.refresh();
      } else {
        showError("Erreur lors de la suppression", result.error);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showError(
        "Erreur lors de la suppression",
        "Une erreur inattendue s'est produite",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project || !editedProject) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="flex items-center gap-2">
              <ProjectTitleEditor
                title={editedProject.title}
                projectId={editedProject.id}
                slug={editedProject.slug || undefined}
              />
            </DialogTitle>

            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="rounded-xl">
                <Trash2 className="size-4" />
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProjectStatusDropdown
              projectId={editedProject.id}
              status={editedProject.status}
              // onStatusUpdated={handleStatusUpdate}
            />
            <AuthorSelectionDropdown
              projectId={editedProject.id}
              selectedAuthors={editedProject.authors}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeadlineSelectorPopover
              projectId={editedProject.id}
              dueDate={editedProject.dueDate}
            />
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Input
                className="border mx-auto p-2 rounded-xl"
                value={getPriorityLabel(editedProject.priority)}
                disabled
              />
            </div>
          </div>
          <div className="space-y-2">
            <ProjectDescriptionDialog
              projectId={editedProject.id}
              description={editedProject.description}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <ProjectTasksEditor
              projectId={editedProject.id}
              tasks={editedProject.tasks}
            />
          </div>

          <Separator />
          <div className="space-y-4">
            <ProjectCustomFieldsEditor
              projectId={editedProject.id}
              customFields={editedProject.customFields}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
