"use client";

import { IconEdit, IconExternalLink } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { updateProject } from "@/lib/actions/kanban";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type FileUrlEditorProps = {
  projectId: string;
  fileUrl: string | null;
  canEdit?: boolean;
  // isDetailView?: boolean;
};

export function ProjectFileUrlEditor({
  projectId,
  fileUrl,
  canEdit = true,
}: // isDetailView = false,
FileUrlEditorProps) {
  const [editedFileUrl, setEditedFileUrl] = useState<string | null>(fileUrl);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedFileUrl(fileUrl);
  }, [fileUrl]);

  const onSave = async () => {
    if (!editedFileUrl) return;

    if (editedFileUrl.trim()) {
      await updateProject(projectId, {
        fileUrl: editedFileUrl.trim(),
      });
      setIsEditing(false);
    }
  };
  const onCancel = () => {
    setIsEditing(false);
    setEditedFileUrl(fileUrl);
  };
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      {!isEditing && (
        <div className="flex items-center space-x-1 justify-between w-full">
          <div className="flex items-center space-x-1">
            <IconExternalLink className="size-3" />
            {editedFileUrl && editedFileUrl.trim() !== "" ? (
              <Link
                href={editedFileUrl as Route}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Ouvrir le fichier
              </Link>
            ) : (
              <span className="italic">Aucun fichier lié</span>
            )}
          </div>
          {canEdit ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant={"ghost"}
              className="rounded-full p-0"
            >
              <IconEdit className="size-3 p-0" />
            </Button>
          ) : null}
        </div>
      )}
      {isEditing && (
        <div className="flex flex-col w-full space-y-2">
          <Input
            type="text"
            value={editedFileUrl || ""}
            onChange={(e) => setEditedFileUrl(e.target.value)}
            placeholder="Coller le lien du fichier..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2">
            <Button size={"sm"} onClick={onSave} className="rounded-full">
              Enregistrer
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={onCancel}
              className="rounded-full"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
