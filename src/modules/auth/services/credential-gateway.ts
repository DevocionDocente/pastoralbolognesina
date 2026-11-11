export interface NewCredentialUser {
  name: string;
  email: string;
  password: string;
}

export interface CredentialGateway {
  createActiveUser(user: NewCredentialUser, roleId: string): Promise<string>;
  setPassword(userId: string, password: string): Promise<void>;
}
