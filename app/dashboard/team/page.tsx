import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MembersTable } from "@/components/membres/members-table";
import { getMembers } from "@/lib/actions/members";
import { auth } from "@/lib/auth/auth";
import { canManageTeam, getAccessContext } from "@/lib/auth/permissions";

export default async function TeamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const access = await getAccessContext();
  if (!canManageTeam(access.role)) {
    redirect("/dashboard/projects");
  }

  const initialData = await getMembers({ page: 1, limit: 10 });
  const breadcrumbs = [{ label: "Équipes", href: "/dashboard/team" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Gestion de l&apos;équipe
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Gérez les membres, les rôles et les accès de votre espace de
              travail.
            </p>
          </div>
        </section>
        <section className="surface-card-elevated rounded-2xl p-4 md:p-6">
          <MembersTable initialData={initialData} />
        </section>
      </main>
    </div>
  );
}
