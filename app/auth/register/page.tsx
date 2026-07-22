import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription — Paginae",
  description: "Créer un compte Paginae — gestion de projets éditoriaux.",
  alternates: { canonical: "/auth/register" },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
