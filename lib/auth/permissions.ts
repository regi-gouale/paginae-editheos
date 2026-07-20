import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";
import type {
  MemberRole,
  ProjectStatus,
} from "@/prisma/generated/prisma/client";

export type AccessContext = {
  userId: string;
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

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, role: true },
  });

  const role: MemberRole = member?.role ?? "GUEST";

  return {
    userId: session.user.id,
    role,
    memberId: member?.id ?? null,
    isAdmin: role === "ADMIN",
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
      members: { some: { userId: context.userId } },
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
      members: { some: { userId: context.userId } },
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Acces refuse a ce projet");
  }
}
