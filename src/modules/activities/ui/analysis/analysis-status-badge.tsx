import { CircleAlertIcon, ClockIcon, LoaderIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { MediaDto } from "../../http/activity-schemas";

const STATUS = {
  pending: { label: "En cola", icon: ClockIcon, className: "bg-background/90 text-muted-foreground" },
  processing: { label: "Analizando", icon: LoaderIcon, className: "bg-background/90 text-foreground" },
  ready: { label: "Analizado", icon: SparklesIcon, className: "bg-primary/90 text-primary-foreground" },
  error: { label: "Error", icon: CircleAlertIcon, className: "bg-destructive text-white" },
};

export function AnalysisStatusBadge({ status }: { status: MediaDto["analysisStatus"] }) {
  const { label, icon: Icon, className } = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm", className)}>
      <Icon className={cn("size-3", status === "processing" && "animate-spin")} aria-hidden />
      {label}
    </span>
  );
}
