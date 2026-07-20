"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { canManageAuthors, getAccessContext } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { generateAuthorSlug } from "@/lib/utils";
import { Prisma } from "@/prisma/generated/prisma/client";

export type Author = {
  organizationId?: string | null;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  slug: string | null;
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
async function _addAuthorAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) redirect("/auth");

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    throw new Error("Vous n'avez pas la permission d'ajouter un auteur");
  }

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
        slug: generateAuthorSlug(validated.firstName, validated.lastName),
      },
    });

    revalidatePath("/dashboard/authors");
  } catch (error) {
    console.error("Error adding author:", error);
    throw error;
  }
}

export async function updateAuthorAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) redirect("/auth");

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    throw new Error("Vous n'avez pas la permission de modifier un auteur");
  }

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

    const updatedAuthor = await prisma.author.update({
      where: { id },
      data: {
        ...validated,
        website: validated.website || null,
      },
    });

    revalidatePath("/dashboard/authors");
    revalidatePath(`/dashboard/authors/${updatedAuthor.slug}`);
  } catch (error) {
    console.error("Error updating author:", error);
    throw error;
  }
}

async function _deleteAuthorAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) redirect("/auth");

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    throw new Error("Vous n'avez pas la permission de supprimer un auteur");
  }

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

    // Récupération du nombre total d'éléments
    const total = await prisma.author.count({
      where,
    });

    // Récupération des auteurs avec pagination
    const authors = await prisma.author.findMany({
      where,
      orderBy: {
        lastName: "asc",
      },
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
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
    const access = await getAccessContext();
    if (!canManageAuthors(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

    const author = await prisma.author.create({
      data: {
        ...data,
        slug: generateAuthorSlug(data.firstName, data.lastName),
      },
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
    const access = await getAccessContext();
    if (!canManageAuthors(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

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

// Fonction pour récupérer un auteur par ID
async function _getAuthorById(id: string): Promise<Author | null> {
  const session = await getCurrentSession();
  if (!session) redirect("/auth");

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    throw new Error("Acces refuse");
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id },
    });

    return author;
  } catch (error) {
    console.error("Error fetching author:", error);
    return null;
  }
}

// Fonction pour récupérer un auteur par slug
export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const session = await getCurrentSession();
  if (!session) redirect("/auth");

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    throw new Error("Acces refuse");
  }

  try {
    const author = await prisma.author.findUnique({
      where: { slug },
    });

    return author;
  } catch (error) {
    console.error("Error fetching author by slug:", error);
    return null;
  }
}
