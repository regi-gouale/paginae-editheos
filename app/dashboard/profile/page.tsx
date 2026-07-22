import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileForm } from "@/components/forms/profile-form";
import { getCurrentSession } from "@/lib/auth/auth-lib";

export default async function ProfilePage() {
  const session = await getCurrentSession();

  if (!session) redirect("/auth");

  const user = session.user;

  const initial = {
    name: user.name || "",
    email: user.email || "",
    image: user.image || undefined,
  };

  const breadcrumbs = [{ label: "Mon profil", href: "/dashboard/profile" }];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-8">
        <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="relative flex flex-col gap-2">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Mon profil
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Mettez a jour vos informations personnelles et vos préférences.
            </p>
          </div>
        </section>

        <section className="surface-card-elevated rounded-2xl p-4 md:p-6">
          <ProfileForm initial={initial} />
        </section>
      </main>
    </div>
  );
}
