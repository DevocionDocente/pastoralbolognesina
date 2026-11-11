"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { Label } from "@/shared/ui/label";
import { SelectField } from "@/shared/ui/select-field";
import { Textarea } from "@/shared/ui/textarea";
import { REVOCATION_REASONS, type RevocationReason } from "../../domain/access";
import type { UserDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import { REASON_LABELS } from "../labels";
import type { DialogControl } from "./types";

const REASON_OPTIONS = REVOCATION_REASONS.map((reason) => ({ value: reason, label: REASON_LABELS[reason] }));

export function RevokeAccessDialog({ user, ...control }: DialogControl & { user: UserDto }) {
  const { run, pending } = useMutation(
    (form: FormData) =>
      userApi.revoke(user.id, {
        reason: String(form.get("reason")) as RevocationReason,
        note: String(form.get("note") ?? "").trim() || null,
      }),
    { success: "Acceso retirado.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title="Retirar acceso"
      description={`${user.name} ya no podrá gestionar el panel, pero seguirá viendo el sitio web. Lo que subió se conserva.`}
      submitLabel="Retirar acceso"
      destructive
      pending={pending}
      onSubmit={run}
    >
      <SelectField name="reason" label="Motivo" placeholder="Elige el motivo" options={REASON_OPTIONS} required />
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Observación (opcional)</Label>
        <Textarea id="note" name="note" maxLength={500} placeholder="Por ejemplo: fin del año escolar" />
      </div>
    </FormDialog>
  );
}
