import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPersonAvatar, getThingAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: { avatar: "h-5 w-5", text: "text-[8px]", title: "text-xs", subtitle: "text-[10px]", gap: "gap-1.5" },
  sm: { avatar: "h-6 w-6", text: "text-[9px]", title: "text-sm", subtitle: "text-xs", gap: "gap-2" },
  md: { avatar: "h-8 w-8", text: "text-[10px]", title: "text-sm", subtitle: "text-xs", gap: "gap-2.5" },
  lg: { avatar: "h-10 w-10", text: "text-xs", title: "text-base", subtitle: "text-sm", gap: "gap-3" },
};

type CellSize = keyof typeof sizeMap;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PersonCellProps {
  name: string;
  subtitle?: string;
  size?: CellSize;
  className?: string;
  avatarUrl?: string;
}

export function PersonCell({ name, subtitle, size = "md", className, avatarUrl }: PersonCellProps) {
  const s = sizeMap[size];
  const src = avatarUrl ?? getPersonAvatar(name, size === "lg" ? 64 : 32);

  return (
    <div className={cn("flex items-center", s.gap, className)} data-testid="person-cell">
      <Avatar className={cn(s.avatar, "shrink-0")}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className={s.text}>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className={cn("font-medium truncate", s.title)} data-testid="person-cell-name">{name}</p>
        {subtitle && (
          <p className={cn("text-muted-foreground truncate", s.subtitle)} data-testid="person-cell-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface CompanyCellProps {
  name: string;
  subtitle?: string;
  size?: CellSize;
  className?: string;
  avatarUrl?: string;
}

export function CompanyCell({ name, subtitle, size = "md", className, avatarUrl }: CompanyCellProps) {
  const s = sizeMap[size];
  const src = avatarUrl ?? getThingAvatar(name, size === "lg" ? 64 : 32);

  return (
    <div className={cn("flex items-center", s.gap, className)} data-testid="company-cell">
      <Avatar className={cn(s.avatar, "shrink-0 rounded-lg")}>
        <AvatarImage src={src} alt={name} className="rounded-lg" />
        <AvatarFallback className={cn(s.text, "rounded-lg")}>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className={cn("font-medium truncate", s.title)} data-testid="company-cell-name">{name}</p>
        {subtitle && (
          <p className={cn("text-muted-foreground truncate", s.subtitle)} data-testid="company-cell-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
