import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createWriteStream } from "node:fs";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { DownloadOptions, ObjectStorage, UploadedPart } from "@/modules/activities/services/object-storage";

const URL_TTL_SECONDS = 60 * 60;

export interface S3Settings {
  endpoint: string;
  publicEndpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly signer: S3Client;

  constructor(private readonly settings: S3Settings) {
    this.client = this.createClient(settings.endpoint);
    this.signer = this.createClient(settings.publicEndpoint);
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.settings.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.settings.bucket }));
    }
  }

  async startMultipartUpload(key: string, contentType: string): Promise<string> {
    const result = await this.client.send(
      new CreateMultipartUploadCommand({ Bucket: this.settings.bucket, Key: key, ContentType: contentType }),
    );
    return result.UploadId!;
  }

  presignUploadPart(key: string, uploadId: string, partNumber: number): Promise<string> {
    const command = new UploadPartCommand({ Bucket: this.settings.bucket, Key: key, UploadId: uploadId, PartNumber: partNumber });
    return getSignedUrl(this.signer, command, { expiresIn: URL_TTL_SECONDS * 6 });
  }

  async completeMultipartUpload(key: string, uploadId: string, parts: UploadedPart[]): Promise<void> {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.settings.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts.map((part) => ({ PartNumber: part.partNumber, ETag: part.etag })) },
      }),
    );
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    await this.client.send(new AbortMultipartUploadCommand({ Bucket: this.settings.bucket, Key: key, UploadId: uploadId }));
  }

  async objectSize(key: string): Promise<number | null> {
    const result = await this.client.send(new HeadObjectCommand({ Bucket: this.settings.bucket, Key: key }));
    return result.ContentLength ?? null;
  }

  async getObjectBytes(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.settings.bucket, Key: key }));
    return Buffer.from(await result.Body!.transformToByteArray());
  }

  async downloadToFile(key: string, path: string): Promise<void> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.settings.bucket, Key: key }));
    await pipeline(result.Body as Readable, createWriteStream(path));
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.settings.bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.send(
      new DeleteObjectsCommand({ Bucket: this.settings.bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }),
    );
  }

  presignDownload(key: string, options: DownloadOptions = {}): Promise<string> {
    const disposition = options.attachment ? "attachment" : "inline";
    const fileName = options.fileName ? `; filename*=UTF-8''${encodeURIComponent(options.fileName)}` : "";
    const command = new GetObjectCommand({
      Bucket: this.settings.bucket,
      Key: key,
      ResponseContentDisposition: options.fileName || options.attachment ? `${disposition}${fileName}` : undefined,
    });
    return getSignedUrl(this.signer, command, { expiresIn: URL_TTL_SECONDS });
  }

  private createClient(endpoint: string): S3Client {
    return new S3Client({
      endpoint,
      region: this.settings.region,
      forcePathStyle: true,
      credentials: { accessKeyId: this.settings.accessKey, secretAccessKey: this.settings.secretKey },
    });
  }
}
