import { open } from "node:fs/promises";
import { basename } from "node:path";

interface Activity {
  id: string;
  name: string;
  published: boolean;
}

interface UploadTicket {
  uploadId: string;
  key: string;
  partSize: number;
  partUrls: string[];
}

export class PastoralClient {
  private cookie = "";

  constructor(private readonly baseUrl: string) {}

  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: this.baseUrl },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error(`Sign in failed with ${response.status}`);
    this.cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  }

  async findActivity(name: string): Promise<Activity | null> {
    const activities = await this.request<Activity[]>("GET", `/activities?q=${encodeURIComponent(name)}`);
    return activities.find((activity) => activity.name === name) ?? null;
  }

  createActivity(input: { name: string; year: number; seriesName: string }): Promise<Activity> {
    return this.request<Activity>("POST", "/activities", { ...input, description: null, date: null });
  }

  async mediaNames(activityId: string): Promise<Set<string>> {
    const media = await this.request<{ originalName: string }[]>("GET", `/activities/${activityId}/media`);
    return new Set(media.map((item) => item.originalName));
  }

  async upload(activityId: string, path: string, size: number): Promise<void> {
    const fileName = basename(path);
    const ticket = await this.request<UploadTicket>("POST", `/activities/${activityId}/uploads`, { fileName, sizeBytes: size });
    const parts = await this.putParts(path, ticket);
    await this.request("POST", `/activities/${activityId}/uploads/complete`, {
      fileName,
      sizeBytes: size,
      uploadId: ticket.uploadId,
      key: ticket.key,
      parts,
    });
  }

  publish(activityId: string): Promise<Activity> {
    return this.request<Activity>("PATCH", `/activities/${activityId}/publication`, { published: true });
  }

  private async putParts(path: string, ticket: UploadTicket) {
    const file = await open(path);
    try {
      const parts: { partNumber: number; etag: string }[] = [];
      for (const [index, url] of ticket.partUrls.entries()) {
        const buffer = Buffer.alloc(ticket.partSize);
        const { bytesRead } = await file.read(buffer, 0, ticket.partSize, index * ticket.partSize);
        const response = await fetch(url, { method: "PUT", body: buffer.subarray(0, bytesRead) });
        const etag = response.headers.get("etag");
        if (!response.ok || !etag) throw new Error(`Part ${index + 1} failed with ${response.status}`);
        parts.push({ partNumber: index + 1, etag });
      }
      return parts;
    } finally {
      await file.close();
    }
  }

  private async request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api${path}`, {
      method,
      headers: { Cookie: this.cookie, Origin: this.baseUrl, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error(`${method} ${path} failed with ${response.status}: ${await response.text()}`);
    return (response.status === 204 ? undefined : await response.json()) as T;
  }
}
