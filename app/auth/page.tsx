import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // const { data: session } = authClient.useSession();

  if (session) {
    redirect("/");
  }

  redirect("/auth/login");
}
