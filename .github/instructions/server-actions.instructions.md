---
description: "Use when writing or editing Server Actions in lib/actions/. Covers auth checks, Zod validation, Prisma calls, and revalidatePath conventions."
applyTo: "lib/actions/**/*.ts"
---

# Conventions — Server Actions (`lib/actions/`)

## Structure obligatoire

```typescript
"use server";

import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function myAction(input: FormData | SomeType) {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Non authentifié");

  // ... logique Prisma via l'instance singleton
  await prisma.someModel.update({ ... });

  revalidatePath("/dashboard/...");
}
```

## Règles

- **Auth** : `getCurrentSession()` depuis `@/lib/auth/auth-lib` — vérifier `session?.user` et lever une erreur si absent. `getRequiredUser()` **n'existe pas** dans ce projet.
- **Prisma** : toujours via le singleton `import { prisma } from "@/lib/prisma"`. Ne jamais instancier `PrismaClient` directement dans une action.
- **Types Prisma** (imports de types uniquement) : depuis `@/prisma/generated/prisma/client`, jamais `@prisma/client`.
- **Validation** : Zod ou validation manuelle sur les payloads entrants — jamais de `any`.
- **revalidatePath** : obligatoire après toute mutation — couvrir toutes les routes affectées.
- **Nommage** : préférer `<domaine>.action.ts` pour les nouveaux fichiers (ex: `authors.action.ts`). Les anciens `.ts` sans suffixe coexistent mais ne pas reproduire ce pattern.
- **Erreurs** : laisser remonter les erreurs Prisma ou les attraper avec un message utilisateur explicite.
- **Pas d'API routes** pour les mutations internes — toujours Server Actions.
