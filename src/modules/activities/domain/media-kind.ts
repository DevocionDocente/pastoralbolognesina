import { ValidationError } from "@/shared/domain/domain-error";

export const MEDIA_KINDS = ["photo", "video", "document", "youtube"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];
export type FileMediaKind = Exclude<MediaKind, "youtube">;

const MB = 1024 * 1024;

const FILE_TYPES: Record<string, { kind: FileMediaKind; mimeType: string }> = {
  jpg: { kind: "photo", mimeType: "image/jpeg" },
  jpeg: { kind: "photo", mimeType: "image/jpeg" },
  png: { kind: "photo", mimeType: "image/png" },
  webp: { kind: "photo", mimeType: "image/webp" },
  heic: { kind: "photo", mimeType: "image/heic" },
  heif: { kind: "photo", mimeType: "image/heif" },
  mp4: { kind: "video", mimeType: "video/mp4" },
  mov: { kind: "video", mimeType: "video/quicktime" },
  webm: { kind: "video", mimeType: "video/webm" },
  pdf: { kind: "document", mimeType: "application/pdf" },
  docx: { kind: "document", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  xlsx: { kind: "document", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  pptx: { kind: "document", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
};

export const MAX_FILE_SIZE: Record<FileMediaKind, number> = {
  photo: 50 * MB,
  video: 4096 * MB,
  document: 50 * MB,
};

export const ACCEPTED_EXTENSIONS = Object.keys(FILE_TYPES).map((extension) => `.${extension}`);

export interface ClassifiedFile {
  kind: FileMediaKind;
  mimeType: string;
  extension: string;
}

export function classifyFile(fileName: string, sizeBytes: number): ClassifiedFile {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const type = FILE_TYPES[extension];
  if (!type) throw new ValidationError("Unsupported file type");
  if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE[type.kind]) throw new ValidationError("File is too large");
  return { ...type, extension };
}
