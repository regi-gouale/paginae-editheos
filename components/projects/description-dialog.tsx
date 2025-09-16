import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/actions/kanban";
import { useEffect, useState } from "react";

interface ProjectDescriptionDialogProps {
  projectId: string;
  description: string | null;
}

export function ProjectDescriptionDialog({
  projectId,
  description,
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
      <Label>Description</Label>
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
          />
          <div className="flex gap-2">
            <Button size={"sm"} onClick={onSave}>
              Enregistrer
            </Button>
            <Button size={"sm"} variant={"outline"} onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="min-h-[60px] p-3 border rounded-xl cursor-pointer hover:bg-muted/50 text-sm"
            onClick={() => setIsEditing(true)}
          >
            {editedDescription || (
              <span className="text-muted-foreground italic">
                Cliquez pour ajouter une description ...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
