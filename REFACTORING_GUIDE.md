# Guide de Refactorisation - Paginae Editheos

Ce guide présente les patterns modernes implémentés selon les instructions du fichier `copilot-instructions.md`.

## 🎯 Patterns Implémentés

### 1. Server Actions Pattern

**Avant** (ancien pattern):

```typescript
export async function addAuthor(
  data: any
): Promise<{ success: boolean; error?: string }> {
  // Gestion manuelle des erreurs
  // Pas de validation
  // Session non vérifiée
}
```

**Après** (nouveau pattern):

```typescript
"use server";

export async function addAuthorAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  try {
    const validated = addAuthorSchema.parse(data);
    await prisma.author.create({ data: validated });
    revalidatePath("/dashboard/authors");
  } catch (error) {
    console.error("Error adding author:", error);
    throw error;
  }
}
```

### 2. Authentification Moderne

**Fichier**: `lib/actions/auth-utils.ts`

```typescript
export const getRequiredUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth");
  return session.user;
});
```

**Usage côté client**: `lib/auth/auth-client.ts`

```typescript
export function useSession() {
  return authClient.useSession();
}
```

### 3. Composants avec Forms Modernes

**Pattern**: `react-hook-form` + `zod` + `useMutation`

Voir: `components/forms/add-author-form.tsx`

```typescript
const mutation = useMutation({
  mutationFn: async (data) => resolveActionResult(addAuthorAction(formData)),
  onSuccess: () => toast.success("Updated!"),
});
```

### 4. Dialog System Global

**Avant** (composant individuel):

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>{/* Gestion manuelle de l'état */}</DialogContent>
</Dialog>
```

**Après** (système global):

```typescript
import { dialogManager } from "@/features/dialog-manager/dialog-manager";

dialogManager.confirm({
  title: "Supprimer l'élément",
  action: { label: "Supprimer", onClick: async () => await deleteAction() },
});
```

### 5. Conventions TypeScript

- ✅ `type` au lieu de `interface`
- ✅ Pas d'`any` types
- ✅ Validation avec `zod`
- ✅ Patterns `const` au lieu d'`enum`

## 📁 Structure des Fichiers

### Server Actions

- ✅ `*.action.ts` ou actions dans `lib/actions/`
- ✅ Pattern simple avec `revalidatePath`
- ✅ Validation avec session

### Composants

- ✅ `components/ui/` pour shadcn/ui
- ✅ `components/forms/` pour les formulaires
- ✅ `features/` pour les fonctionnalités complexes

### Authentification

- ✅ `lib/auth/auth-client.ts` pour le client
- ✅ `lib/actions/auth-utils.ts` pour les utilitaires serveur

## 🚀 Utilisation

### 1. Authentification dans une page

```typescript
import { getRequiredUser } from "@/lib/actions/auth-utils";

export default async function DashboardPage() {
  const user = await getRequiredUser(); // Redirige si non connecté
  return <div>Hello {user.name}</div>;
}
```

### 2. Formulaire avec validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

const form = useForm({
  resolver: zodResolver(schema),
});

const mutation = useMutation({
  mutationFn: async (data) => resolveActionResult(serverAction(formData)),
  onSuccess: () => toast.success("Succès!"),
});
```

### 3. Dialog global

```typescript
import { dialogManager } from "@/features/dialog-manager/dialog-manager";

// Confirmation
dialogManager.confirm({
  title: "Êtes-vous sûr ?",
  action: { label: "Confirmer", onClick: handleDelete },
});

// Input
dialogManager.input({
  title: "Nouveau nom",
  input: { defaultValue: "current" },
  action: { onClick: (value) => handleRename(value) },
});
```

### 4. TailwindCSS v4 (Mobile-first)

```tsx
// ✅ Bonne pratique
<div className="flex flex-col gap-4">
  <Card className="p-4">Content</Card>
</div>

// ❌ À éviter
<div className="space-y-4">
  <div className="bg-white p-4">Content</div>
</div>
```

## 🔄 Migration Steps

1. **Server Actions**: Remplacer les fonctions par le pattern `formData`
2. **Components**: Migrer vers `react-hook-form` + `zod`
3. **Dialogs**: Utiliser le `dialogManager` global
4. **Auth**: Utiliser `getRequiredUser` et `useSession`
5. **Types**: Convertir `interface` vers `type`

## ⚠️ Points d'Attention

1. **Revalidation**: Toujours appeler `revalidatePath` après mutation
2. **Session**: Vérifier la session dans chaque Server Action
3. **Validation**: Utiliser `zod` pour toute validation
4. **Imports**: Préférer les chemins absoluts avec `@/`
5. **Mobile-first**: TailwindCSS avec approche mobile-first

## 📦 Dépendances Requises

Pour que tous les patterns fonctionnent, assurez-vous d'avoir :

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "sonner": "^1.x",
    "zustand": "^4.x"
  }
}
```
