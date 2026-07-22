"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
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
import { useAlerts } from "@/hooks/use-alerts";
import { type Member, updateMember } from "@/lib/actions/members";

type MemberRole = "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST";

interface EditMemberDialogProps {
  member: Member;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  member,
  children,
  onSuccess,
}) => {
  const { showSuccess, showError } = useAlerts();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    role: member.role as MemberRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateMember(member.id, formData);
      if (result.success) {
        setIsOpen(false);
        showSuccess("Membre modifié avec succès");
        if (onSuccess) {
          onSuccess();
        }
        // Rafraîchir la page pour voir les changements
        router.refresh();
      } else {
        showError("Erreur lors de la modification du membre", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      showError(
        "Erreur lors de la modification du membre",
        "Une erreur inattendue s'est produite",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Réinitialiser les données du formulaire quand on ouvre le dialog
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role as MemberRole,
      });
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className="rounded-full">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Modifier le membre</DialogTitle>
          <DialogDescription>
            Modifiez les informations du membre de l&apos;équipe.
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
              onClick={() => setIsOpen(false)}
              className="rounded-full"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
