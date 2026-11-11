import type { AccessAction, RevocationReason } from "../domain/access";

export interface AccessEntry {
  userId: string;
  action: AccessAction;
  roleName: string | null;
  reason: RevocationReason | null;
  note: string | null;
  addedPermissions?: string[] | null;
  removedPermissions?: string[] | null;
  performedBy: string | null;
}

export interface AccessRecord extends AccessEntry {
  id: string;
  performedByName: string | null;
  createdAt: Date;
}

export interface AccessHistoryRepository {
  record(entry: AccessEntry): Promise<void>;
  listForUser(userId: string): Promise<AccessRecord[]>;
}
