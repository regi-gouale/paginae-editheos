"use client";

import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import type { ProjectFilters } from "@/components/projects/project-filters";
import type {
  Priority,
  ProjectStatus,
  ProjectType,
} from "@/prisma/generated/prisma/client";

// Définir les parsers pour chaque type de filtre
const statusParser = parseAsArrayOf(
  parseAsStringEnum<ProjectStatus>(
    Object.values({
      TODO: "TODO",
      IN_PROGRESS: "IN_PROGRESS",
      BLOCKED: "BLOCKED",
      DONE: "DONE",
      REJECTED: "REJECTED",
    } as const),
  ),
).withDefault([]);

const typeParser = parseAsArrayOf(
  parseAsStringEnum<ProjectType>(
    Object.values({
      EDITION: "EDITION",
      PRINTING: "PRINTING",
    } as const),
  ),
).withDefault([]);

const priorityParser = parseAsArrayOf(
  parseAsStringEnum<Priority>(
    Object.values({
      LOW: "LOW",
      MEDIUM: "MEDIUM",
      HIGH: "HIGH",
      URGENT: "URGENT",
    } as const),
  ),
).withDefault([]);

const dueDaysParser = parseAsArrayOf(
  parseAsStringEnum(["7", "15", "30"]),
).withDefault([]);

const searchParser = parseAsString.withDefault("");

// Schéma complet des filtres pour nuqs
const filtersSchema = {
  statuses: statusParser,
  types: typeParser,
  priorities: priorityParser,
  dueDays: dueDaysParser,
  search: searchParser,
};

// Hook personnalisé pour gérer les filtres avec nuqs
export function useProjectFilters() {
  const [filtersState, setFiltersState] = useQueryStates(filtersSchema, {
    // Historique de navigation : remplacer au lieu d'ajouter une entrée
    history: "replace",
    // Effacer les paramètres vides de l'URL
    clearOnDefault: true,
  });

  // Convertir les dueDays string en number pour l'interface ProjectFilters
  const filters: ProjectFilters = {
    ...filtersState,
    dueDays: filtersState.dueDays.map(Number),
    search: filtersState.search,
  };

  // Fonction pour mettre à jour tous les filtres
  const updateFilters = (newFilters: ProjectFilters) => {
    setFiltersState({
      statuses: newFilters.statuses,
      types: newFilters.types,
      priorities: newFilters.priorities,
      dueDays: newFilters.dueDays.map(String),
      search: newFilters.search,
    });
  };

  // Fonction pour effacer tous les filtres
  const clearFilters = () => {
    setFiltersState({
      statuses: [],
      types: [],
      priorities: [],
      dueDays: [],
      search: "",
    });
  };

  // Fonction pour obtenir l'URL avec les filtres actuels (utile pour partage)
  const getFilteredUrl = () => {
    const serialize = createSerializer(filtersSchema);
    const searchParams = serialize(filtersState);
    return `${window.location.pathname}?${searchParams}`;
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    getFilteredUrl,
    // Fonctions individuelles pour chaque filtre si nécessaire
    setStatuses: (statuses: ProjectStatus[]) => setFiltersState({ statuses }),
    setTypes: (types: ProjectType[]) => setFiltersState({ types }),
    setPriorities: (priorities: Priority[]) => setFiltersState({ priorities }),
    setDueDays: (dueDays: number[]) =>
      setFiltersState({ dueDays: dueDays.map(String) }),
    setSearch: (search: string) => setFiltersState({ search }),
  };
}
