import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  changeEmailHTML,
  changeEmailText,
} from "@/lib/email/change-email-template";
import {
  resetPasswordEmailHTML,
  resetPasswordEmailText,
} from "@/lib/email/reset-password-template";
import { sendEmail } from "@/lib/email/usesend";
import {
  verifyEmailHTML,
  verifyEmailText,
} from "@/lib/email/verify-email-template";
import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({
  ...(process.env.ACCELERATE_URL
    ? { accelerateUrl: process.env.ACCELERATE_URL }
    : {}),
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
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Vérifiez votre adresse email — Paginae",
        html: verifyEmailHTML(user.name || "Utilisateur", url),
        text: verifyEmailText(user.name || "Utilisateur", url),
      });
    },
    expiresIn: 3600, // 1 hour
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void sendEmail({
          to: user.email,
          subject: "Confirmez le changement de votre email — Paginae",
          html: changeEmailHTML(user.name || "Utilisateur", url, newEmail),
          text: changeEmailText(user.name || "Utilisateur", url, newEmail),
        });
      },
    },
  },
  plugins: [nextCookies()],
});
