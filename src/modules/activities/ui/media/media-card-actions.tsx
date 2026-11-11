"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import type { MediaDto } from "../../http/activity-schemas";
import { AnalysisDialog } from "../analysis/analysis-dialog";
import { ChangeCategoryDialog } from "./change-category-dialog";
import { DeleteMediaDialog } from "./delete-media-dialog";
import { EditMediaDialog } from "./edit-media-dialog";

type DialogName = "edit" | "category" | "delete" | "analysis";

interface MediaCardActionsProps {
  media: MediaDto;
  canEdit: boolean;
  canDelete: boolean;
}

export function MediaCardActions({ media, canEdit, canDelete }: MediaCardActionsProps) {
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const control = (name: DialogName) => ({ open: dialog === name, onOpenChange: (open: boolean) => setDialog(open ? name : null) });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="size-8" aria-label={`Acciones para ${media.originalName}`}>
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={media.viewUrl} target="_blank" rel="noreferrer">Abrir</a>
          </DropdownMenuItem>
          {media.downloadUrl && (
            <DropdownMenuItem asChild>
              <a href={media.downloadUrl}>Descargar</a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setDialog("analysis")}>Ver análisis de IA</DropdownMenuItem>
          {canEdit && <DropdownMenuItem onSelect={() => setDialog("edit")}>Editar detalles</DropdownMenuItem>}
          {canEdit && <DropdownMenuItem onSelect={() => setDialog("category")}>Cambiar tipo</DropdownMenuItem>}
          {canDelete && (
            <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <EditMediaDialog media={media} {...control("edit")} />
      <ChangeCategoryDialog media={media} {...control("category")} />
      <DeleteMediaDialog media={media} {...control("delete")} />
      <AnalysisDialog media={media} canEdit={canEdit} {...control("analysis")} />
    </>
  );
}
