import { formatDateTime } from "@/shared/lib/format";
import type { AccessRecordDto } from "../../http/user-schemas";
import { PERMISSION_LABELS } from "../../domain/permission-labels";
import { REASON_LABELS } from "../labels";

export function AccessHistoryList({ records }: { records: AccessRecordDto[] | null }) {
  if (!records) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (records.length === 0) return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>;

  return (
    <ol className="flex max-h-80 flex-col gap-3 overflow-y-auto">
      {records.map((record) => (
        <li key={record.id} className="rounded-lg border p-3 text-sm">
          <p className="font-medium">{describe(record)}</p>
          {record.note && <p className="text-muted-foreground">{record.note}</p>}
          {record.addedPermissions.length > 0 && <PermissionLine label="Se agregó" permissions={record.addedPermissions} />}
          {record.removedPermissions.length > 0 && <PermissionLine label="Se quitó" permissions={record.removedPermissions} />}
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(record.createdAt)}
            {record.performedByName && ` · por ${record.performedByName}`}
          </p>
        </li>
      ))}
    </ol>
  );
}

function PermissionLine({ label, permissions }: { label: string; permissions: AccessRecordDto["addedPermissions"] }) {
  return (
    <p className="text-muted-foreground">
      {label}: {permissions.map((permission) => PERMISSION_LABELS[permission]).join(", ")}
    </p>
  );
}

function describe(record: AccessRecordDto): string {
  if (record.action === "permissions_changed") return "Permisos individuales ajustados";
  if (record.action === "granted") return `Acceso otorgado como ${record.roleName ?? "sin rol"}`;
  const reason = record.reason ? REASON_LABELS[record.reason] : "sin motivo";
  return `Acceso retirado (${reason})`;
}
