"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import type { UserDto } from "../../http/user-schemas";
import { AccessHistoryDialog } from "./access-history-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { GrantAccessDialog } from "./grant-access-dialog";
import { RejectRequestDialog } from "./reject-request-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { RevokeAccessDialog } from "./revoke-access-dialog";
import type { RoleOption, UserAdminCapabilities } from "./types";
import { UserPermissionsDialog } from "./user-permissions-dialog";

type Action = "grant" | "revoke" | "reject" | "edit" | "permissions" | "password" | "history";
type Requirement = keyof UserAdminCapabilities | "any";

const MENU: Record<UserDto["status"], { action: Action; label: string; requires: Requirement }[]> = {
  pending: [
    { action: "grant", label: "Aprobar", requires: "manageAccess" },
    { action: "reject", label: "Rechazar", requires: "manageAccess" },
  ],
  active: [
    { action: "grant", label: "Cambiar rol", requires: "manageAccess" },
    { action: "permissions", label: "Permisos", requires: "manageUsers" },
    { action: "edit", label: "Editar datos", requires: "manageUsers" },
    { action: "password", label: "Restablecer contraseña", requires: "manageUsers" },
    { action: "revoke", label: "Retirar acceso", requires: "manageAccess" },
    { action: "history", label: "Historial de accesos", requires: "any" },
  ],
  revoked: [
    { action: "grant", label: "Restituir acceso", requires: "manageAccess" },
    { action: "history", label: "Historial de accesos", requires: "any" },
  ],
};

const SELF_ACTIONS: Action[] = ["edit", "history"];

interface UserRowActionsProps {
  user: UserDto;
  roles: RoleOption[];
  isSelf: boolean;
  capabilities: UserAdminCapabilities;
}

export function UserRowActions({ user, roles, isSelf, capabilities }: UserRowActionsProps) {
  const [action, setAction] = useState<Action | null>(null);
  const control = (name: Action) => ({ open: action === name, onOpenChange: (open: boolean) => setAction(open ? name : null) });
  const items = MENU[user.status]
    .filter((item) => item.requires === "any" || capabilities[item.requires])
    .filter((item) => !isSelf || SELF_ACTIONS.includes(item.action));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Acciones para ${user.name}`}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item) => (
            <DropdownMenuItem key={item.action} onSelect={() => setAction(item.action)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <GrantAccessDialog user={user} roles={roles} {...control("grant")} />
      <RevokeAccessDialog user={user} {...control("revoke")} />
      <RejectRequestDialog user={user} {...control("reject")} />
      <EditUserDialog user={user} {...control("edit")} />
      <UserPermissionsDialog user={user} {...control("permissions")} />
      <ResetPasswordDialog user={user} {...control("password")} />
      <AccessHistoryDialog user={user} {...control("history")} />
    </>
  );
}
