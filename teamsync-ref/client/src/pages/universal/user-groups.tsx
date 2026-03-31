import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Users,
  Lock,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import {
  type UserGroup,
  type Permission,
  type PermissionCategory,
  permissionCategories,
  mockUserGroups,
  mockAppUsers,
} from "@/lib/mock-data-users";
import { PageShell, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/ui/animated";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLOR_OPTIONS = [
  "#7c3aed",
  "#0284c7",
  "#059669",
  "#64748b",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#4f46e5",
  "#0891b2",
  "#16a34a",
];

interface GroupFormState {
  name: string;
  description: string;
  color: string;
  permissions: Permission[];
  resourceScopes: Record<string, "all" | "own">;
}

function getInitialFormState(): GroupFormState {
  return {
    name: "",
    description: "",
    color: "#7c3aed",
    permissions: [],
    resourceScopes: Object.fromEntries(
      permissionCategories.map((c) => [c.id, "all" as const])
    ),
  };
}

function groupFormFromGroup(group: UserGroup): GroupFormState {
  const resourceScopes: Record<string, "all" | "own"> = {};
  for (const cat of permissionCategories) {
    const catPerms = group.permissions.filter((p) => p.category === cat.id);
    const hasOwn = catPerms.some((p) => p.resource === "own");
    resourceScopes[cat.id] = hasOwn ? "own" : "all";
  }
  return {
    name: group.name,
    description: group.description,
    color: group.color,
    permissions: [...group.permissions],
    resourceScopes,
  };
}

function hasCategoryAction(
  permissions: Permission[],
  category: string,
  action: string
): boolean {
  return permissions.some(
    (p) => p.category === category && p.action === action
  );
}

function toggleCategoryAction(
  permissions: Permission[],
  category: string,
  action: string,
  resource: "all" | "own"
): Permission[] {
  const exists = hasCategoryAction(permissions, category, action);
  if (exists) {
    return permissions.filter(
      (p) => !(p.category === category && p.action === action)
    );
  }
  return [
    ...permissions,
    {
      id: `${category}:${action}`,
      category,
      action,
      resource,
    },
  ];
}

function setCategoryAllActions(
  permissions: Permission[],
  category: PermissionCategory,
  enabled: boolean,
  resource: "all" | "own"
): Permission[] {
  const withoutCategory = permissions.filter((p) => p.category !== category.id);
  if (!enabled) return withoutCategory;
  const newPerms = category.actions.map((action) => ({
    id: `${category.id}:${action}`,
    category: category.id,
    action,
    resource,
  }));
  return [...withoutCategory, ...newPerms];
}

function CategoryCheckState(
  permissions: Permission[],
  category: PermissionCategory
): "all" | "some" | "none" {
  const count = category.actions.filter((a) =>
    hasCategoryAction(permissions, category.id, a)
  ).length;
  if (count === 0) return "none";
  if (count === category.actions.length) return "all";
  return "some";
}

function PermissionMatrix({
  form,
  setForm,
}: {
  form: GroupFormState;
  setForm: React.Dispatch<React.SetStateAction<GroupFormState>>;
}) {
  const allActions = ["view", "create", "edit", "delete", "export"];

  const globalCheckState = useMemo(() => {
    let total = 0;
    let checked = 0;
    for (const cat of permissionCategories) {
      for (const action of cat.actions) {
        total++;
        if (hasCategoryAction(form.permissions, cat.id, action)) checked++;
      }
    }
    if (checked === 0) return "none";
    if (checked === total) return "all";
    return "some";
  }, [form.permissions]);

  const handleGlobalToggle = () => {
    if (globalCheckState === "all") {
      setForm((prev) => ({ ...prev, permissions: [] }));
    } else {
      const allPerms: Permission[] = [];
      for (const cat of permissionCategories) {
        const resource = form.resourceScopes[cat.id] || "all";
        for (const action of cat.actions) {
          allPerms.push({
            id: `${cat.id}:${action}`,
            category: cat.id,
            action,
            resource,
          });
        }
      }
      setForm((prev) => ({ ...prev, permissions: allPerms }));
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Permissions</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGlobalToggle}
          data-testid="button-toggle-all-permissions"
        >
          {globalCheckState === "all" ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-[180px]">
                Category
              </th>
              {allActions.map((action) => (
                <th
                  key={action}
                  className="px-2 py-2 text-center text-xs font-medium text-muted-foreground capitalize"
                >
                  {action}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                Scope
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground w-[80px]">
                Toggle
              </th>
            </tr>
          </thead>
          <tbody>
            {permissionCategories.map((cat) => {
              const checkState = CategoryCheckState(form.permissions, cat);
              const resource = form.resourceScopes[cat.id] || "all";
              return (
                <tr
                  key={cat.id}
                  className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-sm">
                    {cat.label}
                  </td>
                  {allActions.map((action) => {
                    const available = cat.actions.includes(action);
                    const checked = hasCategoryAction(
                      form.permissions,
                      cat.id,
                      action
                    );
                    return (
                      <td key={action} className="px-2 py-2 text-center">
                        {available ? (
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              setForm((prev) => ({
                                ...prev,
                                permissions: toggleCategoryAction(
                                  prev.permissions,
                                  cat.id,
                                  action,
                                  resource
                                ),
                              }))
                            }
                            data-testid={`checkbox-perm-${cat.id}-${action}`}
                          />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center">
                    <Select
                      value={resource}
                      onValueChange={(val: "all" | "own") =>
                        setForm((prev) => {
                          const updated = prev.permissions.map((p) =>
                            p.category === cat.id
                              ? { ...p, resource: val }
                              : p
                          );
                          return {
                            ...prev,
                            permissions: updated,
                            resourceScopes: {
                              ...prev.resourceScopes,
                              [cat.id]: val,
                            },
                          };
                        })
                      }
                    >
                      <SelectTrigger
                        className="text-xs w-[70px]"
                        data-testid={`select-scope-${cat.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="own">Own</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          permissions: setCategoryAllActions(
                            prev.permissions,
                            cat,
                            checkState !== "all",
                            resource
                          ),
                        }))
                      }
                      className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`button-toggle-category-${cat.id}`}
                    >
                      {checkState === "all" ? (
                        <CheckSquare className="size-4" />
                      ) : checkState === "some" ? (
                        <MinusSquare className="size-4" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupFormDialog({
  open,
  onOpenChange,
  editGroup,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGroup: UserGroup | null;
  onSave: (form: GroupFormState) => void;
}) {
  const [form, setForm] = useState<GroupFormState>(
    editGroup ? groupFormFromGroup(editGroup) : getInitialFormState()
  );

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold font-heading">
            {editGroup ? "Edit User Group" : "Create User Group"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editGroup
              ? "Update group details and permissions"
              : "Define a new permission group with granular access controls"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-160px)]">
          <div className="px-6 pb-4 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="group-name" className="text-sm">
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Content Editor"
                  data-testid="input-group-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Color</Label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, color: c }))
                      }
                      className={cn(
                        "size-7 rounded-md transition-all",
                        form.color === c &&
                          "ring-2 ring-offset-2 ring-offset-background"
                      )}
                      style={{
                        backgroundColor: c,
                        ...(form.color === c ? { ringColor: c } : {}),
                      }}
                      data-testid={`button-color-${c.replace("#", "")}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-desc" className="text-sm">
                Description
              </Label>
              <Textarea
                id="group-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this group's purpose..."
                rows={2}
                className="resize-none"
                data-testid="input-group-description"
              />
            </div>

            <PermissionMatrix form={form} setForm={setForm} />
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-group-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.name.trim()}
            data-testid="button-group-save"
          >
            {editGroup ? "Update Group" : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupDetailDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UserGroup | null;
}) {
  if (!group) return null;

  const members = mockAppUsers.filter((u) =>
    u.userGroups.includes(group.id)
  );

  const permissionsByCategory = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const p of group.permissions) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p.action);
    }
    return map;
  }, [group.permissions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: group.color + "20", color: group.color }}
            >
              <Shield className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold font-heading">
                {group.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {group.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Members ({members.length})
            </h4>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members in this group
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3"
                    data-testid={`member-${member.id}`}
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Permissions ({group.permissions.length})
            </h4>
            <div className="space-y-3">
              {Object.entries(permissionsByCategory).map(
                ([catId, actions]) => {
                  const catDef = permissionCategories.find(
                    (c) => c.id === catId
                  );
                  return (
                    <div key={catId}>
                      <p className="text-sm font-medium mb-1">
                        {catDef?.label || catId}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {actions.map((action) => (
                          <Badge
                            key={action}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-detail-close"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UniversalUserGroups() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const brandColor = vertical?.color ?? "#7c3aed";

  const [groups, setGroups] = useState<UserGroup[]>(mockUserGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<UserGroup | null>(null);
  const [detailGroup, setDetailGroup] = useState<UserGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserGroup | null>(null);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  const handleCreate = () => {
    setEditGroup(null);
    setFormOpen(true);
  };

  const handleEdit = (group: UserGroup) => {
    setEditGroup(group);
    setFormOpen(true);
  };

  const handleSave = (form: GroupFormState) => {
    if (editGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editGroup.id
            ? {
                ...g,
                name: form.name,
                description: form.description,
                color: form.color,
                permissions: form.permissions,
                updatedAt: new Date().toISOString(),
              }
            : g
        )
      );
    } else {
      const newGroup: UserGroup = {
        id: `grp-${Date.now()}`,
        name: form.name,
        description: form.description,
        color: form.color,
        memberCount: 0,
        permissions: form.permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, newGroup]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <PageShell>
      <PageHeader
        title="User Groups"
        subtitle="Manage permission groups and access controls"
        actions={
          <Button
            onClick={handleCreate}
            style={{ backgroundColor: brandColor, borderColor: brandColor }}
            className="text-white"
            data-testid="button-create-group"
          >
            <Plus className="size-4 mr-1.5" />
            Create Group
          </Button>
        }
      />

      <div className="relative w-80">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-groups"
        />
      </div>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => {
          const memberCount = mockAppUsers.filter((u) =>
            u.userGroups.includes(group.id)
          ).length;

          return (
            <StaggerItem key={group.id}>
              <Card
                className="hover-elevate cursor-pointer overflow-visible"
                onClick={() => setDetailGroup(group)}
                data-testid={`card-group-${group.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: group.color + "20",
                          color: group.color,
                        }}
                      >
                        <Shield className="size-5" />
                      </div>
                      <div>
                        <h3
                          className="text-sm font-semibold"
                          data-testid={`text-group-name-${group.id}`}
                        >
                          {group.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      <span data-testid={`text-member-count-${group.id}`}>
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3.5" />
                      <span
                        data-testid={`text-permission-count-${group.id}`}
                      >
                        {group.permissions.length} permission
                        {group.permissions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="h-1.5 rounded-full flex-1"
                      style={{ backgroundColor: group.color + "20" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: group.color,
                          width: `${Math.min(
                            100,
                            (group.permissions.length /
                              permissionCategories.reduce(
                                (acc, c) => acc + c.actions.length,
                                0
                              )) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(group)}
                        data-testid={`button-edit-group-${group.id}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget(group)}
                        data-testid={`button-delete-group-${group.id}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>

      {filteredGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="size-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">No groups found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchQuery
              ? "Try a different search term"
              : "Create your first user group to get started"}
          </p>
        </div>
      )}

      {formOpen && (
        <GroupFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editGroup={editGroup}
          onSave={handleSave}
        />
      )}

      <GroupDetailDialog
        open={!!detailGroup}
        onOpenChange={(open) => !open && setDetailGroup(null)}
        group={detailGroup}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-testid="confirm-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}
              &quot;? This will remove the group and its permissions. Members
              will lose access granted by this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-delete-confirm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
