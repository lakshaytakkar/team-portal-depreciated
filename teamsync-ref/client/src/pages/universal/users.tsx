import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { UserPlus, Shield, Check, X } from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import {
  mockAppUsers,
  mockUserGroups,
  getUserGroupNames,
  type AppUser,
  type UserStatus,
} from "@/lib/mock-data-users";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ds/data-table";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { PageShell, PageHeader, IndexToolbar } from "@/components/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusVariantMap: Record<UserStatus, "success" | "info" | "error" | "neutral"> = {
  activated: "success",
  invited: "info",
  suspended: "error",
  "not-invited": "neutral",
};

const onboardingVariantMap: Record<string, "success" | "info" | "neutral"> = {
  completed: "success",
  "in-progress": "info",
  "not-started": "neutral",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLabel(str: string): string {
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const columns: Column<AppUser>[] = [
  {
    key: "email",
    header: "Email",
    sortable: true,
    render: (user) => (
      <PersonCell name={user.name} subtitle={user.email} size="sm" />
    ),
  },
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (user) => (
      <span className="text-sm" data-testid={`text-user-name-${user.id}`}>{user.name}</span>
    ),
  },
  {
    key: "createdTime",
    header: "Created Time",
    sortable: true,
    render: (user) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-created-${user.id}`}>
        {formatDate(user.createdTime)}
      </span>
    ),
  },
  {
    key: "lastSeenTime",
    header: "Last Seen",
    sortable: true,
    render: (user) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-lastseen-${user.id}`}>
        {formatDate(user.lastSeenTime)}
      </span>
    ),
  },
  {
    key: "synced",
    header: "Synced",
    render: (user) => (
      <Badge
        variant="secondary"
        className="text-xs"
        data-testid={`badge-synced-${user.id}`}
      >
        {user.synced ? (
          <span className="flex items-center gap-1">
            <Check className="size-3" />
            {user.syncMethod ?? "Yes"}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <X className="size-3" />
            {user.syncMethod ?? "No"}
          </span>
        )}
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (user) => (
      <StatusBadge
        status={formatLabel(user.status)}
        variant={statusVariantMap[user.status]}
      />
    ),
  },
  {
    key: "userGroups",
    header: "User Groups",
    render: (user) => {
      const names = getUserGroupNames(user.userGroups);
      return (
        <div className="flex items-center gap-1 flex-wrap" data-testid={`badges-groups-${user.id}`}>
          {names.map((name) => (
            <Badge key={name} variant="outline" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    key: "creationMethod",
    header: "Creation",
    render: (user) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-creation-${user.id}`}>
        {formatLabel(user.creationMethod)}
      </span>
    ),
  },
  {
    key: "authMethod",
    header: "Auth Method",
    render: (user) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-auth-${user.id}`}>
        {formatLabel(user.authMethod)}
      </span>
    ),
  },
  {
    key: "onboarding",
    header: "Onboarding",
    render: (user) => (
      <StatusBadge
        status={formatLabel(user.onboarding)}
        variant={onboardingVariantMap[user.onboarding] ?? "neutral"}
      />
    ),
  },
];

export default function UsersPage() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const isLoading = useSimulatedLoading(600);

  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteGroups, setInviteGroups] = useState<string[]>([]);

  const brandColor = vertical?.color ?? "#6366f1";

  const filteredUsers = useMemo(() => {
    let result = [...mockAppUsers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockAppUsers.length };
    mockAppUsers.forEach((u) => {
      counts[u.status] = (counts[u.status] ?? 0) + 1;
    });
    return counts;
  }, []);

  const filterOptions = [
    { value: "all", label: "All", count: statusCounts.all },
    { value: "activated", label: "Activated", count: statusCounts.activated ?? 0 },
    { value: "invited", label: "Invited", count: statusCounts.invited ?? 0 },
    { value: "suspended", label: "Suspended", count: statusCounts.suspended ?? 0 },
    { value: "not-invited", label: "Not Invited", count: statusCounts["not-invited"] ?? 0 },
  ];

  const toggleInviteGroup = (groupId: string) => {
    setInviteGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const handleInviteSubmit = () => {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("");
    setInviteGroups([]);
  };

  return (
    <PageShell>
      <PageHeader
        title="Users & Access"
        subtitle="Manage users, roles, and permissions"
        actions={
          <Button
            onClick={() => setInviteOpen(true)}
            style={{ backgroundColor: brandColor, borderColor: brandColor }}
            className="text-white"
            data-testid="button-invite-user"
          >
            <UserPlus className="mr-1.5 size-4" />
            Invite User
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-users-groups">
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-groups">User Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-4">
          <PageTransition>
            {isLoading ? (
              <TableSkeleton rows={6} columns={8} />
            ) : (
              <Fade direction="up" delay={0.1}>
                <IndexToolbar
                  search={search}
                  onSearch={setSearch}
                  filters={filterOptions}
                  activeFilter={statusFilter}
                  onFilter={setStatusFilter}
                  color={brandColor}
                  placeholder="Search users by name or email..."
                />
                <div className="mt-4">
                  <DataTable
                    data={filteredUsers}
                    columns={columns}
                    searchPlaceholder="Search users..."
                    rowActions={[
                      { label: "Edit", onClick: () => {} },
                      { label: "Suspend", onClick: () => {}, variant: "destructive", separator: true },
                      { label: "Delete", onClick: () => {}, variant: "destructive" },
                    ]}
                    pageSize={10}
                    emptyTitle="No users found"
                    emptyDescription="Try adjusting your search or filters."
                  />
                </div>
              </Fade>
            )}
          </PageTransition>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <UserGroupsTab brandColor={brandColor} />
        </TabsContent>
      </Tabs>

      <FormDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite User"
        onSubmit={handleInviteSubmit}
        submitLabel="Send Invite"
      >
        <div className="space-y-1">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="user@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            data-testid="input-invite-email"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="invite-name">Name</Label>
          <Input
            id="invite-name"
            placeholder="Full name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            data-testid="input-invite-name"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="invite-role">Role</Label>
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger data-testid="select-invite-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Team Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>User Groups</Label>
          <div className="space-y-2 rounded-md border p-3">
            {mockUserGroups.map((group) => (
              <div key={group.id} className="flex items-center gap-2">
                <Checkbox
                  id={`invite-group-${group.id}`}
                  checked={inviteGroups.includes(group.id)}
                  onCheckedChange={() => toggleInviteGroup(group.id)}
                  data-testid={`checkbox-invite-group-${group.id}`}
                />
                <label
                  htmlFor={`invite-group-${group.id}`}
                  className="text-sm cursor-pointer"
                >
                  {group.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </FormDialog>
    </PageShell>
  );
}

function UserGroupsTab({ brandColor }: { brandColor: string }) {
  return (
    <Fade direction="up" delay={0.1}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="user-groups-grid">
        {mockUserGroups.map((group) => (
          <Card key={group.id} data-testid={`card-group-${group.id}`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <h3 className="text-sm font-semibold" data-testid={`text-group-name-${group.id}`}>
                    {group.name}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Shield className="size-3 mr-1" />
                  {group.permissions.length} permissions
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-group-desc-${group.id}`}>
                {group.description}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                </span>
                <Button size="sm" variant="outline" data-testid={`button-edit-group-${group.id}`}>
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Fade>
  );
}
