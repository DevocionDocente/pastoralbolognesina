import { formatDate } from "@/shared/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import type { UserDto } from "../../http/user-schemas";
import { UserRowActions } from "./user-row-actions";
import { UserStatusBadge } from "./user-status-badge";
import type { RoleOption, UserAdminCapabilities } from "./types";

interface UserTableProps {
  users: UserDto[];
  roles: RoleOption[];
  currentUserId: string;
  capabilities: UserAdminCapabilities;
  emptyMessage: string;
}

export function UserTable({ users, roles, currentUserId, capabilities, emptyMessage }: UserTableProps) {
  if (users.length === 0) {
    return <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Rol</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <TableHead className="hidden lg:table-cell">Registro</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{user.role?.name ?? "—"}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <UserStatusBadge status={user.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <UserRowActions user={user} roles={roles} isSelf={user.id === currentUserId} capabilities={capabilities} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
