"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProjectWithDetails } from "@/types/kanban";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import InputProjectTitle from "./input-project-title";

interface ProjectDetailDialogProps {
  project: ProjectWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailDialogProps) {
  const [openDetail, setOpenDetail] = useQueryState("openDetail");

  const [editedProject, setEditedProject] = useState<ProjectWithDetails | null>(
    null
  );

  const handleClose = () => {
    setOpenDetail(null);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setOpenDetail("true");
    }
  }, [open, setOpenDetail]);

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
      </DialogContent>
    </Dialog>
  );
}
