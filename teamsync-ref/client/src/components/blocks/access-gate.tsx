import { type ReactNode, createContext, useContext, useMemo } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  hasPermission,
  type UserGroup,
  mockUserGroups,
} from "@/lib/mock-data-users";

interface AccessContextValue {
  currentUserGroups: string[];
  allGroups: UserGroup[];
}

const AccessContext = createContext<AccessContextValue>({
  currentUserGroups: ["grp-001"],
  allGroups: mockUserGroups,
});

interface AccessProviderProps {
  userGroups?: string[];
  children: ReactNode;
}

export function AccessProvider({
  userGroups = ["grp-001"],
  children,
}: AccessProviderProps) {
  const value = useMemo<AccessContextValue>(
    () => ({ currentUserGroups: userGroups, allGroups: mockUserGroups }),
    [userGroups]
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useAccessControl() {
  const { currentUserGroups, allGroups } = useContext(AccessContext);

  const checkPermission = (category: string, action: string): boolean =>
    hasPermission(currentUserGroups, category, action);

  return {
    hasAccess: true,
    userGroups: currentUserGroups,
    allGroups,
    checkPermission,
  };
}

interface AccessGateProps {
  requiredPermission: { category: string; action: string };
  userGroups?: string[];
  fallback?: "hide" | "lock-overlay" | "blur" | "full-page-lock";
  children: ReactNode;
}

export function AccessGate({
  requiredPermission,
  userGroups,
  fallback = "hide",
  children,
}: AccessGateProps) {
  const { checkPermission, userGroups: contextGroups } = useAccessControl();
  const groups = userGroups ?? contextGroups;
  const allowed = hasPermission(
    groups,
    requiredPermission.category,
    requiredPermission.action
  );

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback === "hide") {
    return null;
  }

  if (fallback === "lock-overlay") {
    return (
      <div className="relative" data-testid="access-gate-lock-overlay">
        <div className="pointer-events-none select-none opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-[2px] rounded-md">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Upgrade to access
          </span>
          <PermissionBadge
            category={requiredPermission.category}
            action={requiredPermission.action}
          />
        </div>
      </div>
    );
  }

  if (fallback === "blur") {
    return (
      <div className="relative" data-testid="access-gate-blur">
        <div className="pointer-events-none select-none blur-sm">
          {children}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="gap-1" data-testid="access-gate-blur-badge">
            <Lock className="h-3 w-3" />
            Locked
          </Badge>
        </div>
      </div>
    );
  }

  if (fallback === "full-page-lock") {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        data-testid="access-gate-full-page-lock"
      >
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Access Restricted</h2>
            <p className="text-sm text-muted-foreground text-center">
              You don't have the required permissions to view this content.
            </p>
            <PermissionBadge
              category={requiredPermission.category}
              action={requiredPermission.action}
            />
            <Button variant="outline" data-testid="button-request-access">
              Request Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

interface PermissionBadgeProps {
  category: string;
  action: string;
  className?: string;
}

export function PermissionBadge({
  category,
  action,
  className,
}: PermissionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-xs capitalize", className)}
      data-testid={`permission-badge-${category}-${action}`}
    >
      <Lock className="h-2.5 w-2.5" />
      {category} : {action}
    </Badge>
  );
}
