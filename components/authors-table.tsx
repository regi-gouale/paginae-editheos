"use client";

import { TablePagination } from "@/components/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAlerts } from "@/hooks/use-alerts";
import {
  addAuthor,
  Author,
  AuthorsResponse,
  deleteAuthor,
  getAuthors,
  getNationalities,
} from "@/lib/actions/authors";
import { Filter, Plus, Search, Trash2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface AuthorsTableProps {
  initialData: AuthorsResponse;
}

export function AuthorsTable({ initialData }: AuthorsTableProps) {
  const { showSuccess, showError, confirm } = useAlerts();
  const [data, setData] = useState<AuthorsResponse>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    biography: "",
    website: "",
    nationality: "",
    birthDate: "",
  });

  // Charger les nationalités disponibles
  useEffect(() => {
    const loadNationalities = async () => {
      const result = await getNationalities();
      setNationalities(result);
    };
    loadNationalities();
  }, []);

  const debouncedSearch = useDebouncedCallback(
    async (search: string, nationality: string, page: number = 1) => {
      setIsLoading(true);
      try {
        const result = await getAuthors({
          search,
          nationality: nationality === "ALL" ? undefined : nationality,
          page,
          limit: 10,
        });
        setData(result);
      } catch (error) {
        console.error("Error fetching authors:", error);
      } finally {
        setIsLoading(false);
      }
    },
    300
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value, selectedNationality);
  };

  const handleNationalityChange = (value: string) => {
    setSelectedNationality(value);
    debouncedSearch(searchTerm, value);
  };

  const handlePageChange = (page: number) => {
    debouncedSearch(searchTerm, selectedNationality, page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Capture la nationalité avant de réinitialiser le formulaire
    const submittedNationality = formData.nationality;

    try {
      const result = await addAuthor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        biography: formData.biography || undefined,
        website: formData.website || undefined,
        nationality: submittedNationality || undefined,
        birthDate: formData.birthDate
          ? new Date(formData.birthDate)
          : undefined,
      });

      if (result.success) {
        // Rafraîchir la liste
        const updatedData = await getAuthors({
          search: searchTerm,
          nationality:
            selectedNationality === "ALL" ? undefined : selectedNationality,
          page: data.currentPage,
          limit: 10,
        });
        setData(updatedData);

        // Mettre à jour les nationalités si une nouvelle a été ajoutée
        if (
          submittedNationality &&
          !nationalities.includes(submittedNationality)
        ) {
          setNationalities([...nationalities, submittedNationality]);
        }

        // Réinitialiser le formulaire
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          biography: "",
          website: "",
          nationality: "",
          birthDate: "",
        });
        setIsDialogOpen(false);

        showSuccess("Auteur ajouté avec succès");
      } else {
        showError("Erreur lors de l'ajout de l'auteur", result.error);
      }
    } catch (error) {
      console.error("Error adding author:", error);
      showError(
        "Erreur lors de l'ajout de l'auteur",
        "Une erreur inattendue s'est produite"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      "Êtes-vous sûr de vouloir supprimer cet auteur ?",
      {
        title: "Supprimer l'auteur",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteAuthor(id);
      if (result.success) {
        // Rafraîchir la liste
        const updatedData = await getAuthors({
          search: searchTerm,
          nationality:
            selectedNationality === "ALL" ? undefined : selectedNationality,
          page: data.currentPage,
          limit: 10,
        });
        setData(updatedData);
        showSuccess("Auteur supprimé avec succès");
      } else {
        showError("Erreur lors de la suppression", result.error);
      }
    } catch (error) {
      console.error("Error deleting author:", error);
      showError(
        "Erreur lors de la suppression",
        "Une erreur inattendue s'est produite"
      );
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Non renseignée";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Liste des auteurs</h2>
          <p className="text-muted-foreground">
            {data.total} {data.total <= 1 ? "auteur" : "auteurs"} au total
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold">
              <Plus className="h-4 w-4 mr-1" />
              Auteur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Ajouter un nouvel auteur
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de l&apos;auteur à ajouter.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    placeholder="ex: Française"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://www.exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biography">Biographie</Label>
                <Textarea
                  id="biography"
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({ ...formData, biography: e.target.value })
                  }
                  placeholder="Biographie de l'auteur..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Ajout..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contrôles de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            value={selectedNationality}
            onValueChange={handleNationalityChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par nationalité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes nationalités</SelectItem>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Informations sur les résultats */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Affichage de {data.authors.length} sur {data.total} auteurs
        </div>
        <div>
          Page {data.currentPage} sur {data.totalPages}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nationalité</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.authors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucun auteur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              data.authors.map((author: Author) => (
                <TableRow key={author.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>
                        {author.firstName} {author.lastName}
                      </div>
                      {author.website && (
                        <a
                          href={author.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Site web
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{author.email}</TableCell>
                  <TableCell>
                    {author.nationality ? (
                      <Badge variant="outline">{author.nationality}</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Non renseignée
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(author.birthDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(author.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        hasPrevPage={data.hasPrevPage}
        hasNextPage={data.hasNextPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
