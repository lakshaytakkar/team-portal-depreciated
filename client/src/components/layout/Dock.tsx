import { useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { teams } from "@/lib/teams-config";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: string;
}

interface DockProps {
  className?: string;
}

export function Dock({ className }: DockProps) {
  const { currentUser, currentTeamId, setCurrentTeamId, setMyTeamMemberships } = useStore();
  const isSuperadmin = currentUser?.role === 'superadmin';

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

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        "flex flex-col items-center w-[52px] flex-shrink-0 border-r bg-sidebar border-sidebar-border py-2.5 gap-1 fixed left-0 top-0 h-full z-50",
        className
      )}
      data-testid="dock"
    >
      <div className="flex flex-col items-center gap-1 flex-1 w-full">
        {accessibleTeams.map((team) => {
          const isActive = currentTeamId === team.id;
          const TeamIcon = team.icon;
          const activeTeamIds = ["travel-sales"];
          const isEnabled = activeTeamIds.includes(team.id);
          return (
            <Tooltip key={team.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="relative flex items-center justify-center w-full">
                  {isActive && isEnabled && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-[3px]"
                      style={{ backgroundColor: 'hsl(var(--foreground))' }}
                    />
                  )}
                  <button
                    onClick={() => isEnabled && setCurrentTeamId(team.id)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-[10px] transition-opacity",
                      isEnabled
                        ? cn("cursor-pointer", isActive ? "ring-2 ring-offset-1 ring-sidebar-border" : "opacity-80 hover:opacity-100")
                        : "cursor-not-allowed grayscale opacity-40"
                    )}
                    style={{ backgroundColor: isEnabled ? team.color : undefined }}
                    data-testid={`dock-icon-${team.id}`}
                    disabled={!isEnabled}
                  >
                    <TeamIcon className={cn("h-[18px] w-[18px]", isEnabled ? "text-white" : "text-muted-foreground")} />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium" data-testid={`tooltip-dock-${team.id}`}>
                {team.name}{!isEnabled && " (Coming Soon)"}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1 mt-auto pb-1">
        <div className="w-6 h-px bg-sidebar-border my-1" />

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link
              href="/admin/settings"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-sidebar-border cursor-pointer hover:opacity-80 transition-opacity"
              data-testid="dock-settings"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Settings</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Avatar
              className="h-8 w-8 border border-sidebar-border cursor-pointer hover:opacity-80 transition-opacity"
              data-testid="dock-user-avatar"
            >
              <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name} />
              <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: '#E6F1FB', color: '#0C447C' }}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{currentUser?.name || 'User'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
