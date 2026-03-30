import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  TrendingUp, 
  Users,
  DollarSign,
  Target,
  Briefcase,
  CheckCircle2,
  Plus,
  KanbanSquare,
  MessageSquare,
} from "lucide-react";
import { 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { stages } from "@/lib/mock-data";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import EventsDashboard from "@/pages/events/events-dashboard";
import { AddLeadDialog } from "@/components/dialogs/AddLeadDialog";
import { QuickLogActivityDialog } from "@/components/dialogs/QuickLogActivityDialog";

export default function Dashboard() {
  const { currentUser, currentTeamId, simulatedRole } = useStore();
  const [activeStage, setActiveStage] = useState('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showLogActivity, setShowLogActivity] = useState(false);

  if (currentTeamId === 'events') {
    return <EventsDashboard />;
  }

  const effectiveRole = useStore.getState().getEffectiveRole();

  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ['/api/leads', currentTeamId, effectiveRole, simulatedRole],
    queryFn: async () => {
      const role = useStore.getState().getEffectiveRole();
      const res = await fetch(`/api/leads?teamId=${currentTeamId}&effectiveRole=${role}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ['/api/tasks', currentTeamId, effectiveRole, simulatedRole],
    queryFn: async () => {
      const role = useStore.getState().getEffectiveRole();
      const res = await fetch(`/api/tasks?teamId=${currentTeamId}&effectiveRole=${role}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const totalLeads = leads.length;
  const activeLeads = leads.filter((l: any) => !['won', 'lost'].includes(l.stage)).length;
  const wonLeads = leads.filter((l: any) => l.stage === 'won').length;
  const winRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const totalPipelineValue = leads
    .filter((l: any) => !['won', 'lost'].includes(l.stage))
    .reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);

  const pipelineData = stages.map(stage => ({
    name: stage.label,
    count: leads.filter((l: any) => l.stage === stage.id).length,
    color: stage.color
  })).filter(s => s.count > 0);

  const monthlyLeadsData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const count = leads.filter((l: any) => {
        try {
          const created = parseISO(l.createdAt);
          return isWithinInterval(created, { start, end });
        } catch {
          return false;
        }
      }).length;
      return {
        month: format(monthDate, 'MMM'),
        leads: count,
      };
    });
  }, [leads]);

  const pendingTasks = tasks.filter((t: any) => t.status !== 'done').length;
  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === 'done') return false;
    try { return new Date(t.dueDate) < new Date(); } catch { return false; }
  }).length;

  if (leadsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold leading-[1.35] tracking-tight text-foreground">
            {effectiveRole === 'manager' ? "Sales Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {effectiveRole === 'manager'
              ? "Overview of team-wide sales performance and pipeline."
              : "Track your personal sales performance and active deals."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pipeline">
              <KanbanSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              View Pipeline
            </Link>
          </Button>
          <Button size="sm" onClick={() => setShowAddLead(true)} data-testid="button-add-lead">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none" data-testid="stat-total-leads">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium tracking-[0.28px]">Total Leads</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
               <Users className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-foreground text-2xl font-semibold leading-[1.3] tracking-tight">{totalLeads}</p>
            <p className="text-muted-foreground text-[13px]">{activeLeads} active</p>
          </div>
        </div>

        {/* Active Deals */}
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none" data-testid="stat-active-deals">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium tracking-[0.28px]">Active Deals</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
               <Briefcase className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-foreground text-2xl font-semibold leading-[1.3] tracking-tight">{activeLeads}</p>
            <p className="text-muted-foreground text-[13px]">{wonLeads} won total</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none" data-testid="stat-win-rate">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium tracking-[0.28px]">Win Rate</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
               <Target className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-foreground text-2xl font-semibold leading-[1.3] tracking-tight">{winRate}%</p>
            <p className="text-muted-foreground text-[13px]">{wonLeads} of {totalLeads} leads</p>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none" data-testid="stat-pipeline-value">
          <div className="flex items-center justify-between w-full">
            <p className="text-muted-foreground text-[14px] font-medium tracking-[0.28px]">Pipeline Value</p>
            <div className="w-[36px] h-[36px] bg-card border rounded-lg flex items-center justify-center">
               <DollarSign className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-foreground text-2xl font-semibold leading-[1.3] tracking-tight">
              ₹{(totalPipelineValue / 100000).toFixed(1)}L
            </p>
            <p className="text-muted-foreground text-[13px]">active deals only</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Leads Trend */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-6 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-foreground">New Leads Trend</h3>
              <p className="text-sm text-muted-foreground">Leads added each month (last 6 months)</p>
            </div>
          </div>
          {monthlyLeadsData.every(d => d.leads === 0) ? (
            <div className="h-[300px] flex items-center justify-center flex-col gap-3">
              <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No leads data yet. Add your first lead to see the trend.</p>
              <Button variant="outline" size="sm" onClick={() => setShowAddLead(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyLeadsData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F34147" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F34147" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'hsl(var(--card))' }}
                    formatter={(value: any) => [value, 'New Leads']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#F34147" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-card rounded-xl border p-6 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <h3 className="text-lg font-bold text-foreground mb-6">Pipeline by Stage</h3>
          {pipelineData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center flex-col gap-3">
              <KanbanSquare className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground text-center">No pipeline data yet.</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    width={80}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'hsl(var(--card))' }}
                    formatter={(value: any) => [value, 'Leads']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#F34147" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="mt-4 pt-6 border-t">
            <Button variant="outline" className="w-full justify-between group" asChild>
              <Link href="/pipeline">
                View Full Pipeline
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-card border rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none"
          onClick={() => setShowAddLead(true)}
          data-testid="quick-action-add-lead"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Add Lead</p>
            <p className="text-xs text-muted-foreground">Create a new sales lead</p>
          </div>
        </div>

        <div
          className="bg-card border rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none"
          onClick={() => setShowLogActivity(true)}
          data-testid="quick-action-log-activity"
        >
          <div className="w-10 h-10 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Log Activity</p>
            <p className="text-xs text-muted-foreground">Record a call, meeting or note</p>
          </div>
        </div>

        <Link href="/pipeline" data-testid="quick-action-view-pipeline">
          <div className="bg-card border rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
              <KanbanSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">View Pipeline</p>
              <p className="text-xs text-muted-foreground">
                {activeLeads} active deal{activeLeads !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-card rounded-xl border shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none overflow-hidden">
        <div className="p-6 border-b flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent Leads</h3>
              <p className="text-sm text-muted-foreground">Latest leads in the system</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                <Link href={effectiveRole === 'manager' ? '/admin/leads' : '/leads'}>
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setActiveStage('all')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap border",
                activeStage === 'all' 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-card text-muted-foreground border hover:bg-muted hover:text-foreground"
              )}
              data-testid="filter-all-leads"
            >
              All Leads
            </button>
            {stages.map(stage => (
              <button 
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap border flex items-center gap-2",
                  activeStage === stage.id 
                    ? "bg-primary/10 text-primary border-primary" 
                    : "bg-card text-muted-foreground border hover:bg-muted hover:text-foreground"
                )}
                data-testid={`filter-stage-${stage.id}`}
              >
                <div className={cn("h-2 w-2 rounded-full", `bg-${stage.color}-500`)} />
                {stage.label}
              </button>
            ))}
          </div>
        </div>
        
        {leads.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-foreground">No leads yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first lead to get started.</p>
            </div>
            <Button size="sm" onClick={() => setShowAddLead(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted border-b text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-[40px]">
                    <Checkbox className="rounded-[4px]" />
                  </th>
                  <th className="px-6 py-4">Lead Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads
                  .filter(lead => activeStage === 'all' || lead.stage === activeStage)
                  .slice(0, 5)
                  .map((lead) => {
                  const stage = stages.find(s => s.id === lead.stage);
                  return (
                    <tr key={lead.id} className="hover:bg-muted transition-colors group" data-testid={`row-lead-${lead.id}`}>
                      <td className="px-6 py-4">
                        <Checkbox className="rounded-[4px]" />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/leads/${lead.id}`}>
                          <div className="flex items-center gap-3 cursor-pointer">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                              {lead.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-foreground hover:text-primary transition-colors">{lead.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground font-medium">{lead.company}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{lead.service}</td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        ₹{lead.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "rounded-md px-2.5 py-1 font-medium border-0 capitalize",
                            `bg-${stage?.color}-100 text-${stage?.color}-700`
                          )}
                        >
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                          <Link href={`/leads/${lead.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddLeadDialog open={showAddLead} onOpenChange={setShowAddLead} />
      <QuickLogActivityDialog open={showLogActivity} onOpenChange={setShowLogActivity} />
    </div>
  );
}
