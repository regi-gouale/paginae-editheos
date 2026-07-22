"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import {
  acceptInvitationForCurrentUser,
  getInvitationForRegistration,
} from "@/lib/actions/member-invitations.action";
import { authClient } from "@/lib/auth/auth-client";
import { registerFormSchema } from "@/lib/schemas/auth-schema";
import { cn } from "@/lib/utils";
import { isEmailWhitelisted } from "@/lib/whitelist";
import type { MemberRole } from "@/prisma/generated/prisma/client";

type InvitationState = {
  token: string;
  email: string;
  name: string;
  role: MemberRole;
};

const roleLabels: Record<MemberRole, string> = {
  ADMIN: "Administrateur",
  DESIGNER: "Designer",
  REVIEWER: "Relecteur",
  CONTRIBUTOR: "Contributeur",
  GUEST: "Invite",
};

export function RegisterForm() {
  const [email, setEmail] = useQueryState("email");
  const [name, setName] = useQueryState("name");
  const [invitationToken] = useQueryState("invitation");
  const [loading, setLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitation, setInvitation] = useState<InvitationState | null>(null);

  // Create Form object
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: name || "", email: email || "", password: "" },
  });

  useEffect(() => {
    if (!invitationToken) {
      setInvitation(null);
      return;
    }

    let cancelled = false;
    setInvitationLoading(true);

    void (async () => {
      const result = await getInvitationForRegistration(invitationToken);

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setInvitation(null);
        toast.error(result.error);
        setInvitationLoading(false);
        return;
      }

      setInvitation({
        token: invitationToken,
        email: result.invitation.email,
        name: result.invitation.name,
        role: result.invitation.role,
      });

      form.setValue("email", result.invitation.email, {
        shouldValidate: true,
      });
      form.setValue("name", result.invitation.name, {
        shouldValidate: true,
      });

      setInvitationLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [form, invitationToken]);

  // Handle form submission
  async function onSubmit(data: z.infer<typeof registerFormSchema>) {
    setLoading(true);
    const normalizedEmail = data.email.trim().toLowerCase();

    if (invitation) {
      if (normalizedEmail !== invitation.email.toLowerCase()) {
        toast.error(
          "Cette invitation est liee a une autre adresse email. Utilisez l'email invite.",
        );
        setLoading(false);
        return;
      }
    } else {
      const emailIsWhitelisted = isEmailWhitelisted(normalizedEmail);
      if (!emailIsWhitelisted) {
        toast.error("Cette adresse email n'est pas autorisée à s'inscrire.");
        setLoading(false);
        return;
      }
    }

    const result = await authClient.signUp.email({
      email: normalizedEmail,
      password: data.password,
      name: data.name.trim(),
      callbackURL: "/dashboard",
    });

    if (result?.error) {
      toast.error(
        "Erreur lors de l'inscription. Veuillez vérifier vos informations et réessayer.",
      );
      setLoading(false);
    } else {
      if (invitation) {
        const inviteResult = await acceptInvitationForCurrentUser(
          invitation.token,
        );

        if (!inviteResult.success) {
          toast.warning(
            "Compte créé, mais l'invitation n'a pas encore pu être activée.",
            {
              description: inviteResult.error,
            },
          );
        }
      }

      toast.success("Inscription réussie !");
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

                {invitationLoading && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                    Verification de votre invitation en cours...
                  </div>
                )}

                {invitation && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    Invitation active. Vous rejoindrez l'equipe avec le role{" "}
                    <strong>{roleLabels[invitation.role]}</strong>.
                  </div>
                )}

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom & Nom</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IconUser className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="John Doe"
                              {...field}
                              autoComplete="name"
                              disabled={loading || invitationLoading}
                              className="pl-10"
                              onChange={(e) => {
                                field.onChange(e);
                                if (!invitation) {
                                  setName(e.target.value);
                                }
                              }}
                            />
                          </div>
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
                          <div className="relative">
                            <IconMail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="email@editheos.com"
                              type="email"
                              {...field}
                              autoComplete="email"
                              disabled={
                                loading || invitationLoading || !!invitation
                              }
                              className="pl-10"
                              onChange={(e) => {
                                field.onChange(e);
                                if (!invitation) {
                                  setEmail(e.target.value);
                                }
                              }}
                            />
                          </div>
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
                          <div className="relative">
                            <IconLock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="************"
                              type="password"
                              {...field}
                              autoComplete="current-password"
                              disabled={loading || invitationLoading}
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
                  disabled={loading || invitationLoading}
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
