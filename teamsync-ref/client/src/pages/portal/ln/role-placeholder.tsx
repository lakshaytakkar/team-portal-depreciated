import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLnRole } from "@/lib/use-ln-role";
import { Construction, ArrowLeft } from "lucide-react";

export default function LnRolePlaceholder() {
  const [location, setLocation] = useLocation();
  const { role } = useLnRole();

  const pageName = location
    .replace("/portal-ln/", "")
    .split("/")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" → ") || "Dashboard";

  return (
    <div className="px-16 lg:px-24 py-8 max-w-3xl mx-auto" data-testid="ln-role-placeholder-page">
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center gap-4">
          <div
            className="size-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: role.color + "18" }}
          >
            <Construction className="w-8 h-8" style={{ color: role.color }} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold" data-testid="text-placeholder-title">{pageName}</h1>
            <Badge
              className="text-white text-xs"
              style={{ backgroundColor: role.color }}
              data-testid="badge-role-name"
            >
              {role.label} Role
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-md" data-testid="text-placeholder-description">
            This page is part of the <strong>{role.label}</strong> role view.
            It will be built in an upcoming sprint with full functionality for {role.description.toLowerCase()}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(role.defaultUrl)}
            data-testid="button-back-to-role-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {role.label} Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
