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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2">
        <MembersTable initialData={initialData} />
      </main>
    </div>
  );
}
