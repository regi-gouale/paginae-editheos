"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCustomField,
  deleteCustomField,
  updateCustomField,
} from "@/lib/actions/kanban";
import type { CustomField } from "@/prisma/generated/prisma/client";

// Composant réutilisable pour le bouton d'ajout de champs personnalisés
type AddCustomFieldButtonProps = {
  onAddClick: () => void;
  isDetailView?: boolean;
};

function AddCustomFieldButton({
  onAddClick,
  isDetailView = false,
}: AddCustomFieldButtonProps) {
  if (isDetailView) {
    return (
      <div className="flex items-center justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddClick}
          className="rounded-xl"
        >
          <IconPlus className="size-4 mr-1" />
          Ajouter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-2">
      <Label className="text-base font-semibold">Champs personnalisés</Label>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddClick}
        className="rounded-xl"
      >
        <IconPlus className="size-4 mr-1" />
        Ajouter
      </Button>
    </div>
  );
}

// Composant réutilisable pour le formulaire d'ajout de champs personnalisés
type CustomFieldAdderProps = {
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldValue: string;
  setNewFieldValue: (value: string) => void;
  onAddField: () => void;
  onCancel: () => void;
};

function CustomFieldAdder({
  newFieldName,
  setNewFieldName,
  newFieldValue,
  setNewFieldValue,
  onAddField,
  onCancel,
}: CustomFieldAdderProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onAddField();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="space-y-2 p-3 border rounded-xl mb-4">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Input
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          placeholder="Nouveau champ"
          autoFocus
          onKeyDown={handleKeyDown}
          className="rounded-xl"
        />
        <Input
          value={newFieldValue}
          onChange={(e) => setNewFieldValue(e.target.value)}
          placeholder="Nouvelle valeur"
          onKeyDown={handleKeyDown}
          className="rounded-xl flex-1"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" onClick={onAddField} className="rounded-xl">
          Ajouter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}

interface ProjectCustomFieldsEditorProps {
  projectId: string;
  customFields?: CustomField[];
  isDetailView?: boolean;
}

export function ProjectCustomFieldsEditor({
  projectId,
  customFields,
  isDetailView = false,
}: ProjectCustomFieldsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [editedFields, setEditedFields] = useState<CustomField[]>(
    customFields || [],
  );

  useEffect(() => {
    setEditedFields(customFields || []);
  }, [customFields]);

  const onAddField = async () => {
    if (!newFieldName.trim()) return;

    const createdField = await createCustomField({
      name: newFieldName,
      projectId,
      value: newFieldValue,
    });

    if (!createdField) return;

    setEditedFields((prev) => [...prev, createdField]);

    // Réinitialiser les états après ajout
    setNewFieldName("");
    setNewFieldValue("");
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewFieldName("");
    setNewFieldValue("");
  };

  const updateFieldValue = async (fieldId: string, newValue: string) => {
    try {
      const updatedField = await updateCustomField(fieldId, {
        value: newValue,
      });
      if (!updatedField) {
        throw new Error("Échec de la mise à jour du champ");
      }

      // Mise à jour de l'état local après succès
      setEditedFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, value: newValue } : f)),
      );

      // Arrêter l'édition après succès
      setEditingFieldId(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du champ:", error);
      // En cas d'erreur, restaurer la valeur précédente
      setEditedFields((prev) =>
        prev.map((f) =>
          f.id === fieldId
            ? customFields?.find((cf) => cf.id === fieldId) || f
            : f,
        ),
      );
      setEditingFieldId(null);
    }
  };

  const handleFieldValueChange = (fieldId: string, newValue: string) => {
    // Mise à jour immédiate de l'état local pour l'affichage
    setEditedFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, value: newValue } : f)),
    );
  };

  const onDeleteField = async (fieldId: string) => {
    // Mise à jour optimiste de l'état local d'abord
    const originalFields = editedFields;
    setEditedFields((prev) => prev.filter((t) => t.id !== fieldId));

    try {
      // Puis suppression en base de données
      await deleteCustomField(fieldId);
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setEditedFields(originalFields);
      console.error("Erreur lors de la suppression du champ:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bouton d'ajout conditionnel */}
      {!isAdding && (
        <AddCustomFieldButton
          onAddClick={() => setIsAdding(true)}
          isDetailView={isDetailView}
        />
      )}

      {/* Formulaire d'ajout de champ personnalisé */}
      {isAdding && (
        <CustomFieldAdder
          newFieldName={newFieldName}
          setNewFieldName={setNewFieldName}
          newFieldValue={newFieldValue}
          setNewFieldValue={setNewFieldValue}
          onAddField={onAddField}
          onCancel={handleCancelAdd}
        />
      )}

      {/* Liste des champs personnalisés */}
      <div className="mt-4 space-y-2">
        {editedFields?.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-2 px-2 border rounded-xl group"
          >
            <div className="flex-1 space-y-1 flex flex-row items-center justify-baseline gap-x-4">
              <div className="font-medium text-sm">{field.name}</div>
              <span>:</span>
              {editingFieldId === field.id ? (
                <Input
                  value={field.value}
                  className="bg-gray-100 dark:bg-gray-800 h-8"
                  autoFocus
                  onChange={(e) =>
                    handleFieldValueChange(field.id, e.target.value)
                  }
                  onBlur={() => updateFieldValue(field.id, field.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateFieldValue(field.id, field.value);
                    } else if (e.key === "Escape") {
                      setEditingFieldId(null);
                      // Restaurer la valeur précédente
                      setEditedFields((prev) =>
                        prev.map((f) =>
                          f.id === field.id
                            ? customFields?.find((cf) => cf.id === field.id) ||
                              f
                            : f,
                        ),
                      );
                    }
                  }}
                />
              ) : (
                <Badge
                  variant={"outline"}
                  className="px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  onClick={() => setEditingFieldId(field.id)}
                >
                  {field.value}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="invisible group-hover:visible"
              onClick={() => onDeleteField(field.id)}
            >
              <IconTrash className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
