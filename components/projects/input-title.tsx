"use client";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateProject } from "@/lib/actions/kanban";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectTitleEditorProps {
  projectId: string;
  title: string;
}

export default function ProjectTitleEditor({
  title,
  projectId,
}: ProjectTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState<string>("");

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const onSave = async () => {
    if (editedTitle.trim()) {
      await updateProject(projectId, {
        title: editedTitle,
      });
      setIsEditing(false);
    }
  };

  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1"
              onBlur={onSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSave();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditedTitle(title); // Revert changes
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="flex-1 text-xl">{editedTitle}</span>
            <Button
              variant={"ghost"}
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="size-4" />
            </Button>
          </div>
        )}
      </DialogTitle>
    </DialogHeader>
  );
}
