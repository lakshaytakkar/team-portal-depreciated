export interface Permission {
  id: string;
  category: string;
  action: string;
  resource: "all" | "own";
}

export interface PermissionCategory {
  id: string;
  label: string;
  actions: string[];
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "activated" | "invited" | "suspended" | "not-invited";
export type CreationMethod = "manual" | "import" | "api" | "self-signup";
export type AuthMethod = "email-password" | "google-sso" | "magic-link" | "saml";
export type OnboardingStatus = "not-started" | "in-progress" | "completed";
export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdTime: string;
  lastSeenTime?: string;
  synced: boolean;
  syncMethod?: string;
  status: UserStatus;
  userGroups: string[];
  creationMethod: CreationMethod;
  authMethod: AuthMethod;
  onboarding: OnboardingStatus;
}
