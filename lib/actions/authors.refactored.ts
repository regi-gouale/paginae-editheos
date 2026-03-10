"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

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

// Schemas for validation
const addAuthorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  biography: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  nationality: z.string().optional(),
  birthDate: z.date().optional(),
});

// Server Actions following the pattern from instructions
export async function addAuthorAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  try {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      biography: (formData.get("biography") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      nationality: (formData.get("nationality") as string) || undefined,
      birthDate: formData.get("birthDate")
        ? new Date(formData.get("birthDate") as string)
        : undefined,
    };

    const validated = addAuthorSchema.parse(data);

    await prisma.author.create({
      data: {
        ...validated,
        website: validated.website || null,
      },
    });

    revalidatePath("/dashboard/authors");
  } catch (error) {
    console.error("Error adding author:", error);
    throw error;
  }
}

export async function updateAuthorAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  try {
    const id = formData.get("id") as string;
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      biography: (formData.get("biography") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      nationality: (formData.get("nationality") as string) || undefined,
      birthDate: formData.get("birthDate")
        ? new Date(formData.get("birthDate") as string)
        : undefined,
    };

    const validated = addAuthorSchema.parse(data);

    await prisma.author.update({
      where: { id },
      data: {
        ...validated,
        website: validated.website || null,
      },
    });

    revalidatePath("/dashboard/authors");
  } catch (error) {
    console.error("Error updating author:", error);
    throw error;
  }
}

export async function deleteAuthorAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  try {
    const id = formData.get("id") as string;

    await prisma.author.delete({
      where: { id },
    });

    revalidatePath("/dashboard/authors");
  } catch (error) {
    console.error("Error deleting author:", error);
    throw error;
  }
}

const DEFAULT_NATIONALITY = "ALL";

export async function getAuthors(
  filters: AuthorsFilters = {},
): Promise<AuthorsResponse> {
  try {
    const {
      search = "",
      nationality = DEFAULT_NATIONALITY,
      page = 1,
      limit = 10,
    } = filters;

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

    // Exécution des requêtes en parallèle
    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: limit,
      }),
      prisma.author.count({ where }),
    ]);

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
  id: string,
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
    });

    return result
      .map((author) => author.nationality)
      .filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching nationalities:", error);
    return [];
  }
}
