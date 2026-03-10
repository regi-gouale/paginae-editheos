"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProject } from "@/lib/actions/kanban";
import type { ProjectStatus } from "@/prisma/generated/prisma/client";
import { useEffect, useState } from "react";

interface ProjectStatusDropdownProps {
  projectId: string;
  status: ProjectStatus;
  // onStatusUpdated?: (newStatus: ProjectStatus) => void;
}

export function ProjectStatusDropdown({
  projectId,
  status,
}: // onStatusUpdated,
ProjectStatusDropdownProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(status);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  const onValueChange = async (value: ProjectStatus) => {
    setSelectedStatus(value);
    await updateProject(projectId, { status: value });
  };

  return (
    <div className="space-y-2">
      <Label>Statut</Label>
      <Select
        value={selectedStatus}
        onValueChange={(value) => onValueChange(value as ProjectStatus)}>
        <SelectTrigger className="w-full rounded-xl">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODO">À faire</SelectItem>
          <SelectItem value="IN_PROGRESS">En cours</SelectItem>
          <SelectItem value="BLOCKED">Bloqué</SelectItem>
          <SelectItem value="DONE">Terminé</SelectItem>
          <SelectItem value="REJECTED">Rejeté</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
