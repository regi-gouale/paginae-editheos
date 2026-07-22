import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié — Paginae",
  description: "Réinitialiser votre mot de passe Paginae.",
  alternates: { canonical: "/auth/forgot-password" },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
