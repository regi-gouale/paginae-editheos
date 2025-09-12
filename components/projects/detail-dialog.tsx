"use client";
import InputProjectTitle from "@/components/projects/input-project-title";
import { SelectProjectStatus } from "@/components/projects/select-project-status";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProjectStatus } from "@/prisma/generated/prisma";
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
        <InputProjectTitle
          title={editedProject.title}
          projectId={editedProject.id}
        />

        <div className="space-y-4 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectProjectStatus
              projectId={editedProject.id}
              status={editedProject.status}
              onStatusUpdated={handleStatusUpdate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
