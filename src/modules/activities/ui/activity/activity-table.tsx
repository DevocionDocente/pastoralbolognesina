import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import type { ActivityDto } from "../../http/activity-schemas";
import { PublicationBadge } from "./publication-badge";

export function ActivityTable({ activities }: { activities: ActivityDto[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No se encontraron actividades.
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actividad</TableHead>
            <TableHead className="w-20">Año</TableHead>
            <TableHead className="hidden w-24 sm:table-cell">Archivos</TableHead>
            <TableHead className="hidden w-28 md:table-cell">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>
                <Link href={`/dashboard/activities/${activity.id}`} className="font-medium hover:underline">
                  {activity.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {[activity.series?.name, activity.createdBy?.name].filter(Boolean).join(" · ")}
                </p>
              </TableCell>
              <TableCell>{activity.year}</TableCell>
              <TableCell className="hidden sm:table-cell">{activity.mediaCount}</TableCell>
              <TableCell className="hidden md:table-cell">
                <PublicationBadge published={activity.published} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
