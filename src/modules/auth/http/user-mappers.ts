import { isPermission } from "../domain/permissions";
import type { AccessRecord } from "../repositories/access-history-repository";
import type { UserRecord } from "../repositories/user-repository";
import type { AccessRecordDto, UserDto } from "./user-schemas";

export function toUserDto(user: UserRecord): UserDto {
  return { ...user, createdAt: user.createdAt.toISOString() };
}

export function toAccessRecordDto(record: AccessRecord): AccessRecordDto {
  return {
    id: record.id,
    action: record.action,
    roleName: record.roleName,
    reason: record.reason,
    note: record.note,
    addedPermissions: (record.addedPermissions ?? []).filter(isPermission),
    removedPermissions: (record.removedPermissions ?? []).filter(isPermission),
    performedByName: record.performedByName,
    createdAt: record.createdAt.toISOString(),
  };
}
