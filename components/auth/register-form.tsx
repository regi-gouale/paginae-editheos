"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { EMAIL_WHITELIST } from "@/lib/whitelist";
import Image from "next/image";
import { useState } from "react";

interface RegisterFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Vérification de la whitelist
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedWhitelist = EMAIL_WHITELIST.map((e) => e.toLowerCase());
    if (!normalizedWhitelist.includes(normalizedEmail)) {
      setError("Cette adresse email n'est pas autorisée à s'inscrire.");
      setLoading(false);
      return;
    }
    try {
      const res: any = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/",
      });
      if (res?.error) {
        setError(
          typeof res.error === "string"
            ? res.error
            : res.error?.message || "Erreur lors de l'inscription."
        );
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold pb-6">Créez votre compte</h1>
                <p className="text-muted-foreground text-balance">
                  Inscrivez-vous sur Paginae
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@editheos.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Inscription..." : "Inscription"}
              </Button>

              <div className="text-center text-sm">
                Vous avez déjà un compte ?{" "}
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={onToggleMode}
                  type="button"
                >
                  Connectez-vous
                </Button>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              fill
              src="/logo-editheos.webp"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En cliquant, vous acceptez nos <a href="#">Conditions d'utilisation</a>{" "}
        et <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}
