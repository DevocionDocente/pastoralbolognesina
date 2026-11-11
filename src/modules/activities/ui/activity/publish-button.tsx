"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { Button } from "@/shared/ui/button";
import { activityApi } from "../api/activity-api";

export function PublishButton({ activityId, published }: { activityId: string; published: boolean }) {
  const { run, pending } = useMutation(() => activityApi.setPublished(activityId, !published), {
    success: published ? "La actividad ya no es visible para el público." : "La actividad ya es visible para el público.",
  });

  return (
    <Button variant={published ? "outline" : "default"} onClick={() => run()} disabled={pending}>
      {published ? <EyeOffIcon /> : <EyeIcon />}
      {published ? "Ocultar" : "Publicar"}
    </Button>
  );
}
