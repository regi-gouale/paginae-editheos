import { z } from "zod";
import { secureEmailSchema, secureNameSchema } from "@/lib/security/validation";

// Schéma de mot de passe pour la connexion (moins strict)
export const loginPasswordSchema = z
  .string()
  .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." })
  .max(128, { message: "Le mot de passe doit contenir au maximum 128 caractères." });

// Schéma de mot de passe pour l'inscription (plus strict)
export const registerPasswordSchema = z
  .string()
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
  .max(128, { message: "Le mot de passe doit contenir au maximum 128 caractères." })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (@$!%*?&)" }
  );

export const loginFormSchema = z.object({
  email: secureEmailSchema,
  password: loginPasswordSchema,
});

export const registerFormSchema = z.object({
  name: secureNameSchema,
  email: secureEmailSchema,
  password: registerPasswordSchema,
});

// Schema pour la réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  email: secureEmailSchema,
});

// Schema pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: loginPasswordSchema,
  newPassword: registerPasswordSchema,
  confirmPassword: registerPasswordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});
