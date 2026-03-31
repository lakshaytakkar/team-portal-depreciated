import { useState } from "react";
import { Star } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { evaluations, interviews, type Evaluation } from "@/lib/mock-data-ats";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { PageShell, DetailModal } from "@/components/layout";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`size-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

const pendingInterviews = interviews.filter(i => i.status === "completed" && !evaluations.find(e => e.applicationId === i.applicationId));

export default function AtsEvaluations() {
  const isLoading = useSimulatedLoading(700);
  const [selected, setSelected] = useState<Evaluation | null>(null);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-72 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">Evaluations</h1>
          <p className="text-sm text-muted-foreground">{evaluations.length} scorecards submitted · {pendingInterviews.length} pending evaluation</p>
        </div>
      </Fade>

      <Fade>
        <Tabs defaultValue="completed">
          <TabsList data-testid="eval-tabs">
            <TabsTrigger value="completed">Completed ({evaluations.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Evaluation ({pendingInterviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="mt-4">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Candidate</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interviewer</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Overall Rating</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Recommendation</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Submitted</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {evaluations.map(ev => (
                      <tr key={ev.id} className="hover:bg-muted/20" data-testid={`eval-row-${ev.id}`}>
                        <td className="px-4 py-3"><PersonCell name={ev.candidateName} size="sm" /></td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{ev.jobTitle}</td>
                        <td className="px-4 py-3"><PersonCell name={ev.interviewerName} size="sm" /></td>
                        <td className="px-4 py-3"><StarDisplay rating={ev.overallRating} /></td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ev.recommendation} />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{ev.submittedDate}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelected(ev)} data-testid={`view-eval-${ev.id}`}>View</Button>
                        </td>
                      </tr>
                    ))}
                    {evaluations.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No evaluations yet</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Candidate</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interview Date</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interviewers</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingInterviews.map(iv => (
                      <tr key={iv.id} className="hover:bg-muted/20" data-testid={`pending-eval-row-${iv.id}`}>
                        <td className="px-4 py-3"><PersonCell name={iv.candidateName} size="sm" /></td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{iv.jobTitle}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{iv.scheduledDate}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{iv.interviewers.join(", ")}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-700" data-testid={`submit-eval-${iv.id}`}>Submit Scorecard</Button>
                        </td>
                      </tr>
                    ))}
                    {pendingInterviews.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No pending evaluations</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Fade>

      <DetailModal open={!!selected} onClose={() => setSelected(null)} title="Evaluation Scorecard">
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selected.candidateName}</p>
                  <p className="text-xs text-muted-foreground">{selected.jobTitle} · Evaluated by {selected.interviewerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={selected.overallRating} />
                  <span className="text-sm font-bold">{selected.overallRating}/5</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Criterion</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Rating</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selected.criteria.map((c, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="px-3 py-2 text-sm font-medium">{c.name}</td>
                        <td className="px-3 py-2"><StarDisplay rating={c.rating} /></td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{c.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-semibold">Recommendation</span>
                <StatusBadge status={selected.recommendation} />
              </div>

              {selected.notes && (
                <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">{selected.notes}</div>
              )}
            </div>
          )}
      </DetailModal>
    </PageTransition>
  );
}
