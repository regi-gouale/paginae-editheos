---
description: "Use when creating or editing UI components in components/. Covers shadcn primitives, Tailwind patterns, typography, forms, and dialog conventions."
applyTo: "components/**"
---

# Conventions — Composants UI (`components/`)

## Structure et primitives

- **Conteneurs** : utiliser `components/ui/card.tsx` plutôt que des `<div>` nus.
- **Texte** : utiliser `components/ui/typography.tsx` pour tous les éléments textuels sémantiques.
- **Espacement** : `flex flex-col gap-4` — ne pas utiliser `space-y-*`.
- **Primitives Radix/shadcn** : réutiliser depuis `components/ui/` — ne pas recréer de logique dialog, dropdown ou select.

## Formulaires

```typescript
// Pattern obligatoire — react-hook-form + Zod + useMutation
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
const mutation = useMutation({
  mutationFn: async (data: MyType) => {
    // resolveActionResult est défini INLINE dans chaque composant, pas importé depuis utils
    try {
      return await myAction(data);
    } catch (error) {
      throw error;
    }
  },
  onSuccess: () => {
    toast.success("Message de succès en français");
    queryClient.invalidateQueries({ queryKey: ["ma-clé"] });
  },
  onError: () => toast.error("Message d'erreur en français"),
});
```

> `resolveActionResult` **n'existe pas** dans `@/lib/actions/actions-utils` — la gestion d'erreur est inline.

## Dialogs et confirmations

Utiliser les composants shadcn/ui `Dialog`, `AlertDialog` depuis `components/ui/` — la feature `dialog-manager` référencée dans certaines docs **n'existe pas encore** dans ce projet. Implémenter les dialogs directement via les primitives Radix/shadcn.

## Responsive

- Mobile-first avec Tailwind v4.
- Breakpoints `sm:`, `md:`, `lg:` si la mise en page change.

## Règles TypeScript

- `type` à la place de `interface` (enforced ESLint).
- Props explicitement typées, aucun `any`.
