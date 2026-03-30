import { useParams, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  MessageSquare,
  FileText,
  Clock,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  MapPin,
  Globe,
  User,
  Users,
  Building2,
  DollarSign,
  Tag,
  Star,
  Flame,
  ThermometerSnowflake,
  X,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { stages } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Lead, Activity, Task } from "@shared/schema";
import { LogActivityDialog } from "@/components/dialogs/LogActivityDialog";
import { EditLeadDialog } from "@/components/dialogs/EditLeadDialog";
import { GenerateQuoteDialog } from "@/components/dialogs/GenerateQuoteDialog";
import { SendEmailDialog } from "@/components/dialogs/SendEmailDialog";
import { SendWhatsAppDialog } from "@/components/dialogs/SendWhatsAppDialog";

export default function LeadDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { currentUser, simulatedRole } = useStore();
  const effectiveRole = simulatedRole || currentUser?.role || 'executive';
  const isManagerView = effectiveRole === 'manager' || effectiveRole === 'superadmin';
  const [note, setNote] = useState("");
  const [newTag, setNewTag] = useState("");

  const { data: lead } = useQuery<Lead>({
    queryKey: ['/api/leads', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${params.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser && !!params.id,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/activities?leadId=${params.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser && !!params.id,
  });

  const { data: leadTasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', 'lead', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?leadId=${params.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser && !!params.id,
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: { leadId: string; userId: string; type: string; notes: string; duration?: number }) => {
      const res = await apiRequest('POST', '/api/activities', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', params.id] });
    },
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: string }) => {
      const res = await apiRequest('PATCH', `/api/leads/${leadId}`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads', params.id] });
    },
  });

  const updateLeadStage = (leadId: string, stage: string) => {
    updateLeadStageMutation.mutate({ leadId, stage });
  };
  
  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Lead>) => {
      const res = await apiRequest('PATCH', `/api/leads/${params.id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads', params.id] });
    },
  });

  const [rating, setRating] = useState<number>(0);
  const [leadTagsLocal, setLeadTagsLocal] = useState<string[]>([]);

  useEffect(() => {
    if (lead) {
      setRating(lead.rating || 0);
      setLeadTagsLocal(lead.tags || []);
    }
  }, [lead?.id, lead?.rating, lead?.tags]);

  const handleRatingChange = (star: number) => {
    const newTemp: 'hot' | 'warm' | 'cold' = star >= 4 ? 'hot' : star === 3 ? 'warm' : 'cold';
    setRating(star);
    updateLeadMutation.mutate({ rating: star, temperature: newTemp });
  };

  const handleAddTagLocal = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!leadTagsLocal.includes(newTag.trim())) {
        const updated = [...leadTagsLocal, newTag.trim()];
        setLeadTagsLocal(updated);
        updateLeadMutation.mutate({ tags: updated });
      }
      setNewTag("");
    }
  };

  const removeTagLocal = (tagToRemove: string) => {
    const updated = leadTagsLocal.filter(t => t !== tagToRemove);
    setLeadTagsLocal(updated);
    updateLeadMutation.mutate({ tags: updated });
  };

  const leadActivities = activities
    .filter((a: Activity) => a.leadId === lead?.id)
    .sort((a: Activity, b: Activity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!lead) {
    return <div className="p-8">Lead not found</div>;
  }

  const prevLeadId: string | null = null;
  const nextLeadId: string | null = null;

  const navigateToLead = (id: string | null) => {
    if (id) setLocation(`/leads/${id}`);
  };

  const handleAddNote = () => {
    if (!note.trim() || !lead || !currentUser) return;
    addActivityMutation.mutate({
      leadId: lead.id,
      userId: currentUser.id,
      type: 'note',
      notes: note
    });
    setNote("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-[1600px] mx-auto overflow-hidden">
      {/* Fixed Header Section */}
      <div className="shrink-0 pt-1 px-1 pb-2 flex flex-col gap-2">
        {/* Header Navigation */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Link href={isManagerView ? "/admin/leads" : "/leads"}>
              <a className="hover:text-foreground transition-colors flex items-center gap-1">
                <Users className="h-4 w-4" />
                {isManagerView ? "All Leads" : "My Leads"}
              </a>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">{lead.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 border" 
              disabled={!prevLeadId}
              onClick={() => navigateToLead(prevLeadId)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 border"
              disabled={!nextLeadId}
              onClick={() => navigateToLead(nextLeadId)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Profile Header Card */}
        <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] overflow-hidden shrink-0">
          <div className="p-6 pb-4">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-12 w-12 border shadow-sm">
                  <AvatarImage src={lead.avatar} className="object-cover" />
                  <AvatarFallback className="text-sm bg-muted">{lead.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-[20px] font-bold text-foreground leading-tight">{lead.name}</h1>
                    <div className="h-4 w-[1px] bg-border" />
                    
                    {/* Rating Stars with Integrated Temperature */}
                    <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-0.5 border">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => {
                          let fillClass = "text-border";
                          if (star <= rating) {
                            if (rating >= 4) fillClass = "fill-red-500 text-red-500";
                            else if (rating === 3) fillClass = "fill-orange-500 text-orange-500";
                            else fillClass = "fill-blue-500 text-blue-500";
                          }
                          return (
                            <button 
                              key={star}
                              onClick={() => handleRatingChange(star)}
                              className="focus:outline-none hover:scale-110 transition-transform p-0.5"
                            >
                              <Star className={cn("h-3 w-3 transition-colors", fillClass)} />
                            </button>
                          );
                        })}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        rating >= 4 ? "text-red-600" :
                        rating === 3 ? "text-orange-600" :
                        rating > 0 ? "text-blue-600" : "text-muted-foreground"
                      )}>
                        {rating >= 4 ? "Hot" : rating === 3 ? "Warm" : rating > 0 ? "Cold" : "Unrated"}
                      </span>
                    </div>

                    <div className="h-4 w-[1px] bg-border" />

                    {/* Compact Stage Selector */}
                    <div className="flex items-center gap-1">
                      {stages.map((stage) => {
                        const isActive = stage.id === lead.stage;
                        return (
                          <button
                            key={stage.id}
                            onClick={() => updateLeadStage(lead.id, stage.id)}
                            className={cn(
                              "h-2 w-8 rounded-full transition-all hover:scale-105",
                              isActive ? `bg-${stage.color}-500 ring-2 ring-${stage.color}-200` : "bg-muted"
                            )}
                            title={stage.label}
                          />
                        );
                      })}
                      <span className="ml-2 text-xs font-medium text-foreground uppercase tracking-wide">
                        {stages.find(s => s.id === lead.stage)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {lead.company}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {lead.address || "No location"}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {lead.source}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-3 shrink-0">
              <LogActivityDialog 
                leadId={lead.id} 
                defaultType="call"
                trigger={
                  <Button variant="outline" className="h-[40px] border text-foreground font-medium shadow-sm hover:bg-muted">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                }
              />
              <SendEmailDialog 
                leadId={lead.id} 
                trigger={
                  <Button variant="outline" className="h-[40px] border text-foreground font-medium shadow-sm hover:bg-muted">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                }
              />
              <SendWhatsAppDialog 
                leadId={lead.id} 
                trigger={
                  <Button variant="outline" className="h-[40px] border text-foreground font-medium shadow-sm hover:bg-muted">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                }
              />
              <div className="h-8 w-[1px] bg-border mx-1" />
              {lead.stage !== 'lost' && (
                <Button 
                  onClick={() => updateLeadStage(lead.id, 'lost')} 
                  className="h-[40px] bg-card hover:bg-red-50 text-red-600 border border-red-200 shadow-sm font-medium"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark Lost
                </Button>
              )}
              {lead.stage !== 'won' && (
                <Button 
                  onClick={() => updateLeadStage(lead.id, 'won')} 
                  className="h-[40px] bg-[#10B981] hover:bg-[#059669] text-white border border-[#10B981] shadow-sm font-medium"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Won
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-[40px] w-[40px] border text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <GenerateQuoteDialog leadId={lead.id} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><FileText className="mr-2 h-4 w-4" /> Generate Quote</DropdownMenuItem>} />
                  <DropdownMenuItem className="text-red-600"><XCircle className="mr-2 h-4 w-4" /> Mark as Lost</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Separated Stages Section - Removed as per request */}
      </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden pr-1 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column: Info Cards - Scrollable */}
          <div className="space-y-6 lg:col-span-1 overflow-y-auto h-full pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Key Details */}
            <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] overflow-hidden">
                <div className="px-5 py-4 border-b border flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-foreground">Lead Details</h3>
                  <EditLeadDialog leadId={lead.id} trigger={<Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-muted">Edit</Button>} />
                </div>
                <div className="p-5">
                   <div className="mb-6">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                        <Phone className="h-3 w-3" /> Phone
                      </p>
                      <a href={`tel:${lead.phone}`} className="text-xl font-bold text-foreground hover:underline block">
                        {lead.phone}
                      </a>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                           <DollarSign className="h-3 w-3" /> Deal Value
                        </p>
                        <p className="text-sm font-bold text-[#10B981]">₹{lead.value.toLocaleString()}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                           <Tag className="h-3 w-3" /> Service
                        </p>
                        <p className="text-sm font-medium text-foreground truncate" title={lead.service}>{lead.service}</p>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                           <Mail className="h-3 w-3" /> Email
                        </p>
                        <a href={`mailto:${lead.email}`} className="text-sm font-medium text-primary hover:underline truncate block">
                           {lead.email}
                        </a>
                      </div>
                      
                      <div className="space-y-1 col-span-2">
                         <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                           <Clock className="h-3 w-3" /> Created
                         </p>
                         <p className="text-sm text-foreground">
                           {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Last Connected Card */}
              {lead.lastConnected ? (
                 <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] overflow-hidden">
                  <div className="px-5 py-4 border-b border">
                    <h3 className="text-[16px] font-semibold text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Last Connected
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(lead.lastConnected.date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Outcome</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize font-medium">
                          {lead.lastConnected.outcome}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Duration</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {lead.lastConnected.duration}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Agent</p>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.lastConnected.agent}`} />
                            <AvatarFallback className="text-[10px]">{lead.lastConnected.agent.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground truncate">{lead.lastConnected.agent}</span>
                        </div>
                      </div>
                    </div>

                    {lead.lastConnected.nextFollowUp && (
                      <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium bg-[#FFF0F3] p-3 rounded-lg border border-[#FFE4E8]">
                          <Calendar className="h-4 w-4" />
                          Next: {format(new Date(lead.lastConnected.nextFollowUp), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    )}
                  </div>
                 </div>
              ) : (
                 <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] p-6 text-center">
                    <p className="text-sm text-muted-foreground">No connection history available.</p>
                 </div>
              )}
            </div>

          <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
            <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <TabsList className="bg-card border p-1 h-[44px] rounded-[10px]">
                    <TabsTrigger value="overview" className="rounded-[8px] data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">Overview</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-[8px] data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">Activity</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-[8px] data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
                      Tasks {leadTasks.length > 0 && <span className="ml-1 bg-primary/20 text-primary rounded-full px-1.5 py-0 text-[10px] font-semibold">{leadTasks.length}</span>}
                    </TabsTrigger>
                  </TabsList>
                </div>
                
              <div className="flex-1 overflow-hidden pb-1">
                <TabsContent value="overview" className="h-full mt-0 outline-none">
                   <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] h-full flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Tags Section */}
                        <section>
                          <h3 className="text-[16px] font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" /> Tags
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {leadTagsLocal.map(tag => (
                              <Badge key={tag} variant="secondary" className="bg-muted text-foreground border px-2 py-1 flex items-center gap-1 font-normal group">
                                {tag}
                                <button onClick={() => removeTagLocal(tag)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {leadTagsLocal.length === 0 && <span className="text-sm text-muted-foreground italic">No tags added yet.</span>}
                          </div>
                          <div className="relative max-w-sm">
                            <Input 
                              placeholder="Add a tag and press Enter..." 
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={handleAddTagLocal}
                              className="h-9 text-sm pr-8 bg-muted border focus-visible:ring-primary"
                            />
                            <Plus className="h-4 w-4 absolute right-3 top-2.5 text-muted-foreground" />
                          </div>
                        </section>
                        {/* Attachments Section */}
                        <section>
                          <h3 className="text-[16px] font-semibold text-foreground mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" /> Attachments
                          </h3>
                          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border rounded-xl bg-muted/40">
                            <FileText className="h-10 w-10 text-border mb-3" />
                            <p className="text-sm font-medium">No attachments uploaded yet</p>
                            <Button variant="link" className="text-primary text-sm mt-1">Upload Attachment</Button>
                          </div>
                        </section>
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="activity" className="h-full mt-0 outline-none">
                    <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] overflow-hidden h-full flex flex-col">
                      <div className="px-5 py-4 border-b border shrink-0">
                        <h3 className="text-[16px] font-semibold text-foreground">Activity History</h3>
                      </div>
                      <div className="flex-1 min-h-0">
                        <ScrollArea className="h-full">
                          <div className="p-6 space-y-8">
                            {leadActivities.length === 0 ? (
                              <div className="text-center py-10 text-muted-foreground">No activities recorded yet.</div>
                            ) : (
                              leadActivities.map((activity, i) => (
                                <div key={activity.id} className="relative flex gap-4">
                                  {/* Line connector */}
                                  {i !== leadActivities.length - 1 && (
                                    <div className="absolute left-[15px] top-10 h-full w-[2px] bg-[#F1F5F9]" />
                                  )}
                                  
                                  <div className="relative z-10 shrink-0">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm
                                      ${activity.type === 'call' ? 'bg-blue-100 text-blue-600' : ''}
                                      ${activity.type === 'email' ? 'bg-orange-100 text-orange-600' : ''}
                                      ${activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' : ''}
                                      ${activity.type === 'stage_change' ? 'bg-muted text-muted-foreground' : ''}
                                      ${activity.type === 'note' ? 'bg-yellow-100 text-yellow-600' : ''}
                                    `}>
                                      {activity.type === 'call' && <Phone className="h-4 w-4" />}
                                      {activity.type === 'email' && <Mail className="h-4 w-4" />}
                                      {activity.type === 'meeting' && <Calendar className="h-4 w-4" />}
                                      {activity.type === 'stage_change' && <TrendingUp className="h-4 w-4" />}
                                      {activity.type === 'note' && <FileText className="h-4 w-4" />}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 pb-4">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-sm font-semibold text-foreground capitalize">
                                        {activity.type.replace('_', ' ')}
                                      </p>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                                      </span>
                                    </div>
                                    <div className="bg-muted rounded-lg p-3 border">
                                      <p className="text-sm text-foreground leading-relaxed">
                                        {activity.notes}
                                      </p>
                                      {activity.duration && (
                                        <Badge variant="outline" className="text-[10px] h-5 mt-2 bg-card border">
                                          {activity.duration} mins
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tasks" className="h-full mt-0 outline-none">
                    <div className="bg-card border rounded-[16px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] h-full flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-6">
                        {leadTasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <CheckCircle2 className="h-10 w-10 text-border mb-3" />
                            <p className="font-medium">No tasks linked to this lead</p>
                            <p className="text-sm mt-1">Tasks created for this lead will appear here.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {leadTasks.map((task: Task) => (
                              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/40 hover:bg-muted transition-colors">
                                <div className={cn(
                                  "mt-0.5 h-2 w-2 rounded-full shrink-0",
                                  task.status === 'completed' ? 'bg-green-500' :
                                  task.status === 'in_progress' ? 'bg-blue-500' :
                                  task.priority === 'high' ? 'bg-red-500' : 'bg-orange-400'
                                )} />
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "text-sm font-medium",
                                    task.status === 'completed' && 'line-through text-muted-foreground'
                                  )}>{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="outline" className="text-[10px] h-5 capitalize">{task.status?.replace('_', ' ')}</Badge>
                                    {task.dueDate && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(task.dueDate), "MMM d")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}