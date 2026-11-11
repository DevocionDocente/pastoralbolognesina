import { CheckCircle2Icon, CircleAlertIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { QueuedUpload } from "./use-upload-queue";

interface UploadQueueListProps {
  uploads: QueuedUpload[];
  onClear: () => void;
}

export function UploadQueueList({ uploads, onClear }: UploadQueueListProps) {
  if (uploads.length === 0) return null;
  const finished = uploads.some((upload) => upload.status !== "uploading");

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      {uploads.map((upload) => (
        <UploadRow key={upload.id} upload={upload} />
      ))}
      {finished && (
        <Button variant="ghost" size="sm" className="self-end" onClick={onClear}>
          Limpiar lista
        </Button>
      )}
    </div>
  );
}

function UploadRow({ upload }: { upload: QueuedUpload }) {
  const Icon = { uploading: LoaderIcon, done: CheckCircle2Icon, error: CircleAlertIcon }[upload.status];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-sm">
        <Icon className={upload.status === "uploading" ? "size-4 animate-spin" : "size-4"} />
        <span className="flex-1 truncate">{upload.name}</span>
        <span className="text-muted-foreground">{upload.error ?? `${Math.round(upload.progress * 100)}%`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${upload.progress * 100}%` }} />
      </div>
    </div>
  );
}
