"use client";

import { RotateCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import type { DialogControl } from "@/shared/ui/dialog-control";
import type { AnalysisDto, MediaDto } from "../../http/activity-schemas";
import { activityApi } from "../api/activity-api";
import { AnalysisContent } from "./analysis-content";
import { AnalysisStatusBadge } from "./analysis-status-badge";

interface AnalysisDialogProps extends DialogControl {
  media: MediaDto;
  canEdit: boolean;
}

export function AnalysisDialog({ media, canEdit, ...control }: AnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<AnalysisDto | null>(null);
  const retry = useMutation(() => activityApi.retryAnalysis(media.id), {
    success: "El archivo volvió a la cola de análisis.",
    onSuccess: () => control.onOpenChange(false),
  });

  useEffect(() => {
    if (!control.open) return;
    let cancelled = false;
    activityApi.analysis(media.id).then((result) => !cancelled && setAnalysis(result));
    return () => {
      cancelled = true;
    };
  }, [control.open, media.id]);

  return (
    <Dialog {...control}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Lo que entendió la IA <AnalysisStatusBadge status={analysis?.status ?? media.analysisStatus} />
          </DialogTitle>
          <DialogDescription>{media.title ?? media.originalName}</DialogDescription>
        </DialogHeader>
        {analysis?.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{analysis.error}</p>}
        {analysis ? <AnalysisContent analysis={analysis} /> : <p className="text-sm text-muted-foreground">Cargando…</p>}
        {canEdit && (
          <Button variant="outline" className="justify-self-start" onClick={() => retry.run()} disabled={retry.pending}>
            <RotateCwIcon />
            Volver a analizar
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
