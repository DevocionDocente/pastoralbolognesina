import type { Permission } from "../domain/permissions";

export interface Role {
  id: string;
  name: string;
}

export interface RoleDetails extends Role {
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
  userCount: number;
}

export interface RoleInput {
  name: string;
  description: string | null;
  permissions: readonly Permission[];
}

export interface RoleRepository {
  findByName(name: string): Promise<Role | null>;
  findById(id: string): Promise<RoleDetails | null>;
  list(): Promise<RoleDetails[]>;
  create(input: RoleInput, isSystem: boolean): Promise<Role>;
  update(id: string, input: RoleInput): Promise<void>;
  delete(id: string): Promise<void>;
  findPermissions(roleId: string): Promise<Permission[]>;
  grantMissing(roleId: string, permissions: readonly Permission[]): Promise<void>;
}
