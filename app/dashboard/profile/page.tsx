import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileForm } from "@/components/forms/profile-form";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { redirect } from "next/navigation";

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
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
        <h1 className="text-2xl font-semibold mb-4">Mon profil</h1>
        <div className="bg-card p-4 rounded-md">
          <ProfileForm initial={initial} />
        </div>
      </main>
    </div>
  );
}
