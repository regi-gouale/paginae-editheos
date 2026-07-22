import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe — Paginae",
  description: "Réinitialiser votre mot de passe Paginae.",
  alternates: { canonical: "/auth/reset-password" },
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-6 p-4 md:p-6">
      <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="relative flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Définissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </div>
      </section>
      <section className="surface-card-elevated mx-auto w-full max-w-4xl rounded-2xl p-4 md:p-6">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
