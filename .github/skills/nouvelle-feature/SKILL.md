---
name: nouvelle-feature
description: "Implémenter une feature complète dans Paginae Editheos : schéma Prisma, Server Action, composant UI, page dashboard, et validation. Use when: créer feature, nouvelle fonctionnalité, implémenter, ajouter module, new feature."
argument-hint: "Décris la fonctionnalité, le modèle de données concerné, et les pages impactées."
---

# Nouvelle Feature — Paginae Editheos

Workflow complet pour implémenter une fonctionnalité dans ce projet Next.js 15 + Prisma + shadcn/ui.

## Quand utiliser ce skill

- Créer une nouvelle fonctionnalité CRUD
- Ajouter un module dashboard (nouvelle page + action + composant)
- Implémenter un nouveau domaine métier

## Procédure

### Étape 1 — Exploration préalable (obligatoire)

Avant d'écrire une seule ligne, lire :

- 2-3 actions existantes dans `lib/actions/` pour le pattern auth + Prisma
- 2-3 composants similaires dans `components/` pour le pattern form/mutation
- La page dashboard la plus proche dans `app/dashboard/` pour le pattern session

### Étape 2 — Schéma Prisma (si modèle nouveau ou modifié)

1. Modifier `prisma/schema.prisma` — nouveaux champs toujours optionnels (`?`)
2. `pnpm prisma migrate dev --name ajout-<nom-feature>`
3. Vérifier `types/kanban.ts` si lié aux projets

### Étape 3 — Server Action

Utiliser le template [./assets/server-action.template.ts](./assets/server-action.template.ts).

Points critiques :

- `getCurrentSession()` depuis `@/lib/auth/auth-lib` — jamais `getRequiredUser()`
- `import { prisma } from "@/lib/prisma"` — jamais instanciation directe
- `revalidatePath` sur toutes les routes affectées

### Étape 4 — Composant UI

Utiliser le template [./assets/ui-component.template.tsx](./assets/ui-component.template.tsx).

Points critiques :

- `useMutation` avec gestion d'erreur inline (pas d'import `resolveActionResult`)
- Toasts `sonner` en français
- `queryClient.invalidateQueries` après succès

### Étape 5 — Page Dashboard (si nouvelle route)

```typescript
// En tête de chaque page protégée
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/auth");
```

Réutiliser les types `ProjectWithDetails` / `KanbanColumnWithProjects` si lié aux projets.

### Étape 6 — Validation

```bash
pnpm lint
```

Vérifier : aucun `any`, types cohérents, `interface` remplacé par `type`.

## Critères de complétion

- [ ] Server Action avec auth + revalidation
- [ ] Composant UI avec mutation + toasts français
- [ ] `pnpm lint` sans erreur
- [ ] Aucun `any` dans le code produit
