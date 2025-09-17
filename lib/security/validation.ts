import { z } from "zod";

/**
 * Schemas de validation centralisés pour la sécurité
 * Note: DOMPurify sera ajouté comme dépendance optionnelle
 */

// Validation d'email avec assainissement
export const secureEmailSchema = z
  .string()
  .email("Email invalide")
  .max(254, "Email trop long") // RFC 5321 limite
  .transform((val) => val.toLowerCase().trim())
  .refine((val) => !val.includes("script"), "Email contient des caractères interdits");

// Validation de mot de passe sécurisé
export const securePasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe doit contenir au maximum 128 caractères")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial"
  );

// Validation de nom sécurisé
export const secureNameSchema = z
  .string()
  .min(1, "Le nom est requis")
  .max(100, "Le nom doit contenir au maximum 100 caractères")
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le nom contient des caractères invalides")
  .transform((val) => val.trim());

// Validation d'URL sécurisé
export const secureUrlSchema = z
  .string()
  .url("URL invalide")
  .max(2048, "URL trop longue")
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        return ["http:", "https:"].includes(url.protocol);
      } catch {
        return false;
      }
    },
    "Seuls les protocoles HTTP et HTTPS sont autorisés"
  );

// Validation de texte libre avec sanitisation basique
export const secureTextSchema = z
  .string()
  .max(10000, "Texte trop long")
  .transform((val) => val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));

// Validation d'ID sécurisé (UUID)
export const secureIdSchema = z
  .string()
  .uuid("ID invalide")
  .transform((val) => val.toLowerCase());

// Validation de slug sécurisé
export const secureSlugSchema = z
  .string()
  .min(1, "Slug requis")
  .max(100, "Slug trop long")
  .regex(/^[a-z0-9-]+$/, "Slug peut contenir uniquement des lettres minuscules, chiffres et tirets")
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Le slug ne peut pas commencer ou finir par un tiret");

// Validation de fichier upload sécurisé
export const secureFileSchema = z.object({
  name: z
    .string()
    .max(255, "Nom de fichier trop long")
    .regex(/^[a-zA-Z0-9.\-_\s]+$/, "Nom de fichier contient des caractères interdits"),
  size: z
    .number()
    .max(5 * 1024 * 1024, "Fichier trop volumineux (max 5MB)"), // 5MB max
  type: z
    .string()
    .refine(
      (val) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(val),
      "Type de fichier non autorisé"
    ),
});

// Validation des paramètres de pagination
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page doit être un nombre")
    .transform((val) => Math.max(1, parseInt(val, 10)))
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limite doit être un nombre")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10)))) // Entre 1 et 100
    .default("10"),
});

// Validation des filtres de recherche
export const searchFiltersSchema = z.object({
  search: z
    .string()
    .max(255, "Recherche trop longue")
    .transform((val) => val.trim().replace(/[<>]/g, ""))
    .optional(),
  sort: z
    .enum(["createdAt", "updatedAt", "name", "email"])
    .optional(),
  order: z
    .enum(["asc", "desc"])
    .optional(),
});

/**
 * Utilitaires de validation et sanitisation
 */

/**
 * Sanitise une chaîne HTML basique (sans DOMPurify pour l'instant)
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

/**
 * Valide et sanitise les données d'entrée avec un schéma Zod
 */
export async function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(", ");
      throw new Error(`Données invalides: ${message}`);
    }
    throw error;
  }
}

/**
 * Valide un FormData avec des règles de sécurité
 */
export function validateFormData(formData: FormData, allowedFields: string[]): FormData {
  const cleanFormData = new FormData();
  
  for (const [key, value] of formData.entries()) {
    if (!allowedFields.includes(key)) {
      continue; // Ignore les champs non autorisés
    }
    
    if (typeof value === "string") {
      cleanFormData.set(key, sanitizeHtml(value));
    } else {
      cleanFormData.set(key, value);
    }
  }
  
  return cleanFormData;
}