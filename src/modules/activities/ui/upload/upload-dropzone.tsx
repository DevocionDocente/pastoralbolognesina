"use client";

import { UploadCloudIcon } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/shared/lib/utils";
import { ACCEPTED_EXTENSIONS } from "../../domain/media-kind";

export function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    onFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-card p-8 text-center transition-colors hover:border-primary/60",
        dragging && "border-primary bg-accent/40",
      )}
    >
      <UploadCloudIcon className="size-8 text-muted-foreground" />
      <span className="font-medium">Arrastra aquí fotos, videos o documentos, o pulsa para elegirlos</span>
      <span className="text-sm text-muted-foreground">
        Fotos (JPG, PNG, WEBP, HEIC) · Videos (MP4, MOV, WEBM) hasta 4 GB · PDF, Word, Excel y PowerPoint
      </span>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_EXTENSIONS.join(",")}
        aria-label="Elegir archivos"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </button>
  );
}
