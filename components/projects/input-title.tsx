"use client";

import { Edit3Icon, Link2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ensureProjectSlug, updateProject } from "@/lib/actions/kanban";

interface ProjectTitleEditorProps {
  projectId: string;
  title: string;
  slug?: string; // Passé depuis le parent au lieu d'être récupéré côté client
  isDetailView?: boolean;
}

export default function ProjectTitleEditor({
  title,
  projectId,
  slug: initialSlug,
  isDetailView = false,
}: ProjectTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>(initialSlug || "");

  useEffect(() => {
    setEditedTitle(title);

    // Si aucun slug n'est fourni, demander au serveur de s'assurer qu'il en existe un
    if (!initialSlug) {
      ensureProjectSlug(projectId)
        .then((generatedSlug) => {
          setSlug(generatedSlug);
        })
        .catch((error) => {
          console.error("Failed to ensure project slug:", error);
        });
    } else {
      setSlug(initialSlug);
    }
  }, [title, projectId, initialSlug]);

  const onSave = async () => {
    if (editedTitle.trim()) {
      await updateProject(projectId, {
        title: editedTitle,
      });
      setIsEditing(false);
    }
  };

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="flex-1 rounded-xl w-96 text-xl"
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
        <div className="flex items-center gap-4 flex-1 w-full ">
          <div
            className={`flex items-center justify-between gap-4 flex-1 w-full`}
          >
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1">
                <Button
                  variant={`${!isDetailView ? "secondary" : "ghost"}`}
                  size={"icon"}
                  onClick={() => setIsEditing(true)}
                  className="rounded-full cursor-pointer"
                >
                  <Edit3Icon className="size-4" />
                </Button>
              </div>
              <span
                className={`flex-1 ${
                  isDetailView ? "text-3xl" : "text-base"
                } text-center items-center font-bold`}
                style={{
                  fontFamily: "var(--font-montserrat)",
                }}
              >
                {editedTitle}
              </span>
            </div>

            {!isDetailView && (
              <a
                href={`/dashboard/projects/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir le projet dans une nouvelle fenêtre"
                title="Ouvrir le projet dans une nouvelle fenêtre"
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer p-2"
              >
                <Link2Icon className="size-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
