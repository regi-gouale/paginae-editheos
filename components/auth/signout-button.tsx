"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => {
        authClient.signOut();
        window.location.href = "/auth";
      }}
      className="text-sm p-0 text-destructive hover:bg-destructive/10 focus:bg-destructive/10 w-full justify-start"
    >
      <LogOut className="ml-0 text-destructive" />
      Se déconnecter
    </Button>
  );
}
