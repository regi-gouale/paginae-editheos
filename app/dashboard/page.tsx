import { IconLayoutKanban, IconUsers } from "@tabler/icons-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentActivity from "@/components/dashboard/recent-activity";
import RecentProjects from "@/components/dashboard/recent-projects";
import ProgressChart from "@/components/progress-chart";
import { Button } from "@/components/ui/button";
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <div className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Bienvenue, {session.user.name || session.user.email}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Voici un aperçu de l&apos;activité de vos projets et de votre
                équipe.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" className="rounded-full">
                <Link href="/dashboard/projects">
                  <IconLayoutKanban className="size-4" />
                  Voir le Kanban
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <Link href="/dashboard/team">
                  <IconUsers className="size-4" />
                  Gérer l&apos;équipe
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <DashboardStats />

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="flex flex-col gap-6 xl:col-span-8">
            <RecentProjects />
            <ProgressChart />
          </div>

          <div className="flex flex-col gap-6 xl:col-span-4">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
