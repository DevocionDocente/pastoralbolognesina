"use client";

import { ImageIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { Button } from "@/shared/ui/button";
import { ImageUploadDialog } from "@/shared/ui/image-upload-dialog";
import type { ActivityVirtueDto } from "../../http/profile-schemas";
import { activityApi } from "../api/activity-api";

export function VirtueImageActions({ activityId, virtue }: { activityId: string; virtue: ActivityVirtueDto }) {
  const [uploading, setUploading] = useState(false);
  const regenerate = useMutation(() => activityApi.regenerateVirtueImage(activityId, virtue.id), {
    success: "La IA está dibujando la imagen para esta actividad. Tardará un minuto; luego recarga la página.",
  });
  const reset = useMutation(() => activityApi.resetVirtueImage(activityId, virtue.id), { success: "Se usa otra vez la imagen del catálogo." });

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        {virtue.ownImage ? "Esta imagen es propia de esta actividad." : "Esta imagen es la del catálogo de virtudes."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setUploading(true)}>
          <ImageIcon />
          Cambiar imagen
        </Button>
        <Button variant="outline" size="sm" disabled={regenerate.pending} onClick={() => regenerate.run()}>
          <SparklesIcon />
          Nueva imagen con IA
        </Button>
        {virtue.ownImage && (
          <Button variant="ghost" size="sm" disabled={reset.pending} onClick={() => reset.run()}>
            <RotateCcwIcon />
            Usar la del catálogo
          </Button>
        )}
      </div>
      <ImageUploadDialog
        title={`Imagen de ${virtue.name} en esta actividad`}
        description="Solo cambia en esta actividad; las demás siguen con su imagen."
        onUpload={(file) => activityApi.replaceVirtueImage(activityId, virtue.id, file)}
        open={uploading}
        onOpenChange={setUploading}
      />
    </div>
  );
}
