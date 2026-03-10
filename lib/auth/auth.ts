import { PrismaClient } from "@/prisma/generated/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { generateMemberSlug } from "@/lib/utils";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  user: {
    // Hook appelé après la création d'un utilisateur
    async onCreate(user) {
      try {
        // Vérifier si un membre existe déjà avec cet email
        const existingMember = await prisma.member.findUnique({
          where: { email: user.email },
        });

        if (existingMember && !existingMember.userId) {
          // Lier le membre existant à l'utilisateur
          await prisma.member.update({
            where: { id: existingMember.id },
            data: { userId: user.id },
          });
          console.log(`✅ Membre existant lié à l'utilisateur: ${user.email}`);
        } else if (!existingMember) {
          // Créer un nouveau membre pour cet utilisateur
          const slug = generateMemberSlug(user.name);
          await prisma.member.create({
            data: {
              email: user.email,
              name: user.name,
              role: "CONTRIBUTOR", // Rôle par défaut
              slug,
              userId: user.id,
            },
          });
          console.log(
            `✅ Nouveau membre créé pour l'utilisateur: ${user.email}`,
          );
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de la création du membre pour ${user.email}:`,
          error,
        );
        // Ne pas bloquer la création de l'utilisateur si la création du membre échoue
      }
    },
  },
});
