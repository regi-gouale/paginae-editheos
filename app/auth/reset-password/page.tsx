import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe — Paginae",
  description: "Réinitialiser votre mot de passe Paginae.",
  alternates: { canonical: "/auth/reset-password" },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
