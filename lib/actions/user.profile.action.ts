"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSecureServerAction, validateFileUpload, extractFormData } from "@/lib/security/actions-utils";
import { secureNameSchema, secureEmailSchema } from "@/lib/security/validation";

// Schema de validation sécurisé pour le profil utilisateur
const updateProfileSchema = z.object({
  name: secureNameSchema,
  email: secureEmailSchema,
});

// Schema pour les données avec fichier
const updateProfileWithFileSchema = updateProfileSchema.extend({
  avatarFile: z.instanceof(File).optional(),
});

/**
 * Action sécurisée pour mettre à jour le profil utilisateur
 */
export const updateUserProfileAction = createSecureServerAction(
  updateProfileSchema,
  async (validatedData, userId) => {
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // Mise à jour des données de base
    const updateData: Record<string, unknown> = {
      name: validatedData.name,
      email: validatedData.email,
    };

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Revalidation des pages concernées
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  },
  {
    action: "update_user_profile",
    requireAuth: true,
    allowedFields: ["name", "email"],
    logSensitive: true,
  }
);

/**
 * Action séparée pour la mise à jour de l'avatar
 */
export async function updateUserAvatarAction(formData: FormData) {
  try {
    // Import des utilitaires d'auth ici pour éviter les dépendances circulaires
    const { getRequiredUser } = await import("@/lib/auth/auth-utils");
    const { logger } = await import("@/lib/security/logger");
    
    const user = await getRequiredUser();
    
    const avatarFile = formData.get("avatar") as File;
    if (!avatarFile || avatarFile.size === 0) {
      throw new Error("Aucun fichier sélectionné");
    }

    // Validation sécurisée du fichier
    const fileValidation = validateFileUpload(avatarFile);
    if (!fileValidation.success) {
      throw new Error(fileValidation.error);
    }

    // Conversion sécurisée en base64 avec limite de taille
    const maxSizeForBase64 = 2 * 1024 * 1024; // 2MB pour base64
    if (avatarFile.size > maxSizeForBase64) {
      throw new Error("Fichier trop volumineux pour la conversion (max 2MB)");
    }

    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${avatarFile.type};base64,${base64}`;

    // Mise à jour en base de données
    await prisma.user.update({
      where: { id: user.id },
      data: { image: dataUrl },
    });

    logger.auditLog("update_user_avatar", user.id, {
      fileSize: avatarFile.size,
      fileType: avatarFile.type,
    });

    // Revalidation des pages
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const { handleServerActionError } = await import("@/lib/security/logger");
    return handleServerActionError(error, "update_user_avatar");
  }
}
