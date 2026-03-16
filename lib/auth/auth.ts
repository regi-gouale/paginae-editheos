import { PrismaClient } from "@/prisma/generated/prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/lib/email/usesend";
import {
  resetPasswordEmailHTML,
  resetPasswordEmailText,
} from "@/lib/email/reset-password-template";

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL!,
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "").split(","),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // `url` = /api/auth/reset-password/{token}?callbackURL={redirectTo}
      // better-auth validates the token then redirects to the frontend page
      void sendEmail({
        to: user.email,
        subject: "Réinitialiser votre mot de passe — Paginae",
        html: resetPasswordEmailHTML(user.name || "Utilisateur", url),
        text: resetPasswordEmailText(user.name || "Utilisateur", url),
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  plugins: [nextCookies()],
});
