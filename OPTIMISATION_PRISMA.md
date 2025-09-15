# Optimisations Prisma - Paginae Editheos

Ce document résume les optimisations effectuées pour réduire le nombre de requêtes Prisma tout en maintenant la cohérence des données.

## Problèmes identifiés

1. **Requêtes N+1** : Plusieurs requêtes individuelles pour des données associées alors qu'elles auraient pu être regroupées.
2. **Sélection excessive de champs** : Chargement de tous les champs alors que seuls certains sont nécessaires.
3. **Utilisation sous-optimale des transactions** : Les requêtes qui pouvaient être groupées ne l'étaient pas.
4. **Manque d'utilisation du cache** : Absence d'optimisation par mise en cache pour les données rarement modifiées.

## Solutions implémentées

### 1. Optimisation de `getProjectStats()`

**Avant** : Six requêtes distinctes exécutées en parallèle, chacune récupérant des informations partielles.

**Après** :

- Utilisation de `prisma.$transaction()` pour consolider les requêtes de comptage en une seule connexion à la base de données.
- Extraction des comptages directement à partir de la relation \_count.

### 2. Optimisation de `getKanbanData()`

**Avant** : Récupération de toutes les colonnes avec leurs projets, incluant toutes les relations possibles pour chaque projet.

**Après** :

- Utilisation de sélection précise des champs pour chaque relation.
- Élimination des inclusions inutiles, comme kanbanColumn dans les projets.
- Utilisation d'une transaction pour créer les colonnes par défaut en un seul appel à la base de données.

### 3. Optimisation de `applyAutomationRules()`

**Avant** : Multiples requêtes séquentielles pour chaque projet à déplacer.

**Après** :

- Récupération en une seule requête de toutes les colonnes cibles.
- Création d'un map pour un accès O(1) aux données de colonne.
- Utilisation de Promise.all pour paralléliser les mises à jour tout en réduisant le nombre de connexions.

### 4. Mise en cache pour les données stables

**Avant** : Pas de mise en cache, requêtes répétées pour des données statiques.

**Après** :

- Ajout de stratégies de cache pour `getAuthors()`, `getMembers()` et `getRecentProjects()`.
- Utilisation de TTL (Time-To-Live) et SWR (Stale-While-Revalidate) pour optimiser les performances.

### 5. Amélioration de l'instance Prisma

**Avant** : Simple instanciation du client Prisma avec Accelerate.

**Après** :

- Pattern Singleton pour éviter les instances multiples, surtout en développement.
- Configuration des logs pour réduire le bruit en production.
- Meilleure structure pour les extensions futures.

## Avantages des optimisations

1. **Réduction des requêtes** : Diminution significative du nombre total de requêtes, particulièrement sur les pages les plus visitées.
2. **Transfert de données réduit** : Sélection ciblée des champs nécessaires uniquement.
3. **Cohérence des données** : Maintien de la cohérence des données grâce aux transactions.
4. **Performances accrues** : Temps de réponse plus rapides grâce à la mise en cache intelligente.

## Recommandations supplémentaires

1. Envisager l'utilisation d'index supplémentaires pour les requêtes fréquentes.
2. Implémenter des délais d'expiration adaptés selon la fréquence de changement des données.
3. Surveiller les performances des requêtes et ajuster les stratégies de cache en conséquence.
