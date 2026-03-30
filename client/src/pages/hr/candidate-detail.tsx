import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { insertCandidateCallSchema } from "@shared/schema";
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
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
  Edit,
  Trash2,
  Loader2,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  UserCheck,
  CalendarCheck,
  HelpCircle,
  Plus,
  DollarSign,
  Timer
} from "lucide-react";
import type { Candidate, CandidateCall } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: UserCheck },
  contacted: { label: "Contacted", color: "bg-purple-100 text-purple-800", icon: Phone },
  interested: { label: "Interested", color: "bg-green-100 text-green-800", icon: CheckCircle },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-amber-100 text-amber-800", icon: CalendarCheck },
  interviewed: { label: "Interviewed", color: "bg-indigo-100 text-indigo-800", icon: MessageSquare },
  offered: { label: "Offered", color: "bg-cyan-100 text-cyan-800", icon: FileText },
  hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-800", icon: Clock },
};

const callStatusConfig: Record<string, { label: string; icon: any; color: string }> = {
  connected: { label: "Connected", icon: PhoneCall, color: "text-green-600" },
  not_connected: { label: "Not Connected", icon: PhoneOff, color: "text-red-500" },
  busy: { label: "Busy", icon: PhoneMissed, color: "text-amber-500" },
  switched_off: { label: "Switched Off", icon: PhoneOff, color: "text-gray-500" },
  wrong_number: { label: "Wrong Number", icon: XCircle, color: "text-red-600" },
};

const callResponseConfig: Record<string, { label: string; color: string }> = {
  interested: { label: "Interested", color: "bg-green-100 text-green-800" },
  not_interested: { label: "Not Interested", color: "bg-red-100 text-red-800" },
  maybe: { label: "Maybe", color: "bg-amber-100 text-amber-800" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

// Extend the shared schema for form-specific fields (date as string for datetime-local input)
const callFormSchema = insertCandidateCallSchema
  .omit({ candidateId: true, callDate: true })
  .extend({
    callType: z.string().default("invitation"),
    callDate: z.string().min(1, "Date is required"),
    callStatus: z.string().min(1, "Call status is required"),
    duration: z.coerce.number().optional().nullable(),
  });

type CallFormData = z.infer<typeof callFormSchema>;

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CandidateCall | null>(null);
  const [deleteCallId, setDeleteCallId] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const { data: candidate, isLoading: candidateLoading } = useQuery<Candidate>({
    queryKey: ['/api/hr/candidates', id],
    enabled: !!id,
  });

  const { data: calls = [], isLoading: callsLoading } = useQuery<CandidateCall[]>({
    queryKey: ['/api/hr/candidates', id, 'calls'],
    enabled: !!id,
  });

  const callForm = useForm<CallFormData>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      callType: "invitation",
      callDate: new Date().toISOString().slice(0, 16),
      callStatus: "",
      callResponse: "",
      callNotes: "",
      duration: undefined,
    },
  });

  const createCallMutation = useMutation({
    mutationFn: async (data: CallFormData) => {
      return apiRequest('POST', `/api/hr/candidates/${id}/calls`, {
        ...data,
        callDate: new Date(data.callDate),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates', id, 'calls'] });
      setCallDialogOpen(false);
      callForm.reset();
      toast({ title: "Call logged successfully" });
    },
    onError: (error) => {
      toast({ title: "Error logging call", description: String(error), variant: "destructive" });
    },
  });

  const updateCallMutation = useMutation({
    mutationFn: async ({ callId, data }: { callId: string; data: Partial<CallFormData> }) => {
      return apiRequest('PATCH', `/api/hr/calls/${callId}`, {
        ...data,
        callDate: data.callDate ? new Date(data.callDate) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates', id, 'calls'] });
      setCallDialogOpen(false);
      setEditingCall(null);
      callForm.reset();
      toast({ title: "Call updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating call", description: String(error), variant: "destructive" });
    },
  });

  const deleteCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      return apiRequest('DELETE', `/api/hr/calls/${callId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates', id, 'calls'] });
      setDeleteCallId(null);
      toast({ title: "Call deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting call", description: String(error), variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest('PATCH', `/api/hr/candidates/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/candidates'] });
      setStatusDialogOpen(false);
      toast({ title: "Status updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating status", description: String(error), variant: "destructive" });
    },
  });

  const handleOpenCallDialog = (call?: CandidateCall) => {
    if (call) {
      setEditingCall(call);
      callForm.reset({
        callType: call.callType,
        callDate: new Date(call.callDate).toISOString().slice(0, 16),
        callStatus: call.callStatus,
        callResponse: call.callResponse || "",
        callNotes: call.callNotes || "",
        duration: call.duration || undefined,
      });
    } else {
      setEditingCall(null);
      callForm.reset({
        callType: "invitation",
        callDate: new Date().toISOString().slice(0, 16),
        callStatus: "",
        callResponse: "",
        callNotes: "",
        duration: undefined,
      });
    }
    setCallDialogOpen(true);
  };

  const onSubmitCall = (data: CallFormData) => {
    if (editingCall) {
      updateCallMutation.mutate({ callId: editingCall.id, data });
    } else {
      createCallMutation.mutate(data);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-sm">Not rated</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
    );
  };

  if (candidateLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Candidate not found</p>
          <Link href="/hr/candidates">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[candidate.status]?.icon || HelpCircle;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/candidates">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
          <p className="text-muted-foreground">{candidate.appliedFor}</p>
        </div>
        <Badge className={statusConfig[candidate.status]?.color || "bg-gray-100 text-gray-800"}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig[candidate.status]?.label || candidate.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Candidate Details</CardTitle>
                <Link href={`/hr/candidates/${candidate.id}/edit`}>
                  <Button variant="outline" size="sm" data-testid="button-edit-candidate">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{candidate.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${candidate.phone}`} className="hover:underline">{candidate.phone}</a>
                    </div>
                    {candidate.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${candidate.email}`} className="hover:underline">{candidate.email}</a>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Position</label>
                  <div className="font-medium flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {candidate.appliedFor}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Source</label>
                  <div className="font-medium">{candidate.source}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Experience</label>
                  <div className="font-medium">{candidate.experience || "N/A"}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Current CTC</label>
                  <div className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {candidate.currentSalary || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Expected CTC</label>
                  <div className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {candidate.expectedSalary || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Notice Period</label>
                  <div className="font-medium flex items-center gap-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    {candidate.noticePeriod || "N/A"}
                  </div>
                </div>
              </div>

              {candidate.skills && (
                <>
                  <Separator />
                  <div>
                    <label className="text-xs text-muted-foreground">Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.skills.split(',').map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {candidate.notes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-xs text-muted-foreground">Notes</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{candidate.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Rating</label>
                  <div className="mt-1">{renderStars(candidate.rating)}</div>
                </div>
                <div className="flex-1" />
                <div className="flex gap-2">
                  {candidate.profileUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(candidate.profileUrl!, '_blank')}
                      data-testid="button-view-profile"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  )}
                  {candidate.cvUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(candidate.cvUrl!, '_blank')}
                      data-testid="button-view-cv"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View CV
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Call History</CardTitle>
                <Button size="sm" onClick={() => handleOpenCallDialog()} data-testid="button-log-call">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Call
                </Button>
              </div>
              <CardDescription>Track all calls made to this candidate</CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : calls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No calls logged yet</p>
                  <Button 
                    variant="ghost" 
                    className="mt-2"
                    onClick={() => handleOpenCallDialog()}
                  >
                    Log first call
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {calls.map((call, index) => {
                    const StatusIcon = callStatusConfig[call.callStatus]?.icon || Phone;
                    return (
                      <div 
                        key={call.id} 
                        className="flex gap-4"
                        data-testid={`call-${call.id}`}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full bg-muted ${callStatusConfig[call.callStatus]?.color || ''}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          {index < calls.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">{call.callType.replace('_', ' ')} Call</span>
                                <Badge variant="outline" className="text-xs">
                                  {callStatusConfig[call.callStatus]?.label || call.callStatus}
                                </Badge>
                                {call.callResponse && (
                                  <Badge className={callResponseConfig[call.callResponse]?.color || "bg-gray-100"}>
                                    {callResponseConfig[call.callResponse]?.label || call.callResponse}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(call.callDate), "MMM d, yyyy 'at' h:mm a")}
                                {call.duration && ` • ${Math.floor(call.duration / 60)}m ${call.duration % 60}s`}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleOpenCallDialog(call)}
                                data-testid={`button-edit-call-${call.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => setDeleteCallId(call.id)}
                                data-testid={`button-delete-call-${call.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          {call.callNotes && (
                            <p className="text-sm text-muted-foreground mt-2">{call.callNotes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.open(`tel:${candidate.phone}`)}
                data-testid="button-quick-call"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Candidate
              </Button>
              {candidate.email && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${candidate.email}`)}
                  data-testid="button-quick-email"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.open(`https://wa.me/${candidate.phone.replace(/\D/g, '')}`)}
                data-testid="button-quick-whatsapp"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Separator />
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleOpenCallDialog()}
                data-testid="button-quick-log-call"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Log Call
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setNewStatus(candidate.status);
                  setStatusDialogOpen(true);
                }}
                data-testid="button-change-status"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Change Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Added {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}</span>
                </div>
                {candidate.interviewDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarCheck className="h-4 w-4" />
                    <span>Interview: {format(new Date(candidate.interviewDate), "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{calls.length} call{calls.length !== 1 ? 's' : ''} logged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statusConfig).map(([key, config]) => {
                  const isActive = candidate.status === key;
                  const isPast = Object.keys(statusConfig).indexOf(candidate.status) > Object.keys(statusConfig).indexOf(key);
                  const Icon = config.icon;
                  return (
                    <div 
                      key={key}
                      className={`flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-medium' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{config.label}</span>
                      {isActive && <Badge className="ml-auto text-xs">Current</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCall ? "Edit Call Log" : "Log New Call"}</DialogTitle>
          </DialogHeader>
          <Form {...callForm}>
            <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={callForm.control}
                  name="callType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-call-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invitation">Invitation</SelectItem>
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="follow_up">Follow Up</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={callForm.control}
                  name="callDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="datetime-local"
                          data-testid="input-call-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={callForm.control}
                  name="callStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-call-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(callStatusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={callForm.control}
                  name="callResponse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-call-response">
                            <SelectValue placeholder="Select response" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Response</SelectItem>
                          {Object.entries(callResponseConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={callForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        placeholder="e.g., 180 for 3 minutes"
                        value={field.value || ""}
                        data-testid="input-call-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={callForm.control}
                name="callNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        placeholder="Any notes from the call..."
                        rows={3}
                        data-testid="input-call-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCallDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCallMutation.isPending || updateCallMutation.isPending}
                  data-testid="button-submit-call"
                >
                  {(createCallMutation.isPending || updateCallMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCall ? "Update Call" : "Log Call"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCallId} onOpenChange={() => setDeleteCallId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Call Log</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this call log? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCallId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteCallId && deleteCallMutation.mutate(deleteCallId)}
              disabled={deleteCallMutation.isPending}
              data-testid="button-confirm-delete-call"
            >
              {deleteCallMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Candidate Status</DialogTitle>
          </DialogHeader>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger data-testid="select-new-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateStatusMutation.mutate(newStatus)}
              disabled={updateStatusMutation.isPending}
              data-testid="button-confirm-status"
            >
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
