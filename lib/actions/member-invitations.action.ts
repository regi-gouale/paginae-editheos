"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { hashInvitationToken } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";
import type { MemberRole } from "@/prisma/generated/prisma/client";

const invitationTokenSchema = z.string().min(32).max(128);

export type InvitationLookupResult =
  | {
      success: true;
      invitation: {
        email: string;
        name: string;
        role: MemberRole;
        expiresAt: string;
      };
    }
  | { success: false; error: string };

export async function getInvitationForRegistration(
  token: string,
): Promise<InvitationLookupResult> {
  const parsed = invitationTokenSchema.safeParse(token);
  if (!parsed.success) {
    return { success: false, error: "Invitation invalide" };
  }

  const tokenHash = hashInvitationToken(parsed.data);

  const invitation = await prisma.memberInvitation.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!invitation) {
    return { success: false, error: "Invitation introuvable" };
  }

  if (invitation.status !== "PENDING") {
    return { success: false, error: "Cette invitation n'est plus disponible" };
  }

  if (invitation.expiresAt <= new Date()) {
    await prisma.memberInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });

    return { success: false, error: "Cette invitation a expiré" };
  }

  return {
    success: true,
    invitation: {
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString(),
    },
  };
}

export async function acceptInvitationForCurrentUser(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = invitationTokenSchema.safeParse(token);
  if (!parsed.success) {
    return { success: false, error: "Invitation invalide" };
  }

  const tokenHash = hashInvitationToken(parsed.data);

  const invitation = await prisma.memberInvitation.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      status: true,
      expiresAt: true,
      memberId: true,
    },
  });

  if (!invitation) {
    return { success: false, error: "Invitation introuvable" };
  }

  if (invitation.status !== "PENDING") {
    return { success: false, error: "Cette invitation n'est plus valide" };
  }

  if (invitation.expiresAt <= new Date()) {
    await prisma.memberInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    return { success: false, error: "Cette invitation a expiré" };
  }

  if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return {
      success: false,
      error: "Cette invitation ne correspond pas à votre adresse email",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (invitation.memberId) {
        await tx.member.update({
          where: { id: invitation.memberId },
          data: { userId: session.user.id },
        });
      } else {
        const member = await tx.member.findFirst({
          where: {
            email: {
              equals: invitation.email,
              mode: "insensitive",
            },
          },
          select: { id: true },
        });

        if (member) {
          await tx.member.update({
            where: { id: member.id },
            data: { userId: session.user.id },
          });
        }
      }

      await tx.memberInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return {
      success: false,
      error: "Impossible d'activer l'invitation pour ce compte",
    };
  }

  revalidatePath("/dashboard/team");

  return { success: true };
}
