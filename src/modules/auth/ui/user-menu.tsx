"use client";

import type { UserProfile } from "../domain/user-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { UserAvatar } from "./user-avatar";
import { SignOutItem } from "./sign-out-item";

export function UserMenu({ profile }: { profile: UserProfile }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2" aria-label="Menú de usuario">
          <UserAvatar name={profile.name} />
          <span className="hidden text-sm font-medium sm:inline">{profile.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span>{profile.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{profile.email}</span>
          <span className="text-xs font-normal text-muted-foreground">{profile.role?.name ?? "Sin rol"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
