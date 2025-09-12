import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.email({
    message: "L'adresse e-mail doit être valide.",
  }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." })
    .max(100, {
      message: "Le mot de passe doit contenir au maximum 100 caractères.",
    }),
});

export const registerFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
    .max(100, {
      message: "Le nom doit contenir au maximum 100 caractères.",
    }),
  email: z.email({
    message: "L'adresse e-mail doit être valide.",
  }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." })
    .max(100, {
      message: "Le mot de passe doit contenir au maximum 100 caractères.",
    }),
});
