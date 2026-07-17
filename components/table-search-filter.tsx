import { IconFilter, IconSearch } from "@tabler/icons-react";
import type React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

export const TableSearchFilter: React.FC<TableSearchFilterProps> = ({
  searchValue,
  onSearchChange,
  selectedRole,
  onRoleChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex-1">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <IconFilter className="size-4 text-gray-400" />
        <Select value={selectedRole} onValueChange={onRoleChange}>
          <SelectTrigger className="w-45">
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
  );
};
