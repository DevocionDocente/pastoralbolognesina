import { apiClient, type ApiClient } from "@/shared/lib/api-client";
import type {
  ActivityDto,
  ActivityInputDto,
  AnalysisDto,
  CompleteUploadDto,
  MediaDetailsDto,
  MediaDto,
  UploadTicketDto,
} from "../../http/activity-schemas";
import type { MediaCategory } from "../../domain/media-category";
import type { ProfileField } from "../../domain/pastoral-profile";
import type { ProfileDto, ProfileTextsDto, ProfileVirtuesDto } from "../../http/profile-schemas";

export class ActivityApi {
  constructor(private readonly client: ApiClient) {}

  create(input: ActivityInputDto) {
    return this.client.post<ActivityDto>("/activities", input);
  }

  update(id: string, input: ActivityInputDto) {
    return this.client.put<ActivityDto>(`/activities/${id}`, input);
  }

  setPublished(id: string, published: boolean) {
    return this.client.patch<ActivityDto>(`/activities/${id}/publication`, { published });
  }

  delete(id: string) {
    return this.client.delete(`/activities/${id}`);
  }

  startUpload(id: string, file: { fileName: string; sizeBytes: number }) {
    return this.client.post<UploadTicketDto>(`/activities/${id}/uploads`, file);
  }

  completeUpload(id: string, upload: CompleteUploadDto) {
    return this.client.post<MediaDto>(`/activities/${id}/uploads/complete`, upload);
  }

  abortUpload(id: string, upload: { uploadId: string; key: string }) {
    return this.client.post<void>(`/activities/${id}/uploads/abort`, upload);
  }

  addYoutube(id: string, url: string) {
    return this.client.post<MediaDto>(`/activities/${id}/media/youtube`, { url });
  }

  updateMedia(mediaId: string, details: MediaDetailsDto) {
    return this.client.patch<MediaDto>(`/media/${mediaId}`, details);
  }

  analysis(mediaId: string) {
    return this.client.get<AnalysisDto>(`/media/${mediaId}/analysis`);
  }

  retryAnalysis(mediaId: string) {
    return this.client.post<MediaDto>(`/media/${mediaId}/analysis/retry`);
  }

  setCategory(mediaId: string, category: MediaCategory) {
    return this.client.patch<MediaDto>(`/media/${mediaId}/category`, { category });
  }

  updateProfile(id: string, texts: ProfileTextsDto) {
    return this.client.patch<ProfileDto>(`/activities/${id}/profile`, texts);
  }

  setVirtues(id: string, virtues: ProfileVirtuesDto["virtues"]) {
    return this.client.put<ProfileDto>(`/activities/${id}/profile/virtues`, { virtues });
  }

  replaceProfileImage(id: string, file: File) {
    return this.client.upload<ProfileDto>(`/activities/${id}/profile/image`, imageForm(file));
  }

  replaceVirtueImage(id: string, virtueId: string, file: File) {
    return this.client.upload<ProfileDto>(`/activities/${id}/profile/virtues/${virtueId}/image`, imageForm(file));
  }

  regenerateVirtueImage(id: string, virtueId: string) {
    return this.client.post<void>(`/activities/${id}/profile/virtues/${virtueId}/image/regenerate`);
  }

  resetVirtueImage(id: string, virtueId: string) {
    return this.client.delete(`/activities/${id}/profile/virtues/${virtueId}/image`);
  }

  regenerateProfile(id: string, fields: ProfileField[]) {
    return this.client.post<ProfileDto>(`/activities/${id}/profile/regenerate`, { fields });
  }

  deleteMedia(mediaId: string) {
    return this.client.delete(`/media/${mediaId}`);
  }
}

export function imageForm(file: File): FormData {
  const form = new FormData();
  form.append("file", file);
  return form;
}

export const activityApi = new ActivityApi(apiClient);
