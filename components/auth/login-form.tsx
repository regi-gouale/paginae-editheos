"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { loginFormSchema } from "@/lib/schemas/auth-schema";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [email, setEmail] = useQueryState("loginEmail");
  const [loading, setLoading] = useState(false);

  // Create Form object
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: email || "", password: "" },
  });

  // Handle form submission
  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    setLoading(true);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/",
      rememberMe: true,
    });

    if (result?.error) {
      toast.error("Vous n'êtes pas autorisé à accéder à cette ressource.");
      setLoading(false);
      form.reset({ password: "" });
    } else {
      toast.success(`Connexion réussie ! Redirection...`);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="space-y-4 md:space-y-6 p-8"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold pb-6">
                    Ravi de vous retrouver
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Connectez-vous à votre compte Paginae
                  </p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@editheos.com"
                            type="email"
                            {...field}
                            autoComplete="email"
                            disabled={loading}
                            onChange={(e) => {
                              field.onChange(e);
                              setEmail(e.target.value);
                            }}
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
                    name="password"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="************"
                            type="password"
                            {...field}
                            autoComplete="current-password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription className="flex">
                          <Link
                            href="/auth/forgot-password"
                            className="ml-auto text-sm underline-offset-2 hover:underline w-full text-right"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </FormDescription>
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
                  {loading ? "Connexion..." : "Connexion"}
                </Button>

                <div className="text-center text-sm">
                  Vous n&apos;avez pas de compte ?{" "}
                  <Button
                    variant="link"
                    className="text-sm p-0"
                    onClick={() => {
                      window.location.href = "/auth/register";
                    }}
                    disabled={loading}
                    type="button"
                  >
                    Inscrivez-vous
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <div className="relative hidden md:block max-w-80">
            <Image
              fill
              src="/logo-editheos.webp"
              alt="Logo Editheos"
              className="relative my-auto mx-4 max-h-72 max-w-92 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En cliquant, vous acceptez nos{" "}
        <Link href="#">Conditions d&apos;utilisation</Link> et{" "}
        <Link href="#">Politique de confidentialité</Link>.
      </div>
    </div>
  );
}
