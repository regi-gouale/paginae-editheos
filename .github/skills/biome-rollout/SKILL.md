---
name: biome-rollout
description: "Mettre en place et stabiliser Biome dans Paginae Editheos. Use when: migration ESLint vers Biome, lint qui échoue après setup, besoin de config TypeScript explicite dans Biome, harmonisation des scripts lint/format."
argument-hint: "Décris l'objectif (setup initial, migration progressive, ou stabilisation des erreurs lint)."
---

# Biome Rollout — Paginae Editheos

Workflow reproductible pour installer Biome, l'aligner avec TypeScript, et stabiliser le lint sans bloquer l'équipe.

## Quand utiliser ce skill

- Mise en place initiale de Biome dans le projet
- Migration progressive depuis un lint historique
- Lint en échec après activation de Biome
- Besoin d'une config TypeScript explicite et compréhensible

## Procédure

### Étape 1 — Installer et initialiser

```bash
pnpm add -D @biomejs/biome
pnpm biome init
```

Objectif : obtenir un fichier `biome.json` valide avant customisation.

### Étape 2 — Aligner les scripts projet

Mettre à jour `package.json` :

- `lint`: `biome check .`
- `lint:fix`: `biome check --write .`
- `format`: `biome format --write .`
- `format:check`: `biome format .`
- conserver un script de fallback (`lint:eslint`) si migration progressive

### Étape 3 — Configurer Biome pour TS

Important : Biome ne propose pas de bloc top-level `typescript`.
Le support TS/TSX passe par `javascript`.

Si l'équipe veut une section explicite TypeScript, ajouter un `overrides` :

```json
{
  "overrides": [
    {
      "includes": ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      "linter": { "enabled": true }
    }
  ]
}
```

### Étape 4 — Triage des diagnostics

1. Exécuter `pnpm lint:fix`
2. Rejouer `pnpm lint`
3. Classer les diagnostics :

- auto-fixables (imports, format, templates)
- nécessitant intervention manuelle (assertions non-null, typing)

### Étape 5 — Décision de périmètre

Si trop de bruit hors code applicatif (templates, docs internes), choisir une stratégie :

- Exclure explicitement certains chemins dans `biome.json`
- Ou garder le périmètre global et corriger progressivement

Ne pas mélanger les deux stratégies sans décision explicite.

### Étape 6 — Validation finale

```bash
pnpm biome check biome.json
pnpm lint
pnpm build
```

## Critères de complétion

- `biome.json` valide
- scripts lint/format opérationnels
- stratégie de périmètre définie (inclure tout vs exclusions ciblées)
- `pnpm lint` et `pnpm build` passent ou écarts documentés avec plan d'action
