import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/actions/kanban";

interface ProjectDescriptionDialogProps {
  projectId: string;
  description: string | null;
  isDetailView?: boolean;
  canEdit?: boolean;
}

export function ProjectDescriptionDialog({
  projectId,
  description,
  isDetailView = false,
  canEdit = true,
}: ProjectDescriptionDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedDescription(description || "");
  }, [description]);

  const onSave = async () => {
    const normalizedInitialDescription = (description || "").trim();
    const normalizedCurrentDescription = editedDescription.trim();

    if (normalizedCurrentDescription === normalizedInitialDescription) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      await updateProject(projectId, {
        description:
          normalizedCurrentDescription.length > 0
            ? normalizedCurrentDescription
            : undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const onClear = () => {
    setEditedDescription("");
  };

  const onCancel = () => {
    setIsEditing(false);
    setEditedDescription(description || "");
  };

  const normalizedInitialDescription = (description || "").trim();
  const normalizedCurrentDescription = editedDescription.trim();
  const hasDescription = normalizedCurrentDescription.length > 0;
  const hasChanged =
    normalizedCurrentDescription !== normalizedInitialDescription;

  return (
    <div className="flex flex-col gap-2">
      <Label className={isDetailView ? "sr-only" : "block"}>Description</Label>
      {isEditing ? (
        <div className="rounded-2xl border border-border/70 bg-card/60 p-3 sm:p-4 flex flex-col gap-3">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Ajouter une description..."
            rows={6}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onCancel();
              }

              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void onSave();
              }
            }}
            className="min-h-36 max-h-96 resize-y rounded-2xl leading-6"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {hasDescription
                ? `${normalizedCurrentDescription.length} caracteres`
                : "Description vide"}
            </p>
            <div className="flex items-center gap-2">
              {hasDescription ? (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  onClick={onClear}
                  className="rounded-full"
                  disabled={isSaving}
                >
                  Vider
                </Button>
              ) : null}
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={onCancel}
                className="rounded-full"
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                size={"sm"}
                onClick={onSave}
                className="rounded-full"
                disabled={isSaving || !hasChanged}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`group w-full max-h-96 overflow-y-auto rounded-2xl border border-border/70 bg-linear-to-b from-background to-muted/20 p-4 sm:p-5 text-left transition-colors ${
            canEdit
              ? "cursor-pointer hover:border-primary/35 hover:bg-muted/35"
              : "cursor-default"
          }`}
          onClick={() => {
            if (canEdit) {
              setIsEditing(true);
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
                {isDetailView ? "Description du projet" : "Description"}
              </p>
              <p
                className={`mt-2 whitespace-pre-wrap wrap-break-word ${
                  isDetailView ? "text-lg leading-8" : "text-sm leading-6"
                } ${hasDescription ? "text-foreground/90" : "text-muted-foreground italic"}`}
              >
                {hasDescription
                  ? editedDescription
                  : canEdit
                    ? "Cliquez pour ajouter une description claire et utile pour l'equipe."
                    : "Aucune description."}
              </p>
            </div>

            {canEdit ? (
              <span className="shrink-0 rounded-full border border-border/70 p-2 text-muted-foreground transition-colors group-hover:border-primary/35 group-hover:text-foreground">
                <IconEdit className="size-4" />
              </span>
            ) : null}
          </div>

          {canEdit ? (
            <p className="mt-3 text-xs text-muted-foreground/80">
              Cliquer pour modifier. Raccourci: Cmd/Ctrl + Entree pour
              enregistrer.
            </p>
          ) : null}
        </button>
      )}
    </div>
  );
}
