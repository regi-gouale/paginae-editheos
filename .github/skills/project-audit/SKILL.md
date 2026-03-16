---
name: project-audit
description: "Auditer le code de Paginae Editheos pour détecter des régressions, vérifier les conventions, et produire un rapport priorisé. Use when: audit, régression, code review, vérification qualité, avant déploiement, PR review, audit sécurité."
argument-hint: "Décris le périmètre à auditer : fichiers, fonctionnalité, ou 'global' pour un audit complet."
---

# Project Audit — Paginae Editheos

Workflow d'audit systématique pour détecter les régressions et vérifier les conventions avant merge ou déploiement.

## Quand utiliser ce skill

- Avant un déploiement Vercel
- Après une PR ou un refactoring significatif
- Pour un audit de sécurité ou de qualité
- Quand le build (`pnpm build`) échoue sans raison évidente

## Procédure

### Étape 1 — Définir le périmètre

Si périmètre = un fichier ou une fonctionnalité : se concentrer sur les dépendances directes.
Si périmètre = global : suivre la grille complète dans [./references/grille-audit.md](./references/grille-audit.md).

### Étape 2 — Lecture du code (pas d'édition)

Ce skill est **read-only** sauf si l'utilisateur demande explicitement des corrections.

Lire dans cet ordre :

1. Les Server Actions concernées (`lib/actions/`)
2. Les composants UI qui les appellent (`components/`)
3. Les pages dashboard qui les affichent (`app/dashboard/`)
4. Les modèles Prisma si des données sont en jeu (`prisma/schema.prisma`)

### Étape 3 — Appliquer la grille

Charger [./references/grille-audit.md](./references/grille-audit.md) et cocher chaque point.

### Étape 4 — Produire le rapport

```
## Audit : <périmètre>

### 🔴 Bloquants (à corriger avant déploiement)
- [fichier:zone] Problème — Correction recommandée

### 🟠 Importants (dette technique ou risque latent)
- [fichier:zone] Problème — Correction recommandée

### 🟡 Mineurs (style, optimisation, cohérence)
- [fichier:zone] Observation

### ✅ Conforme
- Liste des points vérifiés sans anomalie
```

## Critères de complétion

- Tous les points de la grille couverts (ou justification d'exclusion)
- Rapport classifié 🔴/🟠/🟡/✅ produit
- Aucune modification de fichier sans accord explicite
