"use client";

import { UploadDropzone } from "./upload-dropzone";
import { UploadQueueList } from "./upload-queue-list";
import { useUploadQueue } from "./use-upload-queue";
import { YoutubeForm } from "./youtube-form";

export function MediaUploader({ activityId }: { activityId: string }) {
  const { uploads, add, clearFinished } = useUploadQueue(activityId);

  return (
    <section className="flex flex-col gap-3">
      <UploadDropzone onFiles={add} />
      <UploadQueueList uploads={uploads} onClear={clearFinished} />
      <YoutubeForm activityId={activityId} />
    </section>
  );
}
