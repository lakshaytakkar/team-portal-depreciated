import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getPersonAvatar } from "@/lib/avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex flex-col">
          <h1 className="text-base font-semibold font-heading leading-tight" data-testid="text-page-title">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground" data-testid="text-page-subtitle">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 w-56 pl-8 text-sm"
            data-testid="input-global-search"
          />
        </div>

        <Button size="icon" variant="ghost" className="relative" data-testid="button-notifications">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive animate-pulse" />
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-user-menu">
              <img src={getPersonAvatar("Sneha Patel", 28)} alt="SP" className="size-7 rounded-full" />
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium">Sneha Patel</span>
                <span className="text-xs text-muted-foreground">Operations Manager</span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem data-testid="menu-item-profile">My Profile</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-item-settings">Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-item-logout">Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
