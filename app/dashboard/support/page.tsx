import { IconClock, IconMail, IconMessageCircle } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SupportContactForm } from "@/components/support/support-contact-form";
import { SupportFaq } from "@/components/support/support-faq";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/auth-lib";

export default async function SupportPage() {
  const session = await getCurrentSession();

  if (!session) redirect("/auth");

  const breadcrumbs = [{ label: "Support", href: "/dashboard/support" }];
  const supportEmail = process.env.SUPPORT_EMAIL || "support@editheos.com";

  return (
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <main className="flex flex-1 flex-col mx-auto p-6 space-y-6 max-w-4xl pt-24">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground">
            Besoin d'aide ? Consultez la FAQ ou contactez directement l'équipe.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMessageCircle className="size-5" />
              Questions fréquentes
            </CardTitle>
            <CardDescription>
              Les réponses aux questions les plus courantes sur Paginae
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupportFaq />
          </CardContent>
        </Card>

        <Card id="contact">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMail className="size-5" />
              Contactez-nous
            </CardTitle>
            <CardDescription>
              Décrivez votre problème ou votre question, l'équipe vous répond
              directement par email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
              <span className="flex items-center gap-2">
                <IconMail className="size-4" />
                {supportEmail}
              </span>
              <span className="flex items-center gap-2">
                <IconClock className="size-4" />
                Réponse sous 24 à 48h ouvrées
              </span>
            </div>
            <SupportContactForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
