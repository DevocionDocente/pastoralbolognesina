import { randomUUID } from "node:crypto";
import type { ObjectStorage } from "./object-storage";

export class ReflectionImageStore {
  constructor(private readonly storage: ObjectStorage) {}

  async replace(folder: string, image: Buffer, previousKey: string | null): Promise<string> {
    const key = `reflections/${folder}/${randomUUID()}.webp`;
    await this.storage.putObject(key, image, "image/webp");
    if (previousKey) await this.storage.deleteObjects([previousKey]);
    return key;
  }

  async remove(key: string | null): Promise<void> {
    if (key) await this.storage.deleteObjects([key]);
  }

  async removeAll(keys: string[]): Promise<void> {
    if (keys.length > 0) await this.storage.deleteObjects(keys);
  }
}
