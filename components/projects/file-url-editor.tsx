"use client";

import { Edit3Icon, ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { updateProject } from "@/lib/actions/kanban";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type FileUrlEditorProps = {
  projectId: string;
  fileUrl: string | null;
  // isDetailView?: boolean;
};

export function ProjectFileUrlEditor({
  projectId,
  fileUrl,
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
            <ExternalLinkIcon className="size-3" />
            {editedFileUrl && editedFileUrl.trim() !== "" ? (
              <a
                href={editedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Ouvrir le fichier
              </a>
            ) : (
              <span className="italic">Aucun fichier lié</span>
            )}
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant={"ghost"}
            className="rounded-full p-0"
          >
            <Edit3Icon className="size-3 p-0" />
          </Button>
        </div>
      )}
      {isEditing && (
        <div className="flex flex-col w-full space-y-2">
          <Input
            type="text"
            value={editedFileUrl || ""}
            onChange={(e) => setEditedFileUrl(e.target.value)}
            placeholder="Coller le lien du fichier..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2">
            <Button size={"sm"} onClick={onSave} className="rounded-xl">
              Enregistrer
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={onCancel}
              className="rounded-xl"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
