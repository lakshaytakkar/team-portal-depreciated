import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PublicLayout from "@/components/public/PublicLayout";
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import delhiSeminarImage from "@/assets/images/events/delhi-seminar-real.jpg";
import mumbaiCantonImage from "@/assets/images/events/mumbai-event-real.jpg";
import bangaloreWorkshopImage from "@/assets/images/events/bangalore-workshop-real.jpg";
import hyderabadSummitImage from "@/assets/images/events/hyderabad-summit-real.jpg";
import puneMeetupImage from "@/assets/images/events/pune-meetup-real.jpg";
import chennaiIbsImage from "@/assets/images/events/chennai-ibs-real.jpg";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const eventImageMap: Record<string, string> = {
  'Delhi': delhiSeminarImage,
  'Mumbai': mumbaiCantonImage,
  'Chennai': chennaiIbsImage,
  'Bangalore': bangaloreWorkshopImage,
  'Hyderabad': hyderabadSummitImage,
  'Pune': puneMeetupImage,
};

const defaultEventImage = delhiSeminarImage;

function getEventImage(city: string): string {
  return eventImageMap[city] || defaultEventImage;
}

function formatEventDate(date: Date | string, endDate?: Date | string | null): string {
  const startDate = new Date(date);
  const timeStr = format(startDate, "h:mm a");
  if (endDate) {
    const end = new Date(endDate);
    if (startDate.toDateString() === end.toDateString()) {
      return `${format(startDate, "EEEE, MMMM d, yyyy")} | ${timeStr}`;
    }
    return `${format(startDate, "MMMM d")} - ${format(end, "d, yyyy")} | ${timeStr}`;
  }
  return `${format(startDate, "EEEE, MMMM d, yyyy")} | ${timeStr}`;
}

const eventHighlights = [
  "Expert speakers from the industry",
  "Networking opportunities with entrepreneurs",
  "Exclusive insights on China sourcing",
  "Q&A sessions with business mentors",
  "Certificate of participation",
  "Complimentary refreshments",
];

export default function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast({
        title: "Payment Error",
        description: "Payment system could not be loaded. Please refresh and try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ["/api/public/events", id],
    queryFn: async () => {
      const res = await fetch(`/api/public/events/${id}`);
      if (!res.ok) throw new Error("Event not found");
      return res.json();
    },
    enabled: !!id,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { amount: number; eventId: string; customerName: string; customerEmail: string; customerPhone: string }) => {
      const response = await apiRequest("POST", "/api/payments/create-event-order", data);
      return response.json();
    },
    onSuccess: (data) => {
      openRazorpayCheckout(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openRazorpayCheckout = (orderData: any) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "Suprans Business",
      description: `Event Registration - ${event?.name}`,
      order_id: orderData.orderId,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#F34147",
      },
      handler: function (response: any) {
        verifyPayment(response);
      },
      modal: {
        ondismiss: function () {
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment. You can try again anytime.",
          });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await apiRequest("POST", "/api/payments/verify-event-payment", {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        eventId: event?.id,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      if (verifyResponse.ok) {
        setBookingDialogOpen(false);
        const isPrivateEvent = event?.type === 'ibs' && (event?.capacity ?? 0) >= 1000;
        toast({
          title: "Registration Successful!",
          description: isPrivateEvent 
            ? "Your booking is confirmed! Meeting slot and ticket details will be shared shortly via email/WhatsApp."
            : "Your event registration has been confirmed. Check your email for details.",
          duration: 8000,
        });
        setFormData({ fullName: "", email: "", phone: "" });
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error) {
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support with your payment details.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event?.ticketPrice) return;
    
    if (!razorpayLoaded || !window.Razorpay) {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate({
      amount: event.ticketPrice,
      eventId: event.id,
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
    });
  };

  const isSoldOut = event?.status === 'sold_out';
  const hasTicketPrice = event?.ticketPrice && event.ticketPrice > 0;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F34147]" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !event) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
          <Link href="/events">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="relative h-[400px] md:h-[500px]">
        <img
          src={getEventImage(event.city)}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link href="/events" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
            <div className="flex gap-2 mb-3">
              <Badge className="bg-[#F34147] text-white border-0">
                {event.type === 'ibs' ? 'IBS Workshop' : 'Business Seminar'}
              </Badge>
              {isSoldOut && (
                <Badge className="bg-gray-800 text-white border-0">
                  Sold Out
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatEventDate(event.date, event.endDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{event.venue === 'TBD' ? 'Venue TBA' : (event.venue || event.city)}, {event.city}</span>
              </div>
              {event.capacity < 1000 && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{event.capacity} seats</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 pb-28 md:pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Join us for an exclusive business event designed to help entrepreneurs and business owners discover new opportunities in international trade. Whether you're looking to start importing from China, expand your existing business, or network with like-minded professionals, this event is for you.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Led by industry experts with over 15 years of experience in China sourcing and international trade, you'll gain actionable insights and strategies to grow your business.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventHighlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#F34147] flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Venue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#F34147] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{event.venue || "Venue TBA"}</p>
                      <p className="text-muted-foreground">{event.venueAddress || event.city}</p>
                    </div>
                  </div>
                  {event.hiTeaTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#F34147] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Hi-Tea</p>
                        <p className="text-muted-foreground">{event.hiTeaTime}</p>
                      </div>
                    </div>
                  )}
                  {event.lunchTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#F34147] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Lunch</p>
                        <p className="text-muted-foreground">{event.lunchTime}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Register Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    {isSoldOut ? (
                      <>
                        <p className="text-3xl font-bold text-gray-500">Sold Out</p>
                        <p className="text-muted-foreground text-sm">No seats available</p>
                      </>
                    ) : hasTicketPrice ? (
                      <>
                        <p className="text-3xl font-bold text-[#F34147]">
                          ₹{event.ticketPrice?.toLocaleString('en-IN')}
                        </p>
                        <p className="text-muted-foreground text-sm">(+5%GST + 5% TCS)</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-[#F34147]">Free Entry</p>
                        <p className="text-muted-foreground text-sm">Limited seats available</p>
                      </>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{format(new Date(event.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City</span>
                      <span className="font-medium">{event.city}</span>
                    </div>
                    {event.capacity < 1000 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{event.capacity} seats</span>
                      </div>
                    )}
                    {event.type === 'ibs' && event.capacity >= 1000 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">Private 1-on-1</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <Button 
                    className="w-full"
                    variant={isSoldOut ? 'secondary' : 'default'}
                    size="lg" 
                    disabled={isSoldOut}
                    onClick={() => setBookingDialogOpen(true)}
                    data-testid="button-register-event"
                  >
                    {isSoldOut ? 'Sold Out' : hasTicketPrice ? `Register - ₹${event.ticketPrice?.toLocaleString('en-IN')}` : 'Register for Free'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By registering, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Have Questions?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="tel:+917988514291" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-[#F34147]" />
                    <span>+91 79885 14291</span>
                  </a>
                  <a href="mailto:events@suprans.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 text-[#F34147]" />
                    <span>events@suprans.com</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Fixed Bottom Register Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden z-50 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-lg">
              {isSoldOut ? 'Sold Out' : hasTicketPrice ? `₹${event.ticketPrice?.toLocaleString('en-IN')}` : 'Free Entry'}
            </p>
            <p className="text-xs text-muted-foreground">{format(new Date(event.date), "MMM d, yyyy")} | {format(new Date(event.date), "h:mm a")}</p>
          </div>
          <Button 
            variant={isSoldOut ? 'secondary' : 'default'}
            size="lg" 
            disabled={isSoldOut}
            onClick={() => setBookingDialogOpen(true)}
            data-testid="button-register-event-mobile"
          >
            {isSoldOut ? 'Sold Out' : 'Register Now'}
          </Button>
        </div>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.name}</DialogTitle>
            <DialogDescription>
              {hasTicketPrice 
                ? `Complete your registration by paying ₹${event.ticketPrice?.toLocaleString('en-IN')}`
                : "Fill in your details to register for this event"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {hasTicketPrice && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Registration Fee:</span>
                  <span className="font-medium">₹{event.ticketPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#F34147]">₹{event.ticketPrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                required
                data-testid="input-event-fullname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                data-testid="input-event-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                required
                data-testid="input-event-phone"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={createOrderMutation.isPending}
              data-testid="button-submit-event-registration"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : hasTicketPrice ? (
                `Proceed to Payment - ₹${event.ticketPrice?.toLocaleString('en-IN')}`
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
