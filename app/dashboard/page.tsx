import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import ProgressChart from "@/components/progress-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import RecentProjects from "@/components/dashboard/recent-projects";
import { auth } from "@/lib/auth/auth";
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
    <div className="flex flex-col gap-6">
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 space-y-6 p-6 pt-24 max-w-6xl mx-auto">
        {/* Message de bienvenue */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue, {session.user.name || session.user.email}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de l&apos;activité de vos projets et de votre
            équipe.
          </p>
        </div>

        {/* Statistiques principales */}
        <DashboardStats />

        {/* Grille principale */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <RecentProjects />
            <ProgressChart />
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
