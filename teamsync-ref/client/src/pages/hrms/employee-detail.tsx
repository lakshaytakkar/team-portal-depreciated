import { useParams, useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, User } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { PersonCell } from "@/components/ui/avatar-cells";
import { employees, attendanceRecords, leaveRequests, payrollEntries, performanceReviews, goals } from "@/lib/mock-data-hrms";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageShell } from "@/components/layout";
import { DetailBanner, InfoPropertyGrid } from "@/components/blocks";

export default function HrmsEmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);

  const employee = employees.find((e) => e.id === id);
  const empAttendance = attendanceRecords.filter((a) => a.employeeId === id).slice(0, 10);
  const empLeaves = leaveRequests.filter((l) => l.employeeId === id);
  const empPayroll = payrollEntries.filter((p) => p.employeeId === id);
  const empReviews = performanceReviews.filter((r) => r.employeeId === id);
  const empGoals = goals.filter((g) => g.employeeId === id);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="h-40 bg-muted rounded-2xl" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <PageShell>
        <Button variant="ghost" onClick={() => setLocation("/hrms/employees")} className="mb-4"><ArrowLeft className="size-4 mr-2" /> Back</Button>
        <div className="text-center py-20 text-muted-foreground">Employee not found.</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/hrms/employees")} data-testid="back-btn">
          <ArrowLeft className="size-4 mr-2" /> All Employees
        </Button>
      </Fade>

      <Fade>
        <DetailBanner
          title={employee.name}
          subtitle={`${employee.designation} · ${employee.department}`}
          avatar={getPersonAvatar(employee.name, 80)}
          avatarFallback={employee.avatar}
          badges={[
            { label: employee.status },
            { label: employee.employmentType, variant: "secondary" as const },
          ]}
          chips={[
            { label: "Email", value: employee.email, icon: Mail },
            { label: "Phone", value: employee.phone, icon: Phone },
            { label: "Location", value: employee.location, icon: MapPin },
            { label: "Joined", value: new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: Calendar },
          ]}
          actions={[
            { label: "Edit", onClick: () => {}, variant: "default" as const },
          ]}
        >
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" asChild data-testid="whatsapp-emp">
              <a href={`https://wa.me/${employee.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <SiWhatsapp className="size-4 text-green-500 mr-1.5" /> WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="email-emp">
              <a href={`mailto:${employee.email}`}><Mail className="size-4 mr-1.5" /> Email</a>
            </Button>
          </div>
        </DetailBanner>
      </Fade>

      <Fade>
        <Tabs defaultValue="overview">
          <TabsList data-testid="employee-tabs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Profile Details</CardTitle></CardHeader>
                <CardContent>
                  <InfoPropertyGrid
                    properties={[
                      { label: "Department", value: employee.department, icon: Building2 },
                      { label: "Designation", value: employee.designation },
                      { label: "Reporting To", value: employee.reportingManager || "N/A", icon: User },
                      { label: "Location", value: employee.location, icon: MapPin },
                      { label: "Employment Type", value: <span className="capitalize">{employee.employmentType}</span> },
                      { label: "Gross Salary", value: `₹${employee.salary.toLocaleString("en-IN")}/mo` },
                    ]}
                    columns={2}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {empGoals.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Goals & OKRs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {empGoals.map((goal) => (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{goal.title}</p>
                        <StatusBadge status={goal.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${goal.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Check In</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Check Out</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Hours</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {empAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-sm">{rec.date}</td>
                        <td className="px-4 py-2.5 text-sm">{rec.checkIn}</td>
                        <td className="px-4 py-2.5 text-sm">{rec.checkOut}</td>
                        <td className="px-4 py-2.5 text-sm">{rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : "-"}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.status === "present" ? "bg-emerald-100 text-emerald-700" : rec.status === "wfh" ? "bg-sky-100 text-sky-700" : rec.status === "half-day" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{rec.status}</span>
                        </td>
                      </tr>
                    ))}
                    {empAttendance.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No attendance records</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Duration</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Dates</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {empLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-sm capitalize">{leave.type}</td>
                        <td className="px-4 py-2.5 text-sm">{leave.days} day{leave.days > 1 ? "s" : ""}</td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">{leave.startDate} → {leave.endDate}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${leave.status === "approved" ? "bg-emerald-100 text-emerald-700" : leave.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{leave.status}</span>
                        </td>
                      </tr>
                    ))}
                    {empLeaves.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No leave records</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Month</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Gross</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Deductions</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Net Pay</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {empPayroll.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-sm font-medium">{p.month}</td>
                        <td className="px-4 py-2.5 text-sm">₹{p.grossSalary.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5 text-sm text-red-600">-₹{p.deductions.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5 text-sm font-semibold text-emerald-600">₹{p.netSalary.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "processed" ? "bg-emerald-100 text-emerald-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                    {empPayroll.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No payroll records</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4 space-y-4">
            {empReviews.map((review) => (
              <Card key={review.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.reviewCycle}</p>
                      <p className="text-xs text-muted-foreground">Reviewer: <PersonCell name={review.reviewer} size="xs" className="inline-flex" /></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => <span key={s} className={`text-lg ${s <= Math.round(review.rating) ? "text-amber-400" : "text-muted"}`}>★</span>)}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.status === "acknowledged" ? "bg-emerald-100 text-emerald-700" : review.status === "submitted" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>{review.status}</span>
                    </div>
                  </div>
                  {review.feedback && <p className="text-sm text-muted-foreground">{review.feedback}</p>}
                </CardContent>
              </Card>
            ))}
            {empReviews.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No performance reviews yet.</div>}
          </TabsContent>
        </Tabs>
      </Fade>
    </PageTransition>
  );
}
