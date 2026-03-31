import { useParams, useLocation } from "wouter";
import { ArrowLeft, MapPin, Calendar, Users, CheckCircle, ExternalLink, Pause, Play } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState } from "react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { jobOpenings, applications, candidates } from "@/lib/mock-data-ats";
import { PageShell } from "@/components/layout";



export default function AtsJobDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);
  const [paused, setPaused] = useState(false);

  const job = jobOpenings.find(j => j.id === id);
  const jobApps = applications.filter(a => a.jobId === id);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="h-28 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 gap-6"><div className="h-64 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>
      </div>
    );
  }

  if (!job) {
    return (
      <PageShell>
        <Button variant="ghost" onClick={() => setLocation("/ats/jobs")} className="mb-4"><ArrowLeft className="size-4 mr-2" /> Back</Button>
        <div className="text-center py-20 text-muted-foreground">Job opening not found.</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/ats/jobs")} data-testid="back-btn">
          <ArrowLeft className="size-4 mr-2" /> All Openings
        </Button>
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <StatusBadge status={paused ? "paused" : job.status} />
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${job.priority === "high" ? "bg-red-100 text-red-700" : job.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{job.priority} priority</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-sky-100 text-sky-700">{job.department}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-3.5" />Posted {job.postedDate}</span>
                  <span className="flex items-center gap-1"><Users className="size-3.5" />{job.filled}/{job.openings} positions filled</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild data-testid="share-job">
                  <a href={`https://wa.me/?text=We're hiring: ${job.title} at TeamSync. Apply now!`} target="_blank" rel="noreferrer">
                    <SiWhatsapp className="size-4 text-green-500 mr-1.5" /> Share
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPaused(!paused)} data-testid="toggle-pause">
                  {paused ? <><Play className="size-4 mr-1.5" /> Activate</> : <><Pause className="size-4 mr-1.5" /> Pause</>}
                </Button>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700" data-testid="edit-job">Edit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Fade>
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">About the Role</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Requirements</p>
                <ul className="space-y-1">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="size-3.5 text-violet-500 mt-0.5 shrink-0" />{req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Hiring Manager</CardTitle></CardHeader>
              <CardContent>
                <PersonCell name={job.hiringManager} subtitle={job.department} size="lg" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Applied", value: jobApps.length },
                { label: "Screened", value: jobApps.filter(a => a.stage !== "applied").length },
                { label: "Interviewed", value: jobApps.filter(a => ["technical", "cultural", "final"].includes(a.stage)).length },
                { label: "Offers", value: jobApps.filter(a => a.stage === "offer").length },
              ].map(s => (
                <Card key={s.label} className="border-0 shadow-sm text-center">
                  <CardContent className="p-3">
                    <p className="text-xl font-bold text-violet-600">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Applicants ({jobApps.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {jobApps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No applicants yet</p>
              ) : (
                <table className="w-full">
                  <thead className="border-b bg-muted/20">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Candidate</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Stage</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {jobApps.map(app => {
                      const cand = candidates.find(c => c.id === app.candidateId);
                      return (
                        <tr key={app.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <PersonCell name={app.candidateName} subtitle={cand?.currentRole} size="sm" />
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={app.stage} />
                          </td>
                          <td className="px-4 py-2.5">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setLocation(`/ats/candidates/${app.candidateId}`)} data-testid={`view-candidate-${app.candidateId}`}>View</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </Fade>
      </div>
    </PageTransition>
  );
}
