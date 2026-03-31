import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Loader2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useEtsOrders, type PaymentMilestone, type MilestoneStatus } from "@/lib/ets-order-store";
import { useToast } from "@/hooks/use-toast";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";

function statusBadge(status: MilestoneStatus) {
  if (status === "Paid") {
    return <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
  }
  if (status === "Due") {
    return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200" variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Due</Badge>;
  }
  return <Badge className="bg-gray-50 text-gray-500 border-gray-200" variant="outline"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
}

function MilestoneCard({ milestone, isNext, onPay, paying }: {
  milestone: PaymentMilestone;
  isNext: boolean;
  onPay: (id: string) => void;
  paying: boolean;
}) {
  const isPaid = milestone.status === "Paid";
  const isDue = milestone.status === "Due";

  return (
    <div className="flex gap-4 items-start" data-testid={`milestone-${milestone.id}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className={cn(
          "h-10 w-10 rounded-full border-2 flex items-center justify-center",
          isPaid ? "bg-green-50 border-green-500 text-green-600" :
          isDue ? "bg-yellow-50 border-yellow-400 text-yellow-600" :
          "bg-gray-50 border-gray-200 text-gray-400"
        )}>
          {isPaid ? <CheckCircle2 className="h-5 w-5" /> :
           isDue ? <AlertCircle className="h-5 w-5" /> :
           <Clock className="h-5 w-5" />}
        </div>
      </div>

      <Card className={cn(
        "flex-1 rounded-xl border",
        isDue ? "border-yellow-200 bg-yellow-50/30" : "bg-card"
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold" data-testid={`text-milestone-label-${milestone.id}`}>{milestone.label}</p>
                {statusBadge(milestone.status)}
                <Badge variant="outline" className="text-xs">{milestone.percentage}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-bold text-base" data-testid={`text-milestone-amount-${milestone.id}`}>
                    ₹{milestone.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                {milestone.datePaid && (
                  <div>
                    <span className="text-muted-foreground">Paid on: </span>
                    <span className="font-medium text-green-700" data-testid={`text-date-paid-${milestone.id}`}>{milestone.datePaid}</span>
                  </div>
                )}
                {!isPaid && milestone.dueDate && (
                  <div>
                    <span className="text-muted-foreground">Due by: </span>
                    <span className={cn("font-medium", isDue ? "text-yellow-700" : "text-muted-foreground")} data-testid={`text-due-date-${milestone.id}`}>
                      {milestone.dueDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {isNext && (
              <Button
                style={{ backgroundColor: ETS_PORTAL_COLOR }}
                className="text-white shrink-0"
                onClick={() => onPay(milestone.id)}
                disabled={paying}
                data-testid={`button-pay-milestone-${milestone.id}`}
              >
                {paying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : <><IndianRupee className="h-4 w-4 mr-2" />Pay Now</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EtsPaymentMilestones() {
  const { milestones, payMilestone } = useEtsOrders();
  const { toast } = useToast();
  const inSidebar = useEtsSidebar();
  const containerClass = inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6";
  const [payingId, setPayingId] = useState<string | null>(null);

  const nextDueIdx = milestones.findIndex(m => m.status === "Due");
  const totalPaid = milestones.filter(m => m.status === "Paid").reduce((sum, m) => sum + m.amount, 0);
  const totalDue = milestones.filter(m => m.status === "Due" || m.status === "Upcoming").reduce((sum, m) => sum + m.amount, 0);
  const allTotal = milestones.reduce((sum, m) => sum + m.amount, 0);

  function handlePay(milestoneId: string) {
    setPayingId(milestoneId);
    setTimeout(() => {
      payMilestone(milestoneId);
      setPayingId(null);
      toast({
        title: "Payment Successful",
        description: `Milestone payment of ₹${milestones.find(m => m.id === milestoneId)?.amount.toLocaleString("en-IN")} completed.`,
      });
    }, 2000);
  }

  return (
    <div className={containerClass} data-testid="ets-payment-milestones">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-milestones-title">Payment Milestones</h1>
        <p className="text-muted-foreground">Track your franchise investment payment schedule.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="rounded-xl border bg-green-50 dark:bg-green-900/10 border-green-100">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-green-800">Total Paid</p>
            <p className="text-2xl font-bold font-heading text-green-700 mt-1" data-testid="text-total-paid">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-yellow-800">Remaining</p>
            <p className="text-2xl font-bold font-heading text-yellow-700 mt-1" data-testid="text-total-remaining">
              ₹{totalDue.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
            <p className="text-2xl font-bold font-heading mt-1" data-testid="text-total-investment">
              ₹{allTotal.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id}>
                <MilestoneCard
                  milestone={milestone}
                  isNext={idx === nextDueIdx}
                  onPay={handlePay}
                  paying={payingId === milestone.id}
                />
                {idx < milestones.length - 1 && (
                  <div className="ml-5 w-0.5 h-4 bg-muted-foreground/15 mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
