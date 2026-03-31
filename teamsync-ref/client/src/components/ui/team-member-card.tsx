import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import { SiWhatsapp, SiSlack } from "react-icons/si";
import { getPersonAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_DOT: Record<string, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-slate-400",
  active: "bg-emerald-500",
  inactive: "bg-slate-400",
  invited: "bg-blue-400",
};

export interface TeamMemberCardProps {
  id: string;
  name: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  status?: string;
  location?: string;
  avatarUrl?: string;
  accentColor?: string;
  onEmailClick?: () => void;
  onWhatsAppClick?: () => void;
  onSlackClick?: () => void;
  onPhoneClick?: () => void;
  className?: string;
}

export function TeamMemberCard({
  id,
  name,
  role,
  department,
  email,
  phone,
  status = "offline",
  location,
  avatarUrl,
  accentColor,
  onEmailClick,
  onWhatsAppClick,
  onSlackClick,
  onPhoneClick,
  className,
}: TeamMemberCardProps) {
  const src = avatarUrl ?? getPersonAvatar(name, 80);

  return (
    <Card
      className={cn(
        "border bg-card overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
      data-testid={`card-member-${id}`}
    >
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: accentColor || "hsl(var(--primary))" }}
      />

      <div className="px-4 pt-4 pb-3 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={src} alt={name} />
            <AvatarFallback className="text-sm font-medium">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
              STATUS_DOT[status] || STATUS_DOT.offline
            )}
          />
        </div>

        <h3
          className="text-sm font-semibold leading-tight truncate w-full"
          data-testid={`text-name-${id}`}
        >
          {name}
        </h3>
        <p
          className="text-xs text-muted-foreground mt-0.5 truncate w-full"
          data-testid={`text-role-${id}`}
        >
          {role}
        </p>

        {department && (
          <Badge variant="secondary" className="mt-2" data-testid={`text-department-${id}`}>
            {department}
          </Badge>
        )}

        {location && (
          <p
            className="text-[11px] text-muted-foreground mt-1.5 truncate w-full"
            data-testid={`text-location-${id}`}
          >
            {location}
          </p>
        )}
      </div>

      <div className="border-t px-3 py-2.5 flex items-center justify-center gap-1">
        {onEmailClick && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onEmailClick}
            aria-label={`Email ${name}`}
            data-testid={`button-email-${id}`}
          >
            <Mail className="size-4 text-muted-foreground" />
          </Button>
        )}
        {onWhatsAppClick && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onWhatsAppClick}
            aria-label={`WhatsApp ${name}`}
            data-testid={`button-whatsapp-${id}`}
          >
            <SiWhatsapp className="size-4 text-emerald-600" />
          </Button>
        )}
        {onSlackClick && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onSlackClick}
            aria-label={`Slack ${name}`}
            data-testid={`button-slack-${id}`}
          >
            <SiSlack className="size-4 text-muted-foreground" />
          </Button>
        )}
        {onPhoneClick && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onPhoneClick}
            aria-label={`Call ${name}`}
            data-testid={`button-phone-${id}`}
          >
            <Phone className="size-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </Card>
  );
}
