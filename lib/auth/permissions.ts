import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";
import type {
  MemberRole,
  Prisma,
  ProjectStatus,
} from "@/prisma/generated/prisma/client";

export type AccessContext = {
  userId: string;
  userEmail: string;
  role: MemberRole;
  memberId: string | null;
  isAdmin: boolean;
};

const CONTRIBUTOR_FORBIDDEN_STATUSES: ProjectStatus[] = ["DONE", "REJECTED"];
const DESIGNER_ALLOWED_UPDATE_KEYS = new Set(["description", "fileUrl"]);

export async function getAccessContext(): Promise<AccessContext> {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    throw new Error("Non authentifie");
  }

  let member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, role: true },
  });

  if (!member) {
    const memberByEmail = await prisma.member.findFirst({
      where: {
        email: {
          equals: session.user.email,
          mode: "insensitive",
        },
      },
      select: { id: true, role: true, userId: true },
    });

    if (memberByEmail) {
      if (!memberByEmail.userId) {
        try {
          await prisma.member.update({
            where: { id: memberByEmail.id },
            data: { userId: session.user.id },
          });
        } catch (error) {
          console.error("Error auto-linking member to user:", error);
        }
      }

      member = {
        id: memberByEmail.id,
        role: memberByEmail.role,
      };

      await prisma.memberInvitation.updateMany({
        where: {
          email: {
            equals: session.user.email,
            mode: "insensitive",
          },
          status: "PENDING",
        },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });
    }
  }

  if (!member) {
    throw new Error("Acces revoque");
  }

  const role: MemberRole = member.role;

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    role,
    memberId: member.id,
    isAdmin: role === "ADMIN",
  };
}

export function getProjectAssignmentScope(
  context: AccessContext,
): Prisma.ProjectWhereInput {
  if (context.isAdmin) {
    return {};
  }

  return {
    OR: [
      {
        members: {
          some: {
            userId: context.userId,
          },
        },
      },
      {
        members: {
          some: {
            email: context.userEmail,
          },
        },
      },
    ],
  };
}

export function canCreateProject(role: MemberRole) {
  return role === "ADMIN" || role === "CONTRIBUTOR";
}

export function canManageAuthors(role: MemberRole) {
  return role === "ADMIN" || role === "CONTRIBUTOR";
}

export function canManageTeam(role: MemberRole) {
  return role === "ADMIN";
}

export function canCommentOnProject(role: MemberRole) {
  return role !== "GUEST";
}

export function canManageProjectWork(role: MemberRole) {
  return role === "ADMIN" || role === "CONTRIBUTOR" || role === "DESIGNER";
}

export function canUpdateProjectPayload(
  role: MemberRole,
  payload: {
    title?: string;
    description?: string;
    status?: ProjectStatus;
    dueDate?: Date;
    columnId?: string;
    authorIds?: string[];
    memberIds?: string[];
    slug?: string;
    fileUrl?: string;
    statusComment?: string;
  },
) {
  if (role === "ADMIN") {
    return true;
  }

  if (role === "REVIEWER" || role === "GUEST") {
    return false;
  }

  if (payload.memberIds !== undefined) {
    return false;
  }

  if (role === "DESIGNER") {
    const usedKeys = Object.entries(payload)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);

    return usedKeys.every((key) => DESIGNER_ALLOWED_UPDATE_KEYS.has(key));
  }

  if (role === "CONTRIBUTOR") {
    if (
      payload.status &&
      CONTRIBUTOR_FORBIDDEN_STATUSES.includes(payload.status)
    ) {
      return false;
    }
    return true;
  }

  return false;
}

export async function assertProjectVisibility(
  context: AccessContext,
  projectId: string,
) {
  if (context.isAdmin) {
    return;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...getProjectAssignmentScope(context),
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Acces refuse a ce projet");
  }
}

export async function assertProjectVisibilityBySlug(
  context: AccessContext,
  slug: string,
) {
  if (context.isAdmin) {
    return;
  }

  const project = await prisma.project.findFirst({
    where: {
      slug,
      ...getProjectAssignmentScope(context),
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Acces refuse a ce projet");
  }
}
