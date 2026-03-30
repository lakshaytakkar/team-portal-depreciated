import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { 
  Search, 
  Plus, 
  Users,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Loader2,
  Edit,
  Trash2,
  Star,
  Calendar,
  Eye,
  Filter,
  Download,
  UserPlus,
  Briefcase
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Candidate, JobPortal } from "@shared/schema";
import { insertCandidateSchema } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacted", color: "bg-purple-100 text-purple-800" },
  interested: { label: "Interested", color: "bg-green-100 text-green-800" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-amber-100 text-amber-800" },
  interviewed: { label: "Interviewed", color: "bg-indigo-100 text-indigo-800" },
  offered: { label: "Offered", color: "bg-cyan-100 text-cyan-800" },
  hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-800" },
};

const sourceOptions = [
  "Naukri Resdex",
  "Internshala",
  "WorkIndia",
  "LinkedIn",
  "Indeed",
  "Email",
  "WhatsApp",
  "Referral",
  "Walk-in",
  "Campus",
  "Other"
];

const positionOptions = [
  "Sales Executive",
  "Sales Manager",
  "Operations Executive",
  "Operations Manager",
  "HR Executive",
  "HR Manager",
  "Social Media Manager",
  "Content Writer",
  "Marketing Executive",
  "Accounts Executive",
  "Business Development",
  "Intern"
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().min(1, "Source is required"),
  appliedFor: z.string().min(1, "Position is required"),
  profileUrl: z.string().optional().or(z.literal("")),
  cvUrl: z.string().optional().or(z.literal("")),
  status: z.string().default("new"),
  currentSalary: z.string().optional().or(z.literal("")),
  expectedSalary: z.string().optional().or(z.literal("")),
  noticePeriod: z.string().optional().or(z.literal("")),
  experience: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  skills: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  rating: z.coerce.number().min(0).max(5).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CandidatesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ['/api/hr/candidates'],
  });

  const { data: portals = [] } = useQuery<JobPortal[]>({
    queryKey: ['/api/hr/job-portals'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      source: "",
      appliedFor: "",
      profileUrl: "",
      cvUrl: "",
      status: "new",
      currentSalary: "",
      expectedSalary: "",
      noticePeriod: "",
      experience: "",
      location: "",
      skills: "",
      notes: "",
      rating: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/hr/candidates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates'] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Candidate added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating candidate", description: String(error), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      return apiRequest('PATCH', `/api/hr/candidates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates'] });
      setDialogOpen(false);
      setEditingCandidate(null);
      form.reset();
      toast({ title: "Candidate updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating candidate", description: String(error), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/hr/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates'] });
      setDeleteConfirmId(null);
      toast({ title: "Candidate deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting candidate", description: String(error), variant: "destructive" });
    },
  });

  const handleOpenDialog = (candidate?: Candidate) => {
    if (candidate) {
      setEditingCandidate(candidate);
      form.reset({
        name: candidate.name,
        phone: candidate.phone,
        email: candidate.email || "",
        source: candidate.source,
        appliedFor: candidate.appliedFor,
        profileUrl: candidate.profileUrl || "",
        cvUrl: candidate.cvUrl || "",
        status: candidate.status,
        currentSalary: candidate.currentSalary || "",
        expectedSalary: candidate.expectedSalary || "",
        noticePeriod: candidate.noticePeriod || "",
        experience: candidate.experience || "",
        location: candidate.location || "",
        skills: candidate.skills || "",
        notes: candidate.notes || "",
        rating: candidate.rating || 0,
      });
    } else {
      setEditingCandidate(null);
      form.reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editingCandidate) {
      updateMutation.mutate({ id: editingCandidate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.phone.includes(search) ||
      (candidate.email && candidate.email.toLowerCase().includes(search.toLowerCase())) ||
      candidate.appliedFor.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter;
    const matchesPosition = positionFilter === "all" || candidate.appliedFor === positionFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesPosition;
  });

  const statusCounts = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueSources = Array.from(new Set(candidates.map(c => c.source))).sort();
  const uniquePositions = Array.from(new Set(candidates.map(c => c.appliedFor))).sort();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-3 w-3 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage job applicants and recruitment pipeline</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-candidate">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.entries(statusConfig).slice(0, 5).map(([key, config]) => (
          <Card 
            key={key} 
            className={`cursor-pointer transition-all hover-elevate ${statusFilter === key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            data-testid={`card-status-${key}`}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statusCounts[key] || 0}</div>
              <div className="text-sm text-muted-foreground">{config.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-candidates"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-source-filter">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-position-filter">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {uniquePositions.map((position) => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">No candidates found</p>
                      {(search || statusFilter !== "all" || sourceFilter !== "all") && (
                        <Button 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                            setSourceFilter("all");
                            setPositionFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="hover-elevate" data-testid={`row-candidate-${candidate.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(candidate.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/hr/candidates/${candidate.id}`}>
                              <span className="font-medium hover:underline cursor-pointer" data-testid={`link-candidate-${candidate.id}`}>
                                {candidate.name}
                              </span>
                            </Link>
                            {candidate.experience && (
                              <div className="text-xs text-muted-foreground">{candidate.experience} exp</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{candidate.phone}</span>
                          </div>
                          {candidate.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{candidate.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {candidate.appliedFor}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{candidate.source}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[candidate.status]?.color || "bg-gray-100 text-gray-800"}>
                          {statusConfig[candidate.status]?.label || candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {renderStars(candidate.rating)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(candidate.createdAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/hr/candidates/${candidate.id}`}>
                            <Button size="icon" variant="ghost" data-testid={`button-view-${candidate.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {candidate.profileUrl && (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => window.open(candidate.profileUrl!, '_blank')}
                              data-testid={`button-profile-${candidate.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleOpenDialog(candidate)}
                            data-testid={`button-edit-${candidate.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(candidate.id)}
                            data-testid={`button-delete-${candidate.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredCandidates.length > 0 && (
            <div className="border-t px-4 py-3 text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter name" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Delhi, Mumbai" data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-source">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sourceOptions.map((source) => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appliedFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applied For *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-position">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positionOptions.map((position) => (
                            <SelectItem key={position} value={position}>{position}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2 years" data-testid="input-experience" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current CTC</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 4 LPA" data-testid="input-current-salary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected CTC</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 5 LPA" data-testid="input-expected-salary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="noticePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Immediate, 15 days" data-testid="input-notice-period" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Naukri/LinkedIn profile URL" data-testid="input-profile-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CV/Resume URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Google Drive or file URL" data-testid="input-cv-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Sales, Communication, MS Office" data-testid="input-skills" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes about the candidate" rows={3} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-candidate"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCandidate ? "Update Candidate" : "Add Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Candidate</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this candidate? This action cannot be undone and will also delete all associated call logs.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
