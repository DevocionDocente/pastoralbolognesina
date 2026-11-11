"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import type { AccessRecordDto, UserDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import { AccessHistoryList } from "./access-history-list";
import type { DialogControl } from "./types";

export function AccessHistoryDialog({ user, ...control }: DialogControl & { user: UserDto }) {
  const [records, setRecords] = useState<AccessRecordDto[] | null>(null);

  useEffect(() => {
    if (!control.open) return;
    let cancelled = false;
    userApi.accessHistory(user.id).then((result) => !cancelled && setRecords(result));
    return () => {
      cancelled = true;
    };
  }, [control.open, user.id]);

  return (
    <Dialog {...control}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historial de accesos</DialogTitle>
          <DialogDescription>{user.name}</DialogDescription>
        </DialogHeader>
        <AccessHistoryList records={records} />
      </DialogContent>
    </Dialog>
  );
}
