CREATE TABLE "media_analyses" (
	"media_id" uuid PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"transcript" text,
	"extracted_text" text,
	"moments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"source" text NOT NULL,
	"content" text NOT NULL,
	"second" integer,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "ai_summary" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "ai_summary_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "analysis_error" text;--> statement-breakpoint
ALTER TABLE "media_analyses" ADD CONSTRAINT "media_analyses_media_id_media_items_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_chunks" ADD CONSTRAINT "media_chunks_media_id_media_items_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_chunks" ADD CONSTRAINT "media_chunks_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_chunks_media_id_index" ON "media_chunks" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "media_chunks_embedding_idx" ON "media_chunks" USING hnsw ("embedding" vector_cosine_ops);