import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthorsTable } from "@/components/authors/authors-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getAuthors } from "@/lib/actions/authors";
import { auth } from "@/lib/auth/auth";
import { canManageAuthors, getAccessContext } from "@/lib/auth/permissions";

export default async function AuthorsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const access = await getAccessContext();
  if (!canManageAuthors(access.role)) {
    redirect("/dashboard/projects");
  }

  const initialData = await getAuthors({ page: 1, limit: 10 });
  const breadcrumbs = [{ label: "Auteurs", href: "/dashboard/authors" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2">
        <AuthorsTable initialData={initialData} />
      </main>
    </div>
  );
}
