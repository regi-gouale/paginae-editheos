import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function getCurrentSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("No active session");
  return session;
}
