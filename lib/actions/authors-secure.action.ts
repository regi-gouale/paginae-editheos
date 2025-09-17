"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma";
import { createSecureServerAction } from "@/lib/security/actions-utils";
import { 
  secureNameSchema, 
  secureEmailSchema, 
  secureUrlSchema, 
  secureTextSchema, 
  secureIdSchema,
  paginationSchema,
  searchFiltersSchema
} from "@/lib/security/validation";
import { logger } from "@/lib/security/logger";

export type Author = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  biography?: string | null;
  website?: string | null;
  nationality?: string | null;
  birthDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthorsFilters = {
  search?: string;
  nationality?: string;
  page?: number;
  limit?: number;
};

export type AuthorsResponse = {
  authors: Author[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

// Schemas de validation sécurisés
const addAuthorSchema = z.object({
  firstName: secureNameSchema,
  lastName: secureNameSchema,
  email: secureEmailSchema,
  biography: secureTextSchema.optional(),
  website: secureUrlSchema.optional().or(z.literal("")),
  nationality: z.string().max(100, "Nationalité trop longue").optional(),
  birthDate: z.string().datetime("Date invalide").transform(date => new Date(date)).optional(),
});

const updateAuthorSchema = z.object({
  id: secureIdSchema,
  firstName: secureNameSchema,
  lastName: secureNameSchema,
  email: secureEmailSchema,
  biography: secureTextSchema.optional(),
  website: secureUrlSchema.optional().or(z.literal("")),
  nationality: z.string().max(100, "Nationalité trop longue").optional(),
  birthDate: z.string().datetime("Date invalide").transform(date => new Date(date)).optional(),
});

const deleteAuthorSchema = z.object({
  id: secureIdSchema,
});

// Actions serveur sécurisées
export const addAuthorSecureAction = createSecureServerAction(
  addAuthorSchema,
  async (validatedData, userId) => {
    // Vérifier si l'email existe déjà
    const existingAuthor = await prisma.author.findUnique({
      where: { email: validatedData.email },
    });

    if (existingAuthor) {
      throw new Error("Un auteur avec cet email existe déjà");
    }

    await prisma.author.create({
      data: {
        ...validatedData,
        website: validatedData.website || null,
      },
    });
    
    revalidatePath("/dashboard/authors");
    
    logger.auditLog("create_author", userId!, {
      authorEmail: "[EMAIL_REDACTED]",
      authorName: `${validatedData.firstName} ${validatedData.lastName}`,
    });
    
    return { success: true };
  },
  {
    action: "add_author",
    requireAuth: true,
    allowedFields: ["firstName", "lastName", "email", "biography", "website", "nationality", "birthDate"],
    logSensitive: true,
  }
);

export const updateAuthorSecureAction = createSecureServerAction(
  updateAuthorSchema,
  async (validatedData, userId) => {
    const { id, ...updateData } = validatedData;
    
    // Vérifier que l'auteur existe
    const existingAuthor = await prisma.author.findUnique({
      where: { id },
    });

    if (!existingAuthor) {
      throw new Error("Auteur non trouvé");
    }

    // Vérifier si le nouvel email existe déjà (sauf pour l'auteur actuel)
    if (updateData.email !== existingAuthor.email) {
      const emailExists = await prisma.author.findFirst({
        where: { 
          email: updateData.email,
          id: { not: id }
        },
      });

      if (emailExists) {
        throw new Error("Un auteur avec cet email existe déjà");
      }
    }
    
    await prisma.author.update({
      where: { id },
      data: {
        ...updateData,
        website: updateData.website || null,
      },
    });
    
    revalidatePath("/dashboard/authors");
    
    logger.auditLog("update_author", userId!, {
      authorId: id,
      authorName: `${updateData.firstName} ${updateData.lastName}`,
    });
    
    return { success: true };
  },
  {
    action: "update_author",
    requireAuth: true,
    allowedFields: ["id", "firstName", "lastName", "email", "biography", "website", "nationality", "birthDate"],
    logSensitive: true,
  }
);

export const deleteAuthorSecureAction = createSecureServerAction(
  deleteAuthorSchema,
  async (validatedData, userId) => {
    // Vérifier que l'auteur existe
    const existingAuthor = await prisma.author.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingAuthor) {
      throw new Error("Auteur non trouvé");
    }

    // Vérifier s'il y a des projets liés
    const projectsCount = await prisma.project.count({
      where: {
        authors: {
          some: {
            id: validatedData.id,
          },
        },
      },
    });

    if (projectsCount > 0) {
      throw new Error(`Impossible de supprimer l'auteur: ${projectsCount} projet(s) associé(s)`);
    }

    await prisma.author.delete({
      where: { id: validatedData.id },
    });
    
    revalidatePath("/dashboard/authors");
    
    logger.auditLog("delete_author", userId!, {
      authorId: validatedData.id,
      authorName: `${existingAuthor.firstName} ${existingAuthor.lastName}`,
    });
    
    return { success: true };
  },
  {
    action: "delete_author",
    requireAuth: true,
    allowedFields: ["id"],
    logSensitive: true,
  }
);

/**
 * Fonction sécurisée pour récupérer les auteurs avec filtres
 */
export async function getAuthorsSecure(
  filters: AuthorsFilters = {}
): Promise<AuthorsResponse> {
  try {
    const {
      search = "",
      nationality = "ALL",
      page = 1,
      limit = 10,
    } = filters;

    // Validation des paramètres
    const validatedPagination = paginationSchema.parse({
      page: page.toString(),
      limit: limit.toString(),
    });

    const skip = (validatedPagination.page - 1) * validatedPagination.limit;

    // Construction sécurisée des filtres
    const where: Prisma.AuthorWhereInput = {};

    // Recherche sécurisée
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().substring(0, 255); // Limite la longueur
      where.OR = [
        { firstName: { contains: sanitizedSearch, mode: "insensitive" } },
        { lastName: { contains: sanitizedSearch, mode: "insensitive" } },
        { email: { contains: sanitizedSearch, mode: "insensitive" } },
      ];
    }

    // Filtre par nationalité
    if (nationality && nationality !== "ALL") {
      where.nationality = nationality.substring(0, 100); // Limite la longueur
    }

    // Requête sécurisée avec timeout implicite via Prisma
    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: validatedPagination.limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          biography: true,
          website: true,
          nationality: true,
          birthDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.author.count({ where }),
    ]);

    const totalPages = Math.ceil(total / validatedPagination.limit);

    return {
      authors,
      total,
      totalPages,
      currentPage: validatedPagination.page,
      hasNextPage: validatedPagination.page < totalPages,
      hasPrevPage: validatedPagination.page > 1,
    };
  } catch (error) {
    logger.error("Error fetching authors", error as Error, { filters });
    throw new Error("Erreur lors de la récupération des auteurs");
  }
}

/**
 * Fonction sécurisée pour récupérer un auteur par ID
 */
export async function getAuthorByIdSecure(id: string): Promise<Author | null> {
  try {
    // Validation de l'ID
    const validatedId = secureIdSchema.parse(id);

    const author = await prisma.author.findUnique({
      where: { id: validatedId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        biography: true,
        website: true,
        nationality: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return author;
  } catch (error) {
    logger.error("Error fetching author by ID", error as Error, { authorId: id });
    return null;
  }
}