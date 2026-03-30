import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, Phone, CheckCircle2, 
  AlarmClock, CalendarClock, CalendarDays, CalendarCheck,
  Eye
} from "lucide-react";
import { format, isToday, isPast, addDays, isThisWeek } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function FollowUps() {
  const { currentUser, currentTeamId, getEffectiveRole } = useStore();
  const effectiveRole = getEffectiveRole();
  const { toast } = useToast();

  const { data: allLeads = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/leads', currentTeamId, effectiveRole],
    queryFn: async () => {
      const res = await fetch(`/api/leads?teamId=${currentTeamId}&effectiveRole=${effectiveRole}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const isManager = effectiveRole === 'manager' || effectiveRole === 'superadmin';

  const myLeads = allLeads
    .filter(l => l.nextFollowUp)
    .sort((a: any, b: any) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime());

  const overdue = myLeads.filter((l: any) => {
    const d = new Date(l.nextFollowUp!);
    return isPast(d) && !isToday(d);
  });

  const today = myLeads.filter((l: any) => isToday(new Date(l.nextFollowUp!)));

  const thisWeek = myLeads.filter((l: any) => {
    const d = new Date(l.nextFollowUp!);
    return !isPast(d) && !isToday(d) && isThisWeek(d, { weekStartsOn: 1 });
  });

  const upcoming = myLeads.filter((l: any) => {
    const d = new Date(l.nextFollowUp!);
    return !isPast(d) && !isToday(d) && !isThisWeek(d, { weekStartsOn: 1 });
  });

  const markContactedMutation = useMutation({
    mutationFn: async (lead: any) => {
      await apiRequest('POST', '/api/activities', {
        leadId: lead.id,
        type: 'call',
        notes: 'Marked as contacted from follow-ups page',
        teamId: currentTeamId,
      });
      await apiRequest('PATCH', `/api/leads/${lead.id}`, {
        nextFollowUp: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({ title: "Marked as contacted", description: "Activity logged and follow-up cleared." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark as contacted.", variant: "destructive" });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async (lead: any) => {
      const currentDate = new Date(lead.nextFollowUp!);
      const newDate = addDays(isPast(currentDate) ? new Date() : currentDate, 1);
      await apiRequest('PATCH', `/api/leads/${lead.id}`, {
        nextFollowUp: newDate.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: "Snoozed", description: "Follow-up moved to tomorrow." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to snooze follow-up.", variant: "destructive" });
    },
  });

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.name || 'Unassigned';
  };

  const getUserInitials = (userId: string) => {
    const name = getUserName(userId);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const FollowUpCard = ({ lead, isOverdue = false }: { lead: any; isOverdue?: boolean }) => (
    <Card 
      data-testid={`card-followup-${lead.id}`}
      className={`hover:shadow-md transition-all ${isOverdue ? 'border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 
              ${isOverdue 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-primary/10 text-primary'}`}>
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Link href={`/leads/${lead.id}`}>
                <span className="font-semibold hover:underline decoration-primary/50 underline-offset-4 cursor-pointer block truncate" data-testid={`link-lead-${lead.id}`}>
                  {lead.name}
                </span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                {lead.company && <span className="truncate">{lead.company}</span>}
                {lead.phone && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{lead.phone}</span>
                  </>
                )}
                <span>•</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">{lead.stage}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {isManager && lead.assignedTo && (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-muted">{getUserInitials(lead.assignedTo)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground hidden sm:inline">{getUserName(lead.assignedTo)}</span>
              </div>
            )}

            <div className="text-right min-w-[70px]">
              <div className={`flex items-center gap-1 text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(lead.nextFollowUp!), 'h:mm a')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(lead.nextFollowUp!), 'MMM d')}
              </div>
            </div>

            <div className="flex gap-1.5">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2.5 text-xs gap-1"
                onClick={() => markContactedMutation.mutate(lead)}
                disabled={markContactedMutation.isPending}
                data-testid={`button-contacted-${lead.id}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Contacted</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2.5 text-xs gap-1"
                onClick={() => snoozeMutation.mutate(lead)}
                disabled={snoozeMutation.isPending}
                data-testid={`button-snooze-${lead.id}`}
              >
                <AlarmClock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">+1 Day</span>
              </Button>
              <Link href={`/leads/${lead.id}`}>
                <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs gap-1" data-testid={`button-view-${lead.id}`}>
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SectionHeader = ({ title, count, icon: Icon, color = '' }: { title: string; count: number; icon: any; color?: string }) => (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <h2 className={`text-lg font-semibold ${color}`}>{title}</h2>
      <Badge variant={color.includes('red') ? 'destructive' : 'secondary'} className="rounded-full px-2.5 h-5 text-xs">
        {count}
      </Badge>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground mt-1">Loading scheduled follow-ups...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalCount = overdue.length + today.length + thisWeek.length + upcoming.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Follow-ups</h1>
        <p className="text-muted-foreground mt-1">
          Stay on top of your scheduled calls and meetings.
          {totalCount > 0 && ` ${totalCount} follow-up${totalCount !== 1 ? 's' : ''} pending.`}
        </p>
      </div>

      <div className="space-y-8">
        {overdue.length > 0 && (
          <div className="space-y-3">
            <SectionHeader title="Overdue" count={overdue.length} icon={AlarmClock} color="text-red-600 dark:text-red-400" />
            <div className="grid gap-2.5">
              {overdue.map((lead: any) => <FollowUpCard key={lead.id} lead={lead} isOverdue />)}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <SectionHeader title="Today" count={today.length} icon={CalendarClock} />
          {today.length > 0 ? (
            <div className="grid gap-2.5">
              {today.map((lead: any) => <FollowUpCard key={lead.id} lead={lead} />)}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-8 border border-dashed rounded-lg text-center">
              No follow-ups scheduled for today. Good job!
            </div>
          )}
        </div>

        {thisWeek.length > 0 && (
          <div className="space-y-3">
            <SectionHeader title="This Week" count={thisWeek.length} icon={CalendarDays} />
            <div className="grid gap-2.5">
              {thisWeek.map((lead: any) => <FollowUpCard key={lead.id} lead={lead} />)}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-3">
            <SectionHeader title="Upcoming" count={upcoming.length} icon={CalendarCheck} color="text-muted-foreground" />
            <div className="grid gap-2.5 opacity-80">
              {upcoming.map((lead: any) => <FollowUpCard key={lead.id} lead={lead} />)}
            </div>
          </div>
        )}

        {totalCount === 0 && (
          <div className="text-center py-16 space-y-3">
            <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No follow-ups scheduled</h3>
            <p className="text-sm text-muted-foreground">
              Schedule follow-ups from the lead detail page to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
