"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Priority,
  ProjectStatus,
  ProjectType,
} from "@/prisma/generated/prisma";
import { Filter, Search, Share2, X } from "lucide-react";
import { toast } from "sonner";

export interface ProjectFilters {
  statuses: ProjectStatus[];
  types: ProjectType[];
  dueDays: number[];
  priorities: Priority[];
  search: string;
}

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onShareUrl?: () => void; // Optionnel : fonction pour partager l'URL
}

const STATUS_LABELS = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  BLOCKED: "Bloqué",
  DONE: "Terminé",
  REJECTED: "Rejeté",
} as const;

const TYPE_LABELS = {
  EDITION: "Édition",
  PRINTING: "Impression",
} as const;

const PRIORITY_LABELS = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
  URGENT: "Urgente",
} as const;

const DUE_DAYS_LABELS = {
  7: "Dans 7 jours",
  15: "Dans 15 jours",
  30: "Dans 30 jours",
} as const;

export function ProjectFilters({
  filters,
  onFiltersChange,
  onShareUrl,
}: ProjectFiltersProps) {
  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.dueDays.length > 0 ||
    filters.priorities.length > 0 ||
    filters.search.trim().length > 0;

  const clearAllFilters = () => {
    onFiltersChange({
      statuses: [],
      types: [],
      dueDays: [],
      priorities: [],
      search: "",
    });
  };

  const updateStatuses = (status: ProjectStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.statuses, status]
      : filters.statuses.filter((s) => s !== status);
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const updateTypes = (type: ProjectType, checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, type]
      : filters.types.filter((t) => t !== type);
    onFiltersChange({ ...filters, types: newTypes });
  };

  const updateDueDays = (days: number, checked: boolean) => {
    const newDueDays = checked
      ? [...filters.dueDays, days]
      : filters.dueDays.filter((d) => d !== days);
    onFiltersChange({ ...filters, dueDays: newDueDays });
  };

  const updatePriorities = (priority: Priority, checked: boolean) => {
    const newPriorities = checked
      ? [...filters.priorities, priority]
      : filters.priorities.filter((p) => p !== priority);
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const updateSearch = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const getFilterCount = () => {
    return (
      filters.statuses.length +
      filters.types.length +
      filters.dueDays.length +
      filters.priorities.length +
      (filters.search.trim().length > 0 ? 1 : 0)
    );
  };

  const handleShareUrl = () => {
    if (onShareUrl) {
      onShareUrl();
    } else {
      // Fallback : copier l'URL actuelle dans le presse-papiers
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast.success("URL copiée !", {
            description:
              "Le lien avec les filtres a été copié dans le presse-papiers",
          });
        })
        .catch(() => {
          toast.error("Erreur", {
            description: "Impossible de copier l'URL",
          });
        });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-center">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un projet..."
          value={filters.search}
          onChange={(e) => updateSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Statut
              {filters.statuses.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.statuses.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.statuses.includes(status as ProjectStatus)}
                onCheckedChange={(checked) =>
                  updateStatuses(status as ProjectStatus, checked)
                }
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Type
              {filters.types.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.types.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filtrer par type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filters.types.includes(type as ProjectType)}
                onCheckedChange={(checked) =>
                  updateTypes(type as ProjectType, checked)
                }
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Priorité
              {filters.priorities.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.priorities.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filtrer par priorité</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={filters.priorities.includes(priority as Priority)}
                onCheckedChange={(checked) =>
                  updatePriorities(priority as Priority, checked)
                }
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Due Date Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Échéance
              {filters.dueDays.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.dueDays.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filtrer par échéance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(DUE_DAYS_LABELS).map(([days, label]) => (
              <DropdownMenuCheckboxItem
                key={days}
                checked={filters.dueDays.includes(Number(days))}
                onCheckedChange={(checked) =>
                  updateDueDays(Number(days), checked)
                }
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Share URL */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareUrl}
            className="shrink-0"
          >
            <Share2 className="size-4 mr-2" />
            Partager
          </Button>
        )}

        {/* Clear all filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="shrink-0"
          >
            <X className="size-4 mr-2" />
            Effacer ({getFilterCount()})
          </Button>
        )}
      </div>
    </div>
  );
}
