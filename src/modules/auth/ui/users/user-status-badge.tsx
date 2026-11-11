import { Badge } from "@/shared/ui/badge";
import type { UserStatus } from "../../domain/access";
import { STATUS_LABELS } from "../labels";

const VARIANTS = { active: "default", pending: "secondary", revoked: "outline" } as const;

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
