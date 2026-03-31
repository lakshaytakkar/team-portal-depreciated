import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiInstagram, SiYoutube,  SiFacebook, SiThreads } from "react-icons/si";
import { SiLinkedin } from "@/lib/icon-compat";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { socialPosts, campaigns, socialAccounts } from "@/lib/mock-data-social";
import { PageShell } from "@/components/layout";


const platformConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  instagram: { icon: SiInstagram, color: "#E11D48", bg: "#FFF1F2" },
  youtube: { icon: SiYoutube, color: "#DC2626", bg: "#FEF2F2" },
  linkedin: { icon: SiLinkedin, color: "#2563EB", bg: "#EFF6FF" },
  facebook: { icon: SiFacebook, color: "#1D4ED8", bg: "#EEF2FF" },
  threads: { icon: SiThreads, color: "#374151", bg: "#F9FAFB" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const TIME_SLOTS = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"];

export default function SocialCalendar() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);
  const [view, setView] = useState<"monthly" | "weekly">("monthly");
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2);
  const [platformFilter, setPlatformFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");

  const scheduledPosts = socialPosts.filter(p => (p.stage === "scheduled" || p.stage === "published") && p.scheduledDate);

  const filteredPosts = scheduledPosts.filter(p => {
    if (platformFilter !== "All" && !p.platforms.includes(platformFilter as any)) return false;
    if (campaignFilter !== "All" && p.campaignId !== campaignFilter) return false;
    return true;
  });

  const getPostsForDate = (dateStr: string) => filteredPosts.filter(p => p.scheduledDate === dateStr);

  const totalScheduled = scheduledPosts.length;
  const totalPublished = socialPosts.filter(p => p.stage === "published").length;
  const totalDrafts = socialPosts.filter(p => p.stage === "idea" || p.stage === "script" || p.stage === "design" || p.stage === "caption").length;
  const totalApproval = socialPosts.filter(p => p.stage === "approval").length;

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const weekDates = [28, 1, 2, 3, 4, 5, 6].map((d, i) => {
    const month = d < 10 ? currentMonth : currentMonth - 1;
    return { day: d, label: DAYS[i], dateStr: `2026-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex gap-4"><div className="h-8 bg-muted rounded w-48" /><div className="h-8 bg-muted rounded w-32" /></div>
        <div className="h-[500px] bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold font-heading">Content Calendar</h1>
          <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
            {(["monthly", "weekly"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${view === v ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                data-testid={`view-${v}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Scheduled This Month", value: totalScheduled, color: "text-teal-600" },
            { label: "Published", value: totalPublished, color: "text-emerald-600" },
            { label: "In Draft", value: totalDrafts, color: "text-slate-600" },
            { label: "In Approval", value: totalApproval, color: "text-amber-600" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-4" data-testid={`cal-stat-${i}`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3 flex-wrap">
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            data-testid="filter-platform"
          >
            {["All", "instagram", "youtube", "linkedin", "facebook", "threads"].map(p => <option key={p}>{p}</option>)}
          </select>
          <select
            value={campaignFilter}
            onChange={e => setCampaignFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            data-testid="filter-campaign"
          >
            <option value="All">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Fade>

      {view === "monthly" && (
        <Fade>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <button onClick={prevMonth} className="p-1 hover:bg-accent rounded" data-testid="btn-prev-month"><ChevronLeft size={18} /></button>
                <h2 className="font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
                <button onClick={nextMonth} className="p-1 hover:bg-accent rounded" data-testid="btn-next-month"><ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-7 border-b">
                {DAYS.map(d => (
                  <div key={d} className="p-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] border-r border-b last:border-r-0 bg-muted/20" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayPosts = getPostsForDate(dateStr);
                  const colIdx = (firstDay + i) % 7;
                  return (
                    <div key={day} className={`min-h-[90px] border-r border-b p-1.5 ${colIdx === 6 ? "border-r-0" : ""}`}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{day}</p>
                      <div className="space-y-0.5">
                        {dayPosts.slice(0, 3).map(post => {
                          const mainPlatform = post.platforms[0];
                          const cfg = platformConfig[mainPlatform];
                          const PIcon = cfg?.icon;
                          return (
                            <button
                              key={post.id}
                              onClick={() => setLocation(`/social/posts/${post.id}`)}
                              className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left hover:opacity-80 transition-opacity"
                              style={{ background: cfg?.bg ?? "#F1F5F9" }}
                              data-testid={`cal-chip-${post.id}`}
                            >
                              {PIcon && <PIcon size={9} style={{ color: cfg.color }} className="shrink-0" />}
                              <span className="text-[9px] truncate leading-tight" style={{ color: cfg?.color ?? "#475569" }}>
                                {post.caption.slice(0, 18)}…
                              </span>
                            </button>
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <p className="text-[9px] text-muted-foreground pl-1">+{dayPosts.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Fade>
      )}

      {view === "weekly" && (
        <Fade>
          <Card>
            <CardContent className="p-0 overflow-auto">
              <div className="grid grid-cols-8 min-w-[700px]">
                <div className="border-r border-b p-2 text-xs text-muted-foreground font-medium"></div>
                {weekDates.map(({ label, day }) => (
                  <div key={label} className="border-r border-b p-2 text-center last:border-r-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">{label}</p>
                    <p className="text-sm font-semibold">{day}</p>
                  </div>
                ))}
                {TIME_SLOTS.map(time => (
                  <>
                    <div key={`time-${time}`} className="border-r border-b p-2 text-[10px] text-muted-foreground font-medium h-14 flex items-start">{time}</div>
                    {weekDates.map(({ dateStr, label }) => {
                      const slotPosts = filteredPosts.filter(p => p.scheduledDate === dateStr);
                      return (
                        <div key={`${time}-${label}`} className="border-r border-b h-14 p-0.5 last:border-r-0 relative">
                          {slotPosts.slice(0, 1).map(post => {
                            const cfg = platformConfig[post.platforms[0]];
                            const PIcon = cfg?.icon;
                            return (
                              <button
                                key={post.id}
                                onClick={() => setLocation(`/social/posts/${post.id}`)}
                                className="w-full h-full rounded flex flex-col items-start px-1 py-0.5 hover:opacity-80 transition-opacity"
                                style={{ background: cfg?.bg ?? "#F1F5F9" }}
                                data-testid={`week-chip-${post.id}`}
                              >
                                {PIcon && <PIcon size={9} style={{ color: cfg?.color }} />}
                                <span className="text-[9px] truncate w-full" style={{ color: cfg?.color ?? "#475569" }}>
                                  {post.caption.slice(0, 14)}…
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </Fade>
      )}
    </PageTransition>
  );
}
