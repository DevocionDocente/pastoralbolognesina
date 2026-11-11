import { apiClient, type ApiClient } from "@/shared/lib/api-client";
import type {
  AccessRecordDto,
  CreateUserInput,
  RevokeAccessInput,
  UpdateUserInput,
  UserDto,
  UserPermissionsDto,
} from "../../http/user-schemas";
import type { Permission } from "../../domain/permissions";

export class UserApi {
  constructor(private readonly client: ApiClient) {}

  create(input: CreateUserInput) {
    return this.client.post<UserDto>("/users", input);
  }

  update(id: string, input: UpdateUserInput) {
    return this.client.patch<UserDto>(`/users/${id}`, input);
  }

  grant(id: string, roleId: string) {
    return this.client.post<UserDto>(`/users/${id}/grant`, { roleId });
  }

  revoke(id: string, input: RevokeAccessInput) {
    return this.client.post<UserDto>(`/users/${id}/revoke`, input);
  }

  reject(id: string) {
    return this.client.delete(`/users/${id}`);
  }

  resetPassword(id: string, password: string) {
    return this.client.post<void>(`/users/${id}/password`, { password });
  }

  permissions(id: string) {
    return this.client.get<UserPermissionsDto>(`/users/${id}/permissions`);
  }

  setPermissions(id: string, permissions: Permission[]) {
    return this.client.put<UserPermissionsDto>(`/users/${id}/permissions`, { permissions });
  }

  accessHistory(id: string) {
    return this.client.get<AccessRecordDto[]>(`/users/${id}/access-history`);
  }
}

export const userApi = new UserApi(apiClient);
