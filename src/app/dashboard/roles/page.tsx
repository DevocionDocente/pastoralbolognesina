import type { Metadata } from "next";
import { CreateRoleButton } from "@/modules/auth/ui/roles/create-role-button";
import { RoleCard } from "@/modules/auth/ui/roles/role-card";
import { container } from "@/server/container";
import { requirePermission } from "@/server/current-profile";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Roles y permisos" };

export default async function RolesPage() {
  const profile = await requirePermission("roles.manage");
  const roles = await container().roleService.list(profile.id);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Roles y permisos"
        description="Define qué puede hacer cada grupo de personas en el panel."
        actions={<CreateRoleButton />}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </section>
  );
}
