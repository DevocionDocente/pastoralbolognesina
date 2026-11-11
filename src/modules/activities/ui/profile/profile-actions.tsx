"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { ImageUploadDialog } from "@/shared/ui/image-upload-dialog";
import type { ProfileDto } from "../../http/profile-schemas";
import { activityApi } from "../api/activity-api";
import { EditProfileTextsDialog } from "./edit-profile-texts-dialog";
import { EditVirtuesDialog } from "./edit-virtues-dialog";
import { RegenerateProfileDialog } from "./regenerate-profile-dialog";

type DialogName = "texts" | "virtues" | "image" | "regenerate";

export function ProfileActions({ activityId, profile, catalog }: { activityId: string; profile: ProfileDto; catalog: string[] }) {
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const control = (name: DialogName) => ({ open: dialog === name, onOpenChange: (open: boolean) => setDialog(open ? name : null) });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <PencilIcon />
            Editar perfil
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("texts")}>Editar textos</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("virtues")}>Cambiar virtudes</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("image")}>Reemplazar imagen</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("regenerate")}>Regenerar con IA</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProfileTextsDialog activityId={activityId} profile={profile} {...control("texts")} />
      <EditVirtuesDialog activityId={activityId} current={profile.virtues} catalog={catalog} {...control("virtues")} />
      <ImageUploadDialog
        title="Reemplazar imagen de reflexión"
        description="Será la portada de la actividad en la galería pública."
        onUpload={(file) => activityApi.replaceProfileImage(activityId, file)}
        {...control("image")}
      />
      <RegenerateProfileDialog activityId={activityId} {...control("regenerate")} />
    </>
  );
}
