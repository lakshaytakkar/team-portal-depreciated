import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/portal-ln/companies": "My Companies",
  "/portal-ln/documents": "Documents",
  "/portal-ln/invoices": "Invoices",
  "/portal-ln/messages": "Messages",
  "/portal-ln/support": "Support",
  "/portal-ln/profile": "Profile",
};

export default function LnClientPlaceholder() {
  const [location, setLocation] = useLocation();
  const title = PAGE_TITLES[location] || location.replace("/portal-ln/", "").replace(/(^\w)/, (m) => m.toUpperCase());

  return (
    <div className="p-6" data-testid="ln-client-placeholder-page">
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Construction className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold" data-testid="text-client-placeholder-title">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-md" data-testid="text-client-placeholder-description">
            This page will be built in the next sprint with full functionality for managing your {title.toLowerCase()}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/portal-ln")}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
