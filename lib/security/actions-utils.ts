"use server";

import { z } from "zod";
import { getRequiredUser } from "@/lib/auth/auth-utils";
import { logger, handleServerActionError, logSensitiveAction } from "@/lib/security/logger";
import { validateAndSanitize, validateFormData } from "@/lib/security/validation";

/**
 * Types pour les résultats d'actions serveur sécurisés
 */
export type ActionResult<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

/**
 * Interface pour les métadonnées d'action
 */
interface ActionMetadata {
  action: string;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  allowedFields?: string[];
  logSensitive?: boolean;
}

/**
 * Wrapper sécurisé pour les server actions
 */
export async function createSecureServerAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (data: TInput, userId?: string) => Promise<TOutput>,
  metadata: ActionMetadata
): Promise<(formData: FormData) => Promise<ActionResult<TOutput>>> {
  return async (formData: FormData): Promise<ActionResult<TOutput>> => {
    try {
      let userId: string | undefined;

      // Vérification de l'authentification si requise
      if (metadata.requireAuth) {
        const user = await getRequiredUser();
        userId = user.id;
      }

      // Validation et nettoyage des données FormData
      const cleanFormData = metadata.allowedFields 
        ? validateFormData(formData, metadata.allowedFields)
        : formData;

      // Extraction des données du FormData
      const rawData = Object.fromEntries(cleanFormData.entries());

      // Validation avec le schéma
      const validatedData = await validateAndSanitize(schema, rawData);

      // Log des actions sensibles
      if (metadata.logSensitive && userId) {
        logSensitiveAction(metadata.action, userId, { 
          formDataKeys: Array.from(formData.keys()) 
        });
      }

      // Exécution de l'action
      const result = await handler(validatedData, userId);

      logger.info(`Server action completed: ${metadata.action}`, { 
        userId, 
        success: true 
      });

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      logger.error(`Server action failed: ${metadata.action}`, error as Error, {
        formDataKeys: Array.from(formData.keys()),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
      };
    }
  };
}

/**
 * Wrapper simple pour les actions qui n'ont pas besoin de validation complexe
 */
export async function withAuth<T>(
  action: (userId: string) => Promise<T>,
  actionName: string
): Promise<ActionResult<T>> {
  try {
    const user = await getRequiredUser();
    const result = await action(user.id);
    
    logger.info(`Authenticated action completed: ${actionName}`, { 
      userId: user.id 
    });
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    handleServerActionError(error, actionName);
  }
}

/**
 * Utilitaire pour résoudre les résultats d'action côté client
 */
export async function resolveActionResult<T>(
  actionPromise: Promise<ActionResult<T>>
): Promise<T> {
  const result = await actionPromise;
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}

/**
 * Helper pour extraire les données d'un FormData de manière sécurisée
 */
export function extractFormData(
  formData: FormData,
  fields: Record<string, "string" | "number" | "boolean" | "file">
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, type] of Object.entries(fields)) {
    const value = formData.get(key);
    
    if (value === null) {
      data[key] = undefined;
      continue;
    }

    switch (type) {
      case "string":
        data[key] = typeof value === "string" ? value : "";
        break;
      case "number":
        data[key] = typeof value === "string" ? parseFloat(value) || 0 : 0;
        break;
      case "boolean":
        data[key] = value === "true" || value === "on";
        break;
      case "file":
        data[key] = value instanceof File ? value : undefined;
        break;
    }
  }

  return data;
}

/**
 * Validation des uploads de fichiers avec limites de sécurité
 */
export function validateFileUpload(file: File): ActionResult<File> {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  
  if (file.size > maxSize) {
    return {
      success: false,
      error: "Fichier trop volumineux (max 5MB)",
      code: "FILE_TOO_LARGE",
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Type de fichier non autorisé",
      code: "INVALID_FILE_TYPE",
    };
  }
  
  // Vérification basique du nom de fichier
  if (!/^[a-zA-Z0-9._\-\s]+$/.test(file.name)) {
    return {
      success: false,
      error: "Nom de fichier contient des caractères invalides",
      code: "INVALID_FILENAME",
    };
  }
  
  return {
    success: true,
    data: file,
  };
}

/**
 * Rate limiting simple basé sur la mémoire (à remplacer par Redis en production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}