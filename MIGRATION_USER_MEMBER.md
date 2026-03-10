# Synchronisation Utilisateurs → Membres

## Vue d'ensemble

Cette mise à jour ajoute une relation entre les **utilisateurs** (User) et les **membres** (Member) dans la base de données.

### Changements apportés

1. **Schéma Prisma** : Ajout d'une relation bidirectionnelle entre `User` et `Member`
   - Champ `userId` (optionnel) dans `Member`
   - Relation `member` (optionnelle) dans `User`
   - Rôle par défaut `CONTRIBUTOR` pour les nouveaux membres

2. **Hook automatique** : Lors de l'inscription d'un nouvel utilisateur, un membre est automatiquement créé avec le rôle `CONTRIBUTOR`

3. **Script de synchronisation** : Pour migrer les utilisateurs existants vers des membres

## Étapes de migration

### 1. Créer la migration (en production)

**⚠️ Important** : Cette commande nécessite un accès direct à votre base de données PostgreSQL.

```bash
# En local ou sur votre serveur de base de données
pnpm prisma migrate dev --name add-user-member-relation
```

Si vous utilisez **Prisma Accelerate**, vous devrez :

1. Créer la migration manuellement dans votre environnement de développement
2. La déployer en production avec `prisma migrate deploy`

### 2. Synchroniser les utilisateurs existants

Une fois la migration appliquée, exécutez le script de synchronisation :

```bash
pnpm sync-users-to-members
```

Ce script va :

- ✅ Créer un membre pour chaque utilisateur qui n'en a pas
- 🔗 Lier les membres existants aux utilisateurs correspondants (par email)
- ⏭️ Ignorer les utilisateurs qui ont déjà un membre lié
- 📊 Afficher un résumé des opérations

### 3. Vérifier les rôles

Après la synchronisation, vous pouvez ajuster les rôles des membres via :

- L'interface de gestion des membres : `/dashboard/team`
- Directement dans la base de données si nécessaire

## Comportement après migration

### Nouvel utilisateur s'inscrit

1. Un compte `User` est créé (via better-auth)
2. Automatiquement, un `Member` est créé et lié avec le rôle `CONTRIBUTOR`
3. L'utilisateur peut maintenant être assigné à des projets

### Utilisateur existant

- Si le membre n'existe pas encore : exécutez `pnpm sync-users-to-members`
- Si le membre existe déjà : la liaison sera créée automatiquement

## Champs ajoutés

### Model Member

```prisma
model Member {
  // ... autres champs
  userId    String?    @unique  // Nouveau : lien vers User
  user      User?      @relation("UserMember", fields: [userId], references: [id], onDelete: Cascade)
  role      MemberRole @default(CONTRIBUTOR) // Ajout de la valeur par défaut
}
```

### Model User

```prisma
model User {
  // ... autres champs
  member    Member?    @relation("UserMember")  // Nouveau : lien vers Member
}
```

## Rollback (si nécessaire)

Si vous devez annuler cette migration :

```bash
# Revenir à la migration précédente
pnpm prisma migrate resolve --rolled-back add-user-member-relation
```

⚠️ **Attention** : Cela ne supprimera pas les données existantes, seulement la structure de relation.

## Questions fréquentes

**Q: Que se passe-t-il si je crée un membre manuellement avec le même email qu'un utilisateur ?**  
R: Le hook détectera le membre existant et créera automatiquement la liaison.

**Q: Puis-je avoir un membre sans utilisateur ?**  
R: Oui, le champ `userId` est optionnel. Cela permet d'avoir des membres non-utilisateurs (ex: contacts externes).

**Q: Que se passe-t-il si je supprime un utilisateur ?**  
R: Le membre associé sera également supprimé (`onDelete: Cascade`).
