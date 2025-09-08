import { SignOutButton } from "@/components/auth/signout-button";
import { DashboardHeader } from "@/components/dashboard-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const breadcrumbs = [{ label: "Tableau de bord", href: "/dashboard" }];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        Page d&apos;accueil
        <SignOutButton />
      </main>
    </div>
  );
}
