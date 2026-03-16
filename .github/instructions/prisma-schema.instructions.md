---
description: "Use when editing prisma/schema.prisma or creating migrations. Covers model conventions, safety rules, and generated client usage."
applyTo: "prisma/schema.prisma"
---

# Conventions — Schéma Prisma

## Règles de modification

- **Client généré** : output toujours dans `prisma/generated/prisma` (ne pas changer `output`).
- **Nouveaux champs** : toujours optionnels (`?`) à l'ajout pour ne pas casser les données existantes.
- **Suppressions** : ne jamais supprimer un champ dans le même commit que le code qui le lit.
- **Enums** : `ProjectStatus`, `RuleConditionType`, `RuleActionType` — ne pas ajouter de valeurs sans vérifier `lib/rules.ts` et `lib/utils.ts`.
- **Relations M:M** : utiliser des tables de jonction explicites comme pattern dominant du projet.
- **Migrations** : nommer explicitement (`--name ajout-champ-deadline-project`), vérifier réversibilité.

## Imports dans le code applicatif

```typescript
// ✅ Instance singleton à utiliser dans toutes les actions et queries
import { prisma } from "@/lib/prisma";

// ✅ Imports de types Prisma uniquement (enums, types générés)
import type { ProjectStatus } from "@/prisma/generated/prisma/client";

// ❌ Interdit — jamais d'import direct depuis @prisma/client
import { PrismaClient } from "@prisma/client";

// ❌ Interdit — ne jamais instancier PrismaClient manuellement dans le code app
const prisma = new PrismaClient();
```

## Après toute modification de schéma

```bash
pnpm prisma migrate dev --name <nom-explicite>
pnpm prisma generate
```

Vérifier que les types étendus dans `types/kanban.ts` restent cohérents.
