"use client";

import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { UserStatus } from "../../domain/access";
import type { UserDto } from "../../http/user-schemas";
import { UserTable } from "./user-table";
import type { RoleOption, UserAdminCapabilities } from "./types";

const TABS: { status: UserStatus; label: string; empty: string }[] = [
  { status: "active", label: "Activos", empty: "No hay usuarios activos." },
  { status: "pending", label: "Solicitudes", empty: "No hay solicitudes pendientes." },
  { status: "revoked", label: "Sin acceso", empty: "Nadie tiene el acceso retirado." },
];

interface UsersTabsProps {
  users: UserDto[];
  roles: RoleOption[];
  currentUserId: string;
  capabilities: UserAdminCapabilities;
}

export function UsersTabs({ users, roles, currentUserId, capabilities }: UsersTabsProps) {
  const byStatus = (status: UserStatus) => users.filter((user) => user.status === status);
  const pendingCount = byStatus("pending").length;

  return (
    <Tabs defaultValue={pendingCount > 0 ? "pending" : "active"}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.status} value={tab.status} className="gap-2">
            {tab.label}
            {tab.status === "pending" && pendingCount > 0 && <Badge>{pendingCount}</Badge>}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent key={tab.status} value={tab.status} className="mt-4">
          <UserTable
            users={byStatus(tab.status)}
            roles={roles}
            currentUserId={currentUserId}
            capabilities={capabilities}
            emptyMessage={tab.empty}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
