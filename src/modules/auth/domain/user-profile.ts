import type { UserStatus } from "./access";
import type { Permission } from "./permissions";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: { id: string; name: string } | null;
  permissions: Permission[];
}
