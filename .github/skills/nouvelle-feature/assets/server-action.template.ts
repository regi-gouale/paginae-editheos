"use server";

import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// -----------------------------------------------------------------
// REMPLACER : MyEntity → nom du modèle Prisma (ex: Author, Task…)
// REMPLACER : myEntityAction → nom de l'action (ex: createAuthor)
// REMPLACER : /dashboard/... → route(s) à revalider
// -----------------------------------------------------------------

type MyEntityInput = {
  // Définir les champs attendus — jamais de `any`
  name: string;
  // ...
};

export async function myEntityAction(input: MyEntityInput) {
  // 1. Auth — pattern obligatoire du projet
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Non authentifié");

  // 2. (Optionnel) Validation supplémentaire avec Zod si payload complexe
  // const data = mySchema.parse(input);

  // 3. Mutation Prisma via le singleton
  const result = await prisma.myEntity.create({
    data: {
      name: input.name,
      // ...
    },
  });

  // 4. Invalider le cache Next.js — couvrir toutes les routes affectées
  revalidatePath("/dashboard/...");

  return result;
}
