import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion — Paginae",
  description: "Se connecter à Paginae — gestion de projets éditoriaux.",
  alternates: { canonical: "/auth/login" },
};

export default function LoginPage() {
  return <LoginForm />;
}
