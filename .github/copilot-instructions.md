# Paginae Editheos - Instructions pour les Agents IA

Paginae Editheos est une application Next.js full-stack pour la gestion de projets éditoriaux avec un système Kanban intelligent et des règles d'automatisation.

## Architecture Clé

### Structure Principale

- **App Router** : Utilise Next.js 15 avec App Router (`app/` directory)
- **Authentication** : better-auth avec Prisma adapter - sessions gérées côté serveur
- **Database** : PostgreSQL avec Prisma ORM, schéma dans `prisma/generated/prisma`
- **UI** : shadcn/ui + Tailwind CSS avec composants réutilisables dans `components/ui/`

### Patterns Critiques

#### 1. Authentification & Routing

```typescript
// Pattern: Vérification de session dans chaque page protégée
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/auth");
```

#### 2. Système Kanban avec Automatisation

- **Colonnes fixes** : "À faire", "En cours", "Bloqué", "Terminé", "Rejeté" (mappées vers `ProjectStatus`)
- **Règles d'automatisation** : `lib/rules.ts` - déplacements automatiques basés sur dates d'échéance et tâches
- **Conversion statut/colonne** : `getProjectStatusFromColumnName()` et `getColumnNameFromProjectStatus()` dans `lib/utils.ts`

#### 3. Server Actions Pattern

```typescript
// Pattern: Actions serveur avec revalidation
"use server";
import { revalidatePath } from "next/cache";
// ... logique métier
revalidatePath("/dashboard/projects");
```

#### 4. Composants avec State Management

- **Board Principal** : `components/projects/board.tsx` - utilise `ProjectsBoard` (version optimisée)
- **Drag & Drop** : `@hello-pangea/dnd` avec mise à jour optimiste + sync DB
- **Automatisation** : `useEffect` surveille les projets et applique les règles (`shouldMoveProject`)

### Conventions Importantes

#### Base de Données

- **Relations complexes** : Project → Authors (M:M), Project → Members (M:M), Project → Tasks (1:M)
- **Custom Output** : Prisma client généré dans `prisma/generated/prisma`
- **Enums** : `ProjectStatus`, `RuleConditionType`, `RuleActionType` - toujours utiliser depuis Prisma

#### UI/UX Patterns

- **Sidebar** : `app-sidebar.tsx` avec stats dynamiques via `getProjectStats()`
- **Layouts** : Dashboard utilise `SidebarProvider` + `AppSidebar` + `SidebarInset`
- **Notifications** : `sonner` pour tous les toasts avec descriptions descriptives en français

#### Gestion d'État

- **Optimistic Updates** : État local mis à jour immédiatement, puis sync DB via server actions
- **Forms** : `react-hook-form` + `zod` validation + shadcn/ui form components
- **URL State** : `nuqs` pour filtres et paramètres de recherche

## Workflows Critiques

### Déploiement

```bash
pnpm vercel-build  # Script spécial qui génère Prisma client + migrations + build
```

### Développement

```bash
pnpm dev                    # Next.js avec turbopack
pnpm prisma migrate dev     # Après changements schema
pnpm prisma db seed         # Données de test
```

### Structure des Données

- **Types étendus** : Utiliser `ProjectWithDetails`, `KanbanColumnWithProjects` de `types/kanban.ts`
- **Actions** : `lib/actions/` - séparées par domaine (kanban, authors, members)

## Points d'Attention

1. **Règles d'Automatisation** : Ne pas modifier `lib/rules.ts` sans comprendre l'impact sur `shouldMoveProject()`
2. **Prisma Output** : Toujours importer depuis `@/prisma/generated/prisma`, jamais `@prisma/client`
3. **Session Management** : Server-side avec better-auth, utiliser `authClient.useSession()` côté client
4. **Revalidation** : Obligatoire après toute mutation de données (`revalidatePath`)
5. **Whitelist Email** : `lib/whitelist.ts` contrôle les inscriptions autorisées

## Intégrations Externes

- **Vercel Analytics & Speed Insights** : Configurés dans `app/layout.tsx`
- **better-auth** : Route API dans `app/api/auth/[...all]/route.ts`
- **Fonts** : Lato + Merriweather avec variables CSS personnalisées
