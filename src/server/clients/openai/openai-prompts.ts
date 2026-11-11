import type { ActivityMaterial, SummaryMaterial } from "@/modules/activities/services/ai-client";

const AUDIENCE =
  "You index evidence of pastoral activities of a Catholic school so that parents can find it with simple searches. Always answer in Spanish (Peru). Be concrete and factual; never invent names of people.";

export const PROMPTS = {
  photo: (context: string) =>
    `${AUDIENCE}\n${context}\nDescribe the photo in 2 to 4 sentences: people and approximate ages, what they are doing (dances, prayer, procession, mass, games…), clothing and costumes, objects, place and any visible text. Then give 5 to 12 short search tags in Spanish (single words or short phrases) that a parent might type.`,
  frames: (context: string) =>
    `${AUDIENCE}\n${context}\nThese are frames of a video; each image is preceded by its second. For each frame write one short sentence describing what is happening. Skip frames that add nothing new.`,
  pdf: (context: string) =>
    `${AUDIENCE}\n${context}\nRead this document (it may be scanned). Return its full readable text, a 2 to 4 sentence description of what it is and what it contains, and 5 to 12 search tags in Spanish.`,
  summary: (material: SummaryMaterial) =>
    [
      AUDIENCE,
      material.context,
      `Material type: ${material.kind}.`,
      material.title ? `Title: ${material.title}` : null,
      material.sourceDescription ? `Original description: ${material.sourceDescription.slice(0, 3000)}` : null,
      material.transcript ? `Transcript: ${material.transcript.slice(0, 40_000)}` : null,
      material.moments?.length ? `What is seen:\n${material.moments.map((moment) => `[${moment.second}s] ${moment.text}`).join("\n")}` : null,
      material.text ? `Document text:\n${material.text}` : null,
      "Describe this material in 3 to 5 sentences (what happens or what it contains, who takes part, key moments or topics) and give 5 to 12 search tags in Spanish.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  activity: (material: ActivityMaterial) =>
    [
      AUDIENCE,
      material.context,
      "Evidence registered for this activity:",
      material.items.map((item) => `- ${item.name}: ${item.description}`).join("\n"),
      "Write a summary of 4 to 6 sentences of how the activity was carried out: what was done, who took part, the main moments and any materials used. It will be compared with editions of other years, so be specific. Plain text, no lists.",
    ].join("\n\n"),
};

export const DESCRIPTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["description", "tags"],
  properties: {
    description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
};

export const DOCUMENT_SCHEMA = {
  ...DESCRIPTION_SCHEMA,
  required: ["description", "tags", "text"],
  properties: { ...DESCRIPTION_SCHEMA.properties, text: { type: "string" } },
};

export const MOMENTS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["moments"],
  properties: {
    moments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["second", "text"],
        properties: { second: { type: "integer" }, text: { type: "string" } },
      },
    },
  },
};
