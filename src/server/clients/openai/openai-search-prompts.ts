import type { CatalogEntry } from "@/modules/activities/domain/search";
import type { RelevanceMaterial } from "@/modules/activities/services/ai-client";

const ARCHIVE =
  "You help families search the pastoral activity archive of a Catholic public school (I.E. 6064 \"Francisco Bolognesi\", Villa El Salvador, Lima, Peru). Activities are religious celebrations, processions, masses, collections and school events, written in Spanish.";

export const SEARCH_PROMPTS = {
  expansion: (query: string, catalog: CatalogEntry[]) =>
    `${ARCHIVE}

Search query: "${query}"

Catalog of published activities (id | name | recurring series):
${catalog.map((entry) => `${entry.id} | ${entry.name} | ${entry.series ?? "-"}`).join("\n")}

Return:
1. variants: up to 4 short Spanish search phrases that mean the same as the query: popular or devotional names, synonyms and spelling fixes (for example "cristo moreno" -> "Señor de los Milagros", "Cristo de Pachacamilla", "octubre morado"). Do not repeat the query. Empty when there is nothing useful to add.
2. activityIds: ids of catalog activities the query refers to by their name, saint, devotion or popular name. Leave it empty when the query describes content or a topic (for example "niños rezando" or "danza") instead of naming a celebration. Never select an activity just because it shares one word with the query: "santa rosa" refers to Santa Rosa de Lima, not to Semana Santa.`,
  relevance: ({ query, variants, candidates }: RelevanceMaterial) =>
    `${ARCHIVE}

Search query: "${query}"${variants.length ? `\nSame meaning as: ${variants.join("; ")}` : ""}

Score how well each activity answers the query:
3 = it is exactly what the person is looking for.
2 = it clearly matches: its celebration, theme or the content of its photos, videos and documents is what the query asks for.
1 = only loosely related, or it merely shares a word with the query (for example "Semana Santa" for "santa rosa").
0 = unrelated.
When the query names a specific celebration, saint or devotion, only that celebration can score 2 or 3. When it describes content (people, actions, objects), score by the evidence of the activity's files.

Activities:
${candidates
  .map(
    (candidate) =>
      `[${candidate.id}] ${candidate.title}${candidate.series ? ` (serie: ${candidate.series})` : ""}\n${candidate.description}${
        candidate.evidence.length ? `\nEvidence: ${candidate.evidence.join(" / ")}` : ""
      }`,
  )
  .join("\n\n")}`,
};

export function expansionSchema(ids: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["variants", "activityIds"],
    properties: {
      variants: { type: "array", items: { type: "string" } },
      activityIds: { type: "array", items: ids.length ? { type: "string", enum: ids } : { type: "string" } },
    },
  };
}

export function relevanceSchema(ids: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["verdicts"],
    properties: {
      verdicts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "score"],
          properties: { id: { type: "string", enum: ids }, score: { type: "integer", enum: [0, 1, 2, 3] } },
        },
      },
    },
  };
}
