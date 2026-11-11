import { MEDIA_CATEGORIES } from "@/modules/activities/domain/media-category";
import { MAX_VIRTUES, MIN_VIRTUES } from "@/modules/activities/domain/pastoral-profile";
import type { CategoryMaterial, ProfileMaterial } from "@/modules/activities/services/ai-client";

const SCHOOL =
  "You write for the pastoral area of I.E. 6064 \"Francisco Bolognesi\" (Villa El Salvador, Lima, Peru), a school that promotes good coexistence through Christian virtues. Always answer in Spanish (Peru), warm and pastoral but concrete. Base everything on the evidence; never invent names, dates or facts.";

export const IMAGE_STYLE =
  "Warm devotional digital painting that invites prayer and reflection, soft golden light, reverent and hopeful mood, gentle colors. Absolutely no text, letters, numbers or watermarks. When people appear, they are the Peruvian school community of a public school in Villa El Salvador, Lima: children and teenagers, their teachers and families.";

export const PASTORAL_PROMPTS = {
  category: ({ kind, name, description }: CategoryMaterial) =>
    `Classify a file registered as evidence of a school pastoral activity.
File kind: ${kind}. File name: ${name}.
What it contains: ${description}
Categories: image (a photo of people, places or moments), video, pastoral_plan (plan pastoral anual o de área), meeting_agreements (acta o acuerdos de reunión), activity_work_plan (esquema o plan de trabajo de una actividad), financial_report (balance económico, rendición de cuentas, montos recaudados), report (informe, oficio, comunicado, constancia), other.
Photos are "image" unless the photo itself is clearly a document (for example a photographed statement or receipt). Videos and YouTube links are "video".`,
  profile: ({ context, summary, items, existingVirtues }: ProfileMaterial) =>
    [
      SCHOOL,
      context,
      summary ? `Summary of the evidence: ${summary}` : null,
      `Evidence:\n${items.map((item) => `- ${item.name}: ${item.description}`).join("\n")}`,
      `Existing virtues catalog (reuse these exact names whenever they fit): ${existingVirtues.length ? existingVirtues.join("; ") : "(empty)"}`,
      `Write:
1. pastoralDescription: 1 to 3 sentences on the pastoral meaning of the activity, in first person plural (for example "Acompañamos a nuestro Señor Jesucristo en su pasión..."). Do not start with the activity name.
2. coexistenceImpact: 1 to 3 sentences on how the activity improves school coexistence (respect, dialogue, forgiveness, solidarity...).
3. virtues: between ${MIN_VIRTUES} and ${MAX_VIRTUES} Christian virtues that this specific activity most clearly promotes, chosen from what actually happened (a Marian procession suggests "Devoción a María" or "Humildad"; a collection for the needy suggests "Caridad" or "Generosidad"; a penitential liturgy suggests "Perdón y Reconciliación"). Families filter activities by virtue, so do not give every activity the same generic set: at most 2 may be broad virtues such as Fe, Respeto, Solidaridad or Gratitud. When a catalog virtue means the same as the one you intend, use the catalog's exact name instead of a synonym. Names are short (1 to 4 words, e.g. "Perdón y Reconciliación"). Each with a 1 to 2 sentence explanation of the virtue for families.
4. imagePrompt: in English, a scene for an illustration that invites meditation on this activity, based on what actually happened (place, moment, symbols). Say who appears (for example primary students, secondary students, teachers, families) and whether students wear the full school uniform or the school tracksuit, following the evidence; when unclear, use the full uniform. No text in the image.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  virtue: (name: string) =>
    `${SCHOOL}\nExplain the Christian virtue "${name}" for families of the school in 1 to 2 sentences, connecting it with everyday school life.`,
};

export const CATEGORY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["category"],
  properties: { category: { type: "string", enum: [...MEDIA_CATEGORIES] } },
};

export const PROFILE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["pastoralDescription", "coexistenceImpact", "virtues", "imagePrompt"],
  properties: {
    pastoralDescription: { type: "string" },
    coexistenceImpact: { type: "string" },
    imagePrompt: { type: "string" },
    virtues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "explanation"],
        properties: { name: { type: "string" }, explanation: { type: "string" } },
      },
    },
  },
};

export const EXPLANATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["explanation"],
  properties: { explanation: { type: "string" } },
};
