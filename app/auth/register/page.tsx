import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription — Paginae",
  description: "Créer un compte Paginae — gestion de projets éditoriaux.",
  alternates: { canonical: "/auth/register" },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-6 p-4 md:p-6">
      <section className="grid-pattern relative overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="relative flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Inscription
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Créez votre compte pour collaborer sur vos projets éditoriaux.
          </p>
        </div>
      </section>
      <section className="surface-card-elevated mx-auto w-full max-w-4xl rounded-2xl p-4 md:p-6">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </section>
    </main>
  );
}
