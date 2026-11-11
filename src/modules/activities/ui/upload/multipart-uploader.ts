import type { UploadTicketDto } from "../../http/activity-schemas";
import type { ActivityApi } from "../api/activity-api";

const CONCURRENT_PARTS = 3;

export type ProgressListener = (fraction: number) => void;

export class MultipartUploader {
  constructor(
    private readonly api: ActivityApi,
    private readonly activityId: string,
  ) {}

  async upload(file: File, onProgress: ProgressListener): Promise<void> {
    const ticket = await this.api.startUpload(this.activityId, { fileName: file.name, sizeBytes: file.size });
    try {
      const parts = await this.uploadParts(file, ticket, onProgress);
      await this.api.completeUpload(this.activityId, {
        fileName: file.name,
        sizeBytes: file.size,
        uploadId: ticket.uploadId,
        key: ticket.key,
        parts,
      });
    } catch (error) {
      await this.api.abortUpload(this.activityId, { uploadId: ticket.uploadId, key: ticket.key }).catch(() => {});
      throw error;
    }
  }

  private async uploadParts(file: File, ticket: UploadTicketDto, onProgress: ProgressListener) {
    const loaded = new Array<number>(ticket.partUrls.length).fill(0);
    const report = () => onProgress(loaded.reduce((sum, value) => sum + value, 0) / file.size);
    const parts: { partNumber: number; etag: string }[] = [];
    let next = 0;

    const worker = async () => {
      while (next < ticket.partUrls.length) {
        const index = next++;
        const blob = file.slice(index * ticket.partSize, (index + 1) * ticket.partSize);
        const etag = await putPart(ticket.partUrls[index], blob, (bytes) => {
          loaded[index] = bytes;
          report();
        });
        parts.push({ partNumber: index + 1, etag });
      }
    };

    await Promise.all(Array.from({ length: CONCURRENT_PARTS }, worker));
    return parts.sort((a, b) => a.partNumber - b.partNumber);
  }
}

function putPart(url: string, blob: Blob, onBytes: (bytes: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.upload.onprogress = (event) => onBytes(event.loaded);
    request.onload = () => {
      const etag = request.getResponseHeader("ETag");
      if (request.status >= 200 && request.status < 300 && etag) resolve(etag);
      else reject(new Error(`Part upload failed with status ${request.status}`));
    };
    request.onerror = () => reject(new Error("Network error while uploading"));
    request.send(blob);
  });
}
