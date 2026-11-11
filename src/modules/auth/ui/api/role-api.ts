import { apiClient, type ApiClient } from "@/shared/lib/api-client";
import type { RoleDto, RoleInputDto } from "../../http/role-schemas";

export class RoleApi {
  constructor(private readonly client: ApiClient) {}

  create(input: RoleInputDto) {
    return this.client.post<RoleDto>("/roles", input);
  }

  update(id: string, input: RoleInputDto) {
    return this.client.put<RoleDto>(`/roles/${id}`, input);
  }

  delete(id: string) {
    return this.client.delete(`/roles/${id}`);
  }
}

export const roleApi = new RoleApi(apiClient);
