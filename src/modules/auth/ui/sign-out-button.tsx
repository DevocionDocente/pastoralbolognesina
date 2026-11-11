"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { Button } from "@/shared/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={signOut}>
      Cerrar sesión
    </Button>
  );
}
