import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { teams, getTeamById, getDefaultTeam } from "@/lib/teams-config";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMemberWithUser {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: string;
}

interface SidebarProps {
  className?: string;
}

const isBusinessTeam = (teamId: string) => 
  teamId.startsWith('travel-') || 
  teamId.startsWith('china-import-') || 
  teamId.startsWith('dropshipping-') || 
  teamId.startsWith('llc-') ||
  teamId.startsWith('faire-') ||
  teamId === 'events';

const isFunctionalTeam = (teamId: string) => 
  teamId === 'hr' || 
  teamId === 'training' ||
  teamId === 'marketing' || 
  teamId === 'admin-it' ||
  teamId === 'sales' ||
  teamId === 'media';

function TeamMemberAvatars({ teamId }: { teamId: string }) {
  const { data: members = [] } = useQuery<TeamMemberWithUser[]>({
    queryKey: ['/api/team-members', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/team-members?teamId=${teamId}`);
      return res.json();
    },
    staleTime: 60000,
  });

  const displayMembers = members.slice(0, 4);
  const remainingCount = members.length - 4;

  if (members.length === 0) return null;

  return (
    <div className="flex -space-x-2 flex-shrink-0" data-testid={`team-member-avatars-${teamId}`}>
      {displayMembers.map((member, index) => (
        <Tooltip key={member.id}>
          <TooltipTrigger asChild>
            <Avatar 
              className="h-6 w-6 border-2 border-background cursor-pointer"
              data-testid={`avatar-member-${teamId}-${index}`}
            >
              <AvatarImage src={member.user?.avatar} alt={member.user?.name} />
              <AvatarFallback className="text-[10px] bg-muted">
                {member.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs" data-testid={`tooltip-member-${teamId}-${index}`}>
            <p className="font-medium" data-testid={`text-member-name-${member.id}`}>{member.user?.name}</p>
            <p className="text-muted-foreground capitalize" data-testid={`text-member-role-${member.id}`}>{member.role}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar 
              className="h-6 w-6 border-2 border-background cursor-pointer"
              data-testid={`avatar-member-${teamId}-overflow`}
            >
              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                +{remainingCount}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs" data-testid={`tooltip-member-${teamId}-overflow`}>
            <p>{remainingCount} more member{remainingCount > 1 ? 's' : ''}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser, currentTeamId, setCurrentTeamId, simulatedRole, setMyTeamMemberships } = useStore();
  const userRole = currentUser?.role || 'sales_executive';
  const isSuperadmin = userRole === 'superadmin';

  const currentTeam = getTeamById(currentTeamId) || getDefaultTeam();
  
  const { data: myTeamMemberships = [] } = useQuery<TeamMembership[]>({
    queryKey: ['/api/my-teams'],
    enabled: !!currentUser,
    staleTime: 30000,
  });

  useEffect(() => {
    if (myTeamMemberships.length > 0) {
      setMyTeamMemberships(myTeamMemberships);
    }
  }, [myTeamMemberships, setMyTeamMemberships]);

  const myTeamIds = new Set(myTeamMemberships.map(m => m.teamId));
  
  const accessibleTeams = isSuperadmin 
    ? teams 
    : teams.filter(t => myTeamIds.has(t.id));

  const businessTeams = accessibleTeams.filter(t => isBusinessTeam(t.id));
  const functionalTeams = accessibleTeams.filter(t => isFunctionalTeam(t.id));

  const currentMembership = myTeamMemberships.find(m => m.teamId === currentTeamId);
  const effectiveRole = isSuperadmin 
    ? (simulatedRole || 'manager')
    : (currentMembership?.role || 'executive');
  
  const isTeamAdmin = effectiveRole === 'manager';
  
  const navGroups = (isTeamAdmin && currentTeam.adminGroups) ? currentTeam.adminGroups : currentTeam.groups;

  return (
    <div className={cn("flex h-screen w-[272px] flex-col border-r bg-sidebar shrink-0 fixed left-0 top-0 overflow-y-auto z-50 no-scrollbar", className)}>
      <div className="h-20 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-3 w-full hover-elevate rounded-md py-2 px-2 transition-colors cursor-pointer group"
              data-testid="button-team-switcher"
            >
              <div 
                className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: currentTeam.color }}
              >
                <currentTeam.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col flex-1 text-left min-w-0">
                <span className="text-[15px] font-semibold tracking-tight text-foreground leading-none truncate">{currentTeam.name}</span>
                <span className="text-[12px] text-muted-foreground mt-1 truncate">
                  {currentTeam.subtitle}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[380px]" sideOffset={4}>
          <ScrollArea className="h-[450px]">
            {businessTeams.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Business Teams</DropdownMenuLabel>
                {businessTeams.map((team) => (
                  <DropdownMenuItem 
                    key={team.id}
                    onClick={() => setCurrentTeamId(team.id)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                    data-testid={`menuitem-team-${team.id}`}
                  >
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: team.color + '20' }}
                    >
                      <team.icon className="h-4 w-4" style={{ color: team.color }} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{team.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{team.subtitle}</span>
                    </div>
                    <TeamMemberAvatars teamId={team.id} />
                    {currentTeamId === team.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            {businessTeams.length > 0 && functionalTeams.length > 0 && (
              <DropdownMenuSeparator />
            )}
            
            {functionalTeams.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Functional Teams</DropdownMenuLabel>
                {functionalTeams.map((team) => (
                  <DropdownMenuItem 
                    key={team.id}
                    onClick={() => setCurrentTeamId(team.id)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                    data-testid={`menuitem-team-${team.id}`}
                  >
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: team.color + '20' }}
                    >
                      <team.icon className="h-4 w-4" style={{ color: team.color }} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{team.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{team.subtitle}</span>
                    </div>
                    <TeamMemberAvatars teamId={team.id} />
                    {currentTeamId === team.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </ScrollArea>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 py-2 px-3 space-y-4">
        {navGroups.map((group, i) => (
          <div key={i} className="py-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground px-2 mb-1">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && item.href !== "/dashboard" && location.startsWith(item.href));
                const isDashboardActive = item.href === "/dashboard" && (location === "/dashboard" || location === "/");
                const active = isActive || isDashboardActive;
                return (
                  <Link key={item.label} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 h-9 text-[14px] font-medium transition-all cursor-pointer",
                        active
                          ? "bg-primary text-white"
                          : "text-sidebar-foreground hover-elevate"
                      )}
                      data-testid={`navitem-${item.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isSuperadmin && currentTeam.id !== 'admin-it' && (
          <div className="py-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground px-2 mb-1">
              System
            </h3>
            <Link href="/admin/settings">
              <div 
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 h-9 text-[14px] font-medium cursor-pointer transition-all",
                  location.startsWith("/admin/settings")
                    ? "bg-primary text-white"
                    : "text-sidebar-foreground hover-elevate"
                )}
                data-testid="navitem-settings"
              >
                <Settings className="h-[18px] w-[18px]" />
                <span>Settings</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
