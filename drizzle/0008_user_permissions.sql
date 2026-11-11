CREATE TABLE "user_permissions" (
	"user_id" text NOT NULL,
	"permission" text NOT NULL,
	"granted" boolean NOT NULL,
	CONSTRAINT "user_permissions_user_id_permission_pk" PRIMARY KEY("user_id","permission")
);
--> statement-breakpoint
ALTER TABLE "access_history" ADD COLUMN "added_permissions" text[];--> statement-breakpoint
ALTER TABLE "access_history" ADD COLUMN "removed_permissions" text[];--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
UPDATE "roles" SET "name" = 'Equipo pastoral', "description" = 'Integrantes del equipo pastoral y directivos: registran actividades y suben sus evidencias.' WHERE "name" = 'Profesor' AND "is_system" AND NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'Equipo pastoral');--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission") SELECT DISTINCT "role_id", unnest(ARRAY['media.upload', 'media.edit', 'profiles.edit']) FROM "role_permissions" WHERE "permission" IN ('activities.update_own', 'activities.update_any') ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission") SELECT DISTINCT "role_id", 'media.delete' FROM "role_permissions" WHERE "permission" = 'activities.delete' ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission") SELECT DISTINCT "role_id", 'users.access' FROM "role_permissions" WHERE "permission" = 'users.manage' ON CONFLICT DO NOTHING;
