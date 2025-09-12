"use client";

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
import { authClient } from "@/lib/auth-client";
import { registerFormSchema } from "@/lib/schemas/auth-schema";
import { cn } from "@/lib/utils";
import { isEmailWhitelisted } from "@/lib/whitelist";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function RegisterForm() {
  const [email, setEmail] = useQueryState("email");
  const [name, setName] = useQueryState("name");
  const [loading, setLoading] = useState(false);

  // Create Form object
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: name || "", email: email || "", password: "" },
  });

  // Handle form submission
  async function onSubmit(data: z.infer<typeof registerFormSchema>) {
    setLoading(true);
    const normalizedEmail = data.email.trim().toLowerCase();
    const emailIsWhitelisted = isEmailWhitelisted(normalizedEmail);
    if (!emailIsWhitelisted) {
      toast.error("Cette adresse email n'est pas autorisée à s'inscrire.");
      setLoading(false);
      return;
    }

    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      callbackURL: "/",
    });

    if (result?.error) {
      toast.error(
        "Erreur lors de l'inscription. Veuillez vérifier vos informations et réessayer."
      );
      setLoading(false);
    } else {
      toast.success("Inscription réussie !");
      window.location.href = "/";
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="space-y-4 md:space-y-8 p-8"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold pb-6">
                    Créez votre compte
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Inscrivez-vous sur Paginae
                  </p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom & Nom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            autoComplete="name"
                            disabled={loading}
                            onChange={(e) => {
                              field.onChange(e);
                              setName(e.target.value);
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
                    name="email"
                    render={({ field }) => (
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
                    render={({ field }) => (
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
                            href="#"
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
                  {loading ? "Inscription..." : "Inscription"}
                </Button>

                <div className="text-center text-sm">
                  Vous avez déjà un compte ?{" "}
                  <Button
                    variant="link"
                    className="text-sm p-0"
                    onClick={() => {
                      window.location.href = "/auth/login";
                    }}
                    disabled={loading}
                    type="button"
                  >
                    Connectez-vous
                  </Button>
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
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En cliquant, vous acceptez nos{" "}
        <Link href="#">Conditions d&apos;utilisation</Link> et{" "}
        <Link href="#">Politique de confidentialité</Link>.
      </div>
    </div>
  );
}
