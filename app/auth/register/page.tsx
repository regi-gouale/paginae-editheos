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
    <div className="flex items-center justify-center min-h-screen p-8 gap-16 sm:p-20 bg-background">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
