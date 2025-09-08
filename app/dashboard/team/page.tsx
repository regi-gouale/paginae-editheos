import { getMembers } from "@/app/actions/members";
import { DashboardHeader } from "@/components/dashboard-header";
import { MembersTable } from "@/components/members-table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const members = await getMembers();
  const breadcrumbs = [{ label: "Équipes", href: "/dashboard/team" }];

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-comfortaa)",
            }}
          >
            Gestion de l&apos;équipe
          </h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles.
          </p>
        </div>
        <MembersTable members={members} />
      </main>
    </div>
  );
}
