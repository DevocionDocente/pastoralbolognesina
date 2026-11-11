import { readFile } from "node:fs/promises";
import path from "node:path";
import { toFile, type Uploadable } from "openai";

const REFERENCES = [
  { file: "logo.jpg", shows: "the school crest" },
  { file: "student-sweater.jpg", shows: "the student sweater: navy blue, red sleeves, navy cuffs and waistband, red V-neck trim, three thin red stripes across the chest and the crest as a small badge on the left chest" },
  { file: "student-uniform.jpg", shows: "the full student uniform: the sweater over a white shirt with a navy tie, a pleated navy and red tartan skirt with navy knee socks, or navy trousers, and black school shoes" },
  { file: "student-tracksuit.jpg", shows: "the student tracksuit (buzo) for physical education and many activities: white jacket with navy sleeves and shoulders, a red and white stripe on the shoulder, navy trousers with a white and red side stripe, white sneakers" },
  { file: "student-tracksuit-group.jpg", shows: "students in the tracksuit and a female teacher in her red blazer during a school activity" },
  { file: "female-teachers.jpg", shows: "the female teachers' institutional outfit: red blazer over a black top and black trousers" },
  { file: "female-teachers-standing.jpg", shows: "the female teachers' red blazer outfit seen full length" },
  { file: "male-teacher.jpg", shows: "the male teachers' outfit: navy suit, light blue shirt and tie, black shoes" },
] as const;

export class SchoolReferences {
  private loading?: Promise<Uploadable[]>;

  constructor(private readonly directory: string) {}

  images(): Promise<Uploadable[]> {
    this.loading ??= Promise.all(
      REFERENCES.map(async ({ file }) => toFile(await readFile(path.resolve(this.directory, file)), file, { type: "image/jpeg" })),
    );
    return this.loading;
  }

  guide(): string {
    const list = REFERENCES.map(({ shows }, index) => `Reference image ${index + 1}: ${shows}.`).join("\n");
    return `The reference images show I.E. 6064 "Francisco Bolognesi" (Villa El Salvador, Lima, Peru). Use them only to dress people correctly and to show the crest:
${list}
Students wear either the full uniform or the tracksuit, as fits the scene (never mix them on one person). Female teachers wear the red blazer outfit; male teachers wear the navy suit. Draw new, different people: never copy the faces of the reference photos. The crest appears only as a small badge on clothing or a banner; never draw it large and never write any lettering.`;
  }
}
