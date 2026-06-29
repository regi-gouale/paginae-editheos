---
name: Nouvelle Feature
description: "Implémenter une nouvelle fonctionnalité complète : Server Action, composant UI, validation Zod, et revalidatePath."
argument-hint: "Décris la fonctionnalité, le modèle Prisma concerné, et les pages impactées."
agent: agent
tools: [read, search, edit, execute]
---

Implémente la fonctionnalité suivante dans le projet Paginae Editheos :

**Fonctionnalité demandée** : {{input}}

## Checklist d'implémentation

### 1. Exploration préalable

- Lire au moins 3 fichiers similaires dans `lib/actions/`, `components/`, et `app/dashboard/` avant d'écrire du code.
- Vérifier si le modèle Prisma concerné existe déjà dans `prisma/schema.prisma`.

### 2. Données (si changement de schéma)

- Ajouter ou modifier le modèle dans `prisma/schema.prisma`.
- Créer une migration nommée explicitement (`bun prisma migrate dev --name <nom>`).
- Vérifier que le client généré est dans `prisma/generated/prisma`.

### 3. Server Action (`lib/actions/<domaine>.ts`)

- `"use server"` en tête de fichier.
- Auth check via `getRequiredUser()` ou session.
- Validation Zod du payload entrant.
- Appel Prisma typé.
- `revalidatePath(...)` sur toutes les routes affectées.

### 4. Composant UI (`components/` ou feature dédiée)

- Réutiliser les composants `components/ui/` existants (card, form, dialog…).
- Formulaires avec `react-hook-form` + résolveur Zod.
- Mutation côté client avec `useMutation` + `resolveActionResult`.
- Toast `sonner` en français pour succès et erreur.

### 5. Page / Route (`app/dashboard/…`)

- Protéger la page avec un check de session serveur.
- Utiliser les types étendus de `types/kanban.ts` si lié aux projets.

### 6. Validation finale

- `bun lint` sans erreur.
- Types TypeScript cohérents, aucun `any`.

Résume les fichiers créés/modifiés et les risques résiduels éventuels.
