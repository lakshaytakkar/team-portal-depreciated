import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle2, Circle, Store, Package,
  Truck, FileText, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

const DEFAULT_CHECKLIST = [
  { id: 1, category: "Profile", title: "Complete store profile", description: "Fill in all required business and personal details.", completed: false },
  { id: 2, category: "Profile", title: "Upload store photos", description: "Add photos of your store location (exterior and interior).", completed: false },
  { id: 3, category: "Design", title: "Approve store layout", description: "Review and approve the 3D design provided by our architects.", completed: false },
  { id: 4, category: "Design", title: "Confirm signage design", description: "Approve the branding and signage for your storefront.", completed: false },
  { id: 5, category: "Inventory", title: "Select launch inventory", description: "Choose products from the catalog for your initial stock.", completed: false },
  { id: 6, category: "Inventory", title: "Confirm category mix", description: "Set your product category distribution preferences.", completed: false },
  { id: 7, category: "Operations", title: "Set up POS system", description: "Install and configure your point-of-sale system.", completed: false },
  { id: 8, category: "Operations", title: "Train staff on operations", description: "Complete the training modules for store operations.", completed: false },
  { id: 9, category: "Launch", title: "Plan grand opening event", description: "Coordinate launch event details with the marketing team.", completed: false },
  { id: 10, category: "Launch", title: "Final walkthrough", description: "Complete the final store inspection before opening.", completed: false },
];

const categoryIcons: Record<string, typeof Store> = {
  Profile: FileText,
  Design: Store,
  Inventory: Package,
  Operations: Truck,
  Launch: CheckCircle2,
};

function ChecklistSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-20 rounded-xl" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
    </div>
  );
}

export default function EtsPortalChecklist() {
  const inSidebar = useEtsSidebar();
  const clientId = portalEtsClient.id;
  const queryClient = useQueryClient();

  const { data: checklistData, isLoading } = useQuery<{ checklist: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'checklist'],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ statusId, completed }: { statusId: number; completed: boolean }) => {
      return apiRequest("PATCH", `/api/ets-portal/client/${clientId}/checklist/${statusId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ets-portal/client', clientId, 'checklist'] });
    },
  });

  if (isLoading) return <ChecklistSkeleton />;

  const checklist = checklistData?.checklist || DEFAULT_CHECKLIST;
  const completedCount = checklist.filter((c: any) => c.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const categories = [...new Set(checklist.map((c: any) => c.category || "General"))];

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-portal-checklist">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-checklist-title">Readiness Checklist</h1>
        <p className="text-muted-foreground">Complete all items before your store launch.</p>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold font-heading" data-testid="text-checklist-progress">{completedCount}/{totalCount}</div>
              <span className="text-muted-foreground text-sm">items completed</span>
            </div>
            <Badge
              variant="outline"
              className={cn(progress === 100 ? "bg-green-50 text-green-700 border-green-200" : "")}
              data-testid="badge-progress"
            >
              {Math.round(progress)}%
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {categories.map((category) => {
        const items = checklist.filter((c: any) => (c.category || "General") === category);
        const catDone = items.filter((c: any) => c.completed).length;
        const CatIcon = categoryIcons[category] || FileText;

        return (
          <Card key={category} className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CatIcon className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                  <CardTitle className="text-lg">{category}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {catDone}/{items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/30",
                      item.completed ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900" : ""
                    )}
                    onClick={() => toggleMutation.mutate({ statusId: item.id, completed: !item.completed })}
                    data-testid={`checklist-item-${item.id}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", item.completed ? "line-through text-muted-foreground" : "")}>{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
