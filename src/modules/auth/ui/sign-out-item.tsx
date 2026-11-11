"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";

export function SignOutItem() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenuItem onSelect={signOut}>
      <LogOutIcon />
      Cerrar sesión
    </DropdownMenuItem>
  );
}
