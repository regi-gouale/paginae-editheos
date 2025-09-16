"use client";
import { ProjectCustomFieldsEditor } from "@/components/projects/custom-fields-editor";
import { ProjectDescriptionDialog } from "@/components/projects/description-dialog";
import ProjectTitleEditor from "@/components/projects/input-title";
import { DeadlineSelectorPopover } from "@/components/projects/popover-due-date";
import { AuthorSelectionDropdown } from "@/components/projects/select-author";
import { ProjectStatusDropdown } from "@/components/projects/select-project-status";
import { ProjectTasksEditor } from "@/components/projects/tasks-editor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getPriorityLabel } from "@/lib/utils";
import { Author, ProjectStatus } from "@/prisma/generated/prisma";
import { ProjectWithDetails } from "@/types/kanban";
import { useEffect, useState } from "react";

interface ProjectDetailDialogProps {
  project: ProjectWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated?: (project: ProjectWithDetails) => void;
}

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdated,
}: ProjectDetailDialogProps) {
  const [editedProject, setEditedProject] = useState<ProjectWithDetails | null>(
    null
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleStatusUpdate = (newStatus: ProjectStatus) => {
    if (editedProject && onProjectUpdated) {
      const updatedProject = { ...editedProject, status: newStatus };
      setEditedProject(updatedProject);
      onProjectUpdated(updatedProject);
    }
  };

  const handleAuthorUpdate = (author: Author) => {
    if (editedProject && onProjectUpdated) {
      const updatedProject = { ...editedProject, authors: [author] };
      setEditedProject(updatedProject);
      onProjectUpdated(updatedProject);
    }
  };

  const handleDueDateUpdate = (date: Date | null) => {
    if (editedProject && onProjectUpdated) {
      const updatedProject = { ...editedProject, dueDate: date };
      setEditedProject(updatedProject);
      onProjectUpdated(updatedProject);
    }
  };

  useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
    }
  }, [project]);

  if (!project || !editedProject) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ProjectTitleEditor
          title={editedProject.title}
          projectId={editedProject.id}
        />

        <div className="space-y-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProjectStatusDropdown
              projectId={editedProject.id}
              status={editedProject.status}
              onStatusUpdated={handleStatusUpdate}
            />
            <AuthorSelectionDropdown
              projectId={editedProject.id}
              selectedAuthors={editedProject.authors}
              onAuthorChange={handleAuthorUpdate}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeadlineSelectorPopover
              projectId={editedProject.id}
              dueDate={editedProject.dueDate}
              onDueDateChange={handleDueDateUpdate}
            />
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Input
                className="border mx-auto p-2"
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
