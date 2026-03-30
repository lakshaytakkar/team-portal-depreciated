import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  UserCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Building2,
  QrCode,
  Camera,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, EventAttendee } from "@shared/schema";
import { Html5Qrcode } from "html5-qrcode";

export default function CheckinPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/events/:id/checkin");
  const eventId = params?.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [recentCheckins, setRecentCheckins] = useState<EventAttendee[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<{ success: boolean; message: string; attendee?: EventAttendee } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  const { data: event } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  const { data: attendees = [], refetch } = useQuery<EventAttendee[]>({
    queryKey: ["/api/events", eventId, "attendees"],
    enabled: !!eventId,
    refetchInterval: 5000,
  });

  // QR code scanning handler
  const handleQrScan = useCallback(async (decodedText: string) => {
    if (!eventId) {
      toast({ title: "Error", description: "Event ID is missing", variant: "destructive" });
      return;
    }

    try {
      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch {
        throw new Error("Invalid QR code format");
      }
      const { ticketId, eventId: qrEventId } = qrData;

      if (!ticketId) {
        throw new Error("Invalid QR code - missing ticket ID");
      }

      // Call the check-in API
      const response = await apiRequest("POST", `/api/events/${eventId}/checkin-by-qr`, {
        ticketId,
        eventId: qrEventId
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.alreadyCheckedIn) {
          setLastScannedResult({
            success: true,
            message: `${result.attendee.name} is already checked in`,
            attendee: result.attendee
          });
          toast({ 
            title: "Already Checked In", 
            description: `${result.attendee.name} was checked in earlier`,
          });
        } else {
          setLastScannedResult({
            success: true,
            message: `${result.attendee.name} checked in successfully!`,
            attendee: result.attendee
          });
          setRecentCheckins(prev => [result.attendee, ...prev.slice(0, 9)]);
          queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees"] });
          toast({ 
            title: "Check-in Successful!", 
            description: `${result.attendee.name} is now checked in`,
          });
        }
      } else {
        throw new Error(result.message || "Check-in failed");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Invalid QR code";
      
      setLastScannedResult({
        success: false,
        message: errorMessage
      });
      toast({ 
        title: "Scan Failed", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [eventId, toast]);

  // Start QR scanner
  const startScanner = useCallback(async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleQrScan,
        () => {} // Ignore errors on each frame
      );
      
      setScannerActive(true);
    } catch (error: any) {
      console.error("Scanner error:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [handleQrScan, toast]);

  // Stop QR scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setScannerActive(false);
    setLastScannedResult(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (!scannerActive) {
      searchInputRef.current?.focus();
    }
  }, [scannerActive]);

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const pendingCount = attendees.filter((a) => !a.checkedIn).length;

  const filteredAttendees = attendees.filter(
    (a) =>
      !a.checkedIn &&
      (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.includes(searchQuery) ||
        (a.company?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  );

  const handleCheckIn = async (attendee: EventAttendee) => {
    try {
      const result = await apiRequest("POST", `/api/events/${eventId}/attendees/${attendee.id}/checkin`, {});
      setRecentCheckins((prev) => [{ ...attendee, checkedIn: true, checkedInAt: new Date() } as EventAttendee, ...prev.slice(0, 9)]);
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees"] });
      setSearchQuery("");
      searchInputRef.current?.focus();
      toast({ title: `${attendee.name} checked in!`, description: attendee.company || "" });
    } catch (error: any) {
      toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon" data-testid="button-back-to-event">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Check-in: {event.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "EEE, MMM d, yyyy")} • {event.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{checkedInCount}</p>
                <p className="text-xs text-muted-foreground">Checked In</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-400">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{attendees.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {scannerActive ? (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={stopScanner}
                  data-testid="button-stop-scanner"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={startScanner}
                  className="bg-primary text-white"
                  data-testid="button-start-scanner"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Search & Check-in Panel or QR Scanner */}
          <div className="col-span-2 space-y-4">
            {scannerActive ? (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    QR Code Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div 
                      id={scannerContainerId} 
                      className="w-full max-w-md aspect-square rounded-lg overflow-hidden bg-gray-900"
                      data-testid="qr-scanner-container"
                    />
                    
                    {lastScannedResult && (
                      <div 
                        className={cn(
                          "mt-4 p-4 rounded-lg w-full max-w-md text-center",
                          lastScannedResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                        )}
                        data-testid={lastScannedResult.success ? "scan-result-success" : "scan-result-error"}
                      >
                        {lastScannedResult.success ? (
                          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        ) : (
                          <XCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                        )}
                        <p className={cn(
                          "font-semibold",
                          lastScannedResult.success ? "text-green-800" : "text-red-800"
                        )}>
                          {lastScannedResult.message}
                        </p>
                        {lastScannedResult.attendee && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {lastScannedResult.attendee.company || lastScannedResult.attendee.phone}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground mt-4">
                      Point your camera at an attendee's QR code ticket
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Search & Check-in</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search by name, phone, or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 text-lg"
                      data-testid="input-checkin-search"
                    />
                  </div>

                {searchQuery && filteredAttendees.length > 0 && (
                  <div className="space-y-2">
                    {filteredAttendees.slice(0, 10).map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer transition-colors"
                        onClick={() => handleCheckIn(attendee)}
                        data-testid={`card-checkin-attendee-${attendee.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                            {attendee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{attendee.name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {attendee.company && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {attendee.company}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {attendee.phone}
                              </span>
                              {attendee.slotTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {attendee.slotTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button className="bg-green-600 text-white h-12 px-6">
                          <UserCheck className="h-5 w-5 mr-2" />
                          Check In
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && filteredAttendees.length === 0 && (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No matching attendee found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try searching by name, phone, or company</p>
                  </div>
                )}

                {!searchQuery && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-xl text-muted-foreground">Start typing to search attendees</p>
                    <p className="text-sm text-muted-foreground mt-2">Search by name, phone number, or company</p>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>

          {/* Recent Check-ins */}
          <div>
            <Card className="sticky top-28">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckins.length > 0 ? (
                  <div className="space-y-3">
                    {recentCheckins.map((attendee, index) => (
                      <div
                        key={`${attendee.id}-${index}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg",
                          index === 0 ? "bg-green-50 border border-green-200" : "bg-muted"
                        )}
                      >
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{attendee.company || attendee.phone}</p>
                        </div>
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-700">Just now</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-muted-foreground">No check-ins yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slot Queue for IBS */}
            {event.type === "ibs" && (
              <Card className="mt-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Current Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendees
                      .filter((a) => a.checkedIn && a.slotTime)
                      .slice(0, 4)
                      .map((attendee, index) => (
                        <div
                          key={attendee.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg",
                            index === 0 ? "bg-blue-50 border border-blue-200" : "bg-muted"
                          )}
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{attendee.name}</p>
                            <p className="text-xs text-muted-foreground">{attendee.slotTime}</p>
                          </div>
                          {index === 0 && (
                            <Badge className="bg-blue-100 text-blue-700">Now</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Groups of 3-4 • {event.slotDuration} min slots
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
