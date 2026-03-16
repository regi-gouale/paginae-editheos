---
description: "Use when creating or editing pages and layouts in app/dashboard/. Covers session auth, data fetching patterns, layout structure, and revalidation scope."
applyTo: "app/dashboard/**"
---

# Conventions — Pages Dashboard (`app/dashboard/`)

## Auth obligatoire sur chaque page protégée

```typescript
// Pattern direct (utilisé dans la majorité des pages)
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/auth");

// Ou via le helper de lib/auth/auth-lib.ts
import { getCurrentSession } from "@/lib/auth/auth-lib";
const session = await getCurrentSession();
if (!session?.user) redirect("/auth");
```

> `getRequiredUser()` **n'existe pas** — ne pas l'utiliser.

## Data fetching

- Fetch côté serveur dans les Server Components (pas de `useEffect` pour le chargement initial).
- TanStack Query uniquement pour les données interactives nécessitant re-fetch côté client.
- `nuqs` pour les filtres et paramètres de recherche dans l'URL.

## Layout

- Toute page utilise `SidebarProvider` + `AppSidebar` + `SidebarInset` (hérité du layout parent).
- Ne pas recréer la sidebar dans les pages enfants.

## Types de données

- Utiliser `ProjectWithDetails` et `KanbanColumnWithProjects` de `types/kanban.ts` pour tout ce qui concerne les projets.
- Ne pas reconstruire des types ad-hoc équivalents.

## Notifications / Feedback

- `sonner` pour tous les toasts, texte en français avec description explicite.
- États de chargement visibles (`isPending`, skeleton ou spinner).

## Sécurité

- Ne jamais exposer l'email ou les métadonnées sessions dans des props client sans nécessité.
- Vérifier les accès aux ressources par userId/session avant de renvoyer les données.
