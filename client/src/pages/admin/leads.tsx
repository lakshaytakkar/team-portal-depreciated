import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { stages } from "@/lib/mock-data";
import { format } from "date-fns";
import { Link } from "wouter";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Download,
  Trash2,
  Edit,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  Target,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { Lead, User } from "@shared/schema";
import { AddLeadDialog } from "@/components/dialogs/AddLeadDialog";
import { EditLeadDialog } from "@/components/dialogs/EditLeadDialog";
import { LogActivityDialog } from "@/components/dialogs/LogActivityDialog";

const SOURCES = ["Website", "Referral", "Google Ads", "LinkedIn", "Cold Call", "Social Media", "Partner", "Other"];

export default function AdminLeads() {
  const { currentUser, currentTeamId, simulatedRole } = useStore();

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/leads', currentTeamId, simulatedRole],
    queryFn: async () => {
      const effectiveRole = useStore.getState().getEffectiveRole();
      const params = new URLSearchParams();
      if (currentTeamId) params.set('teamId', currentTeamId);
      if (effectiveRole === 'executive' && currentUser?.id) params.set('assignedTo', currentUser.id);
      const res = await fetch(`/api/leads?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users', currentTeamId],
    queryFn: async () => {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
      const res = await apiRequest('PATCH', `/api/leads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
  });

  const updateLead = (id: string, data: Partial<Lead>) => updateLeadMutation.mutate({ id, data });
  const deleteLead = (id: string) => deleteLeadMutation.mutate(id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filteredLeads = leads
    .filter((lead: Lead) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        lead.name.toLowerCase().includes(q) ||
        (lead.company || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || lead.stage === statusFilter;
      const matchesAssignee = assigneeFilter === "all" || lead.assignedTo === assigneeFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesAssignee && matchesSource;
    });

  const totalPipelineValue = leads.reduce((sum: number, l: Lead) => sum + (l.value || 0), 0);
  const avgDealSize = leads.length > 0 ? Math.round(totalPipelineValue / leads.length) : 0;

  const getStageBadgeStyles = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    switch (stage?.color) {
      case 'blue': return "bg-card text-blue-500 border-blue-500";
      case 'yellow': return "bg-card text-orange-500 border-orange-500";
      case 'purple': return "bg-card text-purple-500 border-purple-500";
      case 'green': return "bg-card text-emerald-500 border-emerald-500";
      case 'gray': return "bg-card text-muted-foreground border";
      default: return "bg-card text-muted-foreground border";
    }
  };

  const getStageDotColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    switch (stage?.color) {
      case 'blue': return "bg-blue-500";
      case 'yellow': return "bg-orange-500";
      case 'purple': return "bg-purple-500";
      case 'green': return "bg-emerald-500";
      default: return "bg-muted-foreground";
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    return users.find(u => u.id === userId)?.name || "Unknown";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-[20px] font-semibold text-foreground leading-[1.35]">All Leads</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-card border text-foreground shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] h-[40px] px-4 font-semibold">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <AddLeadDialog trigger={
            <Button className="bg-primary text-white shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] h-[40px] px-4 font-semibold border-none">
              Add New Lead
            </Button>
          } />
        </div>
      </div>

      {/* Stats Cards for Admin */}
      <div className="flex gap-5 w-full overflow-x-auto pb-1">
        <div className="flex-1 min-w-[240px] bg-card border rounded-lg p-4 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground tracking-[0.28px]">Total Pipeline</span>
            <div className="w-9 h-9 rounded-[8px] border flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold text-foreground">{leads.length}</span>
            <div className="flex items-center gap-2">
              <div className="bg-[#EFFEFA] px-1.5 py-0.5 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-[#40C4AA]">+8%</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground tracking-[0.28px]">vs last week</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[240px] bg-card border rounded-lg p-4 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground tracking-[0.28px]">Avg Deal Size</span>
            <div className="w-9 h-9 rounded-[8px] border flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold text-foreground">₹{avgDealSize >= 1000 ? `${(avgDealSize/1000).toFixed(1)}k` : avgDealSize}</span>
            <div className="flex items-center gap-2">
              <div className="bg-[#FFF0F3] px-1.5 py-0.5 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-[#DF1C41]">-1.2%</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground tracking-[0.28px]">vs last week</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[240px] bg-card border rounded-lg p-4 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground tracking-[0.28px]">Active Agents</span>
            <div className="w-9 h-9 rounded-[8px] border flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold text-foreground">{users.length}</span>
            <div className="flex items-center gap-2">
              <div className="bg-[#EFFEFA] px-1.5 py-0.5 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-[#40C4AA]">+2</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground tracking-[0.28px]">new this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-card border rounded-lg shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="flex items-center justify-between px-5 py-2 border-b h-[64px]">
          <h2 className="text-[16px] font-semibold text-foreground tracking-[0.32px]">All Leads Data</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-[38px] w-[200px] bg-card border text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[160px] h-[38px] bg-card border text-muted-foreground">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-[38px] bg-card border text-muted-foreground">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px] h-[38px] bg-card border text-muted-foreground">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {SOURCES.map(src => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-[50px] pl-4">
                  <Checkbox className="border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[4px]" />
                </TableHead>
                <TableHead className="h-[40px] text-muted-foreground font-medium text-[14px] tracking-[0.28px]">Lead Name</TableHead>
                <TableHead className="h-[40px] text-muted-foreground font-medium text-[14px] tracking-[0.28px]">Assigned To</TableHead>
                <TableHead className="h-[40px] text-muted-foreground font-medium text-[14px] tracking-[0.28px]">Value</TableHead>
                <TableHead className="h-[40px] text-muted-foreground font-medium text-[14px] tracking-[0.28px]">Stage</TableHead>
                <TableHead className="h-[40px] text-muted-foreground font-medium text-[14px] tracking-[0.28px]">Created</TableHead>
                <TableHead className="h-[40px] w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No leads found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-b hover:bg-muted transition-colors group h-[64px]">
                    <TableCell className="pl-4">
                      <Checkbox className="border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[4px]" />
                    </TableCell>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`}>
                        <a className="font-medium text-foreground text-[14px] hover:text-primary transition-colors">
                          {lead.name}
                        </a>
                      </Link>
                      <div className="text-xs text-muted-foreground">{lead.company}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={users.find(u => u.id === lead.assignedTo)?.avatar} />
                          <AvatarFallback>
                            {getUserName(lead.assignedTo).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">{getUserName(lead.assignedTo)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground text-[14px]">₹{(lead.value).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[16px] border ${getStageBadgeStyles(lead.stage)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${getStageDotColor(lead.stage)}`} />
                        <span className="text-[12px] font-medium tracking-[0.12px]">
                          {stages.find(s => s.id === lead.stage)?.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[14px]">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <EditLeadDialog leadId={lead.id} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>} />
                          <LogActivityDialog leadId={lead.id} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><MessageSquare className="mr-2 h-4 w-4" /> Log Activity</DropdownMenuItem>} />
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Reassign To</DropdownMenuLabel>
                          {users.filter(u => u.id !== lead.assignedTo).map(u => (
                            <DropdownMenuItem key={u.id} onClick={() => updateLead(lead.id, { assignedTo: u.id })}>
                              {u.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-[#DF1C41] hover:text-[#DF1C41] hover:bg-[#FFF0F3]"
                            onClick={() => deleteLead(lead.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-card h-[64px]">
          <span className="text-foreground text-[14px] font-medium tracking-[0.28px]">
            Showing 1 to {Math.min(filteredLeads.length, 8)} of, {filteredLeads.length} results
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center h-[32px] border rounded-[8px] overflow-hidden">
              <div className="px-2 border-r h-full flex items-center bg-card">
                <span className="text-[12px] font-medium text-foreground">Per page</span>
              </div>
              <div className="flex items-center gap-1 px-2 h-full bg-card cursor-pointer">
                <span className="text-[12px] font-medium text-foreground">8</span>
                <ChevronDown className="h-4 w-4 text-foreground" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              <Button variant="outline" size="icon" className="h-8 w-8 p-0 border rounded-[8px]">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </Button>
              <div className="flex items-center border rounded-[8px] overflow-hidden">
                <button className="h-8 w-8 flex items-center justify-center bg-card border-r text-[12px] font-medium text-foreground">1</button>
                <button className="h-8 w-8 flex items-center justify-center bg-card border-r text-[12px] font-medium text-foreground">2</button>
                <button className="h-8 w-8 flex items-center justify-center bg-primary border-r text-[12px] font-medium text-white">3</button>
                <button className="h-8 w-8 flex items-center justify-center bg-card border-r text-[12px] font-medium text-foreground">...</button>
                <button className="h-8 w-8 flex items-center justify-center bg-card text-[12px] font-medium text-foreground">5</button>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 p-0 border rounded-[8px]">
                <ChevronRight className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
