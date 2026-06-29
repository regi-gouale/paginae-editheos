import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function getCurrentSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session;
}
