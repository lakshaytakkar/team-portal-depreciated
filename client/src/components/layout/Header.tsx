import { useState } from "react";
import { Link } from "wouter";
import { 
  Bell, 
  Search,
  Command,
  Clock,
  CheckCircle2,
  Package,
  Settings,
  User,
  LogOut,
  Shield,
  Eye,
  Crown,
  Moon,
  Sun,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchDialog } from "@/components/modals/SearchDialog";
import { SignOutDialog } from "@/components/modals/SignOutDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTeamById } from "@/lib/teams-config";
import { useTheme } from "@/components/theme-provider";
import { AIChatDrawer } from "@/components/ai-chat/AIChatDrawer";

export function Header() {
  const { currentUser, simulatedRole, setSimulatedRole, currentTeamId, getEffectiveRole } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const isSuperadmin = currentUser?.role === 'superadmin';
  const currentTeam = getTeamById(currentTeamId);
  const effectiveRole = getEffectiveRole();

  const notifications = [
    {
      id: 1,
      title: "Shipment Delayed",
      message: "SHP-1004 is delayed due to customs check",
      time: "2 hours ago",
      icon: Clock,
      read: false
    },
    {
      id: 2,
      title: "Shipment Delivered",
      message: "SHP-1002 has been successfully delivered",
      time: "5 hours ago",
      icon: CheckCircle2,
      read: true
    },
    {
      id: 3,
      title: "Customs Clearance Complete",
      message: "SHP-1001 cleared Singapore customs",
      time: "1 day ago",
      icon: User,
      read: true
    },
    {
      id: 4,
      title: "New Shipment Created",
      message: "SHP-1006 has been added to the system",
      time: "2 days ago",
      icon: Package,
      read: true
    }
  ];

  const handleLogout = () => {
    setLogoutOpen(false);
  };

  return (
    <>
      <header className="flex h-20 items-center justify-between px-6 bg-card border-b shrink-0" data-testid="header">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-card border rounded-lg shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none w-72 hover-elevate transition-colors text-left"
            data-testid="button-search"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground font-normal tracking-[0.02em]">Search</span>
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center h-5 w-5 bg-muted rounded" data-testid="search-cmd-key">
                <Command className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center h-5 w-5 bg-muted rounded" data-testid="search-k-key">
                <span className="text-[13px] font-semibold text-muted-foreground leading-none tracking-[0.02em]">K</span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {isSuperadmin && (
            <div className="flex items-center gap-1.5 mr-2 bg-muted p-1 rounded-lg" data-testid="role-switcher">
              <Button 
                variant={effectiveRole === 'superadmin' ? 'default' : 'ghost'} 
                size="sm" 
                className="text-xs gap-1.5 toggle-elevate"
                onClick={() => setSimulatedRole('superadmin')}
                data-testid="button-role-superadmin"
              >
                <Crown className="h-3 w-3" />
                SuperAdmin
              </Button>
              <Button 
                variant={effectiveRole === 'manager' ? 'default' : 'ghost'} 
                size="sm" 
                className="text-xs gap-1.5 toggle-elevate"
                onClick={() => setSimulatedRole('manager')}
                data-testid="button-role-manager"
              >
                <Shield className="h-3 w-3" />
                Manager
              </Button>
              <Button 
                variant={effectiveRole === 'executive' ? 'default' : 'ghost'} 
                size="sm" 
                className="text-xs gap-1.5 toggle-elevate"
                onClick={() => setSimulatedRole('executive')}
                data-testid="button-role-executive"
              >
                <Eye className="h-3 w-3" />
                Executive
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <div className="relative cursor-pointer" data-testid="button-notifications">
                <div className="flex items-center justify-center h-8 w-8 rounded-full border bg-card">
                  <Bell className="h-4 w-4 text-foreground" />
                </div>
                {notifications.some(n => !n.read) && (
                  <div className="absolute top-[7px] right-0 h-2 w-2 bg-primary rounded-full" />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 rounded-lg shadow-lg"
              align="end"
            >
              <div className="flex items-center justify-between gap-2 p-5 border-b">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Notifications</h3>
                  <div className="bg-primary text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {notifications.filter(n => !n.read).length}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0">
                      <notification.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{notification.message}</p>
                      <span className="text-[12px] text-muted-foreground/70">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex items-center justify-between gap-2">
                <button className="text-sm font-semibold text-primary" data-testid="button-mark-all-read">
                  Mark as all read
                </button>
                <Button size="sm">View All</Button>
              </div>
            </PopoverContent>
          </Popover>

          <div
            className="relative cursor-pointer"
            onClick={() => setAiChatOpen(true)}
            data-testid="button-ai-chat"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full border bg-card hover:bg-primary/10 transition-colors">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>

          <div className="h-5 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none hover-elevate rounded-lg px-2 py-1" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name} />
                  <AvatarFallback className="bg-primary text-white text-sm font-medium">
                    {currentUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-[12px] font-semibold leading-[1.5] tracking-[0.02em]" data-testid="text-user-name">{currentUser?.name}</span>
                  <span className="text-[12px] text-muted-foreground leading-[1.5] tracking-[0.02em]" data-testid="text-user-role">
                    {effectiveRole === 'superadmin' ? 'Super Admin' : effectiveRole === 'manager' ? 'Manager' : 'Executive'}
                    {isSuperadmin && simulatedRole && simulatedRole !== 'superadmin' && (
                      <span className="ml-1 text-primary">
                        (viewing as {simulatedRole})
                      </span>
                    )}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem data-testid="menuitem-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/settings">
                <DropdownMenuItem data-testid="menuitem-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setLogoutOpen(true)} data-testid="menuitem-logout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <SignOutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={handleLogout} />
      <AIChatDrawer open={aiChatOpen} onOpenChange={setAiChatOpen} />
    </>
  );
}
