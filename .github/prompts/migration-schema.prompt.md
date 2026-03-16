---
name: Migration Prisma
description: "Appliquer une modification de schéma Prisma de façon sûre : audit des usages, génération de migration, vérification des types générés."
argument-hint: "Décris le changement de schéma (ajout champ, nouvelle relation, renommage…) et les contraintes de données."
agent: agent
tools: [read, search, edit, execute]
---

Applique la migration Prisma suivante de façon sécurisée :

**Changement demandé** : {{input}}

## Étapes obligatoires

### 1. Audit préalable

- Lire `prisma/schema.prisma` — modèles concernés et relations existantes.
- Chercher tous les usages du modèle/champ modifié dans `lib/actions/`, `app/`, `components/`.
- Identifier les types étendus dans `types/kanban.ts` qui référencent ce modèle.

### 2. Modification du schéma

- Appliquer le changement minimal dans `prisma/schema.prisma`.
- Champs optionnels si ajout (évite les données existantes cassées).
- Ne pas supprimer de colonne dans le même commit que la suppression du code qui la lit.

### 3. Migration

```bash
pnpm prisma migrate dev --name <nom-explicite-du-changement>
```

- Vérifier que la migration générée est réversible.
- En cas de migration destructive, noter explicitement ce qui sera perdu.

### 4. Mise à jour des usages

- Corriger les appels Prisma impactés dans `lib/actions/`.
- Mettre à jour les types TypeScript étendus si nécessaire.
- Vérifier les `select` et `include` dans les queries.

### 5. Vérification

```bash
pnpm prisma generate
pnpm lint
```

Résume : changements de schéma, migration produite, usages mis à jour, risques de données résiduels.
