-- Migration manuelle pour ajouter la relation User-Member
-- À exécuter si vous ne pouvez pas utiliser `prisma migrate dev`

-- 1. Ajouter la colonne userId à la table member
ALTER TABLE "member" 
ADD COLUMN "userId" TEXT;

-- 2. Ajouter la contrainte d'unicité sur userId
ALTER TABLE "member" 
ADD CONSTRAINT "member_userId_key" UNIQUE ("userId");

-- 3. Ajouter la clé étrangère vers user
ALTER TABLE "member" 
ADD CONSTRAINT "member_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "user"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 4. Modifier la colonne role pour avoir une valeur par défaut (optionnel)
ALTER TABLE "member" 
ALTER COLUMN "role" SET DEFAULT 'CONTRIBUTOR';

-- Note: Cette migration ne synchronise pas automatiquement les utilisateurs existants
-- Vous devez exécuter le script: pnpm sync-users-to-members
