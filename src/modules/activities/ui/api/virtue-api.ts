import { apiClient, type ApiClient } from "@/shared/lib/api-client";
import type { VirtueDto, VirtueInputDto } from "../../http/profile-schemas";
import { imageForm } from "./activity-api";

export class VirtueApi {
  constructor(private readonly client: ApiClient) {}

  create(input: VirtueInputDto) {
    return this.client.post<VirtueDto>("/virtues", input);
  }

  update(id: string, input: VirtueInputDto) {
    return this.client.patch<VirtueDto>(`/virtues/${id}`, input);
  }

  delete(id: string) {
    return this.client.delete(`/virtues/${id}`);
  }

  replaceImage(id: string, file: File) {
    return this.client.upload<VirtueDto>(`/virtues/${id}/image`, imageForm(file));
  }

  regenerateImage(id: string) {
    return this.client.post<void>(`/virtues/${id}/image/regenerate`);
  }
}

export const virtueApi = new VirtueApi(apiClient);
