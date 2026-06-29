# Grille d'Audit — Paginae Editheos

Référence exhaustive pour l'audit qualité et régressions du projet.

---

## 1. Server Actions (`lib/actions/`)

- [ ] `"use server"` en tête de chaque fichier action
- [ ] Auth via `getCurrentSession()` (de `@/lib/auth/auth-lib`) — `getRequiredUser()` n'existe pas
- [ ] `session?.user` vérifié avant toute mutation
- [ ] `import { prisma } from "@/lib/prisma"` — jamais `new PrismaClient()`
- [ ] Types Prisma importés depuis `@/prisma/generated/prisma/client`, jamais `@prisma/client`
- [ ] `revalidatePath` après chaque mutation — toutes les routes affectées couvertes
- [ ] Aucun `any` dans les signatures
- [ ] `type` utilisé à la place de `interface`
- [ ] Erreurs attrapées ou laissées remonter avec message explicite

---

## 2. Composants UI (`components/`)

- [ ] `useMutation` utilisé pour les mutations (pas `useEffect` + fetch)
- [ ] Gestion d'erreur inline dans `mutationFn` (pas d'import `resolveActionResult` depuis utils)
- [ ] Toasts `sonner` en français avec description
- [ ] `queryClient.invalidateQueries` après succès
- [ ] États de chargement visibles (`isPending`, disabled button, skeleton)
- [ ] Espacement `flex flex-col gap-4` — pas de `space-y-*`
- [ ] Primitives shadcn/ui réutilisées — pas de `<div>` nu à la place de `<Card>`
- [ ] `type` pour les props, pas de `interface`
- [ ] Aucun `any`

---

## 3. Pages Dashboard (`app/dashboard/`)

- [ ] Check de session en tête de chaque page : `auth.api.getSession()` + `redirect("/auth")`
- [ ] Data fetching dans les Server Components (pas de `useEffect` pour le chargement initial)
- [ ] Types `ProjectWithDetails` / `KanbanColumnWithProjects` de `types/kanban.ts` utilisés si lié aux projets
- [ ] `nuqs` pour les filtres URL — pas de `useState` pour les query params
- [ ] Layout hérite de `SidebarProvider`/`AppSidebar`/`SidebarInset` — pas de sidebar recréée

---

## 4. Prisma & Base de données

- [ ] Aucun nouveau champ non optionnel ajouté sans migration
- [ ] Aucune suppression de colonne sans vérification des usages dans le code
- [ ] Enums `ProjectStatus`, `RuleConditionType`, `RuleActionType` non modifiés sans vérification de `lib/rules.ts`
- [ ] Migration nommée explicitement (pas `migration` générique)
- [ ] `pnpm prisma generate` exécuté après changement de schéma

---

## 5. Kanban & Automatisation (`lib/rules.ts`, `components/projects/board.tsx`)

- [ ] `shouldMoveProject` non contourné lors des transitions de statut
- [ ] Optimistic updates synchronisés avec la DB (pas de divergence d'état)
- [ ] Colonnes fixes respectées : "À faire", "En cours", "Bloqué", "Terminé", "Rejeté"
- [ ] `getProjectStatusFromColumnName()` / `getColumnNameFromProjectStatus()` utilisés pour les conversions

---

## 6. Sécurité (OWASP Top 10 appliqué au projet)

- [ ] **Contrôle d'accès** : resources filtrées par `userId` côté serveur avant renvoi
- [ ] **Injection** : pas de concaténation de chaînes dans les queries Prisma (utiliser les paramètres Prisma)
- [ ] **Données sensibles** : emails, tokens, métadonnées session non exposés en props client
- [ ] **Auth** : aucune route `app/dashboard/**` sans check de session
- [ ] **Whitelist** : `lib/whitelist.ts` non contournée pour les inscriptions

---

## 7. TypeScript & Qualité générale

- [ ] `pnpm lint` (Biome) passe sans erreur sur les fichiers modifiés
- [ ] `pnpm build` passe (si audit pré-déploiement)
- [ ] Aucun `console.log` de debug laissé dans le code
- [ ] Aucun `TODO` bloquant non documenté
