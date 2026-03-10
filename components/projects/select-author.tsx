"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthors } from "@/lib/actions/authors";
import { updateProject } from "@/lib/actions/kanban";
import { Author } from "@/prisma/generated/prisma/client";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthorSelectionDropdownProps {
  projectId: string;
  selectedAuthors?: Author[];
  // onAuthorChange?: (author: Author) => void;
  autoLoad?: boolean;
}

export function AuthorSelectionDropdown({
  projectId,
  selectedAuthors = [],
  // onAuthorChange,
  autoLoad = true,
}: AuthorSelectionDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(
    selectedAuthors[0] || null
  );

  useEffect(() => {
    setSelectedAuthor(selectedAuthors[0] || null);
  }, [selectedAuthors]);

  useEffect(() => {
    const loadAuthors = async () => {
      setIsLoading(true);
      try {
        const response = await getAuthors({ limit: 100 }); // Charger tous les auteurs
        // Transformer les auteurs en ajoutant les champs manquants avec des valeurs par défaut
        const transformedAuthors: Author[] = response.authors.map((author) => ({
          ...author,
          biography: author.biography ?? null,
          website: author.website ?? null,
          nationality: author.nationality ?? null,
          birthDate: author.birthDate ?? null,
          createdAt: author.createdAt || new Date(),
          updatedAt: author.updatedAt || new Date(),
        }));
        setAuthors(transformedAuthors);
      } catch (error) {
        console.error("Erreur lors du chargement des auteurs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (autoLoad) {
      loadAuthors();
    }
  }, [autoLoad]);

  const handleAuthorChange = async (authorId: string) => {
    const author = authors.find((a) => a.id === authorId);
    if (!author) return;

    try {
      // Mettre à jour la base de données
      await updateProject(projectId, {
        authorIds: [authorId],
      });

      // Mettre à jour l'état local
      setSelectedAuthor(author);

      // Appeler le callback si fourni
      // if (onAuthorChange) {
      //   onAuthorChange(author);
      // }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'auteur:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Auteur</Label>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">
          Chargement des auteurs...
        </div>
      ) : (
        <Select
          value={selectedAuthor?.id || ""}
          onValueChange={handleAuthorChange}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Sélectionner un auteur">
              {selectedAuthor && (
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  {`${selectedAuthor.firstName} ${selectedAuthor.lastName}`}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {authors.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  {`${author.firstName} ${author.lastName}`}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
