# Erreurs Fréquentes — Paginae Editheos Build

Catalogue des erreurs de build récurrentes avec corrections spécifiques à ce projet.

---

## TypeScript

### `Type '...' is not assignable to type 'ProjectStatus'`

**Cause** : import de l'enum depuis le mauvais chemin ou valeur string brute.  
**Fix** :

```typescript
// ✅
import type { ProjectStatus } from "@/prisma/generated/prisma/client";
const status: ProjectStatus = "TODO"; // valeur enum Prisma
// ❌
import type { ProjectStatus } from "@prisma/client";
```

### `Property '...' does not exist on type 'ProjectWithDetails'`

**Cause** : type étendu dans `types/kanban.ts` pas mis à jour après changement de schéma Prisma.  
**Fix** : mettre à jour `types/kanban.ts` pour refléter le nouveau schéma, puis `pnpm prisma generate`.

### `Object is possibly 'undefined'`

**Cause** : accès à une propriété sans guard sur une relation Prisma optionnelle.  
**Fix** : utiliser optional chaining `?.` ou une guard explicite avant l'accès.

### `Parameter 'x' implicitly has an 'any' type`

**Cause** : paramètre de fonction sans type dans un fichier couvert par `strict: true`.  
**Fix** : typer explicitement chaque paramètre.

---

## Imports

### `Cannot find module '@/lib/actions/actions-utils'`

**Cause** : ce fichier n'existe pas dans ce projet — `resolveActionResult` est défini inline dans chaque composant.  
**Fix** : supprimer l'import et définir la fonction inline :

```typescript
// Inline dans le composant
mutationFn: async (data) => {
  try { return await myAction(data); }
  catch (error) { throw error; }
},
```

### `Cannot find module '@/features/dialog-manager/dialog-manager'`

**Cause** : cette feature n'a pas encore été implémentée dans ce projet.  
**Fix** : utiliser les composants shadcn/ui `Dialog` et `AlertDialog` directement depuis `components/ui/`.

### `Cannot find module '@prisma/client'`

**Cause** : import direct depuis `@prisma/client` au lieu du client généré.  
**Fix** :

```typescript
// ✅
import type { ... } from "@/prisma/generated/prisma/client";
import { prisma } from "@/lib/prisma"; // pour les queries
// ❌
import { PrismaClient } from "@prisma/client";
```

---

## Prisma

### `PrismaClientInitializationError` ou client vide au build

**Cause** : client Prisma non généré après un changement de schéma.  
**Fix** :

```bash
pnpm prisma generate
pnpm build
```

### `The table '...' does not exist`

**Cause** : migration non appliquée en dev.  
**Fix** :

```bash
pnpm prisma migrate dev
pnpm build
```

---

## ESLint (erreurs bloquantes uniquement)

### `@typescript-eslint/no-explicit-any`

**Cause** : `any` explicite dans le code.  
**Fix** : typer correctement ou utiliser `unknown` avec un type guard.

### `@typescript-eslint/consistent-type-definitions` (interface → type)

**Cause** : `interface` utilisé à la place de `type`.  
**Fix** :

```typescript
// ✅
type MyProps = { name: string };
// ❌
interface MyProps {
  name: string;
}
```

### `react-hooks/exhaustive-deps` (en error, pas warning)

**Cause** : dépendance manquante dans un `useEffect`.  
**Fix** : ajouter la dépendance ou utiliser `useCallback` pour stabiliser les fonctions.

---

## Pages Dashboard

### Page statique en échec lors de `Generating static pages`

**Causes possibles** :

1. `await` manquant sur `headers()` dans le check de session
2. Variable d'environnement absente au build (Prisma / Auth)
3. Import circulaire entre une page et un composant

**Vérification rapide** :

```typescript
// Check session correct
const session = await auth.api.getSession({ headers: await headers() });
//                                                   ^^^^^ await requis
```
