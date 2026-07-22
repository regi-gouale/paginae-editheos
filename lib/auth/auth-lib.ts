import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { userId: session.user.id },
        {
          email: {
            equals: session.user.email,
            mode: "insensitive",
          },
        },
      ],
    },
    select: { id: true },
  });

  if (!member) {
    await prisma.session.deleteMany({
      where: { userId: session.user.id },
    });
    return null;
  }

  return session;
}
