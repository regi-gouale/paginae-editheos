import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion — Paginae",
  description: "Se connecter à Paginae — gestion de projets éditoriaux.",
  alternates: { canonical: "/auth/login" },
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 gap-16 sm:p-20 bg-background">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
