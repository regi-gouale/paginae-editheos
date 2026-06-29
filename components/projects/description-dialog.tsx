import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/actions/kanban";

interface ProjectDescriptionDialogProps {
  projectId: string;
  description: string | null;
  isDetailView?: boolean;
}

export function ProjectDescriptionDialog({
  projectId,
  description,
  isDetailView = false,
}: ProjectDescriptionDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  useEffect(() => {
    setEditedDescription(description);
  }, [description]);

  const onSave = async () => {
    if (!editedDescription) return;

    if (editedDescription.trim()) {
      await updateProject(projectId, {
        description: editedDescription,
      });
      setIsEditing(false);
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    setEditedDescription(description);
  };

  return (
    <div className="space-y-2">
      <Label className={`${isDetailView ? "hidden" : "block"}`}>
        Description
      </Label>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedDescription || ""}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Ajouter une description..."
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onCancel();
              }
            }}
            className="rounded-xl max-h-96 overflow-y-auto"
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
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            className={`${
              isDetailView
                ? "text-muted-foreground text-lg mx-auto p-4 rounded-xl"
                : "min-h-15 p-3 border rounded-xl hover:bg-muted/50 text-sm"
            } w-full text-left cursor-pointer hover:bg-muted/50 max-h-96 overflow-y-auto`}
            onClick={() => setIsEditing(true)}
          >
            {editedDescription || (
              <span className="text-muted-foreground italic">
                Cliquez pour ajouter une description ...
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
