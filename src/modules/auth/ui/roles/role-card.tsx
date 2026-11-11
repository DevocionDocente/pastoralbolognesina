"use client";

import { LockIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PERMISSION_LABELS } from "../../domain/permission-labels";
import { ADMINISTRATOR_ROLE } from "../../domain/default-roles";
import type { RoleDto } from "../../http/role-schemas";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { RoleFormDialog } from "./role-form-dialog";

export function RoleCard({ role }: { role: RoleDto }) {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const control = (name: "edit" | "delete") => ({ open: dialog === name, onOpenChange: (open: boolean) => setDialog(open ? name : null) });
  const locked = role.name === ADMINISTRATOR_ROLE.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {role.name}
          {role.isSystem && <Badge variant="secondary">Del sistema</Badge>}
        </CardTitle>
        <CardDescription>
          {role.description ?? "Sin descripción"} · {role.userCount} {role.userCount === 1 ? "usuario" : "usuarios"}
        </CardDescription>
        <CardAction className="flex gap-1">
          {locked ? (
            <LockIcon className="size-4 text-muted-foreground" aria-label="No editable" />
          ) : (
            <Button variant="ghost" size="icon" aria-label={`Editar ${role.name}`} onClick={() => setDialog("edit")}>
              <PencilIcon />
            </Button>
          )}
          {!role.isSystem && (
            <Button variant="ghost" size="icon" aria-label={`Eliminar ${role.name}`} onClick={() => setDialog("delete")}>
              <Trash2Icon />
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-2">
          {role.permissions.map((permission) => (
            <li key={permission}>
              <Badge variant="outline">{PERMISSION_LABELS[permission]}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
      <RoleFormDialog role={role} {...control("edit")} />
      <DeleteRoleDialog role={role} {...control("delete")} />
    </Card>
  );
}
