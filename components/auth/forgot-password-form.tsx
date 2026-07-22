"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconAt, IconMailCheck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

const forgotPasswordSchema = z.object({
  email: z
    .email("Veuillez entrer une adresse email valide.")
    .min(1, "L'email est requis"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordForm) {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Erreur lors de l'envoi de l'email");
      }

      setSubmitted(true);
      toast.success(
        "Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.",
      );
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="space-y-4 md:space-y-6 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-700">
                  <IconMailCheck className="size-6" />
                </div>
                <h1 className="text-2xl font-bold pb-2">
                  Vérifiez votre email
                </h1>
                <p className="text-muted-foreground text-balance mb-6">
                  Nous avons envoyé un lien de réinitialisation à :
                </p>
                <p className="font-medium text-sm mb-6">
                  {form.getValues("email")}
                </p>

                <div className="space-y-4 w-full">
                  <p className="text-sm text-muted-foreground">
                    Le lien expire dans 1 heure. Si vous ne voyez pas
                    l&apos;email, vérifiez votre dossier spam.
                  </p>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSubmitted(false);
                      form.reset();
                    }}
                  >
                    Envoyer un autre email
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-primary hover:underline"
                    >
                      Retour à la connexion
                    </Link>
                  </div>
                </div>
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
                    Mot de passe oublié
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </p>
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IconAt className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="email@editheos.com"
                              type="email"
                              {...field}
                              autoComplete="email"
                              disabled={loading}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading
                    ? "Envoi en cours..."
                    : "Envoyer le lien de réinitialisation"}
                </Button>

                <div className="text-center text-sm">
                  Vous vous souvenez de votre mot de passe ?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Connexion
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="hidden relative md:block">
            <Image
              fill
              src="/logo-editheos.webp"
              alt="Image"
              className="relative my-auto max-w-96 max-h-72 object-cover "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
