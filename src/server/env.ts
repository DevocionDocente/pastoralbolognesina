import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  ROOT_ADMIN_NAME: z.string().min(1).default("Administrador"),
  ROOT_ADMIN_EMAIL: z.email(),
  ROOT_ADMIN_PASSWORD: z.string().min(8),
  S3_ENDPOINT: z.url(),
  S3_PUBLIC_ENDPOINT: z.url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(3).default("pastoral-media"),
  OPENAI_API_KEY: z.preprocess((value) => value || undefined, z.string().startsWith("sk-").optional()),
  OPENAI_VISION_MODEL: z.string().default("gpt-6-luna"),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default("gpt-transcribe"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-2.5-flare"),
  SCHOOL_REFERENCES_DIR: z.string().default("assets/school"),
  WORKER_ENABLED: z.stringbool().default(true),
  SEARCH_MAX_DISTANCE: z.coerce.number().min(0).max(2).default(0.63),
  SEARCH_AI_TIMEOUT_MS: z.coerce.number().int().min(1000).default(8000),
  FFMPEG_PATH: z.string().default("ffmpeg"),
  FFPROBE_PATH: z.string().default("ffprobe"),
  YT_DLP_PATH: z.string().default("yt-dlp"),
});

export type Environment = z.infer<typeof environmentSchema>;

let cached: Environment | undefined;

export function env(): Environment {
  cached ??= environmentSchema.parse(process.env);
  return cached;
}

// Read separately from env() because page metadata is also rendered at build time, when the rest of the variables are absent.
export function siteUrl(): URL {
  return new URL(process.env.SITE_URL || "http://localhost:3000");
}
