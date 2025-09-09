"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma";

export interface Author {
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
}

export interface AuthorsFilters {
  search?: string;
  nationality?: string;
  page?: number;
  limit?: number;
}

export interface AuthorsResponse {
  authors: Author[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getAuthors(
  filters: AuthorsFilters = {}
): Promise<AuthorsResponse> {
  try {
    const { search = "", nationality = "ALL", page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    // Construction des conditions de filtrage
    const where: Prisma.AuthorWhereInput = {};

    // Recherche par nom, prénom ou email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtre par nationalité
    if (nationality && nationality !== "ALL") {
      where.nationality = nationality;
    }

    // Récupération du nombre total d'éléments
    const total = await prisma.author.count({
      where,
      cacheStrategy: {
        ttl: 180, // Cache pendant 180 secondes
      },
    });

    // Récupération des auteurs avec pagination
    const authors = await prisma.author.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      cacheStrategy: {
        ttl: 180, // Cache pendant 180 secondes
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      authors,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error("Error fetching authors:", error);
    return {
      authors: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

export async function addAuthor(data: {
  firstName: string;
  lastName: string;
  email: string;
  biography?: string;
  website?: string;
  nationality?: string;
  birthDate?: Date;
}): Promise<{ success: boolean; author?: Author; error?: string }> {
  try {
    const author = await prisma.author.create({
      data,
    });

    return { success: true, author };
  } catch (error) {
    console.error("Error adding author:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Un auteur avec cet email existe déjà",
        };
      }
    }
    return { success: false, error: "Erreur lors de l'ajout de l'auteur" };
  }
}

export async function deleteAuthor(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.author.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting author:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de l'auteur",
    };
  }
}

export async function getNationalities(): Promise<string[]> {
  try {
    const result = await prisma.author.findMany({
      select: {
        nationality: true,
      },
      distinct: ["nationality"],
      where: {
        nationality: {
          not: null,
        },
      },
      cacheStrategy: {
        ttl: 3600, // Cache pendant 1 heure
      },
    });

    return result
      .map((author) => author.nationality)
      .filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching nationalities:", error);
    return [];
  }
}
