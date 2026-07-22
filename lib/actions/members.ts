"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { canManageTeam, getAccessContext } from "@/lib/auth/permissions";
import {
  memberInvitationEmailHTML,
  memberInvitationEmailText,
} from "@/lib/email/member-invitation-template";
import { sendEmail } from "@/lib/email/usesend";
import {
  buildInvitationLink,
  generateInvitationToken,
  getInvitationExpiresAt,
  hashInvitationToken,
} from "@/lib/invitations";
import { prisma } from "@/lib/prisma";
import { generateMemberSlug } from "@/lib/utils";
import type { Prisma } from "@/prisma/generated/prisma/client";

const addMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  role: z.enum(["ADMIN", "DESIGNER", "REVIEWER", "CONTRIBUTOR", "GUEST"]),
});

const memberRoleLabels = {
  ADMIN: "Administrateur",
  DESIGNER: "Designer",
  REVIEWER: "Relecteur",
  CONTRIBUTOR: "Contributeur",
  GUEST: "Invite",
} as const;

export interface Member {
  id: string;
  name: string;
  email: string;
  slug: string | null;
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
  filters: MembersFilters = {},
): Promise<MembersResponse> {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      throw new Error("Non authentifie");
    }

    const access = await getAccessContext();
    if (!canManageTeam(access.role)) {
      throw new Error("Acces refuse");
    }

    const { search = "", role = "ALL", page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    // Construction des conditions de filtrage
    const where: Prisma.MemberWhereInput = {};

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
    const total = await prisma.member.count({
      where,
    });

    // Récupération des membres avec pagination
    const members = await prisma.member.findMany({
      where,
      orderBy: {
        name: "asc",
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
}): Promise<{
  success: boolean;
  member?: Member;
  invitationSent?: boolean;
  error?: string;
}> {
  try {
    const access = await getAccessContext();
    if (!canManageTeam(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

    const parsed = addMemberSchema.safeParse({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
    });

    if (!parsed.success) {
      return { success: false, error: "Donnees membre invalides" };
    }

    const payload = parsed.data;

    const member = await prisma.member.upsert({
      where: { email: payload.email },
      create: {
        ...payload,
        slug: generateMemberSlug(payload.name),
      },
      update: {
        name: payload.name,
        role: payload.role,
      },
    });

    const rawToken = generateInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);
    const expiresAt = getInvitationExpiresAt();

    await prisma.memberInvitation.updateMany({
      where: {
        email: payload.email,
        status: "PENDING",
      },
      data: {
        status: "REVOKED",
      },
    });

    await prisma.memberInvitation.create({
      data: {
        email: payload.email,
        name: payload.name,
        role: payload.role,
        tokenHash,
        expiresAt,
        invitedById: access.userId,
        memberId: member.id,
      },
    });

    const invitationLink = buildInvitationLink(
      rawToken,
      payload.email,
      payload.name,
    );

    let invitationSent = true;
    let invitationWarning: string | undefined;

    try {
      await sendEmail({
        to: payload.email,
        subject: "Invitation a rejoindre Paginae",
        html: memberInvitationEmailHTML(
          payload.name,
          invitationLink,
          memberRoleLabels[payload.role],
        ),
        text: memberInvitationEmailText(
          payload.name,
          invitationLink,
          memberRoleLabels[payload.role],
        ),
      });
    } catch (emailError) {
      console.error("Error sending member invitation:", emailError);
      invitationSent = false;
      invitationWarning =
        "Membre cree, mais l'email d'invitation n'a pas pu etre envoye";
    }

    revalidatePath("/dashboard/team");

    return {
      success: true,
      member,
      invitationSent,
      error: invitationWarning,
    };
  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, error: "Erreur lors de l'ajout du membre" };
  }
}

async function _getMemberById(
  id: string,
): Promise<{ success: boolean; member?: Member; error?: string }> {
  try {
    const access = await getAccessContext();
    if (!canManageTeam(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return { success: false, error: "Membre non trouvé" };
    }

    return { success: true, member };
  } catch (error) {
    console.error("Error fetching member:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du membre",
    };
  }
}

export async function getMemberBySlug(
  slug: string,
): Promise<{ success: boolean; member?: Member; error?: string }> {
  try {
    const access = await getAccessContext();
    if (!canManageTeam(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

    const member = await prisma.member.findUnique({
      where: { slug },
    });

    if (!member) {
      return { success: false, error: "Membre non trouvé" };
    }

    return { success: true, member };
  } catch (error) {
    console.error("Error fetching member by slug:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du membre",
    };
  }
}

export async function updateMember(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: "ADMIN" | "DESIGNER" | "REVIEWER" | "CONTRIBUTOR" | "GUEST";
  },
): Promise<{ success: boolean; member?: Member; error?: string }> {
  try {
    const access = await getAccessContext();
    if (!canManageTeam(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

    const member = await prisma.member.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/team");
    if (member.slug) {
      revalidatePath(`/dashboard/team/${member.slug}`);
    }
    return { success: true, member };
  } catch (error) {
    console.error("Error updating member:", error);
    return {
      success: false,
      error: "Erreur lors de la modification du membre",
    };
  }
}

export async function deleteMember(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const access = await getAccessContext();
    if (!canManageTeam(access.role)) {
      return { success: false, error: "Acces refuse" };
    }

    const member = await prisma.member.findUnique({
      where: { id },
      select: { userId: true, email: true },
    });

    if (!member) {
      return { success: false, error: "Membre non trouvé" };
    }

    await prisma.$transaction(async (tx) => {
      if (member.userId) {
        await tx.session.deleteMany({
          where: { userId: member.userId },
        });
      }

      await tx.memberInvitation.updateMany({
        where: {
          email: {
            equals: member.email,
            mode: "insensitive",
          },
          status: "PENDING",
        },
        data: {
          status: "REVOKED",
        },
      });

      await tx.member.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard/team");
    return { success: true };
  } catch (error) {
    console.error("Error deleting member:", error);
    return { success: false, error: "Erreur lors de la suppression du membre" };
  }
}
