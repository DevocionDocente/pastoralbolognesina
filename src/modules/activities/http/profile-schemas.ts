import { z } from "@hono/zod-openapi";
import { MAX_VIRTUES, MIN_VIRTUES, PROFILE_FIELDS } from "../domain/pastoral-profile";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export const VirtueSchema = z
  .object({
    id: z.uuid(),
    name: z.string().openapi({ example: "Perdón y Reconciliación" }),
    explanation: z.string().openapi({ example: "Pedir y ofrecer perdón nos ayuda a reconstruir la amistad." }),
    imageUrl: z.string().nullable().openapi({ description: "Temporary URL of the reflection image" }),
  })
  .openapi("Virtue");

export const VirtueUsageSchema = VirtueSchema.extend({
  activityCount: z.number().int().openapi({ description: "Activities that promote this virtue" }),
}).openapi("VirtueUsage");

export const ActivityVirtueSchema = VirtueSchema.extend({
  ownExplanation: z
    .string()
    .nullable()
    .openapi({ description: "Explanation written for this activity; `explanation` falls back to the catalog when it is null" }),
  ownImage: z.boolean().openapi({ description: "Whether `imageUrl` is an image made for this activity; otherwise it is the catalog image" }),
}).openapi("ActivityVirtue");

export const ActivityVirtueParams = z.object({
  id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
  virtueId: z.uuid().openapi({ param: { name: "virtueId", in: "path" } }),
});

export const ProfileSchema = z
  .object({
    status: z.enum(["pending", "processing", "ready", "error"]),
    pastoralDescription: z.string().nullable(),
    coexistenceImpact: z.string().nullable(),
    imageUrl: z.string().nullable().openapi({ description: "Temporary URL of the reflection image used as public cover" }),
    manualFields: z.array(z.enum(PROFILE_FIELDS)).openapi({ description: "Fields edited by a person; the AI never overwrites them" }),
    virtues: z.array(ActivityVirtueSchema),
  })
  .openapi("PastoralProfile");

export const ProfileTextsSchema = z
  .object({
    pastoralDescription: z.string().trim().min(1).max(2000).optional(),
    coexistenceImpact: z.string().trim().min(1).max(2000).optional(),
  })
  .openapi("PastoralProfileTexts");

export const ProfileVirtuesSchema = z
  .object({
    virtues: z
      .array(
        z.object({
          name: z.string().trim().min(2).max(60).openapi({ example: "Servicio" }),
          explanation: z
            .string()
            .trim()
            .max(1500)
            .nullable()
            .default(null)
            .openapi({
              description: "How this activity promotes the virtue; when empty, the catalog explanation is shown",
              example: "En la Festividad de Santa Rosa de Lima se fortalece el servicio, inspirado en su entrega a los necesitados.",
            }),
        }),
      )
      .min(MIN_VIRTUES)
      .max(MAX_VIRTUES),
  })
  .openapi("PastoralProfileVirtues");

export const RegenerateProfileSchema = z
  .object({ fields: z.array(z.enum(PROFILE_FIELDS)).min(1).openapi({ example: ["reflectionImage"] }) })
  .openapi("RegenerateProfile");

export const VirtueInputSchema = z
  .object({
    name: z.string().trim().min(2).max(60).openapi({ example: "Gratitud" }),
    explanation: z.string().trim().max(1000).default("").openapi({ description: "Leave empty to let the AI write it" }),
  })
  .openapi("VirtueInput");

export const ImageUploadSchema = z
  .object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_IMAGE_BYTES, "Image larger than 15 MB")
      .openapi({ type: "string", format: "binary", description: "JPG, PNG or WEBP up to 15 MB" }),
  })
  .openapi("ImageUpload");

export type VirtueDto = z.infer<typeof VirtueSchema>;
export type ActivityVirtueDto = z.infer<typeof ActivityVirtueSchema>;
export type ProfileVirtuesDto = z.input<typeof ProfileVirtuesSchema>;
export type VirtueUsageDto = z.infer<typeof VirtueUsageSchema>;
export type ProfileDto = z.infer<typeof ProfileSchema>;
export type ProfileTextsDto = z.infer<typeof ProfileTextsSchema>;
export type VirtueInputDto = z.input<typeof VirtueInputSchema>;
