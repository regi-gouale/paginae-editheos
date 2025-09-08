"use server";

import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST";
  createdAt: Date;
  updatedAt: Date;
}

export interface MembersFilters {
  search?: string;
  role?: "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST" | "ALL";
  page?: number;
  limit?: number;
}

export interface MembersResponse {
  members: Member[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getMembers(
  filters: MembersFilters = {}
): Promise<MembersResponse> {
  try {
    const { search = "", role = "ALL", page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    // Construction des conditions de filtrage
    const where: any = {};

    // Recherche par nom ou email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtre par rôle
    if (role && role !== "ALL") {
      where.role = role;
    }

    // Récupération du nombre total d'éléments
    const total = await prisma.member.count({ where });

    // Récupération des membres avec pagination
    const members = await prisma.member.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      members,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error("Error fetching members:", error);
    return {
      members: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

export async function addMember(data: {
  name: string;
  email: string;
  role: "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST";
}): Promise<{ success: boolean; member?: Member; error?: string }> {
  try {
    const member = await prisma.member.create({
      data,
    });
    return { success: true, member };
  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, error: "Erreur lors de l'ajout du membre" };
  }
}

export async function deleteMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.member.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting member:", error);
    return { success: false, error: "Erreur lors de la suppression du membre" };
  }
}
