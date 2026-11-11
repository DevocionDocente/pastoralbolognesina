import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Permission } from "@/modules/auth/domain/permissions";
import type { UserProfile } from "@/modules/auth/domain/user-profile";
import { container } from "./container";

export async function currentProfile(): Promise<UserProfile | null> {
  const requestHeaders = await headers();
  const { auth, profileService } = container();
  const session = await auth.api.getSession({ headers: requestHeaders });
  return session ? profileService.getProfile(session.user.id) : null;
}

export async function requirePermission(permission: Permission): Promise<UserProfile> {
  return requireAnyPermission([permission]);
}

export async function requireAnyPermission(permissions: readonly Permission[]): Promise<UserProfile> {
  const profile = await currentProfile();
  if (!profile) redirect("/login");
  if (!permissions.some((permission) => profile.permissions.includes(permission))) redirect("/dashboard");
  return profile;
}
