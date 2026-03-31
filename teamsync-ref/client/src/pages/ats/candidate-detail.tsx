import { useParams, useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, Star, FileText, Search, MonitorSmartphone, Code, Award } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ds/status-badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { PersonCell } from "@/components/ui/avatar-cells";
import { candidates, applications, interviews, evaluations } from "@/lib/mock-data-ats";
import { PageShell } from "@/components/layout";
import { DetailBanner, InfoPropertyGrid, Timeline } from "@/components/blocks";

const activityTimeline = (candidateId: string) => [
  { id: "at-1", title: "Application received", timestamp: "2026-02-08", icon: FileText },
  { id: "at-2", title: "Moved to Screening", timestamp: "2026-02-10", icon: Search },
  { id: "at-3", title: "Phone screen completed", timestamp: "2026-02-15", icon: Phone },
  { id: "at-4", title: "Technical interview scheduled", timestamp: "2026-02-22", icon: MonitorSmartphone },
  { id: "at-5", title: "Evaluation submitted", timestamp: "2026-02-25", icon: Award },
];

const stageColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-amber-100 text-amber-700",
  interview: "bg-violet-100 text-violet-700",
  offer: "bg-emerald-100 text-emerald-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AtsCandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);

  const candidate = candidates.find(c => c.id === id);
  const candApps = applications.filter(a => a.candidateId === id);
  const candInterviews = interviews.filter(i => i.candidateId === id);
  const candEvals = evaluations.filter(e => e.candidateId === id);

  if (isLoading) {
    return <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse"><div className="h-8 bg-muted rounded w-32" /><div className="h-40 bg-muted rounded-2xl" /><div className="h-96 bg-muted rounded-xl" /></div>;
  }

  if (!candidate) {
    return (
      <PageShell>
        <Button variant="ghost" onClick={() => setLocation("/ats/candidates")} className="mb-4"><ArrowLeft className="size-4 mr-2" /> Back</Button>
        <div className="text-center py-20 text-muted-foreground">Candidate not found.</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/ats/candidates")} data-testid="back-btn"><ArrowLeft className="size-4 mr-2" /> All Candidates</Button>
      </Fade>

      <Fade>
        <DetailBanner
          title={candidate.name}
          subtitle={`${candidate.currentRole} · ${candidate.currentCompany}`}
          avatar={getPersonAvatar(candidate.name, 64)}
          avatarFallback={candidate.name.split(" ").map(n => n[0]).join("")}
          badges={[
            { label: candidate.stage },
            { label: `${candidate.experience}y experience`, variant: "secondary" as const },
          ]}
          chips={[
            { label: "Email", value: candidate.email, icon: Mail },
            { label: "Phone", value: candidate.phone, icon: Phone },
          ]}
          actions={[
            { label: "Schedule Interview", onClick: () => {}, variant: "default" as const },
          ]}
        >
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" asChild data-testid="whatsapp-candidate">
              <a href={`https://wa.me/${candidate.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <SiWhatsapp className="size-4 text-green-500 mr-1.5" /> WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="email-candidate">
              <a href={`mailto:${candidate.email}`}><Mail className="size-4 mr-1.5" /> Email</a>
            </Button>
          </div>
        </DetailBanner>
      </Fade>

      <Fade>
        <Tabs defaultValue="profile">
          <TabsList data-testid="candidate-tabs">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="applications">Applications ({candApps.length})</TabsTrigger>
            <TabsTrigger value="interviews">Interviews ({candInterviews.length})</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations ({candEvals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Contact Information</CardTitle></CardHeader>
                <CardContent>
                  <InfoPropertyGrid
                    properties={[
                      { label: "Email", value: candidate.email, icon: Mail },
                      { label: "Phone", value: candidate.phone, icon: Phone },
                      { label: "Current Role", value: candidate.currentRole },
                      { label: "Company", value: candidate.currentCompany },
                      { label: "Experience", value: `${candidate.experience} years` },
                      { label: "Source", value: <StatusBadge status={candidate.source} /> },
                      { label: "Rating", value: (
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`size-3.5 ${s <= candidate.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>
                      ) },
                    ]}
                    columns={2}
                  />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                  {candidate.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{candidate.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle></CardHeader>
              <CardContent>
                <Timeline events={activityTimeline(id!)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job Title</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Applied Date</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Stage</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interviewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {candApps.map(app => (
                      <tr key={app.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-sm font-medium">{app.jobTitle}</td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">{app.appliedDate}</td>
                        <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[app.stage] || "bg-muted text-muted-foreground"}`}>{app.stage}</span></td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">{app.currentInterviewer}</td>
                      </tr>
                    ))}
                    {candApps.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No applications</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date & Time</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interviewers</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {candInterviews.map(iv => (
                      <tr key={iv.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-sm">{iv.scheduledDate} {iv.scheduledTime}</td>
                        <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700">{iv.type}</span></td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">{iv.interviewers.join(", ")}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={iv.status} /></td>
                      </tr>
                    ))}
                    {candInterviews.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No interviews scheduled</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations" className="mt-4 space-y-4">
            {candEvals.map(ev => (
              <Card key={ev.id} className="border-0 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <PersonCell name={ev.interviewerName} subtitle={`Submitted ${ev.submittedDate}`} size="sm" />
                    <div className="flex items-center gap-2">
                      <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`size-4 ${s <= Math.round(ev.overallRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>
                      <StatusBadge status={ev.recommendation} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {ev.criteria.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground w-32 shrink-0">{c.name}</span>
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`size-3 ${s <= c.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>
                        <span className="text-xs text-muted-foreground flex-1 truncate">{c.comment}</span>
                      </div>
                    ))}
                  </div>
                  {ev.notes && <p className="text-xs text-muted-foreground border-t pt-2">{ev.notes}</p>}
                </CardContent>
              </Card>
            ))}
            {candEvals.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No evaluations submitted yet.</div>}
          </TabsContent>
        </Tabs>
      </Fade>
    </PageTransition>
  );
}
