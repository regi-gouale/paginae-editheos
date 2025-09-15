import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MembersTable } from "@/components/members-table";
import { getMembers } from "@/lib/actions/members";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const initialData = await getMembers({ page: 1, limit: 10 });
  const breadcrumbs = [{ label: "Équipes", href: "/dashboard/team" }];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
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
