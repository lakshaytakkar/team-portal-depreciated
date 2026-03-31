import { useQuery } from "@tanstack/react-query";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { MapPin, Phone, Building, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";

const PIPELINE_STAGES = [
  "new-lead", "qualified", "token-paid", "store-design",
  "inventory-ordered", "in-transit", "launched", "reordering",
];

function StoreSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <Skeleton className="h-10 w-48" />
      <div className="grid md:grid-cols-3 gap-8">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl md:col-span-2" />
      </div>
    </div>
  );
}

export default function EtsPortalStore() {
  const inSidebar = useEtsSidebar();
  const clientId = portalEtsClient.id;

  const { data: clientData, isLoading } = useQuery<{ client: any }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  if (isLoading) return <StoreSkeleton />;

  const fallbackClient = {
    id: portalEtsClient.id,
    name: portalEtsClient.name,
    phone: portalEtsClient.phone,
    city: portalEtsClient.city,
    stage: "qualified",
    storeAddress: "",
    storeArea: null,
  };
  const client = clientData?.client || fallbackClient;

  const currentStageIndex = PIPELINE_STAGES.indexOf(client.stage);

  const steps = [
    {
      title: "Discovery & Qualification",
      date: currentStageIndex >= 2 ? "Completed" : "Pending",
      status: currentStageIndex >= 2 ? "completed" : currentStageIndex <= 1 ? "current" : "pending",
      desc: "Understanding your requirements and location.",
    },
    {
      title: "Proposal & Agreement",
      date: currentStageIndex >= 3 ? "Completed" : "Pending",
      status: currentStageIndex >= 3 ? "completed" : currentStageIndex === 2 ? "current" : "pending",
      desc: "Package selection and negotiation.",
    },
    {
      title: "Token Payment",
      date: currentStageIndex >= 3 ? "Completed" : "Pending",
      status: currentStageIndex >= 3 ? "completed" : currentStageIndex === 2 ? "current" : "pending",
      desc: "Initial commitment amount to secure launch slot.",
    },
    {
      title: "Store Execution",
      date: currentStageIndex >= 5 ? "Completed" : "Pending",
      status: currentStageIndex >= 5 ? "completed" : currentStageIndex >= 3 && currentStageIndex < 5 ? "current" : "pending",
      desc: "Interior setup, inventory procurement and placement.",
    },
    {
      title: "Grand Opening",
      date: currentStageIndex >= 6 ? "Completed" : "Target: TBD",
      status: currentStageIndex >= 6 ? "completed" : currentStageIndex === 5 ? "current" : "pending",
      desc: "Store launch event and go-live.",
    },
  ];

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-portal-store">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-store-title">My Store</h1>
        <p className="text-muted-foreground">Manage your location and track launch milestones.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle>Store Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted">
                  <Building className="h-10 w-10 opacity-20" />
                </div>
                <Badge
                  className="absolute top-2 right-2 text-white border-0"
                  style={{ backgroundColor: ETS_PORTAL_COLOR }}
                  data-testid="badge-store-status"
                >
                  {ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: ETS_PORTAL_COLOR }} />
                  <div>
                    <p className="font-medium" data-testid="text-store-name">{client.name} - {client.city || portalEtsClient.city} Store</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-store-address">{client.storeAddress || "Address not set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                  <p className="text-sm" data-testid="text-store-phone">{client.phone || portalEtsClient.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader>
              <CardTitle>Design Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border text-center" style={{ backgroundColor: "rgba(249, 115, 22, 0.05)", borderColor: "rgba(249, 115, 22, 0.2)" }}>
                <p className="text-sm font-medium text-foreground mb-2" data-testid="text-design-status">
                  {currentStageIndex >= 5 ? "Store Layout Completed" : currentStageIndex >= 3 ? "Store Layout in Progress" : "Awaiting Previous Steps"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {client.storeArea
                    ? `Our architects are designing the optimal layout for your ${client.storeArea} sq ft space.`
                    : "Store area not specified yet."}
                </p>
                <Button size="sm" variant="outline" className="bg-background" data-testid="button-view-drafts">View Drafts</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="rounded-xl border bg-card h-full">
            <CardHeader>
              <CardTitle>Launch Roadmap</CardTitle>
              <CardDescription>Track your journey from signup to grand opening.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="pl-8 relative" data-testid={`step-${idx}`}>
                    <div className={`
                      absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center
                      ${step.status === 'completed' ? 'border-orange-500' : 
                        step.status === 'current' ? 'bg-background border-orange-500 ring-4 ring-orange-200/50' : 
                        'bg-muted border-muted-foreground/30'}
                    `}
                    style={step.status === 'completed' ? { backgroundColor: ETS_PORTAL_COLOR, borderColor: ETS_PORTAL_COLOR } : step.status === 'current' ? { borderColor: ETS_PORTAL_COLOR } : {}}>
                      {step.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>

                    <div className={`${step.status === 'pending' ? 'opacity-50' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <span className="text-sm text-muted-foreground font-medium">{step.date}</span>
                      </div>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
