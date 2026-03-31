import type { Permission, PermissionCategory, UserGroup, UserStatus, CreationMethod, AuthMethod, OnboardingStatus, AppUser } from "@/types/users";
export type { Permission, PermissionCategory, UserGroup, UserStatus, CreationMethod, AuthMethod, OnboardingStatus, AppUser };


export const permissionCategories: PermissionCategory[] = [
  { id: "dashboard", label: "Dashboard", actions: ["view"] },
  { id: "clients", label: "Clients", actions: ["view", "create", "edit", "delete", "export"] },
  { id: "documents", label: "Documents", actions: ["view", "create", "edit", "delete", "export"] },
  { id: "operations", label: "Operations", actions: ["view", "create", "edit", "delete"] },
  { id: "finance", label: "Finance", actions: ["view", "create", "edit", "delete", "export"] },
  { id: "hr", label: "HR & People", actions: ["view", "create", "edit", "delete"] },
  { id: "reports", label: "Reports", actions: ["view", "create", "export"] },
  { id: "settings", label: "Settings", actions: ["view", "edit"] },
  { id: "users", label: "Users", actions: ["view", "create", "edit", "delete"] },
  { id: "user-groups", label: "User Groups", actions: ["view", "create", "edit", "delete"] },
  { id: "integrations", label: "Integrations", actions: ["view", "create", "edit", "delete"] },
  { id: "billing", label: "Billing", actions: ["view", "edit"] },
];

function makePermissions(categories: string[], actions: string[], resource: "all" | "own" = "all"): Permission[] {
  return categories.flatMap((cat) =>
    actions
      .filter((action) => {
        const catDef = permissionCategories.find((c) => c.id === cat);
        return catDef ? catDef.actions.includes(action) : false;
      })
      .map((action) => ({
        id: `${cat}:${action}`,
        category: cat,
        action,
        resource,
      }))
  );
}

const allCategories = permissionCategories.map((c) => c.id);
const allActions = ["view", "create", "edit", "delete", "export"];

export const mockUserGroups: UserGroup[] = [
  {
    id: "grp-001",
    name: "Super Admin",
    description: "Full system access with all permissions across every module and vertical",
    color: "#7c3aed",
    memberCount: 2,
    permissions: makePermissions(allCategories, allActions),
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-03-01T14:00:00Z",
  },
  {
    id: "grp-002",
    name: "Manager",
    description: "Can view, create, and edit most resources but cannot delete or manage users",
    color: "#0284c7",
    memberCount: 4,
    permissions: makePermissions(
      ["dashboard", "clients", "documents", "operations", "finance", "hr", "reports", "settings"],
      ["view", "create", "edit", "export"]
    ),
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-02-20T11:00:00Z",
  },
  {
    id: "grp-003",
    name: "Team Member",
    description: "Standard access for day-to-day operations with limited editing capabilities",
    color: "#059669",
    memberCount: 8,
    permissions: [
      ...makePermissions(["dashboard", "reports"], ["view"]),
      ...makePermissions(["clients", "documents", "operations"], ["view", "create", "edit"], "own"),
    ],
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-03-01T14:00:00Z",
  },
  {
    id: "grp-004",
    name: "Viewer",
    description: "Read-only access to view data and reports without any modification rights",
    color: "#64748b",
    memberCount: 3,
    permissions: makePermissions(["dashboard", "clients", "documents", "operations", "reports"], ["view"]),
    createdAt: "2025-02-10T09:00:00Z",
    updatedAt: "2025-02-10T09:00:00Z",
  },
  {
    id: "grp-005",
    name: "Client Portal User",
    description: "External user access limited to their own portal data and documents",
    color: "#d97706",
    memberCount: 12,
    permissions: [
      ...makePermissions(["dashboard"], ["view"]),
      ...makePermissions(["documents"], ["view", "create"], "own"),
      ...makePermissions(["billing"], ["view"]),
    ],
    createdAt: "2025-03-01T09:00:00Z",
    updatedAt: "2025-03-05T16:00:00Z",
  },
];

export const mockAppUsers: AppUser[] = [
  {
    id: "usr-001",
    email: "lakshay@startupsquad.in",
    name: "Admin",
    createdTime: "2025-10-16T12:41:56Z",
    synced: false,
    syncMethod: "Upgrade",
    status: "not-invited",
    userGroups: ["grp-001"],
    creationMethod: "manual",
    authMethod: "email-password",
    onboarding: "not-started",
  },
  {
    id: "usr-002",
    email: "sahil@startupsquad.in",
    name: "Sahil",
    createdTime: "2025-10-16T12:41:56Z",
    synced: false,
    syncMethod: "Upgrade",
    status: "activated",
    userGroups: ["grp-001"],
    creationMethod: "manual",
    authMethod: "email-password",
    onboarding: "completed",
  },
  {
    id: "usr-003",
    email: "testuser@example.com",
    name: "Test User",
    createdTime: "2025-10-15T12:38:17Z",
    lastSeenTime: "2025-10-16T08:22:00Z",
    synced: false,
    syncMethod: "Upgrade",
    status: "activated",
    userGroups: ["grp-003"],
    creationMethod: "manual",
    authMethod: "email-password",
    onboarding: "not-started",
  },
  {
    id: "usr-004",
    email: "priya.sharma@lumin.io",
    name: "Priya Sharma",
    createdTime: "2025-09-20T10:15:00Z",
    lastSeenTime: "2025-10-16T11:45:00Z",
    synced: true,
    syncMethod: "Google",
    status: "activated",
    userGroups: ["grp-002"],
    creationMethod: "self-signup",
    authMethod: "google-sso",
    onboarding: "completed",
  },
  {
    id: "usr-005",
    email: "rahul.mehta@lumin.io",
    name: "Rahul Mehta",
    createdTime: "2025-08-12T14:30:00Z",
    lastSeenTime: "2025-10-15T09:00:00Z",
    synced: true,
    syncMethod: "Google",
    status: "activated",
    userGroups: ["grp-002", "grp-003"],
    creationMethod: "manual",
    authMethod: "google-sso",
    onboarding: "completed",
  },
  {
    id: "usr-006",
    email: "neha.verma@partner.co",
    name: "Neha Verma",
    createdTime: "2025-10-01T08:00:00Z",
    status: "invited",
    synced: false,
    userGroups: ["grp-004"],
    creationMethod: "manual",
    authMethod: "magic-link",
    onboarding: "not-started",
  },
  {
    id: "usr-007",
    email: "alex.johnson@client.com",
    name: "Alex Johnson",
    createdTime: "2025-10-10T16:20:00Z",
    lastSeenTime: "2025-10-14T12:00:00Z",
    synced: false,
    status: "activated",
    userGroups: ["grp-005"],
    creationMethod: "self-signup",
    authMethod: "email-password",
    onboarding: "in-progress",
  },
  {
    id: "usr-008",
    email: "maria.gonzalez@vendor.co",
    name: "Maria Gonzalez",
    createdTime: "2025-09-05T11:00:00Z",
    status: "suspended",
    synced: false,
    userGroups: ["grp-003"],
    creationMethod: "import",
    authMethod: "email-password",
    onboarding: "completed",
  },
  {
    id: "usr-009",
    email: "dev.api@system.internal",
    name: "API Service Account",
    createdTime: "2025-07-01T00:00:00Z",
    lastSeenTime: "2025-10-16T12:00:00Z",
    synced: true,
    syncMethod: "API",
    status: "activated",
    userGroups: ["grp-001"],
    creationMethod: "api",
    authMethod: "saml",
    onboarding: "completed",
  },
  {
    id: "usr-010",
    email: "new.hire@lumin.io",
    name: "Ankit Patel",
    createdTime: "2025-10-15T09:00:00Z",
    status: "invited",
    synced: false,
    userGroups: ["grp-003"],
    creationMethod: "manual",
    authMethod: "email-password",
    onboarding: "not-started",
  },
];

export function getUserGroupById(id: string): UserGroup | undefined {
  return mockUserGroups.find((g) => g.id === id);
}

export function getUserGroupNames(groupIds: string[]): string[] {
  return groupIds.map((id) => getUserGroupById(id)?.name ?? id);
}

export function hasPermission(
  userGroupIds: string[],
  category: string,
  action: string
): boolean {
  for (const groupId of userGroupIds) {
    const group = getUserGroupById(groupId);
    if (!group) continue;
    const found = group.permissions.some(
      (p) => p.category === category && p.action === action
    );
    if (found) return true;
  }
  return false;
}
