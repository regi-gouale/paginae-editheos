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
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        <div className="space-y-2">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-lato)",
            }}
          >
            Gestion de l&apos;équipe
          </h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles.
          </p>
        </div>
        <MembersTable initialData={initialData} />
      </main>
    </div>
  );
}
