import type { UserStatus } from "../domain/access";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: { id: string; name: string } | null;
  createdAt: Date;
}

export interface UserAccess {
  status: UserStatus;
  roleId: string | null;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  list(status?: UserStatus): Promise<UserRecord[]>;
  updateDetails(id: string, details: { name: string; email: string }): Promise<void>;
  setAccess(id: string, access: UserAccess): Promise<void>;
  delete(id: string): Promise<void>;
  countByRole(roleId: string): Promise<number>;
}
