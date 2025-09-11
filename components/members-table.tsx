"use client";

import { AddMemberDialog } from "@/components/add-member-dialog";
import { TablePagination } from "@/components/table-pagination";
import { TableSearchFilter } from "@/components/table-search-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAlerts } from "@/hooks/use-alerts";
import {
  addMember,
  deleteMember,
  getMembers,
  Member,
  MembersResponse,
} from "@/lib/actions/members";
import { Trash2 } from "lucide-react";
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
  const { showSuccess, showError, confirm } = useAlerts();
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
        // window.location.reload();
        setData(refreshedData);
        showSuccess("Membre ajouté avec succès");
      } else {
        showError("Erreur lors de l'ajout du membre", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      showError(
        "Erreur lors de l'ajout du membre",
        "Une erreur inattendue s'est produite"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      "Êtes-vous sûr de vouloir supprimer ce membre ?",
      {
        title: "Supprimer le membre",
        confirmText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (!confirmed) {
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
        showSuccess("Membre supprimé avec succès");
      } else {
        showError("Erreur lors de la suppression du membre", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      showError(
        "Erreur lors de la suppression du membre",
        "Une erreur inattendue s'est produite"
      );
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
        <AddMemberDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
        />
      </div>

      <TableSearchFilter
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
      />

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
