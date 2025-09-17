/**
 * Exemples d'utilisation des améliorations de sécurité
 * Ce fichier sert de référence pour la migration et l'adoption des patterns sécurisés
 * @fileoverview Documentation et exemples des patterns de sécurité
 */

import { z } from "zod";

// Imports des nouveaux utilitaires sécurisés
import { 
  addAuthorSecureAction, 
  updateAuthorSecureAction,
  deleteAuthorSecureAction 
} from "@/lib/actions/authors-secure.action";
import { createSecureServerAction } from "@/lib/security/actions-utils";
import { secureNameSchema, secureEmailSchema } from "@/lib/security/validation";
import { logger } from "@/lib/security/logger";

// =============================================================================
// 1. EXEMPLE: Utilisation des nouvelles actions sécurisées dans un composant
// =============================================================================

/* 
// Pour un composant React, vous pourriez utiliser:

export function ExampleAuthorForm() {
  const addAuthorMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addAuthorSecureAction(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: () => {
      toast.success("Auteur ajouté avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return (
    <form action={(formData) => addAuthorMutation.mutate(formData)}>
      // Formulaire ici
    </form>
  );
}
*/

// =============================================================================
// 2. EXEMPLE: Création d'une nouvelle action serveur sécurisée
// =============================================================================

// Schema de validation
const updateUserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["fr", "en"]),
  notifications: z.boolean(),
  email: secureEmailSchema,
});

// Action serveur sécurisée
export const updateUserPreferencesAction = createSecureServerAction(
  updateUserPreferencesSchema,
  async (validatedData, userId) => {
    // Import dynamique pour éviter les dépendances circulaires
    const { prisma } = await import("@/lib/prisma");
    
    // Logique métier - données déjà validées et utilisateur authentifié
    await prisma.user.update({
      where: { id: userId },
      data: {
        // preferences: validatedData, // Exemple de structure
      },
    });

    // Logging d'audit automatique grâce aux métadonnées
    return { preferences: validatedData };
  },
  {
    action: "update_user_preferences",
    requireAuth: true, // Authentification requise
    allowedFields: ["theme", "language", "notifications", "email"],
    logSensitive: false, // Pas besoin de log d'audit pour les préférences
  }
);

// =============================================================================
// 3. EXEMPLE: Gestion des permissions avancées
// =============================================================================

import { hasProjectPermission, requireProjectPermission } from "@/lib/auth/auth-utils";

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: secureNameSchema,
  description: z.string().max(10000),
});

export const updateProjectSecureAction = createSecureServerAction(
  updateProjectSchema,
  async (validatedData, userId) => {
    // Vérification des permissions avant l'action
    await requireProjectPermission(validatedData.id, "write");

    const { id, ...updateData } = validatedData;
    
    // Import dynamique pour éviter les dépendances circulaires
    const { prisma } = await import("@/lib/prisma");
    
    await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  },
  {
    action: "update_project",
    requireAuth: true,
    allowedFields: ["id", "title", "description"],
    logSensitive: true, // Log d'audit pour les modifications de projet
  }
);

// =============================================================================
// 4. EXEMPLE: Vérification conditionnelle des permissions côté client
// =============================================================================

/*
// Pour un Server Component:

export async function ExampleProjectComponent({ projectId }: { projectId: string }) {
  const canEdit = await hasProjectPermission(projectId, "write");
  const canDelete = await hasProjectPermission(projectId, "delete");

  return (
    <div>
      {canEdit && <button>Éditer le projet</button>}
      {canDelete && <button>Supprimer le projet</button>}
    </div>
  );
}
*/

// =============================================================================
// 5. EXEMPLE: Validation de fichiers avec sécurité
// =============================================================================

import { validateFileUpload } from "@/lib/security/actions-utils";

export async function handleAvatarUpload(formData: FormData) {
  const file = formData.get("avatar") as File;
  
  if (!file) {
    throw new Error("Aucun fichier sélectionné");
  }

  // Validation sécurisée du fichier
  const fileValidation = validateFileUpload(file);
  if (!fileValidation.success) {
    throw new Error(fileValidation.error);
  }

  // Le fichier est maintenant validé et sûr à utiliser
  const validFile = fileValidation.data;
  
  // Traitement du fichier...
  console.log("Fichier validé:", validFile.name);
}

// =============================================================================
// 6. EXEMPLE: Logging sécurisé dans l'application
// =============================================================================

export async function handleUserLogin(email: string, success: boolean, ip?: string) {
  // Log d'authentification avec masquage automatique des données sensibles
  logger.authLog("login_attempt", email, success, ip);

  if (success) {
    logger.info("User logged in successfully", { 
      userEmail: "[EMAIL_REDACTED]", // Email automatiquement masqué
      loginTime: new Date().toISOString(),
    });
  }
}

export async function handleSuspiciousActivity(userId: string, details: Record<string, unknown>) {
  // Log de sécurité pour les activités suspectes
  logger.securityLog("suspicious_activity", {
    userId,
    timestamp: new Date().toISOString(),
    ...details, // Les données sensibles seront automatiquement masquées
  });
}

// =============================================================================
// 7. EXEMPLE: Gestion d'erreurs centralisée
// =============================================================================

import { handleServerActionError } from "@/lib/security/logger";

export async function exampleLegacyAction(formData: FormData) {
  try {
    // Logique métier...
    return { success: true };
  } catch (error) {
    // Gestion d'erreur sécurisée avec logging et masquage
    return handleServerActionError(error, "example_legacy_action");
  }
}

// =============================================================================
// 8. EXEMPLE: Configuration et validation de la whitelist
// =============================================================================

import { validateWhitelistConfig, getAllowedDomains } from "@/lib/whitelist";

// Validation de la configuration au démarrage de l'application
export async function validateAppSecurity() {
  const whitelistValidation = validateWhitelistConfig();
  
  if (!whitelistValidation.valid) {
    logger.error("Security configuration errors", undefined, {
      errors: whitelistValidation.errors,
    });
    throw new Error("Configuration de sécurité invalide");
  }

  const allowedDomains = getAllowedDomains();
  logger.info("Security configuration validated", {
    allowedDomainsCount: allowedDomains.length,
  });
}

// =============================================================================
// 9. EXEMPLE: Migration d'anciennes actions vers les nouvelles
// =============================================================================

/*
// ANCIEN CODE (non sécurisé)
export async function oldAddAuthor(formData: FormData) {
  const data = {
    firstName: formData.get("firstName") as string, // Pas de validation
    lastName: formData.get("lastName") as string,   // Pas de validation
    email: formData.get("email") as string,         // Pas de validation
  };
  
  // Pas de vérification d'authentification
  // Pas de logging d'audit
  // Gestion d'erreur basique
  
  await prisma.author.create({ data });
}

// NOUVEAU CODE (sécurisé)
export const newAddAuthor = createSecureServerAction(
  addAuthorSchema, // Validation Zod stricte
  async (validatedData, userId) => {
    // Données déjà validées, utilisateur authentifié
    const { prisma } = await import("@/lib/prisma");
    await prisma.author.create({ data: validatedData });
    return { success: true };
  },
  {
    action: "add_author",
    requireAuth: true,     // Authentification requise
    allowedFields: [...],  // Whitelist de champs
    logSensitive: true,    // Logging d'audit automatique
  }
);
*/