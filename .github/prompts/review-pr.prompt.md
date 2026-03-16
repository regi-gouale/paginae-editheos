---
name: Review PR
description: "Effectuer une revue complète d'une PR : conventions, sécurité, régressions Kanban/Server Actions/Prisma, et qualité UI."
argument-hint: "Colle le diff ou décris les fichiers modifiés et le périmètre fonctionnel de la PR."
agent: agent
tools: [read, search]
---

Effectue une revue approfondie de la PR suivante :

**Périmètre / diff** : {{input}}

## Grille de revue

### ✅ Conventions générales

- [ ] `type` utilisé à la place de `interface`
- [ ] Aucun `any` dans le code modifié
- [ ] Imports Prisma depuis `prisma/generated/prisma` uniquement
- [ ] Nommage des fichiers respecté (`*.action.ts`, `*.tsx`, etc.)

### ✅ Server Actions

- [ ] `"use server"` présent sur chaque action
- [ ] Auth check en tête (`getRequiredUser()` ou session)
- [ ] Validation Zod du payload entrant
- [ ] `revalidatePath` sur toutes les routes impactées
- [ ] Gestion d'erreurs explicite

### ✅ Kanban & Automatisation

- [ ] Transitions de statut cohérentes avec `ProjectStatus`
- [ ] `shouldMoveProject` non contourné
- [ ] Optimistic updates synchronisés avec la DB

### ✅ Prisma

- [ ] Aucune mutation directe de colonne sans migration
- [ ] `select` et `include` précis (pas de `findMany` sans restriction)
- [ ] Types générés à jour après changement de schéma

### ✅ UI / Composants

- [ ] Composants `components/ui/` réutilisés plutôt que recréés
- [ ] Toasts `sonner` en français avec description
- [ ] Formulaires validés côté client (Zod + react-hook-form)
- [ ] Aucun état de chargement oublié

### ✅ Sécurité (OWASP)

- [ ] Pas d'injection via paramètres non validés
- [ ] Accès aux ressources vérifié par session/rôle
- [ ] Pas de données sensibles exposées côté client

Produis un rapport structuré avec les points bloquants (🔴), à améliorer (🟠), et conformes (✅).
