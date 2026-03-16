import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe — Paginae",
  description: "Réinitialiser votre mot de passe Paginae.",
  alternates: { canonical: "/auth/reset-password" },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 gap-16 sm:p-20 bg-background">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
