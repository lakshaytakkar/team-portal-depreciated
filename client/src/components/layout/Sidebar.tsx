import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Settings, HelpCircle, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { getTeamById, getDefaultTeam } from "@/lib/teams-config";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignOutDialog } from "@/components/modals/SignOutDialog";

interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: string;
}

interface SidebarProps {
  className?: string;
  inSheet?: boolean;
}

export function Sidebar({ className, inSheet = false }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser, currentTeamId, simulatedRole, myTeamMemberships, setMyTeamMemberships, setCurrentUser } = useStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    setCurrentUser(null);
    setLogoutOpen(false);
    window.location.href = '/login';
  };

  const { data: fetchedMemberships = [] } = useQuery<TeamMembership[]>({
    queryKey: ['/api/my-teams'],
    enabled: !!currentUser,
    staleTime: 30000,
  });

  useEffect(() => {
    if (fetchedMemberships.length > 0) {
      setMyTeamMemberships(fetchedMemberships);
    }
  }, [fetchedMemberships, setMyTeamMemberships]);

  const userRole = currentUser?.role || 'sales_executive';
  const isSuperadmin = userRole === 'superadmin';

  const currentTeam = getTeamById(currentTeamId) || getDefaultTeam();

  const currentMembership = myTeamMemberships.find(m => m.teamId === currentTeamId);
  const effectiveRole = isSuperadmin
    ? (simulatedRole || 'superadmin')
    : (currentMembership?.role || 'executive');

  const isSuperadminRole = effectiveRole === 'superadmin';
  const isTeamAdmin = effectiveRole === 'manager' || isSuperadminRole;

  const navGroups = isSuperadminRole && currentTeam.superadminGroups
    ? currentTeam.superadminGroups
    : (isTeamAdmin && currentTeam.adminGroups)
      ? currentTeam.adminGroups
      : currentTeam.groups;

  const navGroupsHaveSettings = navGroups.some(g => g.items.some(i => i.href === '/admin/settings'));

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location === href || (href !== "/" && location.startsWith(href));
  };

  return (
    <>
      <div
        className={cn(
          "flex h-screen w-[210px] flex-col bg-white dark:bg-[#1a1d24] border-r border-[#dfe1e7] dark:border-[#2a2d36] shrink-0 overflow-hidden z-40",
          !inSheet && "fixed top-0",
          className
        )}
        style={!inSheet ? { left: '52px' } : undefined}
        data-testid="sidebar"
      >
        <div className="px-3.5 pt-4 pb-3 border-b border-[#dfe1e7] dark:border-[#2a2d36] shrink-0">
          <div className="text-[28px] font-extrabold tracking-tight leading-none">
            <span className="text-foreground">Team</span>
            <span className="text-[#2563EB]">Sync</span>
          </div>
        </div>

        <ScrollArea className="flex-1 py-1.5">
          <div className="px-2">
            {navGroups.map((group, i) => (
              <div key={i} className="py-1">
                <h3
                  className="text-[10px] font-semibold uppercase text-[#a4acb9] dark:text-[#6b7280] px-2.5 mb-0.5 py-1 leading-none"
                  style={{ letterSpacing: '0.28px' }}
                >
                  {group.label}
                </h3>
                <div>
                  {group.items.map((item) => {
                    const active = isItemActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href}>
                        <div
                          className={cn(
                            "relative flex items-center gap-2 px-2.5 h-[30px] rounded-md cursor-pointer transition-colors",
                            active
                              ? "bg-[#f6f8fa] dark:bg-[#252830]"
                              : "hover:bg-[#f6f8fa] dark:hover:bg-[#252830]"
                          )}
                          data-testid={`navitem-${item.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                        >
                          {active && (
                            <div
                              className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-[3px]"
                              style={{ backgroundColor: '#2563EB' }}
                            />
                          )}
                          <Icon
                            className="w-[14px] h-[14px] shrink-0"
                            style={{ color: active ? '#2563EB' : '#666d80' }}
                          />
                          <span
                            className={cn(
                              "text-[13px] leading-none",
                              active
                                ? "font-medium text-[#1a1d24] dark:text-white"
                                : "text-[#666d80] dark:text-[#8891a4]"
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {isSuperadmin && !isSuperadminRole && currentTeam.id !== 'admin-it' && (
              <div className="py-1">
                <h3
                  className="text-[10px] font-semibold uppercase text-[#a4acb9] dark:text-[#6b7280] px-2.5 mb-0.5 py-1 leading-none"
                  style={{ letterSpacing: '0.28px' }}
                >
                  System
                </h3>
                <Link href="/admin/settings">
                  <div
                    className={cn(
                      "relative flex items-center gap-2 px-2.5 h-[30px] rounded-md cursor-pointer transition-colors",
                      location.startsWith("/admin/settings")
                        ? "bg-[#f6f8fa] dark:bg-[#252830]"
                        : "hover:bg-[#f6f8fa] dark:hover:bg-[#252830]"
                    )}
                    data-testid="navitem-settings"
                  >
                    {location.startsWith("/admin/settings") && (
                      <div
                        className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-[3px]"
                        style={{ backgroundColor: '#2563EB' }}
                      />
                    )}
                    <Settings
                      className="w-[14px] h-[14px] shrink-0"
                      style={{ color: location.startsWith("/admin/settings") ? '#2563EB' : '#666d80' }}
                    />
                    <span
                      className={cn(
                        "text-[13px] leading-none",
                        location.startsWith("/admin/settings")
                          ? "font-medium text-[#1a1d24] dark:text-white"
                          : "text-[#666d80] dark:text-[#8891a4]"
                      )}
                    >
                      Settings
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom section */}
        <div className="border-t border-[#dfe1e7] dark:border-[#2a2d36] px-2 py-2 shrink-0">
          <div className="space-y-0.5">
            {!navGroupsHaveSettings && (
              <Link href="/admin/settings">
                <div
                  className={cn(
                    "flex items-center gap-2 px-2.5 h-[30px] rounded-md cursor-pointer transition-colors",
                    location.startsWith("/admin/settings")
                      ? "bg-[#f6f8fa] dark:bg-[#252830]"
                      : "hover:bg-[#f6f8fa] dark:hover:bg-[#252830]"
                  )}
                  data-testid="navitem-bottom-settings"
                >
                  <Settings className="w-[14px] h-[14px] text-[#666d80] dark:text-[#8891a4] shrink-0" />
                  <span className="text-[13px] text-[#666d80] dark:text-[#8891a4] leading-none">
                    Settings
                  </span>
                </div>
              </Link>
            )}
            <div
              className="flex items-center gap-2 px-2.5 h-[30px] rounded-md cursor-pointer hover:bg-[#f6f8fa] dark:hover:bg-[#252830] transition-colors"
              data-testid="navitem-help"
            >
              <HelpCircle className="w-[14px] h-[14px] text-[#666d80] dark:text-[#8891a4] shrink-0" />
              <span className="text-[13px] text-[#666d80] dark:text-[#8891a4] leading-none">
                Help & Center
              </span>
            </div>
            <button
              className="flex items-center gap-2 px-2.5 h-[30px] rounded-md cursor-pointer hover:bg-[#f6f8fa] dark:hover:bg-[#252830] transition-colors w-full text-left"
              onClick={() => setLogoutOpen(true)}
              data-testid="button-logout"
            >
              <LogOut className="w-[14px] h-[14px] text-[#df1c41] shrink-0" />
              <span className="text-[13px] text-[#df1c41] leading-none">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      <SignOutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={handleLogout} />
    </>
  );
}
