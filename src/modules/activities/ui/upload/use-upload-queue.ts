"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { friendlyError } from "@/shared/lib/error-messages";
import { activityApi } from "../api/activity-api";
import { MultipartUploader } from "./multipart-uploader";

export interface QueuedUpload {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

export function useUploadQueue(activityId: string) {
  const router = useRouter();
  const [uploads, setUploads] = useState<QueuedUpload[]>([]);
  const uploader = useMemo(() => new MultipartUploader(activityApi, activityId), [activityId]);

  const patch = (id: string, changes: Partial<QueuedUpload>) =>
    setUploads((current) => current.map((upload) => (upload.id === id ? { ...upload, ...changes } : upload)));

  async function uploadOne(file: File) {
    const id = crypto.randomUUID();
    setUploads((current) => [...current, { id, name: file.name, progress: 0, status: "uploading" }]);
    try {
      await uploader.upload(file, (progress) => patch(id, { progress }));
      patch(id, { progress: 1, status: "done" });
      router.refresh();
    } catch (error) {
      patch(id, { status: "error", error: friendlyError(error) });
      toast.error(`No se pudo subir ${file.name}`);
    }
  }

  async function add(files: File[]) {
    for (const file of files) await uploadOne(file);
  }

  const clearFinished = () => setUploads((current) => current.filter((upload) => upload.status === "uploading"));

  return { uploads, add, clearFinished };
}
