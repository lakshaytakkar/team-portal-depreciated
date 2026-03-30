import { useState, Fragment } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  Plane,
  Hotel,
  Palette,
  Package,
  MessageSquare,
  Presentation,
  MoreHorizontal,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Phone,
  Mail,
  BadgeCheck,
  QrCode,
  Send,
  FileText,
  Video,
  Building,
  Truck,
  Shield,
  ChevronDown,
  UtensilsCrossed,
  Headphones,
  Store,
  Star,
  ExternalLink,
  MapPin as MapPinIcon,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, EventAttendee, EventHotel, EventFlight, EventCreative, EventPackingItem, EventCommunication, EventPresentation, EventTeamContact, EventVendor, EventVendorItem } from "@shared/schema";

export default function EventDetailPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id;
  const [activeTab, setActiveTab] = useState("attendees");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAttendee, setExpandedAttendee] = useState<string | null>(null);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  const { data: attendees = [] } = useQuery<EventAttendee[]>({
    queryKey: ["/api/events", eventId, "attendees"],
    enabled: !!eventId,
  });

  const { data: hotels = [] } = useQuery<EventHotel[]>({
    queryKey: ["/api/events", eventId, "hotels"],
    enabled: !!eventId,
  });

  const { data: flights = [] } = useQuery<EventFlight[]>({
    queryKey: ["/api/events", eventId, "flights"],
    enabled: !!eventId,
  });

  const { data: creatives = [] } = useQuery<EventCreative[]>({
    queryKey: ["/api/events", eventId, "creatives"],
    enabled: !!eventId,
  });

  const { data: packingItems = [] } = useQuery<EventPackingItem[]>({
    queryKey: ["/api/events", eventId, "packing"],
    enabled: !!eventId,
  });

  const { data: communications = [] } = useQuery<EventCommunication[]>({
    queryKey: ["/api/events", eventId, "communications"],
    enabled: !!eventId,
  });

  const { data: presentations = [] } = useQuery<EventPresentation[]>({
    queryKey: ["/api/events", eventId, "presentations"],
    enabled: !!eventId,
  });

  const { data: teamContacts = [] } = useQuery<EventTeamContact[]>({
    queryKey: ["/api/events", eventId, "team-contacts"],
    enabled: !!eventId,
  });

  const { data: vendors = [] } = useQuery<EventVendor[]>({
    queryKey: ["/api/events", eventId, "vendors"],
    enabled: !!eventId,
  });

  if (eventLoading || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const badgesPrinted = attendees.filter((a) => a.badgePrinted).length;
  const ticketsIssued = attendees.filter((a) => a.ticketStatus === "issued" || a.ticketStatus === "sent").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
            <Badge className={cn("text-sm", event.type === "ibs" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>
              {event.type === "ibs" ? "IBS" : "Seminar"}
            </Badge>
            <Badge className={cn("text-sm", event.status === "upcoming" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>
              {event.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.date), "EEE, MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.city} {event.venue && `• ${event.venue}`}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {attendees.length} / {event.capacity}
            </span>
          </div>
        </div>
        <Link href={`/events/${eventId}/checkin`}>
          <Button className="bg-primary text-white" data-testid="button-checkin-mode">
            <QrCode className="w-4 h-4 mr-2" />
            Check-in Mode
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{attendees.reduce((sum, a) => sum + (a.ticketCount || 1), 0)}</p>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
                <p className="text-xs text-muted-foreground">{attendees.length} attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{checkedInCount}</p>
                <p className="text-xs text-muted-foreground">Checked In</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <BadgeCheck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{badgesPrinted}</p>
                <p className="text-xs text-muted-foreground">Badges Printed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Hotel className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{hotels.length}</p>
                <p className="text-xs text-muted-foreground">Hotel Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Plane className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{flights.length}</p>
                <p className="text-xs text-muted-foreground">Flights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="attendees" className="flex items-center gap-2" data-testid="tab-attendees">
            <Users className="h-4 w-4" />
            Attendees
          </TabsTrigger>
          <TabsTrigger value="logistics" className="flex items-center gap-2" data-testid="tab-logistics">
            <Building2 className="h-4 w-4" />
            Logistics
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2" data-testid="tab-badges">
            <BadgeCheck className="h-4 w-4" />
            Badges & Tickets
          </TabsTrigger>
          <TabsTrigger value="creatives" className="flex items-center gap-2" data-testid="tab-creatives">
            <Palette className="h-4 w-4" />
            Creatives
          </TabsTrigger>
          <TabsTrigger value="packing" className="flex items-center gap-2" data-testid="tab-packing">
            <Package className="h-4 w-4" />
            Packing List
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2" data-testid="tab-communications">
            <Mail className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="presentations" className="flex items-center gap-2" data-testid="tab-presentations">
            <Presentation className="h-4 w-4" />
            Presentations
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2" data-testid="tab-team">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2" data-testid="tab-vendors">
            <Store className="h-4 w-4" />
            Vendors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendees" className="mt-4">
          <AttendeesTab eventId={eventId!} event={event} attendees={attendees} searchQuery={searchQuery} setSearchQuery={setSearchQuery} eventType={event.type} />
        </TabsContent>

        <TabsContent value="logistics" className="mt-4">
          <LogisticsTab eventId={eventId!} hotels={hotels} flights={flights} />
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <BadgesTab eventId={eventId!} attendees={attendees} />
        </TabsContent>

        <TabsContent value="creatives" className="mt-4">
          <CreativesTab eventId={eventId!} creatives={creatives} />
        </TabsContent>

        <TabsContent value="packing" className="mt-4">
          <PackingTab eventId={eventId!} items={packingItems} />
        </TabsContent>

        <TabsContent value="communications" className="mt-4">
          <CommunicationsTab eventId={eventId!} communications={communications} />
        </TabsContent>

        <TabsContent value="presentations" className="mt-4">
          <PresentationsTab eventId={eventId!} presentations={presentations} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <TeamContactsTab eventId={eventId!} contacts={teamContacts} />
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <VendorsTab eventId={eventId!} vendors={vendors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendeesTab({ eventId, event, attendees, searchQuery, setSearchQuery, eventType }: { eventId: string; event: Event; attendees: EventAttendee[]; searchQuery: string; setSearchQuery: (q: string) => void; eventType: string }) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
  const [isBulkSmsOpen, setIsBulkSmsOpen] = useState(false);
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false);
  const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);
  const [isSendingBulkWhatsApp, setIsSendingBulkWhatsApp] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [expandedAttendee, setExpandedAttendee] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    designation: "",
    city: "",
    slotTime: "",
    source: "direct",
  });

  const handleAddAttendee = async () => {
    try {
      await apiRequest("POST", `/api/events/${eventId}/attendees`, formData);
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees"] });
      setIsAddOpen(false);
      setFormData({ name: "", phone: "", email: "", company: "", designation: "", city: "", slotTime: "", source: "direct" });
      toast({ title: "Attendee added successfully" });
    } catch (error: any) {
      toast({ title: "Error adding attendee", description: error.message, variant: "destructive" });
    }
  };

  const handleGenerateAllTickets = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", `/api/events/${eventId}/generate-tickets`, {});
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees"] });
      toast({ title: "Tickets Generated", description: result.message });
    } catch (error: any) {
      toast({ title: "Error generating tickets", description: error.message, variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const handleSendBulkEmail = async () => {
    const attendeesWithEmail = attendees.filter(a => a.email);
    if (attendeesWithEmail.length === 0) {
      toast({ title: "No email addresses", description: "None of the attendees have email addresses", variant: "destructive" });
      return;
    }

    setIsSendingBulkEmail(true);
    try {
      // Server uses authoritative event data from database
      const response = await apiRequest("POST", `/api/events/${eventId}/send-bulk-email`, {});
      const result = await response.json();
      toast({ title: "Bulk Email Sent", description: result.message });
      setIsBulkEmailOpen(false);
    } catch (error: any) {
      toast({ title: "Error sending emails", description: error.message, variant: "destructive" });
    }
    setIsSendingBulkEmail(false);
  };

  const handleSendBulkSms = async () => {
    const attendeesWithPhone = attendees.filter(a => a.phone);
    if (attendeesWithPhone.length === 0) {
      toast({ title: "No phone numbers", description: "None of the attendees have phone numbers", variant: "destructive" });
      return;
    }

    setIsSendingBulkSms(true);
    try {
      // Server uses authoritative event data from database
      const response = await apiRequest("POST", `/api/events/${eventId}/send-bulk-sms`, {});
      const result = await response.json();
      toast({ title: "Bulk SMS Sent", description: result.message });
      setIsBulkSmsOpen(false);
    } catch (error: any) {
      toast({ title: "Error sending SMS", description: error.message, variant: "destructive" });
    }
    setIsSendingBulkSms(false);
  };

  const handleSendBulkWhatsApp = async () => {
    const attendeesWithPhone = attendees.filter(a => a.phone);
    if (attendeesWithPhone.length === 0) {
      toast({ title: "No phone numbers", description: "None of the attendees have phone numbers", variant: "destructive" });
      return;
    }

    setIsSendingBulkWhatsApp(true);
    try {
      const response = await apiRequest("POST", `/api/events/${eventId}/send-bulk-whatsapp`, {});
      const result = await response.json();
      toast({ title: "Bulk WhatsApp Sent", description: result.message });
      setIsBulkWhatsAppOpen(false);
    } catch (error: any) {
      toast({ title: "Error sending WhatsApp", description: error.message, variant: "destructive" });
    }
    setIsSendingBulkWhatsApp(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({ title: "Email required", description: "Please enter a test email address", variant: "destructive" });
      return;
    }
    setIsSendingTest(true);
    try {
      const response = await apiRequest("POST", `/api/events/${eventId}/test-email`, { testEmail });
      const result = await response.json();
      toast({ title: "Test Email Sent", description: result.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setIsSendingTest(false);
  };

  const handleSendTestSms = async () => {
    if (!testPhone) {
      toast({ title: "Phone required", description: "Please enter a test phone number", variant: "destructive" });
      return;
    }
    setIsSendingTest(true);
    try {
      const response = await apiRequest("POST", `/api/events/${eventId}/test-sms`, { testPhone });
      const result = await response.json();
      toast({ title: "Test SMS Sent", description: result.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setIsSendingTest(false);
  };

  const handleSendTestWhatsApp = async () => {
    if (!testPhone) {
      toast({ title: "Phone required", description: "Please enter a test phone number", variant: "destructive" });
      return;
    }
    setIsSendingTest(true);
    try {
      const response = await apiRequest("POST", `/api/events/${eventId}/test-whatsapp`, { testPhone });
      const result = await response.json();
      toast({ title: "Test WhatsApp Sent", description: result.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setIsSendingTest(false);
  };

  // Event details for messages
  const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
  const venue = event.venue || "Hotel Details & Contact";
  const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";
  const venuePhone = "+91 11 4250 0500";
  const mapsLink = "https://maps.app.goo.gl/bvxYw1wNXas1G4TF9";

  const generateWhatsAppMessage = (attendee: EventAttendee) => {
    const ticketCount = attendee.ticketCount || 1;
    const slotInfo = attendee.slotTime || "To be assigned";
    const isIBS = event.type === "ibs";
    
    // For IBS events, show batch-specific schedule
    const ibsSchedule = isIBS && attendee.slotTime ? `

*Your Batch:* ${slotInfo}
Please arrive 15 minutes before your batch timing.` : "";

    if (isIBS) {
      return `Hello ${attendee.name}!

Your ticket for *${event.name}* is confirmed.

*Number of Tickets:* ${ticketCount}
*Date:* ${eventDate}

*Your Batch:* ${slotInfo}
Please arrive 15 minutes before your batch timing.

*Venue:* Radisson Blu Plaza
${venueAddress}
Phone: ${venuePhone}
Google Maps: ${mapsLink}


*Important Instructions:*
• 1 person per ticket
• Arrive 15 mins before your batch time for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav 
+91 8851492209
Team Suprans
cs@suprans.in`;
    }

    // Non-IBS events (workshops, etc.)
    const ticketId = attendee.ticketId || "PENDING";
    return `Hello ${attendee.name}!

Your ticket for *${event.name}* is confirmed.

*Ticket ID:* ${ticketId}
*Number of Tickets:* ${ticketCount}
*Date:* ${eventDate}

*Venue:* Radisson Blu Plaza
${venueAddress}
Phone: ${venuePhone}
Google Maps: ${mapsLink}

*Event Schedule:*
• 8:30 AM - 10:00 AM: Registration & Breakfast
• 10:00 AM: Event Begins
• 1:30 PM: Lunch
• 3:00-3:30 PM: Event Closes

*Important Instructions:*
• 1 person per ticket
• First Come First Served (FCFS) seating
• Hi-Tea and Lunch included
• Arrive 30 mins before event start for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav
Team Suprans
+91 8851492209
cs@suprans.in`;
  };

  const generateEmailSubject = (attendee: EventAttendee) => {
    return `Your Ticket for ${event.name} - ${eventDate}`;
  };

  const generateEmailBody = (attendee: EventAttendee) => {
    const ticketCount = attendee.ticketCount || 1;
    const slotInfo = attendee.slotTime || "To be assigned";
    const isIBS = event.type === "ibs";

    if (isIBS) {
      return `Hello ${attendee.name}!

Your ticket for ${event.name} is confirmed.

Number of Tickets: ${ticketCount}
Date: ${eventDate}

Your Batch: ${slotInfo}
Please arrive 15 minutes before your batch timing.

Venue: Radisson Blu Plaza
${venueAddress}
Phone: ${venuePhone}
Google Maps: ${mapsLink}


Important Instructions:
- 1 person per ticket
- Arrive 15 mins before your batch time for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav 
+91 8851492209
Team Suprans
cs@suprans.in`;
    }

    // Non-IBS events (workshops, etc.)
    const ticketId = attendee.ticketId || "PENDING";
    const ticketText = ticketCount > 1 ? `Number of Tickets: ${ticketCount} (${ticketCount} persons allowed)` : `Number of Tickets: 1`;
    return `Dear ${attendee.name},

Greetings from Suprans Business Consulting!

Your registration for ${event.name} is confirmed.

TICKET DETAILS
--------------
Ticket ID: ${ticketId}
${ticketText}
Name: ${attendee.name}
Event Date: ${eventDate}

VENUE DETAILS
-------------
${venue}
${venueAddress}
Phone: ${venuePhone}
Google Maps: ${mapsLink}

EVENT SCHEDULE
--------------
- 8:30 AM - 10:30 AM: Registration & Breakfast
- 10:30 AM: Event Begins
- 1:30 PM: Lunch
- 5:00 PM - 6:00 PM: Event Closes

IMPORTANT INSTRUCTIONS
----------------------
- 1 person per ticket (non-transferable)
- Seating is on First Come First Served (FCFS) basis
- Complimentary Hi-Tea and Lunch included
- Please carry a valid government-issued ID proof for each person
- We recommend arriving 30 minutes before the event starts for a smooth check-in experience
- Business formal attire recommended

Please save this email for reference and show it at the registration desk.

We look forward to welcoming you!

Warm Regards,
Team Suprans Business Consulting
www.suprans.com`;
  };

  const openWhatsApp = async (attendee: EventAttendee) => {
    const phone = attendee.phone.replace(/\D/g, '');
    const phoneWithCountry = phone.startsWith('91') ? phone : `91${phone}`;
    const message = encodeURIComponent(generateWhatsAppMessage(attendee));
    
    // If attendee has a QR code, download it for manual attachment to WhatsApp
    if (attendee.ticketQr) {
      try {
        // Download the QR code image
        const link = document.createElement('a');
        link.href = attendee.ticketQr;
        link.download = `${attendee.ticketId || 'ticket'}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "QR Ticket Downloaded",
          description: "Please attach the downloaded QR image in your WhatsApp chat",
          duration: 5000,
        });
      } catch (e) {
        console.error('Failed to download QR:', e);
      }
    } else {
      toast({
        title: "No QR Code",
        description: "Generate ticket first to include QR code",
        variant: "destructive",
      });
    }
    
    // Open WhatsApp with the message
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  const openEmail = (attendee: EventAttendee) => {
    if (!attendee.email) {
      toast({ title: "No email address", description: "This attendee doesn't have an email address", variant: "destructive" });
      return;
    }
    const subject = encodeURIComponent(generateEmailSubject(attendee));
    const body = encodeURIComponent(generateEmailBody(attendee));
    window.open(`mailto:${attendee.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const filteredAttendees = attendees.filter(
    (a) => {
      const query = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(query) ||
        (a.phone || "").includes(searchQuery) ||
        (a.email?.toLowerCase() || "").includes(query) ||
        (a.ticketId?.toLowerCase() || "").includes(query) ||
        (a.company?.toLowerCase() || "").includes(query)
      );
    }
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Attendees ({attendees.length})</CardTitle>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
              data-testid="input-search-attendees"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateAllTickets}
            disabled={isGenerating}
            data-testid="button-generate-tickets"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate All Tickets"}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isBulkEmailOpen} onOpenChange={setIsBulkEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-send-bulk-email">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send Email to Attendees</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Email Template Preview:</h4>
                  <p className="text-sm"><strong>Subject:</strong> Your Ticket for {event.name} - {eventDate}</p>
                  <div className="mt-3 p-3 bg-card border rounded text-sm">
                    <p className="text-primary font-semibold mb-2">Suprans Business Consulting</p>
                    <p>Dear [Attendee Name],</p>
                    <p className="mt-2">Your registration for <strong>{event.name}</strong> is confirmed.</p>
                    <div className="mt-3 bg-muted p-2 rounded">
                      <p><strong>Ticket ID:</strong> [TICKET-ID]</p>
                      <p><strong>Event Date:</strong> {eventDate}</p>
                    </div>
                    <div className="mt-3 bg-muted p-2 rounded">
                      <p><strong>Venue:</strong> {venue}</p>
                      <p>{venueAddress}</p>
                      <p>Phone: {venuePhone}</p>
                    </div>
                    <div className="mt-3 bg-muted p-2 rounded">
                      <p><strong>Schedule:</strong></p>
                      <p>8:30 AM - Registration & Breakfast</p>
                      <p>10:30 AM - Event Begins</p>
                      <p>1:30 PM - Lunch | 5:00 PM - Event Closes</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Send Test Email First:</h4>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter your email to preview" 
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      data-testid="input-test-email"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest || !testEmail}
                      data-testid="button-send-test-email"
                    >
                      {isSendingTest ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {attendees.filter(a => a.email).length} attendees have email addresses
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsBulkEmailOpen(false)} data-testid="button-cancel-bulk-email">Cancel</Button>
                    <Button 
                      onClick={handleSendBulkEmail} 
                      disabled={isSendingBulkEmail || attendees.filter(a => a.email).length === 0}
                      variant="destructive"
                      data-testid="button-confirm-bulk-email"
                    >
                      {isSendingBulkEmail ? "Sending..." : `Send to All ${attendees.filter(a => a.email).length}`}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isBulkSmsOpen} onOpenChange={setIsBulkSmsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-send-bulk-sms">
                <Phone className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send SMS to Attendees</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">SMS Template Preview:</h4>
                  <div className="mt-3 p-3 bg-card border rounded text-sm whitespace-pre-line">
{`Dear [Attendee Name],

Your registration for ${event.name} is confirmed.

Ticket ID: [TICKET-ID]
Date: ${eventDate}
Venue: ${venue}
Address: ${venueAddress}

Event Schedule:
- 8:30 AM - Registration & Breakfast
- 10:30 AM - Event Begins
- 1:30 PM - Lunch
- 5:00 PM - Event Closes

Team Suprans Business Consulting`}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Send Test SMS First:</h4>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter phone number to preview" 
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      data-testid="input-test-sms"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleSendTestSms}
                      disabled={isSendingTest || !testPhone}
                      data-testid="button-send-test-sms"
                    >
                      {isSendingTest ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {attendees.filter(a => a.phone).length} attendees have phone numbers
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsBulkSmsOpen(false)} data-testid="button-cancel-bulk-sms">Cancel</Button>
                    <Button 
                      onClick={handleSendBulkSms} 
                      disabled={isSendingBulkSms || attendees.filter(a => a.phone).length === 0}
                      variant="destructive"
                      data-testid="button-confirm-bulk-sms"
                    >
                      {isSendingBulkSms ? "Sending..." : `Send to All ${attendees.filter(a => a.phone).length}`}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isBulkWhatsAppOpen} onOpenChange={setIsBulkWhatsAppOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-send-bulk-whatsapp">
                <SiWhatsapp className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send WhatsApp to Attendees</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">WhatsApp Template Preview:</h4>
                  <div className="mt-3 p-3 bg-[#DCF8C6] border border-green-200 rounded text-sm whitespace-pre-line">
{`Hello [Attendee Name]!

Your ticket for *${event.name}* is confirmed.

*Ticket ID:* [TICKET-ID]
*Date:* ${eventDate}

*Venue:* ${venue}
${venueAddress}
Phone: ${venuePhone}

*Event Schedule:*
- 8:30 AM - 10:30 AM: Registration & Breakfast
- 10:30 AM: Event Begins
- 1:30 PM: Lunch
- 5:00 PM - 6:00 PM: Event Closes

Please show this message at the registration desk.

Team Suprans Business Consulting`}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Send Test WhatsApp First:</h4>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter phone number to preview" 
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      data-testid="input-test-whatsapp"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleSendTestWhatsApp}
                      disabled={isSendingTest || !testPhone}
                      data-testid="button-send-test-whatsapp"
                    >
                      {isSendingTest ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {attendees.filter(a => a.phone).length} attendees have phone numbers
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsBulkWhatsAppOpen(false)} data-testid="button-cancel-bulk-whatsapp">Cancel</Button>
                    <Button 
                      onClick={handleSendBulkWhatsApp} 
                      disabled={isSendingBulkWhatsApp || attendees.filter(a => a.phone).length === 0}
                      variant="destructive"
                      data-testid="button-confirm-bulk-whatsapp"
                    >
                      {isSendingBulkWhatsApp ? "Sending..." : `Send to All ${attendees.filter(a => a.phone).length}`}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-white" data-testid="button-add-attendee">
                <Plus className="h-4 w-4 mr-2" />
                Add Attendee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attendee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-attendee-name" />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} data-testid="input-attendee-phone" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Input value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  {eventType === "ibs" && (
                    <div>
                      <Label>Batch</Label>
                      <Select value={formData.slotTime} onValueChange={(v) => setFormData({ ...formData, slotTime: v })}>
                        <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M1 (9:00 AM - 11:00 AM)">M1 (9:00 AM - 11:00 AM)</SelectItem>
                          <SelectItem value="M2 (11:00 AM - 1:00 PM)">M2 (11:00 AM - 1:00 PM)</SelectItem>
                          <SelectItem value="E1 (2:30 PM - 4:30 PM)">E1 (2:30 PM - 4:30 PM)</SelectItem>
                          <SelectItem value="E2 (4:30 PM - 6:30 PM)">E2 (4:30 PM - 6:30 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Source</Label>
                    <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddAttendee} className="bg-primary text-white" data-testid="button-submit-attendee">Add Attendee</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-12 text-center">Qty</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              {eventType === "ibs" && <TableHead>Batch</TableHead>}
              <TableHead>Ticket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Checked In</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendees.map((attendee) => (
              <Fragment key={attendee.id}>
              <TableRow 
                data-testid={`row-attendee-${attendee.id}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedAttendee(expandedAttendee === attendee.id ? null : attendee.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandedAttendee === attendee.id && "rotate-180")} />
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      {attendee.designation && <p className="text-xs text-muted-foreground">{attendee.designation}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {(attendee.ticketCount || 1) > 1 ? (
                    <Badge className="bg-amber-100 text-amber-700 font-bold">{attendee.ticketCount || 1}</Badge>
                  ) : (
                    <span className="text-muted-foreground">1</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {attendee.phone}</p>
                    {attendee.email && <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {attendee.email}</p>}
                  </div>
                </TableCell>
                <TableCell>{attendee.company || "-"}</TableCell>
                {eventType === "ibs" && <TableCell>{attendee.slotTime || "-"}</TableCell>}
                <TableCell>
                  {attendee.ticketId ? (
                    <div className="flex items-center gap-2">
                      {attendee.ticketQr && (
                        <img 
                          src={attendee.ticketQr} 
                          alt="QR Code" 
                          className="w-10 h-10 border rounded"
                          data-testid={`img-qr-${attendee.id}`}
                        />
                      )}
                      <span className="text-xs font-mono text-muted-foreground">{attendee.ticketId}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No ticket</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    attendee.ticketStatus === "issued" || attendee.ticketStatus === "sent" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                  )}>
                    {attendee.ticketStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {attendee.checkedIn ? (
                    <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Yes</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-green-600 hover-elevate"
                      onClick={() => openWhatsApp(attendee)}
                      data-testid={`button-whatsapp-${attendee.id}`}
                    >
                      <SiWhatsapp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-600 hover-elevate"
                      onClick={() => openEmail(attendee)}
                      disabled={!attendee.email}
                      data-testid={`button-email-${attendee.id}`}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openWhatsApp(attendee)}>
                          <SiWhatsapp className="h-4 w-4 mr-2 text-green-600" />
                          Send WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEmail(attendee)} disabled={!attendee.email}>
                          <Mail className="h-4 w-4 mr-2 text-blue-600" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-primary">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              {/* Expanded Details Row */}
              {expandedAttendee === attendee.id && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={eventType === "ibs" ? 9 : 8} className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {attendee.plan && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Interest / Plan</p>
                          <p className="font-medium text-primary">{attendee.plan}</p>
                        </div>
                      )}
                      {attendee.budget && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Budget</p>
                          <p className="font-medium">{attendee.budget}</p>
                        </div>
                      )}
                      {attendee.clientStatus && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Client Type</p>
                          <Badge variant="outline">{attendee.clientStatus}</Badge>
                        </div>
                      )}
                      {attendee.city && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">City</p>
                          <p>{attendee.city}</p>
                        </div>
                      )}
                      {attendee.calledBy && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Called By</p>
                          <p>{attendee.calledBy}</p>
                        </div>
                      )}
                      {attendee.callStatus && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Call Status</p>
                          <Badge variant={attendee.callStatus === "Call done" ? "default" : "secondary"}>{attendee.callStatus}</Badge>
                        </div>
                      )}
                      {attendee.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground font-medium">Notes</p>
                          <p className="text-muted-foreground">{attendee.notes}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
        {filteredAttendees.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No attendees found</div>
        )}
      </CardContent>
    </Card>
  );
}

function LogisticsTab({ eventId, hotels, flights }: { eventId: string; hotels: EventHotel[]; flights: EventFlight[] }) {
  const { toast } = useToast();
  const [isHotelOpen, setIsHotelOpen] = useState(false);
  const [isFlightOpen, setIsFlightOpen] = useState(false);
  const [hotelForm, setHotelForm] = useState({ hotelName: "", guestName: "", guestPhone: "", guestType: "team", checkIn: "", checkOut: "", roomType: "single", confirmationNumber: "" });
  const [flightForm, setFlightForm] = useState({ passengerName: "", passengerType: "team", flightNumber: "", airline: "", departureCity: "", arrivalCity: "", departureTime: "", arrivalTime: "", pnr: "" });

  const handleAddHotel = async () => {
    try {
      await apiRequest("POST", `/api/events/${eventId}/hotels`, {
        ...hotelForm,
        checkIn: new Date(hotelForm.checkIn),
        checkOut: new Date(hotelForm.checkOut),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "hotels"] });
      setIsHotelOpen(false);
      toast({ title: "Hotel booking added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddFlight = async () => {
    try {
      await apiRequest("POST", `/api/events/${eventId}/flights`, {
        ...flightForm,
        departureTime: new Date(flightForm.departureTime),
        arrivalTime: new Date(flightForm.arrivalTime),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "flights"] });
      setIsFlightOpen(false);
      toast({ title: "Flight added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Hotel className="h-5 w-5" /> Hotels ({hotels.length})</CardTitle>
          <Dialog open={isHotelOpen} onOpenChange={setIsHotelOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-white" data-testid="button-add-hotel">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Hotel Booking</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Hotel Name</Label><Input value={hotelForm.hotelName} onChange={(e) => setHotelForm({ ...hotelForm, hotelName: e.target.value })} /></div>
                  <div><Label>Guest Name</Label><Input value={hotelForm.guestName} onChange={(e) => setHotelForm({ ...hotelForm, guestName: e.target.value })} /></div>
                  <div><Label>Guest Type</Label>
                    <Select value={hotelForm.guestType} onValueChange={(v) => setHotelForm({ ...hotelForm, guestType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="speaker">Speaker</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Check-in</Label><Input type="datetime-local" value={hotelForm.checkIn} onChange={(e) => setHotelForm({ ...hotelForm, checkIn: e.target.value })} /></div>
                  <div><Label>Check-out</Label><Input type="datetime-local" value={hotelForm.checkOut} onChange={(e) => setHotelForm({ ...hotelForm, checkOut: e.target.value })} /></div>
                  <div><Label>Room Type</Label>
                    <Select value={hotelForm.roomType} onValueChange={(v) => setHotelForm({ ...hotelForm, roomType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Confirmation #</Label><Input value={hotelForm.confirmationNumber} onChange={(e) => setHotelForm({ ...hotelForm, confirmationNumber: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsHotelOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddHotel} className="bg-primary text-white">Add Booking</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="p-3 border rounded-lg" data-testid={`card-hotel-${hotel.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{hotel.hotelName}</p>
                      {hotel.bookingUrl && (
                        <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{hotel.guestName} • {hotel.roomType} ({hotel.roomCount || 1} room{(hotel.roomCount || 1) > 1 ? 's' : ''})</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(hotel.checkIn), "MMM d")} - {format(new Date(hotel.checkOut), "MMM d")}
                    </p>
                    {hotel.distanceFromVenue && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPinIcon className="h-3 w-3" /> {hotel.distanceFromVenue}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={hotel.status === 'pending' ? 'secondary' : hotel.status === 'confirmed' ? 'default' : 'outline'}>
                      {hotel.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{hotel.guestType}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {hotels.length === 0 && <p className="text-center text-muted-foreground py-4">No hotel bookings yet</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Plane className="h-5 w-5" /> Flights ({flights.length})</CardTitle>
          <Dialog open={isFlightOpen} onOpenChange={setIsFlightOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-white" data-testid="button-add-flight">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Flight</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Passenger Name</Label><Input value={flightForm.passengerName} onChange={(e) => setFlightForm({ ...flightForm, passengerName: e.target.value })} /></div>
                  <div><Label>Type</Label>
                    <Select value={flightForm.passengerType} onValueChange={(v) => setFlightForm({ ...flightForm, passengerType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="speaker">Speaker</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Airline</Label><Input value={flightForm.airline} onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })} /></div>
                  <div><Label>Flight Number</Label><Input value={flightForm.flightNumber} onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })} /></div>
                  <div><Label>From</Label><Input value={flightForm.departureCity} onChange={(e) => setFlightForm({ ...flightForm, departureCity: e.target.value })} /></div>
                  <div><Label>To</Label><Input value={flightForm.arrivalCity} onChange={(e) => setFlightForm({ ...flightForm, arrivalCity: e.target.value })} /></div>
                  <div><Label>Departure</Label><Input type="datetime-local" value={flightForm.departureTime} onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })} /></div>
                  <div><Label>Arrival</Label><Input type="datetime-local" value={flightForm.arrivalTime} onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })} /></div>
                  <div className="col-span-2"><Label>PNR</Label><Input value={flightForm.pnr} onChange={(e) => setFlightForm({ ...flightForm, pnr: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsFlightOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddFlight} className="bg-primary text-white">Add Flight</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flights.map((flight) => (
              <div key={flight.id} className="p-3 border rounded-lg" data-testid={`card-flight-${flight.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{flight.departureCity} → {flight.arrivalCity}</p>
                      {flight.bookingUrl && (
                        <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{flight.passengerName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {flight.airline || 'TBD'} {flight.flightNumber !== 'TBD' ? flight.flightNumber : ''} • {format(new Date(flight.departureTime), "MMM d, h:mm a")}
                    </p>
                    {flight.pnr && <p className="text-xs text-muted-foreground">PNR: {flight.pnr}</p>}
                    {flight.notes && <p className="text-xs text-muted-foreground mt-1">{flight.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={flight.status === 'pending' ? 'secondary' : flight.status === 'booked' || flight.status === 'confirmed' ? 'default' : 'outline'}>
                      {flight.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{flight.passengerType}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {flights.length === 0 && <p className="text-center text-muted-foreground py-4">No flights yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgesTab({ eventId, attendees }: { eventId: string; attendees: EventAttendee[] }) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleMarkPrinted = async () => {
    try {
      for (const id of selectedIds) {
        await apiRequest("PATCH", `/api/events/${eventId}/attendees/${id}`, { badgePrinted: true });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees"] });
      setSelectedIds([]);
      toast({ title: `${selectedIds.length} badges marked as printed` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleIssueTickets = async () => {
    try {
      for (const id of selectedIds) {
        await apiRequest("PATCH", `/api/events/${eventId}/attendees/${id}`, { ticketStatus: "issued" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees"] });
      setSelectedIds([]);
      toast({ title: `${selectedIds.length} tickets issued` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === attendees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attendees.map((a) => a.id));
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">Badges & Tickets</CardTitle>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleIssueTickets} disabled={selectedIds.length === 0}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Issue Tickets ({selectedIds.length})
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkPrinted} disabled={selectedIds.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Mark Printed ({selectedIds.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={selectedIds.length === attendees.length && attendees.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Ticket Status</TableHead>
              <TableHead>Badge Printed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendees.map((attendee) => (
              <TableRow key={attendee.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(attendee.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds([...selectedIds, attendee.id]);
                      } else {
                        setSelectedIds(selectedIds.filter((id) => id !== attendee.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{attendee.name}</TableCell>
                <TableCell>{attendee.company || "-"}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    attendee.ticketStatus === "issued" ? "bg-green-100 text-green-700" :
                    attendee.ticketStatus === "sent" ? "bg-blue-100 text-blue-700" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {attendee.ticketStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {attendee.badgePrinted ? (
                    <Badge className="bg-green-100 text-green-700"><Printer className="h-3 w-3 mr-1" /> Printed</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreativesTab({ eventId, creatives }: { eventId: string; creatives: EventCreative[] }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "banner", dimensions: "", quantity: 1, vendor: "", status: "pending" });

  const handleAdd = async () => {
    try {
      await apiRequest("POST", `/api/events/${eventId}/creatives`, form);
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "creatives"] });
      setIsOpen(false);
      toast({ title: "Creative added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    designing: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    printing: "bg-purple-100 text-purple-700",
    ready: "bg-green-100 text-green-700",
    delivered: "bg-green-200 text-green-800",
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">Creatives & Assets</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-white" data-testid="button-add-creative">
              <Plus className="h-4 w-4 mr-2" /> Add Creative
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Creative</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Main Stage Backdrop" /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="standee">Standee</SelectItem>
                      <SelectItem value="backdrop">Backdrop</SelectItem>
                      <SelectItem value="brochure">Brochure</SelectItem>
                      <SelectItem value="invite">Invite</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Dimensions</Label><Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g., 10x6 ft" /></div>
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                <div><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary text-white">Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {creatives.map((creative) => (
            <Card key={creative.id} className="hover-elevate" data-testid={`card-creative-${creative.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{creative.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{creative.type}</p>
                    {creative.dimensions && <p className="text-xs text-muted-foreground">{creative.dimensions}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {creative.quantity}</p>
                  </div>
                  <Badge className={statusColors[creative.status] || statusColors.pending}>{creative.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {creatives.length === 0 && <p className="text-center text-muted-foreground py-8">No creatives added yet</p>}
      </CardContent>
    </Card>
  );
}

function PackingTab({ eventId, items }: { eventId: string; items: EventPackingItem[] }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ itemName: "", category: "banners", quantity: 1, assignedTo: "", status: "pending" });

  const handleAdd = async () => {
    try {
      await apiRequest("POST", `/api/events/${eventId}/packing`, form);
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "packing"] });
      setIsOpen(false);
      toast({ title: "Packing item added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiRequest("PATCH", `/api/events/${eventId}/packing/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "packing"] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const categories = ["banners", "tech", "stationery", "badges", "gifts", "documents", "other"];
  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    packed: "bg-yellow-100 text-yellow-700",
    shipped: "bg-blue-100 text-blue-700",
    received: "bg-green-100 text-green-700",
    setup: "bg-green-200 text-green-800",
  };

  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<string, EventPackingItem[]>);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">Packing Checklist</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-white" data-testid="button-add-packing">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Packing Item</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Item Name</Label><Input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} /></div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label>Assigned To</Label><Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary text-white">Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((cat) => {
            const catItems = groupedItems[cat];
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="font-medium text-foreground capitalize mb-2">{cat}</h3>
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`item-packing-${item.id}`}>
                      <div className="flex items-center gap-3">
                        <Checkbox checked={item.status === "setup"} onCheckedChange={(checked) => handleStatusChange(item.id, checked ? "setup" : "pending")} />
                        <div>
                          <p className={cn("font-medium", item.status === "setup" && "line-through text-muted-foreground")}>{item.itemName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.assignedTo && `• ${item.assignedTo}`}</p>
                        </div>
                      </div>
                      <Select value={item.status} onValueChange={(v) => handleStatusChange(item.id, v)}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="setup">Setup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {items.length === 0 && <p className="text-center text-muted-foreground py-8">No packing items yet</p>}
      </CardContent>
    </Card>
  );
}

function CommunicationsTab({ eventId, communications }: { eventId: string; communications: EventCommunication[] }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    type: "email" as "email" | "sms" | "whatsapp",
    subject: "",
    content: "",
    targetAudience: "all",
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", `/api/events/${eventId}/communications`, data);
    },
    onSuccess: () => {
      toast({ title: "Communication sent" });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "communications"] });
      setIsOpen(false);
      setForm({ type: "email", subject: "", content: "", targetAudience: "all" });
    },
  });

  const handleSend = () => {
    if (!form.content) {
      toast({ title: "Please enter message content", variant: "destructive" });
      return;
    }
    addMutation.mutate(form);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <Phone className="h-4 w-4" />;
      case "whatsapp": return <MessageSquare className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg">Communications</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-white" data-testid="button-add-communication">
              <Plus className="h-4 w-4 mr-2" /> New Communication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Send Communication</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: "email" | "sms" | "whatsapp") => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === "email" && (
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} data-testid="input-communication-subject" />
                </div>
              )}
              <div>
                <Label>Target Audience</Label>
                <Select value={form.targetAudience} onValueChange={(v) => setForm({ ...form, targetAudience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Attendees</SelectItem>
                    <SelectItem value="registered">Registered Only</SelectItem>
                    <SelectItem value="checked_in">Checked In Only</SelectItem>
                    <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  className="h-32 resize-none"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter your message..."
                  data-testid="input-communication-content"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSend} className="bg-primary text-white" disabled={addMutation.isPending}>
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {communications.map((comm) => (
            <div key={comm.id} className="flex items-start justify-between p-4 border rounded-lg" data-testid={`item-communication-${comm.id}`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  {getTypeIcon(comm.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{comm.type}</span>
                    <Badge variant="outline" className="text-xs">{comm.targetAudience}</Badge>
                    <Badge variant={comm.status === "sent" ? "default" : "secondary"} className="text-xs">{comm.status}</Badge>
                  </div>
                  {comm.subject && <p className="text-sm text-muted-foreground mt-1">{comm.subject}</p>}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comm.content}</p>
                  {comm.createdAt && <p className="text-xs text-muted-foreground mt-2">{format(new Date(comm.createdAt), "MMM d, yyyy h:mm a")}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {communications.length === 0 && <p className="text-center text-muted-foreground py-8">No communications sent yet</p>}
      </CardContent>
    </Card>
  );
}

function PresentationsTab({ eventId, presentations }: { eventId: string; presentations: EventPresentation[] }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    presenter: "",
    duration: 30,
    type: "keynote" as "keynote" | "panel" | "workshop" | "demo",
    fileUrl: "",
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", `/api/events/${eventId}/presentations`, data);
    },
    onSuccess: () => {
      toast({ title: "Presentation added" });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "presentations"] });
      setIsOpen(false);
      setForm({ title: "", presenter: "", duration: 30, type: "keynote", fileUrl: "" });
    },
  });

  const handleAdd = () => {
    if (!form.title || !form.presenter) {
      toast({ title: "Please fill title and presenter", variant: "destructive" });
      return;
    }
    addMutation.mutate(form);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "keynote": return "bg-purple-100 text-purple-700";
      case "panel": return "bg-blue-100 text-blue-700";
      case "workshop": return "bg-green-100 text-green-700";
      case "demo": return "bg-orange-100 text-orange-700";
      default: return "bg-muted text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg">Presentations</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-white" data-testid="button-add-presentation">
              <Plus className="h-4 w-4 mr-2" /> Add Presentation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Presentation</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-presentation-title" />
                </div>
                <div>
                  <Label>Presenter</Label>
                  <Input value={form.presenter} onChange={(e) => setForm({ ...form, presenter: e.target.value })} data-testid="input-presentation-presenter" />
                </div>
                <div>
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} data-testid="input-presentation-duration" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: "keynote" | "panel" | "workshop" | "demo") => setForm({ ...form, type: v })}>
                    <SelectTrigger data-testid="select-presentation-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keynote">Keynote</SelectItem>
                      <SelectItem value="panel">Panel Discussion</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File URL (optional)</Label>
                  <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." data-testid="input-presentation-fileurl" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary text-white">Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {presentations.map((pres, index) => (
            <div key={pres.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`item-presentation-${pres.id}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pres.title}</span>
                    <Badge className={cn("text-xs", getTypeColor(pres.type))}>{pres.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{pres.presenter}</span>
                    <span>•</span>
                    <span>{pres.duration} mins</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pres.fileUrl && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={pres.fileUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Badge variant={pres.status === "completed" ? "default" : "secondary"}>{pres.status}</Badge>
              </div>
            </div>
          ))}
        </div>
        {presentations.length === 0 && <p className="text-center text-muted-foreground py-8">No presentations added yet</p>}
      </CardContent>
    </Card>
  );
}

function TeamContactsTab({ eventId, contacts }: { eventId: string; contacts: EventTeamContact[] }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "coordinator" as "coordinator" | "exhibitor" | "vendor" | "venue_staff" | "security" | "catering" | "av_tech" | "other",
    company: "",
    phone: "",
    whatsapp: "",
    email: "",
    department: "",
    notes: "",
    isEmergencyContact: false,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", `/api/events/${eventId}/team-contacts`, data);
    },
    onSuccess: () => {
      toast({ title: "Contact added" });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "team-contacts"] });
      setIsOpen(false);
      setForm({ name: "", role: "coordinator", company: "", phone: "", whatsapp: "", email: "", department: "", notes: "", isEmergencyContact: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/events/${eventId}/team-contacts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Contact removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "team-contacts"] });
    },
  });

  const handleAdd = () => {
    if (!form.name || !form.phone) {
      toast({ title: "Please enter name and phone", variant: "destructive" });
      return;
    }
    addMutation.mutate(form);
  };

  const roles = ["coordinator", "exhibitor", "vendor", "venue_staff", "security", "catering", "av_tech", "other"];
  const roleLabels: Record<string, string> = {
    coordinator: "Coordinator",
    exhibitor: "Exhibitor",
    vendor: "Vendor",
    venue_staff: "Venue Staff",
    security: "Security",
    catering: "Catering",
    av_tech: "AV/Tech",
    other: "Other",
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "coordinator": return <Users className="h-4 w-4" />;
      case "exhibitor": return <Package className="h-4 w-4" />;
      case "vendor": return <Truck className="h-4 w-4" />;
      case "venue_staff": return <Building className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "catering": return <UtensilsCrossed className="h-4 w-4" />;
      case "av_tech": return <Headphones className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const groupedContacts = roles.reduce((acc, role) => {
    acc[role] = contacts.filter((c) => c.role === role);
    return acc;
  }, {} as Record<string, EventTeamContact[]>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg">Event Day Team & Contacts</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Team members, exhibitors, vendors, and venue staff</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-white" data-testid="button-add-team-contact">
              <Plus className="h-4 w-4 mr-2" /> Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Team Contact</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-team-name" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v: typeof form.role) => setForm({ ...form, role: v })}>
                    <SelectTrigger data-testid="select-team-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} data-testid="input-team-company" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="input-team-phone" />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} data-testid="input-team-whatsapp" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-team-email" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} data-testid="input-team-department" />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-team-notes" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Checkbox checked={form.isEmergencyContact} onCheckedChange={(checked) => setForm({ ...form, isEmergencyContact: !!checked })} data-testid="checkbox-emergency-contact" />
                  <Label>Emergency Contact</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} className="bg-primary text-white" disabled={addMutation.isPending}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {roles.map((role) => {
            const roleContacts = groupedContacts[role];
            if (roleContacts.length === 0) return null;
            return (
              <div key={role}>
                <div className="flex items-center gap-2 mb-3">
                  {getRoleIcon(role)}
                  <h3 className="font-medium text-foreground">{roleLabels[role]}</h3>
                  <Badge variant="secondary" className="text-xs">{roleContacts.length}</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {roleContacts.map((contact) => (
                    <div key={contact.id} className={cn("p-4 border rounded-lg", contact.isEmergencyContact && "border-red-300 bg-red-50")} data-testid={`item-team-contact-${contact.id}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contact.name}</span>
                            {contact.isEmergencyContact && <Badge variant="destructive" className="text-xs">Emergency</Badge>}
                          </div>
                          {contact.company && <p className="text-sm text-muted-foreground">{contact.company}</p>}
                          {contact.department && <p className="text-xs text-muted-foreground">{contact.department}</p>}
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(contact.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 space-y-1">
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <Phone className="h-3 w-3" /> {contact.phone}
                        </a>
                        {contact.whatsapp && (
                          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700">
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                            <Mail className="h-3 w-3" /> {contact.email}
                          </a>
                        )}
                      </div>
                      {contact.notes && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{contact.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">No team contacts added yet</p>}
      </CardContent>
    </Card>
  );
}

function VendorsTab({ eventId, vendors }: { eventId: string; vendors: EventVendor[] }) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vendorName: "",
    companyName: "",
    category: "other",
    contactPhone: "",
    email: "",
    location: "",
    rating: "",
    totalAmount: 0,
    paymentStatus: "pending",
    notes: "",
  });

  const categories = [
    { value: "printables", label: "Printables", icon: FileText },
    { value: "av_equipment", label: "AV Equipment", icon: Video },
    { value: "catering", label: "Catering", icon: UtensilsCrossed },
    { value: "decoration", label: "Decoration", icon: Palette },
    { value: "photography", label: "Photography", icon: Palette },
    { value: "other", label: "Other", icon: Store },
  ];

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return apiRequest("POST", `/api/events/${eventId}/vendors`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "vendors"] });
      setIsAddOpen(false);
      setFormData({ vendorName: "", companyName: "", category: "other", contactPhone: "", email: "", location: "", rating: "", totalAmount: 0, paymentStatus: "pending", notes: "" });
      toast({ title: "Vendor added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add vendor", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest("DELETE", `/api/events/${eventId}/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "vendors"] });
      toast({ title: "Vendor removed" });
    },
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || Store;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || "Other";
  };

  const totalVendorCost = vendors.reduce((sum, v) => sum + (v.totalAmount || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Event Vendors
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Total: ₹{totalVendorCost.toLocaleString()}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-vendor">
              <Plus className="h-4 w-4 mr-1" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor Name *</Label>
                  <Input value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} placeholder="e.g., Vishal" data-testid="input-vendor-name" />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g., Softech Group" data-testid="input-company-name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Amount (₹)</Label>
                  <Input type="number" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })} placeholder="18250" data-testid="input-total-amount" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="9654996359" data-testid="input-phone" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="vendor@email.com" data-testid="input-email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Shop No. 9, Delhi" data-testid="input-location" />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="4.2" data-testid="input-rating" />
                </div>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(v) => setFormData({ ...formData, paymentStatus: v })}>
                  <SelectTrigger data-testid="select-payment-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Included items, special terms..." rows={3} data-testid="input-notes" />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(formData)} disabled={!formData.vendorName || createMutation.isPending} data-testid="button-submit-vendor">
                {createMutation.isPending ? "Adding..." : "Add Vendor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((vendor) => {
            const CategoryIcon = getCategoryIcon(vendor.category);
            return (
              <Card key={vendor.id} className="border" data-testid={`card-vendor-${vendor.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{vendor.vendorName}</h4>
                        {vendor.companyName && <p className="text-sm text-muted-foreground">{vendor.companyName}</p>}
                        <Badge variant="outline" className="mt-1 text-xs">{getCategoryLabel(vendor.category)}</Badge>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(vendor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">₹{(vendor.totalAmount || 0).toLocaleString()}</div>
                    <Badge className={cn(
                      vendor.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                      vendor.paymentStatus === "partial" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-gray-700"
                    )}>
                      {vendor.paymentStatus === "paid" ? "Paid" : vendor.paymentStatus === "partial" ? "Partial" : "Pending"}
                    </Badge>
                  </div>

                  {vendor.rating && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      {vendor.rating}
                    </div>
                  )}

                  <div className="mt-3 space-y-1">
                    {vendor.contactPhone && (
                      <a href={`tel:${vendor.contactPhone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                        <Phone className="h-3 w-3" /> {vendor.contactPhone}
                      </a>
                    )}
                    {vendor.email && (
                      <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                        <Mail className="h-3 w-3" /> {vendor.email}
                      </a>
                    )}
                    {vendor.location && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {vendor.location}
                      </p>
                    )}
                  </div>

                  {vendor.notes && <p className="mt-3 text-xs text-muted-foreground bg-muted p-2 rounded">{vendor.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {vendors.length === 0 && <p className="text-center text-muted-foreground py-8">No vendors added yet</p>}
      </CardContent>
    </Card>
  );
}
