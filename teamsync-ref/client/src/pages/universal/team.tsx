import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Users, UserPlus, Search } from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { verticalMembers } from "@/lib/mock-data-shared";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/ds/form-dialog";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMemberCard } from "@/components/ui/team-member-card";
import { useToast } from "@/hooks/use-toast";

export default function UniversalTeam() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const isLoading = useSimulatedLoading(800);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const members = useMemo(() => {
    if (!vertical) return [];
    return verticalMembers.filter((m) => m.verticalId === vertical.id);
  }, [vertical]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = deptFilter === "all" || m.department === deptFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [members, searchQuery, deptFilter, statusFilter]);

  const departments = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.department)));
  }, [members]);

  const stats = useMemo(() => {
    return {
      total: members.length,
      online: members.filter((m) => m.status === "online").length,
      departments: departments.length,
    };
  }, [members, departments]);

  const handleAction = (type: string, name: string) => {
    toast({
      title: `${type} action`,
      description: `Opening ${type.toLowerCase()} for ${name}...`,
    });
  };

  if (!vertical) return null;

  return (
    <PageShell>
      <PageHeader
        title="Team Members"
        subtitle={`Manage and connect with the ${vertical.name} team.`}
        actions={
          <Button
            onClick={() => setIsInviteOpen(true)}
            style={{ backgroundColor: vertical.color }}
            className="text-white"
            data-testid="button-invite-member"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        }
      />

      {isLoading ? (
        <div className="h-[54px] animate-pulse bg-muted rounded-lg border" />
      ) : (
        <div className="flex items-stretch bg-card border rounded-lg overflow-hidden">
          <div className="flex-1 px-5 py-3 flex flex-col justify-center border-r">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total Members
            </span>
            <span className="text-lg font-semibold">{stats.total}</span>
          </div>
          <div className="flex-1 px-5 py-3 flex flex-col justify-center border-r">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Online Now
            </span>
            <span className="text-lg font-semibold text-emerald-600">{stats.online}</span>
          </div>
          <div className="flex-1 px-5 py-3 flex flex-col justify-center">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Departments
            </span>
            <span className="text-lg font-semibold">{stats.departments}</span>
          </div>
        </div>
      )}

      <Card className="bg-card/50 border-dashed">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]" data-testid="filter-dept">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-1.5 bg-muted w-full" />
                <div className="p-4 flex flex-col items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="border-t p-2.5 flex justify-center gap-1">
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </Card>
            ))
          : filteredMembers.map((member) => (
              <StaggerItem key={member.id}>
                <TeamMemberCard
                  id={member.id}
                  name={member.name}
                  role={member.role}
                  department={member.department}
                  email={member.email}
                  phone={member.phone}
                  status={member.status}
                  location={member.location}
                  accentColor={vertical.color}
                  onEmailClick={() => handleAction("Email", member.name)}
                  onWhatsAppClick={() => handleAction("WhatsApp", member.name)}
                  onSlackClick={() => handleAction("Slack", member.name)}
                />
              </StaggerItem>
            ))}
      </Stagger>

      {!isLoading && filteredMembers.length === 0 && (
        <Fade className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No team members found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </Fade>
      )}

      <FormDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        title="Invite Team Member"
        onSubmit={() => setIsInviteOpen(false)}
        submitLabel="Send Invitation"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" data-testid="input-invite-name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" data-testid="input-invite-email" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Designer" data-testid="input-invite-role" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dept">Department</Label>
              <Select>
                <SelectTrigger data-testid="select-invite-dept">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+1 (555) 000-0000" data-testid="input-invite-phone" />
          </div>
        </div>
      </FormDialog>
    </PageShell>
  );
}
