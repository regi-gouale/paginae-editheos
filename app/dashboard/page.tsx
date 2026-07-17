import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentActivity from "@/components/dashboard/recent-activity";
import RecentProjects from "@/components/dashboard/recent-projects";
import ProgressChart from "@/components/progress-chart";
import { auth } from "@/lib/auth/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const breadcrumbs = [{ label: "Tableau de bord", href: "/dashboard" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-24 md:p-6 md:pt-24">
        <div className="surface-card-elevated grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Espace éditorial
            </p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Bienvenue, {session.user.name || session.user.email}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Voici un aperçu de l&apos;activité de vos projets et de votre
              équipe.
            </p>
          </div>
        </div>

        <DashboardStats />

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 space-y-6">
            <RecentProjects />
            <ProgressChart />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
