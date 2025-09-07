"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <Button
      variant="default"
      onClick={() => {
        authClient.signOut();
        window.location.href = "/auth";
      }}
    >
      Se déconnecter
    </Button>
  );
}
