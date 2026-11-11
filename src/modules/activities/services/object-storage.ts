export interface UploadedPart {
  partNumber: number;
  etag: string;
}

export interface DownloadOptions {
  fileName?: string;
  attachment?: boolean;
}

export interface ObjectStorage {
  startMultipartUpload(key: string, contentType: string): Promise<string>;
  presignUploadPart(key: string, uploadId: string, partNumber: number): Promise<string>;
  completeMultipartUpload(key: string, uploadId: string, parts: UploadedPart[]): Promise<void>;
  abortMultipartUpload(key: string, uploadId: string): Promise<void>;
  objectSize(key: string): Promise<number | null>;
  getObjectBytes(key: string): Promise<Buffer>;
  downloadToFile(key: string, path: string): Promise<void>;
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  deleteObjects(keys: string[]): Promise<void>;
  presignDownload(key: string, options?: DownloadOptions): Promise<string>;
}
