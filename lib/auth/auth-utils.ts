"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isEmailWhitelisted } from "@/lib/whitelist";

/**
 * Obtient la session utilisateur actuelle de manière sécurisée
 * Utilise le cache React pour éviter les appels multiples
 */
export const getCurrentSession = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

/**
 * Obtient l'utilisateur requis ou redirige vers la page d'authentification
 * Vérifie également que l'email est dans la whitelist
 */
export const getRequiredUser = cache(async () => {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Vérification de la whitelist
  if (!isEmailWhitelisted(session.user.email)) {
    redirect("/auth?error=unauthorized");
  }

  return session.user;
});

/**
 * Vérifie si l'utilisateur est authentifié sans redirection
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * Vérifie les permissions d'un utilisateur sur un projet
 */
export async function hasProjectPermission(
  projectId: string,
  requiredPermission: "read" | "write" | "delete" = "read"
): Promise<boolean> {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    return false;
  }

  // Import dynamique pour éviter les dépendances circulaires
  const { prisma } = await import("@/lib/prisma");
  
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          {
            members: {
              some: {
                email: session.user.email,
              },
            },
          },
          {
            authors: {
              some: {
                email: session.user.email,
              },
            },
          },
        ],
      },
      include: {
        members: {
          where: {
            email: session.user.email,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!project) {
      return false;
    }

    // Logic des permissions basée sur le rôle
    const member = project.members[0];
    if (!member) {
      // Si l'utilisateur est auteur mais pas membre, accès en lecture seule
      return requiredPermission === "read";
    }

    switch (requiredPermission) {
      case "read":
        return true; // Tous les membres peuvent lire
      case "write":
        return ["ADMIN", "DESIGNER", "CONTRIBUTOR"].includes(member.role);
      case "delete":
        return member.role === "ADMIN";
      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking project permission:", error);
    return false;
  }
}

/**
 * Middleware pour vérifier les permissions sur les server actions
 */
export async function requireProjectPermission(
  projectId: string,
  permission: "read" | "write" | "delete" = "read"
) {
  const hasPermission = await hasProjectPermission(projectId, permission);
  
  if (!hasPermission) {
    throw new Error("Insufficient permissions for this action");
  }
}

/**
 * Obtient l'utilisateur avec validation stricte des permissions
 */
export async function getRequiredUserWithProjectPermission(
  projectId: string,
  permission: "read" | "write" | "delete" = "read"
) {
  const user = await getRequiredUser();
  await requireProjectPermission(projectId, permission);
  return user;
}