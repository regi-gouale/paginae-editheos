"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useQueryState("loginEmail");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signIn.email({
        email: email!,
        password: password!,
        callbackURL: "/",
        rememberMe: true,
      });
      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
      } else {
        window.location.reload();
      }
    } catch {
      setError("Erreur lors de la connexion.");
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
                <h1 className="text-2xl font-bold pb-6">
                  Ravi de vous retrouver
                </h1>
                <p className="text-muted-foreground text-balance">
                  Connectez-vous à votre compte Paginae
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@editheos.com"
                  required
                  value={email || ""}
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
                  value={password || ""}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button type="submit" className="w-full mt-4" disabled={loading}>
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
        <a href="#">Conditions d&apos;utilisation</a> et{" "}
        <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}
