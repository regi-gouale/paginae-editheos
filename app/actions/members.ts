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

export async function getMembers(): Promise<Member[]> {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
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
