"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  initialToken?: string;
}

export function ResetPasswordForm({ initialToken }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = initialToken || searchParams.get("token");

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      setError("Aucun token de réinitialisation trouvé. Veuillez réessayer.");
    }
  }, [token]);

  async function onSubmit(data: ResetPasswordForm) {
    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (resetError) {
      setError(
        resetError.message ||
          "Erreur lors de la réinitialisation du mot de passe",
      );
      setLoading(false);
    } else {
      toast.success("Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    }
  }

  if (error && !token) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="space-y-4 md:space-y-6 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold pb-2">Lien invalide</h1>
                <p className="text-muted-foreground text-balance mb-6">
                  Le lien de réinitialisation est invalide ou a expiré.
                </p>

                <Button
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full"
                >
                  Demander un nouveau lien
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="space-y-4 md:space-y-6 p-8"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold pb-2">
                    Réinitialiser le mot de passe
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Créez un nouveau mot de passe sécurisé
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="●●●●●●●●"
                            type="password"
                            {...field}
                            autoComplete="new-password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmez le mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="●●●●●●●●"
                            type="password"
                            {...field}
                            autoComplete="new-password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-800">
                  <strong>Critères de sécurité :</strong>
                  <ul className="mt-2 space-y-1">
                    <li>
                      ✓ Minimum 8 caractères{" "}
                      {form.watch("password").length >= 8 && "✔"}
                    </li>
                    <li>
                      ✓ Au moins une majuscule{" "}
                      {/[A-Z]/.test(form.watch("password")) && "✔"}
                    </li>
                    <li>
                      ✓ Au moins une minuscule{" "}
                      {/[a-z]/.test(form.watch("password")) && "✔"}
                    </li>
                    <li>
                      ✓ Au moins un chiffre{" "}
                      {/[0-9]/.test(form.watch("password")) && "✔"}
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading
                    ? "Réinitialisation..."
                    : "Réinitialiser le mot de passe"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
