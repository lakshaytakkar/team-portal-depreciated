import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Trophy, Target, Users, Award, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { format, subMonths, startOfMonth, isWithinInterval, endOfMonth, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Performance() {
  const { currentUser, currentTeamId, getEffectiveRole } = useStore();
  const effectiveRole = getEffectiveRole();
  const isManager = effectiveRole === 'manager' || effectiveRole === 'superadmin';

  const [leaderboardSort, setLeaderboardSort] = useState<'leads' | 'won' | 'rate' | 'value'>('value');

  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ['/api/leads', currentTeamId, effectiveRole],
    queryFn: async () => {
      const res = await fetch(`/api/leads?teamId=${currentTeamId}&effectiveRole=${effectiveRole}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const res = await fetch('/api/activities', { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const myLeads = leads;
  const wonLeads = myLeads.filter((l: any) => l.stage === 'won');

  const totalValue = wonLeads.reduce((sum: number, l: any) => sum + (l.wonAmount || l.value || 0), 0);
  const winRate = myLeads.length > 0 ? (wonLeads.length / myLeads.length) * 100 : 0;
  const avgDealSize = wonLeads.length > 0 ? totalValue / wonLeads.length : 0;

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months: { name: string; leads: number; won: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthLeads = myLeads.filter((l: any) => {
        const d = new Date(l.createdAt);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });
      months.push({
        name: format(monthStart, 'MMM'),
        leads: monthLeads.length,
        won: monthLeads.filter((l: any) => l.stage === 'won').length,
      });
    }
    return months;
  }, [myLeads]);

  const funnelData = useMemo(() => [
    { stage: 'New', count: myLeads.filter((l: any) => l.stage === 'new').length },
    { stage: 'Contacted', count: myLeads.filter((l: any) => l.stage === 'contacted').length },
    { stage: 'Qualified', count: myLeads.filter((l: any) => l.stage === 'qualified').length },
    { stage: 'Proposal', count: myLeads.filter((l: any) => l.stage === 'proposal').length },
    { stage: 'Negotiation', count: myLeads.filter((l: any) => l.stage === 'negotiation').length },
    { stage: 'Won', count: wonLeads.length },
  ], [myLeads, wonLeads]);

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activities]);

  const leaderboard = useMemo(() => {
    if (!isManager) return [];
    const assignedUserIds = [...new Set(leads.map((l: any) => l.assignedTo).filter(Boolean))];
    const board = assignedUserIds.map((userId: string) => {
      const user = users.find((u: any) => u.id === userId);
      const userLeads = leads.filter((l: any) => l.assignedTo === userId);
      const userWon = userLeads.filter((l: any) => l.stage === 'won');
      const userValue = userWon.reduce((s: number, l: any) => s + (l.wonAmount || l.value || 0), 0);
      return {
        id: userId,
        name: user?.name || 'Unknown',
        avatar: user?.avatar,
        leadsCount: userLeads.length,
        wonCount: userWon.length,
        winRate: userLeads.length > 0 ? (userWon.length / userLeads.length) * 100 : 0,
        totalValue: userValue,
      };
    }).filter((u: any) => u.leadsCount > 0);

    board.sort((a: any, b: any) => {
      switch (leaderboardSort) {
        case 'leads': return b.leadsCount - a.leadsCount;
        case 'won': return b.wonCount - a.wonCount;
        case 'rate': return b.winRate - a.winRate;
        case 'value': return b.totalValue - a.totalValue;
        default: return 0;
      }
    });
    return board;
  }, [isManager, users, leads, leaderboardSort]);

  const weeklyActivityData = useMemo(() => {
    if (!isManager) return [];
    const now = new Date();
    const weeks: { name: string; activities: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const count = activities.filter((a: any) => {
        const d = new Date(a.createdAt);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
      }).length;
      weeks.push({
        name: format(weekStart, 'MMM d'),
        activities: count,
      });
    }
    return weeks;
  }, [isManager, activities]);

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Call';
      case 'email': return 'Email';
      case 'meeting': return 'Meeting';
      case 'note': return 'Note';
      case 'stage_change': return 'Stage Change';
      default: return type;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'email': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'meeting': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'stage_change': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.name || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
          {isManager ? 'Team Performance' : 'My Performance'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isManager ? 'Overview of company sales metrics and team velocity.' : 'Track your metrics and sales velocity.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="stat-total-leads">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              {myLeads.filter((l: any) => l.stage !== 'won' && l.stage !== 'lost').length} active
            </p>
          </CardContent>
        </Card>
        <Card data-testid="stat-leads-won">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Won</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wonLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              {myLeads.filter((l: any) => l.stage === 'lost').length} lost
            </p>
          </CardContent>
        </Card>
        <Card data-testid="stat-win-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{wonLeads.length} of {myLeads.length} leads</p>
          </CardContent>
        </Card>
        <Card data-testid="stat-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground">
              Avg ₹{(avgDealSize / 1000).toFixed(1)}k per deal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Stage</CardTitle>
            <CardDescription>Current lead distribution across pipeline</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Leads Trend</CardTitle>
            <CardDescription>Leads added per month (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" name="New Leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={36} />
                <Bar dataKey="won" name="Won" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 5 logged activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((act: any, i: number) => (
                  <div key={act.id || i} className="flex items-start gap-3 text-sm" data-testid={`activity-item-${i}`}>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 shrink-0 mt-0.5 ${getActivityColor(act.type)}`}>
                      {getActivityLabel(act.type)}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{act.notes || `${getActivityLabel(act.type)} logged`}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getUserName(act.userId)} · {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No activities logged yet.
              </div>
            )}
          </CardContent>
        </Card>

        {isManager ? (
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Activities logged per week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="activities" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Summary</CardTitle>
              <CardDescription>Your current lead pipeline value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['new', 'contacted', 'qualified', 'proposal', 'negotiation'].map(stage => {
                  const stageLeads = myLeads.filter((l: any) => l.stage === stage);
                  const stageValue = stageLeads.reduce((s: number, l: any) => s + (l.value || 0), 0);
                  return (
                    <div key={stage} className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{stage}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                        <span className="text-muted-foreground min-w-[80px] text-right">₹{(stageValue / 1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isManager && leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Team member performance ranking</CardDescription>
              </div>
              <div className="flex gap-1">
                {(['leads', 'won', 'rate', 'value'] as const).map(col => (
                  <Button
                    key={col}
                    variant={leaderboardSort === col ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setLeaderboardSort(col)}
                    data-testid={`button-sort-${col}`}
                  >
                    {col === 'leads' && 'Leads'}
                    {col === 'won' && 'Won'}
                    {col === 'rate' && 'Win %'}
                    {col === 'value' && 'Value'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Won</TableHead>
                  <TableHead className="text-center">Win Rate</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((row: any, i: number) => (
                  <TableRow key={row.id} data-testid={`row-leaderboard-${row.id}`}>
                    <TableCell className="font-medium text-muted-foreground">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-muted">
                            {row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{row.leadsCount}</TableCell>
                    <TableCell className="text-center">{row.wonCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.winRate >= 50 ? 'default' : 'secondary'} className="text-xs">
                        {row.winRate.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{(row.totalValue / 1000).toFixed(0)}k</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
