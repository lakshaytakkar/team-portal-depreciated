import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { getTeamById, getDefaultTeam } from "@/lib/teams-config";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { currentUser, currentTeamId, simulatedRole, myTeamMemberships, setMyTeamMemberships } = useStore();

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
    ? (simulatedRole || 'manager')
    : (currentMembership?.role || 'executive');

  const isTeamAdmin = effectiveRole === 'manager';

  const navGroups = (isTeamAdmin && currentTeam.adminGroups) ? currentTeam.adminGroups : currentTeam.groups;

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const displayRole = isSuperadmin
    ? 'Super Admin'
    : effectiveRole === 'manager' ? 'Manager' : 'Executive';

  return (
    <div
      className={cn(
        "flex h-screen w-[210px] flex-col border-r bg-sidebar shrink-0 overflow-hidden z-40",
        !inSheet && "fixed top-0",
        className
      )}
      style={!inSheet ? { left: '52px' } : undefined}
    >
      <div className="px-3.5 pt-3.5 pb-2.5 border-b border-sidebar-border shrink-0">
        <div className="text-[14px] font-semibold tracking-tight text-foreground leading-snug truncate">
          {currentTeam.name}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {currentTeam.subtitle}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1.5">
          {navGroups.map((group, i) => (
            <div key={i} className="py-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground px-3.5 mb-0.5 py-1">
                {group.label}
              </h3>
              <div>
                {group.items.map((item) => {
                  const isActive = location === item.href || (item.href !== "/" && item.href !== "/dashboard" && location.startsWith(item.href));
                  const isDashboardActive = item.href === "/dashboard" && (location === "/dashboard" || location === "/");
                  const active = isActive || isDashboardActive;
                  return (
                    <Link key={item.label} href={item.href}>
                      <div
                        className={cn(
                          "group flex items-center gap-2.5 px-3.5 h-[30px] text-[13px] cursor-pointer relative transition-colors",
                          active
                            ? "text-foreground font-medium bg-background"
                            : "text-sidebar-foreground hover:bg-background hover:text-foreground"
                        )}
                        data-testid={`navitem-${item.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                      >
                        {active && (
                          <div
                            className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-[2px]"
                            style={{ backgroundColor: currentTeam.color }}
                          />
                        )}
                        <div
                          className="h-[5px] w-[5px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: active ? currentTeam.color : 'hsl(var(--border))' }}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {isSuperadmin && currentTeam.id !== 'admin-it' && (
            <div className="py-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground px-3.5 mb-0.5 py-1">
                System
              </h3>
              <Link href="/admin/settings">
                <div
                  className={cn(
                    "group flex items-center gap-2.5 px-3.5 h-[30px] text-[13px] cursor-pointer relative transition-colors",
                    location.startsWith("/admin/settings")
                      ? "text-foreground font-medium bg-background"
                      : "text-sidebar-foreground hover:bg-background hover:text-foreground"
                  )}
                  data-testid="navitem-settings"
                >
                  {location.startsWith("/admin/settings") && (
                    <div
                      className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-[2px]"
                      style={{ backgroundColor: currentTeam.color }}
                    />
                  )}
                  <Settings className="h-[14px] w-[14px] flex-shrink-0" />
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-3 py-2.5 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-[26px] w-[26px] flex-shrink-0">
            <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name} />
            <AvatarFallback
              className="text-[10px] font-semibold"
              style={{ backgroundColor: '#E6F1FB', color: '#0C447C' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-medium text-foreground truncate leading-snug" data-testid="sidebar-user-name">
              {currentUser?.name || 'User'}
            </span>
            <span className="text-[11px] text-muted-foreground truncate leading-snug" data-testid="sidebar-user-role">
              {displayRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
