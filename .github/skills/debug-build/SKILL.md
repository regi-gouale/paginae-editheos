---
name: debug-build
description: "Diagnostiquer et corriger les erreurs de build Next.js dans Paginae Editheos. Use when: pnpm build échoue, erreur TypeScript, erreur ESLint bloquante, Prisma generate manquant, import introuvable, type error, build error, compilation failed."
argument-hint: "Colle l'erreur de build ou décris le symptôme (ex: 'type error sur kanban.ts ligne 42')."
---

# Debug Build — Paginae Editheos

Workflow de diagnostic pour les échecs `pnpm build` dans ce projet Next.js 15 + Prisma + TypeScript strict.

## Quand utiliser ce skill

- `pnpm build` se termine avec exit code non nul
- Erreurs TypeScript ou ESLint bloquantes au build
- Pages qui échouent en génération statique
- Problème après une migration Prisma ou un changement de schéma

## Procédure

### Étape 1 — Lire l'erreur complète

```bash
pnpm build 2>&1 | head -120
```

Identifier la **catégorie** de l'erreur — voir [./references/erreurs-frequentes.md](./references/erreurs-frequentes.md) pour les patterns courants et leurs corrections.

### Étape 2 — Triage par catégorie

| Symptôme dans l'erreur                                                  | → Aller à                           |
| ----------------------------------------------------------------------- | ----------------------------------- |
| `Type error:` / `TS2xxx`                                                | Étape 3 — TypeScript                |
| `Cannot find module` / `Module not found`                               | Étape 4 — Imports                   |
| `ESLint:` avec `Error` (pas Warning)                                    | Étape 5 — ESLint                    |
| `PrismaClientInitializationError` / `@prisma/client did not initialize` | Étape 6 — Prisma                    |
| `Error: NEXT_` / env variable                                           | Étape 7 — Variables d'environnement |
| Erreur dans une page statique (`/dashboard/…`)                          | Étape 8 — Pages                     |

### Étape 3 — Erreurs TypeScript

1. Lire le fichier incriminé et son contexte.
2. Vérifier : `type` utilisé à la place de `interface` ? Pas de `any` implicite ?
3. Si le type vient de Prisma : vérifier que `pnpm prisma generate` a été exécuté après le dernier changement de schéma.
4. Types étendus dans `types/kanban.ts` — vérifier cohérence avec le schéma.

### Étape 4 — Imports introuvables

Causes fréquentes dans ce projet :

- Import depuis `@prisma/client` → corriger vers `@/prisma/generated/prisma/client`
- Import depuis `@/lib/actions/actions-utils` → ce fichier n'existe pas, corriger inline
- Import depuis `@/features/dialog-manager/…` → cette feature n'existe pas encore
- Chemin d'alias `@/` mal configuré → vérifier `tsconfig.json` paths

### Étape 5 — ESLint bloquant

Les **warnings** ne bloquent pas le build Next.js. Seules les règles configurées en `error` bloquent.

```bash
pnpm lint 2>&1 | grep "Error:"
```

Règles ESLint enforced dans ce projet : `@typescript-eslint/no-explicit-any`, `prefer-const`, `@typescript-eslint/consistent-type-definitions` (type > interface).

### Étape 6 — Prisma non initialisé

```bash
pnpm prisma generate
pnpm build
```

Si le client n'est pas généré, tous les imports depuis `@/lib/prisma` échouent silencieusement à la compilation. S'assurer que le dossier `prisma/generated/prisma/` existe et est à jour.

### Étape 7 — Variables d'environnement manquantes

Variables requises au build :

- `DATABASE_URL` ou `ACCELERATE_URL` (utilisée dans `lib/prisma.ts`)
- `BETTER_AUTH_SECRET` (utilisée dans `lib/auth/auth.ts`)

```bash
cat .env | grep -E "DATABASE_URL|BETTER_AUTH"
```

### Étape 8 — Pages en échec

Si une page `/dashboard/…` échoue en génération :

1. Vérifier que le check de session est correct (`auth.api.getSession` + `redirect`)
2. Vérifier que les imports Server Actions dans la page sont valides
3. Chercher des `await` manquants sur des fonctions async

## Critères de complétion

- `pnpm build` se termine sans exit code non nul
- Aucune erreur TypeScript (warnings tolérés)
- Rapport des corrections appliquées produit
