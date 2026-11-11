import type { Metadata } from "next";
import { toUserDto } from "@/modules/auth/http/user-mappers";
import { CreateUserDialog } from "@/modules/auth/ui/users/create-user-dialog";
import { UsersTabs } from "@/modules/auth/ui/users/users-tabs";
import { container } from "@/server/container";
import { USER_ADMINISTRATION_PERMISSIONS } from "@/modules/auth/domain/permissions";
import { requireAnyPermission } from "@/server/current-profile";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const profile = await requireAnyPermission(USER_ADMINISTRATION_PERMISSIONS);
  const { userDirectoryService, roleService } = container();
  const [users, roles] = await Promise.all([
    userDirectoryService.list(profile.id),
    roleService.list(profile.id),
  ]);
  const roleOptions = roles.map(({ id, name }) => ({ id, name }));
  const capabilities = {
    manageAccess: profile.permissions.includes("users.access"),
    manageUsers: profile.permissions.includes("users.manage"),
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description="Aprueba solicitudes, asigna roles, ajusta permisos y retira accesos del equipo pastoral."
        actions={capabilities.manageUsers && <CreateUserDialog roles={roleOptions} />}
      />
      <UsersTabs users={users.map(toUserDto)} roles={roleOptions} currentUserId={profile.id} capabilities={capabilities} />
    </section>
  );
}
