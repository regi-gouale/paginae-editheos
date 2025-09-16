"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjectById, updateProject } from "@/lib/actions/kanban";
import { Edit3Icon, Link2Icon } from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectTitleEditorProps {
  projectId: string;
  title: string;
  isDetailView?: boolean;
}

export default function ProjectTitleEditor({
  title,
  projectId,
  isDetailView = false,
}: ProjectTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  const getProjectSlug = async () => {
    const project = await getProjectById(projectId);
    if (project && project.slug) {
      setSlug(project.slug);
    } else {
      const newSlug = `${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      setSlug(newSlug);
      await updateProject(projectId, { slug: newSlug });
    }
  };

  useEffect(() => {
    setEditedTitle(title);
    getProjectSlug();
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
