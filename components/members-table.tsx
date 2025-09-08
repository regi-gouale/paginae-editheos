"use client";

import {
  addMember,
  deleteMember,
  getMembers,
  Member,
  MembersResponse,
} from "@/app/actions/members";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { Filter, Plus, Search, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type MemberRole = "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST";

interface MembersTableProps {
  initialData: MembersResponse;
}

const roleLabels = {
  ADMIN: "Administrateur",
  DESIGNER: "Designer",
  REVIEWER: "Relecteur",
  CONTRIBUTOR: "Contributeur",
  GUEST: "Invité",
};

const roleColors = {
  ADMIN: "bg-red-100 text-red-800",
  DESIGNER: "bg-blue-100 text-blue-800",
  REVIEWER: "bg-green-100 text-green-800",
  CONTRIBUTOR: "bg-yellow-100 text-yellow-800",
  GUEST: "bg-gray-100 text-gray-800",
};

export function MembersTable({ initialData }: MembersTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<MembersResponse>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as MemberRole,
  });

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    async (search: string, role: string, page: number) => {
      const result = await getMembers({
        search,
        role: role as MemberRole | "ALL",
        page,
        limit: 10,
      });
      setData(result);
    },
    500
  );

  // Effect to handle search and filter changes
  useEffect(() => {
    debouncedSearch(searchTerm, selectedRole, currentPage);
  }, [searchTerm, selectedRole, currentPage, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await addMember(formData);
      if (result.success) {
        setIsDialogOpen(false);
        setFormData({ name: "", email: "", role: "" as MemberRole });
        // Refresh the data
        const refreshedData = await getMembers({
          search: searchTerm,
          role: selectedRole as MemberRole | "ALL",
          page: currentPage,
          limit: 10,
        });
        setData(refreshedData);
      } else {
        alert(result.error || "Erreur lors de l'ajout du membre");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de l'ajout du membre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      return;
    }

    try {
      const result = await deleteMember(id);
      if (result.success) {
        // Refresh the data
        const refreshedData = await getMembers({
          search: searchTerm,
          role: selectedRole as MemberRole | "ALL",
          page: currentPage,
          limit: 10,
        });
        setData(refreshedData);
      } else {
        alert(result.error || "Erreur lors de la suppression du membre");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de la suppression du membre");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when search changes
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Membres de l&apos;équipe</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              {"Membre"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau membre</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau membre à votre équipe en remplissant les
                informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nom du membre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: MemberRole) =>
                    setFormData({ ...formData, role: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                    <SelectItem value="DESIGNER">Designer</SelectItem>
                    <SelectItem value="REVIEWER">Relecteur</SelectItem>
                    <SelectItem value="CONTRIBUTOR">Contributeur</SelectItem>
                    <SelectItem value="GUEST">Invité</SelectItem>
                  </SelectContent>
                </Select>
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
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les rôles</SelectItem>
              <SelectItem value="ADMIN">Administrateur</SelectItem>
              <SelectItem value="DESIGNER">Designer</SelectItem>
              <SelectItem value="REVIEWER">Relecteur</SelectItem>
              <SelectItem value="CONTRIBUTOR">Contributeur</SelectItem>
              <SelectItem value="GUEST">Invité</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Informations sur les résultats */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Affichage de {data.members.length} sur {data.total} membres
        </div>
        <div>
          Page {data.currentPage} sur {data.totalPages}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ml-2">Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucun membre dans l&apos;équipe pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              data.members.map((member: Member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium ml-2">
                    {member.name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
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

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {data.hasPrevPage && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(data.currentPage - 1);
                    }}
                  />
                </PaginationItem>
              )}

              {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  const current = data.currentPage;
                  return (
                    page === 1 ||
                    page === data.totalPages ||
                    (page >= current - 1 && page <= current + 1)
                  );
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === data.currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === data.currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

              {data.hasNextPage && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(data.currentPage + 1);
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
