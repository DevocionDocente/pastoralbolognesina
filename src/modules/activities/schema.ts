import { bigint, boolean, date, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";
import { users } from "../auth/schema";

export const activitySeries = pgTable("activity_series", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const activities = pgTable(
  "activities",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    description: text(),
    date: date({ mode: "string" }),
    year: integer().notNull(),
    seriesId: uuid().references(() => activitySeries.id, { onDelete: "set null" }),
    published: boolean().notNull().default(false),
    aiSummary: text(),
    aiSummaryUpdatedAt: timestamp(),
    pastoralDescription: text(),
    coexistenceImpact: text(),
    reflectionImageKey: text(),
    manualFields: text().array().notNull().default([]),
    profileStatus: text({ enum: ["pending", "processing", "ready", "error"] }).notNull().default("pending"),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.year), index().on(table.seriesId)],
);

export const mediaItems = pgTable(
  "media_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    activityId: uuid()
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    kind: text({ enum: ["photo", "video", "document", "youtube"] }).notNull(),
    storageKey: text(),
    thumbnailKey: text(),
    youtubeId: text(),
    originalName: text().notNull(),
    mimeType: text(),
    sizeBytes: bigint({ mode: "number" }),
    title: text(),
    description: text(),
    analysisStatus: text({ enum: ["pending", "processing", "ready", "error"] }).notNull().default("pending"),
    analysisError: text(),
    category: text({
      enum: ["image", "video", "pastoral_plan", "meeting_agreements", "activity_work_plan", "financial_report", "report", "other"],
    }),
    categorySource: text({ enum: ["ai", "manual"] }),
    position: integer().notNull().default(0),
    uploadedBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.activityId)],
);

export const mediaAnalyses = pgTable("media_analyses", {
  mediaId: uuid()
    .primaryKey()
    .references(() => mediaItems.id, { onDelete: "cascade" }),
  description: text().notNull(),
  tags: text().array().notNull().default([]),
  transcript: text(),
  extractedText: text(),
  moments: jsonb().$type<{ second: number; text: string }[]>().notNull().default([]),
  model: text().notNull(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const mediaChunks = pgTable(
  "media_chunks",
  {
    id: uuid().primaryKey().defaultRandom(),
    mediaId: uuid()
      .notNull()
      .references(() => mediaItems.id, { onDelete: "cascade" }),
    activityId: uuid()
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    source: text({ enum: ["description", "transcript", "text", "moment"] }).notNull(),
    content: text().notNull(),
    second: integer(),
    embedding: vector({ dimensions: 1536 }).notNull(),
  },
  (table) => [
    index().on(table.mediaId),
    index("media_chunks_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ],
);

export const virtues = pgTable("virtues", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  normalizedName: text().notNull().unique(),
  explanation: text().notNull(),
  imageKey: text(),
  source: text({ enum: ["ai", "manual"] }).notNull().default("ai"),
  createdAt: timestamp().notNull().defaultNow(),
});

export const activityVirtues = pgTable(
  "activity_virtues",
  {
    activityId: uuid()
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    virtueId: uuid()
      .notNull()
      .references(() => virtues.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
    explanation: text(),
    imageKey: text(),
  },
  (table) => [primaryKey({ columns: [table.activityId, table.virtueId] }), index().on(table.virtueId)],
);
