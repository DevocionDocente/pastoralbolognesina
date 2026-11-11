"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { ImageUploadDialog } from "@/shared/ui/image-upload-dialog";
import type { VirtueUsageDto } from "../../http/profile-schemas";
import { virtueApi } from "../api/virtue-api";
import { DeleteVirtueDialog } from "./delete-virtue-dialog";
import { VirtueFormDialog } from "./virtue-form-dialog";

type DialogName = "edit" | "image" | "delete";

export function VirtueCardActions({ virtue }: { virtue: VirtueUsageDto }) {
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const control = (name: DialogName) => ({ open: dialog === name, onOpenChange: (open: boolean) => setDialog(open ? name : null) });
  const regenerate = useMutation(() => virtueApi.regenerateImage(virtue.id), {
    success: "La IA está dibujando una nueva imagen. Tardará un minuto.",
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label={`Acciones para ${virtue.name}`}>
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("edit")}>Editar</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("image")}>Reemplazar imagen</DropdownMenuItem>
          <DropdownMenuItem disabled={regenerate.pending} onSelect={() => regenerate.run()}>
            Nueva imagen con IA
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" disabled={virtue.activityCount > 0} onSelect={() => setDialog("delete")}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <VirtueFormDialog virtue={virtue} {...control("edit")} />
      <ImageUploadDialog
        title={`Imagen de ${virtue.name}`}
        description="Se muestra a las familias cuando abren esta virtud."
        onUpload={(file) => virtueApi.replaceImage(virtue.id, file)}
        {...control("image")}
      />
      <DeleteVirtueDialog virtue={virtue} {...control("delete")} />
    </>
  );
}
