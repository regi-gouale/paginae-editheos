"use client";

import { IconLogout } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

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
      <IconLogout className="ml-0 text-destructive" />
      Se déconnecter
    </Button>
  );
}
