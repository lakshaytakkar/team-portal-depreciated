import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin, Calendar, Users, Clock, Star, ChevronRight, ChevronLeft,
  Hotel, Utensils, Car, Check, X, Phone, Mail, User,
  Plane, Shield, Coffee, Briefcase, CreditCard, Loader2, Flame, CheckCircle, PhoneCall, PartyPopper
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PublicLayout from "@/components/public/PublicLayout";
import type { TravelPackage } from "@shared/schema";

declare global {
  interface Window {
    Razorpay: any;
  }
}

import foshanTour from "../../assets/images/travel/foshan-tour-real.jpg";
import wuxiEvTour from "../../assets/images/travel/wuxi-ev-tour-real.jpg";
import yiwuShanghaiTour from "../../assets/images/travel/yiwu-shanghai-real.jpg";
import cantonPhase1 from "../../assets/images/travel/canton-phase-real.jpg";
import cantonPhase2 from "../../assets/images/travel/canton-phase-real.jpg";
import cantonPhase3 from "../../assets/images/travel/canton-phase-real.jpg";
import hongKongCanton from "../../assets/images/travel/hong-kong-real.jpg";

const imageMap: Record<string, string> = {
  "/assets/images/travel/foshan-tour.png": foshanTour,
  "/assets/images/travel/wuxi-ev-tour.png": wuxiEvTour,
  "/assets/images/travel/yiwu-shanghai-tour.png": yiwuShanghaiTour,
  "/assets/images/travel/canton-phase1.png": cantonPhase1,
  "/assets/images/travel/canton-phase2.png": cantonPhase2,
  "/assets/images/travel/canton-phase3.png": cantonPhase3,
  "/assets/images/travel/hong-kong-canton.png": hongKongCanton,
};

function getImage(path: string): string {
  return imageMap[path] || path;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string | Date | null): string {
  if (!date) return "Year Round";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TravelDetailPage() {
  const [, params] = useRoute("/travel/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    travelers: "1",
    notes: "",
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  const { data: pkg, isLoading, error } = useQuery<TravelPackage>({
    queryKey: ["/api/public/travel-packages", slug],
    enabled: !!slug,
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/create-order", {
        packageId: pkg?.id,
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerPhone: bookingData.phone,
        numberOfTravelers: parseInt(bookingData.travelers),
        notes: bookingData.notes,
      });
      return response.json();
    },
    onSuccess: (data) => {
      openRazorpayCheckout(data);
    },
    onError: (error: any) => {
      setIsProcessingPayment(false);
      toast({
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      bookingId: string;
    }) => {
      const response = await apiRequest("POST", "/api/payments/verify", paymentData);
      return response.json();
    },
    onSuccess: () => {
      setIsProcessingPayment(false);
      setBookingDialogOpen(false);
      setSuccessDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ["/api/public/travel-packages", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/travel-packages"] });
    },
    onError: () => {
      setIsProcessingPayment(false);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if the amount was deducted.",
        variant: "destructive",
      });
    },
  });

  const openRazorpayCheckout = (orderData: {
    orderId: string;
    bookingId: string;
    amount: number;
    keyId: string;
    packageTitle: string;
  }) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "Suprans Business Consulting",
      description: orderData.packageTitle,
      order_id: orderData.orderId,
      handler: function (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) {
        verifyPaymentMutation.mutate({
          ...response,
          bookingId: orderData.bookingId,
        });
      },
      prefill: {
        name: bookingData.name,
        email: bookingData.email,
        contact: bookingData.phone,
      },
      theme: {
        color: "#F34147",
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleBookNow = () => {
    if (!bookingData.name || !bookingData.email || !bookingData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (!razorpayLoaded || !window.Razorpay) {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessingPayment(true);
    createOrderMutation.mutate();
  };

  const enquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/public/callback", {
        ...data,
        service: `Travel Package: ${pkg?.title}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Enquiry Submitted",
        description: "Our team will contact you shortly to discuss your trip!",
      });
      setFormData({ name: "", phone: "", email: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast({
        title: "Required Fields",
        description: "Please fill in your name and phone number.",
        variant: "destructive",
      });
      return;
    }
    enquiryMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Package Not Found</h1>
        <p className="text-muted-foreground">The travel package you're looking for doesn't exist.</p>
        <Link href="/travel">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Packages
          </Button>
        </Link>
      </div>
    );
  }

  const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price;
  const itinerary = (pkg.itinerary || []) as Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation: string;
  }>;
  const inclusions = (pkg.inclusions || []) as string[];
  const exclusions = (pkg.exclusions || []) as string[];
  const highlights = (pkg.highlights || []) as string[];

  return (
    <PublicLayout>
    <div className="min-h-screen bg-background">
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getImage(pkg.image)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white border-0">Sale</Badge>
            )}
            {pkg.isFeatured && (
              <Badge className="bg-primary text-white border-0">Featured</Badge>
            )}
            {pkg.category === "canton_fair" && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Canton Fair</Badge>
            )}
          </div>
          
          <div className="text-white/80 mb-2">
            Starting From <span className="text-2xl font-bold text-white">{formatPrice(pkg.price)}</span> (+5%GST + 5% TCS)
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {pkg.title}
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-primary/80 text-white px-4 py-2 rounded-full text-sm mb-6">
            <Clock className="h-4 w-4" />
            <span>{pkg.days} Days | {pkg.nights} Nights | {pkg.destination}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/80 text-sm">
            {pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft > 0 && pkg.seatsLeft <= 5 && (
              <div className="flex items-center gap-2 bg-orange-500/90 text-white px-3 py-1.5 rounded-full animate-pulse">
                <Flame className="h-4 w-4" />
                <span className="font-semibold">Only {pkg.seatsLeft} seats left</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-400" />
              <span>Book with just {formatPrice(pkg.bookingAmount || 30000)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span>(4.5/5) based on 138 reviews</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/travel" className="text-primary hover:underline inline-flex items-center text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Packages
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About This Tour Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{pkg.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                    <Hotel className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground">Accommodation</span>
                    <span className="font-medium text-sm">{pkg.accommodation}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                    <Utensils className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground">Meals</span>
                    <span className="font-medium text-sm">{pkg.meals}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                    <Car className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground">Transportation</span>
                    <span className="font-medium text-sm">{pkg.transportation}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xs text-muted-foreground">Group Size</span>
                    <span className="font-medium text-sm">Max {pkg.groupSize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Highlights of the Tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {itinerary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Tour Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
                    {itinerary.map((day) => (
                      <AccordionItem key={day.day} value={`day-${day.day}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {day.day}
                            </div>
                            <div>
                              <div className="font-semibold">Day {day.day} – {day.title}</div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-14">
                          <div className="space-y-4">
                            <p className="text-muted-foreground">{day.description}</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="flex items-start gap-2">
                                <Briefcase className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                <div>
                                  <span className="text-sm font-medium">Activities:</span>
                                  <p className="text-sm text-muted-foreground">{day.activities.join(", ")}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Coffee className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                <div>
                                  <span className="text-sm font-medium">Meals:</span>
                                  <p className="text-sm text-muted-foreground">{day.meals.join(", ")}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Hotel className="h-4 w-4 text-primary" />
                              <span className="font-medium">Accommodation:</span>
                              <span className="text-muted-foreground">{day.accommodation}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Package Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5" /> Included
                    </h4>
                    <ul className="space-y-2">
                      {inclusions.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                      <X className="h-5 w-5" /> Not Included
                    </h4>
                    <ul className="space-y-2">
                      {exclusions.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Single Room:</span>
                  <span>Additional charge of ₹6,500 per day applies.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Hotels:</span>
                  <span>4★ Hotels will be allocated as per final itinerary (confirmed 15 days before departure).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Breakfast:</span>
                  <span>7:00 AM – 8:30 AM daily.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Age Range:</span>
                  <span>{pkg.ageRange} years</span>
                </div>
                {pkg.startDate && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">Tour Dates:</span>
                    <span>{formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-2 border-primary/20">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {hasDiscount && (
                    <Badge className="bg-red-500 text-white border-0">
                      {Math.round((1 - pkg.price / pkg.originalPrice!) * 100)}% Off
                    </Badge>
                  )}
                  {pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft > 0 && pkg.seatsLeft <= 5 && (
                    <Badge className="bg-orange-500 text-white border-0 animate-pulse">
                      <Flame className="w-3 h-3 mr-1" />
                      Only {pkg.seatsLeft} seats left
                    </Badge>
                  )}
                  {pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft > 5 && (
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {pkg.seatsLeft} seats available
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Package Price</span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {hasDiscount && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(pkg.originalPrice!)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">(+5%GST + 5% TCS)</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Reserve your spot with just {formatPrice(pkg.bookingAmount || 30000)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Our executive will call you for remaining payment & formalities</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Money Back Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Your Safety is Our Top Priority</span>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Submit an Enquiry</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Full Name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="input-name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+91 XXXXX XXXXX"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your travel requirements..."
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      data-testid="input-message"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={enquiryMutation.isPending}
                    data-testid="button-submit-enquiry"
                  >
                    {enquiryMutation.isPending ? "Submitting..." : "Submit Enquiry"}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
                
                <div className="pt-4 border-t space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setBookingDialogOpen(true)}
                    disabled={pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft <= 0}
                    data-testid="button-book-now"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft <= 0
                      ? "Sold Out"
                      : `Reserve Now - ${formatPrice(pkg.bookingAmount || 30000)}`}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment powered by Razorpay
                  </p>
                </div>
                
                <div className="pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-2">Need help? Contact us directly</p>
                  <div className="flex justify-center gap-4">
                    <a href="tel:+917988514291" className="flex items-center gap-1 text-primary text-sm hover:underline">
                      <Phone className="h-4 w-4" /> +91 7988514291
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reserve Your Spot</DialogTitle>
            <DialogDescription>
              Secure your booking for {pkg?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Package Price:</span>
                <span className="font-semibold">{formatPrice(pkg?.price || 0)} (+5%GST + 5% TCS)</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                <span className="font-semibold text-green-700">Booking Amount (Pay Now):</span>
                <span className="text-xl font-bold text-green-700">
                  {formatPrice(pkg?.bookingAmount || 30000)}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Remaining amount to be discussed with our executive after booking
              </p>
            </div>
            {pkg?.seatsLeft !== null && pkg?.seatsLeft !== undefined && pkg.seatsLeft > 0 && pkg.seatsLeft <= 5 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                <Flame className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Hurry! Only {pkg.seatsLeft} seats remaining for this trip</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="booking-name">Full Name *</Label>
              <Input
                id="booking-name"
                placeholder="Enter your full name"
                value={bookingData.name}
                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                data-testid="input-booking-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking-email">Email *</Label>
              <Input
                id="booking-email"
                type="email"
                placeholder="your@email.com"
                value={bookingData.email}
                onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                data-testid="input-booking-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking-phone">Phone Number *</Label>
              <Input
                id="booking-phone"
                placeholder="+91 XXXXX XXXXX"
                value={bookingData.phone}
                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                data-testid="input-booking-phone"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-travelers">Travelers</Label>
                <Select
                  value={bookingData.travelers}
                  onValueChange={(value) => setBookingData({ ...bookingData, travelers: value })}
                >
                  <SelectTrigger data-testid="select-travelers">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Traveler" : "Travelers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-notes">Special Requests</Label>
                <Textarea
                  id="booking-notes"
                  placeholder="Any requirements..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={1}
                  data-testid="input-booking-notes"
                />
              </div>
            </div>
            
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={handleBookNow}
              disabled={isProcessingPayment || !razorpayLoaded}
              data-testid="button-proceed-payment"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay {formatPrice(pkg?.bookingAmount || 30000)} to Reserve
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Secure payment via Razorpay. Our team will contact you within 24 hours to complete formalities.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Confirmation Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSuccessDialogOpen(false);
          setBookingData({ name: "", email: "", phone: "", travelers: "1", notes: "" });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6 space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
              <p className="text-gray-500">Your spot has been reserved successfully</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F34147]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4 text-[#F34147]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Our executive will call you shortly</p>
                  <p className="text-xs text-gray-500">Within the next 24 hours to discuss your travel details, visa requirements, and remaining payment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Confirmation sent to your email</p>
                  <p className="text-xs text-gray-500">Check your inbox for booking details and payment receipt</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">100% Secure Booking</p>
                  <p className="text-xs text-gray-500">Your payment is protected with full refund guarantee if trip is cancelled by us</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F34147]/5 border border-[#F34147]/20 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">What happens next?</span> Our travel coordinator will reach out to finalize your itinerary, arrange visa documentation, and coordinate the remaining payment at your convenience.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setSuccessDialogOpen(false);
                  setBookingData({ name: "", email: "", phone: "", travelers: "1", notes: "" });
                }}
                className="w-full"
                data-testid="button-close-success"
              >
                Got it, Thanks!
              </Button>
              <a href="https://wa.me/919350818272" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full border-green-500 text-green-700" data-testid="button-whatsapp-success">
                  <Phone className="w-4 h-4 mr-2" />
                  Chat with us on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PublicLayout>
  );
}
