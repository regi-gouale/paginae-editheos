# 🔄 Synchronisation Utilisateurs → Membres - Guide Rapide

## ✅ Changements effectués

- ✅ Schéma Prisma mis à jour avec relation User ↔ Member
- ✅ Hook automatique dans better-auth pour créer des membres à l'inscription
- ✅ Script de synchronisation créé
- ✅ Client Prisma régénéré
- ✅ Script npm ajouté au package.json

## 🚀 Prochaines étapes

### 1. Appliquer la migration SQL

**Option A** - Via Prisma (recommandé en développement) :

```bash
# Nécessite un accès direct à la base de données
pnpm prisma migrate dev --name add-user-member-relation
```

**Option B** - Manuellement (pour Prisma Accelerate ou production) :

```bash
# Exécuter le fichier SQL manuellement
psql -d votre_database < prisma/migrations/manual_add_user_member_relation.sql
```

### 2. Synchroniser les utilisateurs existants

```bash
pnpm sync-users-to-members
```

### 3. Vérifier le résultat

- Connectez-vous à votre dashboard : `/dashboard/team`
- Vérifiez que tous les utilisateurs apparaissent comme membres
- Ajustez les rôles si nécessaire

## 📋 Ce qui se passe maintenant

### Pour les nouveaux utilisateurs

Lorsqu'un utilisateur s'inscrit :

1. ✅ Compte User créé
2. ✅ Membre automatiquement créé avec rôle CONTRIBUTOR
3. ✅ Liaison automatique entre les deux

### Pour les utilisateurs existants

Après avoir exécuté `pnpm sync-users-to-members` :

- ✅ Chaque utilisateur aura un membre lié
- ✅ Les membres existants seront liés aux utilisateurs correspondants (par email)
- ✅ Les nouveaux membres auront le rôle CONTRIBUTOR par défaut

## 🔍 Détails techniques

**Fichiers modifiés :**

- `prisma/schema.prisma` - Ajout de la relation
- `lib/auth/auth.ts` - Hook onCreate pour auto-création
- `scripts/sync-users-to-members.ts` - Script de synchronisation
- `package.json` - Nouveau script npm

**Nouveau champs :**

- `Member.userId` (optionnel) - Référence vers User
- `Member.role` - Maintenant avec valeur par défaut CONTRIBUTOR
- `User.member` (relation) - Accès au membre lié

## 📖 Documentation complète

Consultez [MIGRATION_USER_MEMBER.md](./MIGRATION_USER_MEMBER.md) pour plus de détails.
