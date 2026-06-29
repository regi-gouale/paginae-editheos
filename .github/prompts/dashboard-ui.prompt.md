---
name: Dashboard UI
description: "Generer une page de tableau de bord specifique avec stats cards, graphiques recharts et tableaux de donnees. Style sobre, moderne, sans emoji."
argument-hint: "Decris le tableau de bord : sujet, metriques cles, donnees a afficher, et contexte metier."
agent: agent
tools: [read, search, edit, execute]
---

Genere une page de tableau de bord professionnelle dans le projet Paginae Editheos.

**Tableau de bord demande** : {{input}}

## Directives de style

- **Aucun emoji** dans le code, les labels, les titres ou les descriptions.
- Palette neutre et sobre : utiliser les tokens CSS du theme (`--card`, `--muted`, `--primary`, `--border`).
- Typographie elegante avec hierarchie claire : titres en Merriweather (font-serif), corps en Lato (font-sans).
- Espacement genereux : `gap-4` minimum entre les sections, `gap-6` entre les blocs principaux.
- Coins arrondis coherents via les classes `rounded-lg` ou `rounded-xl`.
- Privilegier les bordures subtiles (`border`) plutot que les ombres lourdes.

## Architecture de la page

### 1. Exploration prealable

- Lire `components/dashboard/stats-card.tsx`, `components/dashboard/dashboard-stats.tsx`, et `components/dashboard/dashboard-header.tsx` pour reproduire les patterns existants.
- Lire `components/ui/card.tsx`, `components/ui/chart.tsx`, et `components/ui/table.tsx` pour les primitives disponibles.
- Vérifier les composants existants dans `components/dashboard/` et `components/projects/` avant de créer des doublons.

### 2. Structure de la page (`app/dashboard/...`)

- Page server-side avec session check :
  ```typescript
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");
  ```
- Layout en grille responsive :
  - Mobile : une colonne pleine largeur.
  - Desktop : grille `grid-cols-2 lg:grid-cols-4` pour les KPIs, `grid-cols-1 lg:grid-cols-2` pour les graphiques.

### 3. Bloc KPI — Stats Cards

- Utiliser `Card`, `CardHeader`, `CardTitle`, `CardContent` depuis `components/ui/card.tsx`.
- Chaque carte affiche : un label textuel, une valeur principale, et optionnellement une variation (fleche haut/bas via Lucide icons, pas d'emoji).
- 3 a 6 cartes en haut de page, en grille responsive.

### 4. Bloc Graphiques — Recharts

- Utiliser le wrapper `components/ui/chart.tsx` avec `ChartConfig` pour la configuration des couleurs.
- Types de graphiques selon les donnees : `BarChart`, `LineChart`, `AreaChart`, `PieChart`.
- Chaque graphique dans une `Card` avec `CardHeader` (titre + description) et `CardContent`.
- Pas de legende surchargee : privilegier les tooltips et labels inline.
- Couleurs issues de `ChartConfig` avec les CSS variables du theme.

### 5. Bloc Tableau de donnees

- Utiliser `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` depuis `components/ui/table.tsx`.
- Tableau dans une `Card` avec un titre clair dans `CardHeader`.
- Colonnes triables si pertinent.
- Badge depuis `components/ui/badge.tsx` pour les statuts.
- Pagination si les donnees depassent 10 lignes (voir `components/table-pagination.tsx`).

### 6. Donnees

- Ecrire une Server Action dans `lib/actions/` pour recuperer les donnees agregees.
- `"use server"` + auth check + appel Prisma type.
- Typer les retours explicitement, aucun `any`.
- Si les donnees n'existent pas encore, proposer des donnees de demonstration realistes et typees.

### 7. Validation finale

- `bun lint` sans erreur.
- Types TypeScript coherents.
- Aucun emoji dans le rendu.
- Responsive correct sur mobile et desktop.
- Les textes visibles sont en français.

Resume les fichiers créés/modifiés, les métriques affichées, et les éventuelles améliorations futures.
