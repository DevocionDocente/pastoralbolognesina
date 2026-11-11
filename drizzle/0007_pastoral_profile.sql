CREATE TABLE "activity_virtues" (
	"activity_id" uuid NOT NULL,
	"virtue_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "activity_virtues_activity_id_virtue_id_pk" PRIMARY KEY("activity_id","virtue_id")
);
--> statement-breakpoint
CREATE TABLE "virtues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"explanation" text NOT NULL,
	"image_key" text,
	"source" text DEFAULT 'ai' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "virtues_normalizedName_unique" UNIQUE("normalized_name")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "pastoral_description" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "coexistence_impact" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "reflection_image_key" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "manual_fields" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "profile_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "category_source" text;--> statement-breakpoint
ALTER TABLE "activity_virtues" ADD CONSTRAINT "activity_virtues_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_virtues" ADD CONSTRAINT "activity_virtues_virtue_id_virtues_id_fk" FOREIGN KEY ("virtue_id") REFERENCES "public"."virtues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_virtues_virtue_id_index" ON "activity_virtues" USING btree ("virtue_id");