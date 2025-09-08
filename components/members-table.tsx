"use client";

import { Member, addMember, deleteMember } from "@/app/actions/members";
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
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MembersTableProps {
  members: Member[];
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

export function MembersTable({ members }: MembersTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await addMember(formData);
      if (result.success) {
        setIsDialogOpen(false);
        setFormData({ name: "", email: "", role: "" as any });
        router.refresh();
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
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la suppression du membre");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de la suppression du membre");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Membres de l'équipe</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un membre
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
                  onValueChange={(value: any) =>
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
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucun membre dans l'équipe pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
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
    </div>
  );
}
