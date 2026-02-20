import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Users, Clock, Star, ChevronRight, ChevronDown, Plane, Hotel, Utensils, ShieldCheck, Check, ArrowRight, Phone, MessageCircle, Briefcase, Globe, Award, Sparkles, Search, Ticket, Map, Quote, Flame, CreditCard } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import type { TravelPackage } from "@shared/schema";

import foshanTour from "../../assets/images/travel/foshan-tour-real.jpg";
import wuxiEvTour from "../../assets/images/travel/wuxi-ev-tour-real.jpg";
import yiwuShanghaiTour from "../../assets/images/travel/yiwu-shanghai-real.jpg";
import cantonPhase1 from "../../assets/images/travel/canton-phase-real.jpg";
import cantonPhase2 from "../../assets/images/travel/canton-phase-real.jpg";
import cantonPhase3 from "../../assets/images/travel/canton-phase-real.jpg";
import hongKongCanton from "../../assets/images/travel/hong-kong-real.jpg";
import founderImage from "@/assets/images/founder-portrait-opt.jpg";
import cantonFairImage from "@/assets/images/canton-fair-real.jpg";

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

const destinations = [
  { name: "Guangzhou, China", image: cantonPhase1 },
  { name: "Hong Kong", image: hongKongCanton },
  { name: "Shanghai, China", image: yiwuShanghaiTour },
  { name: "Yiwu, China", image: foshanTour },
];

const testimonials = [
  {
    name: "Rajesh Agarwal",
    role: "Textile Importer",
    content: "Suprans team was one of the best options we went for. The Canton Fair experience was incredible and helped us find 15+ verified suppliers.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RA&backgroundColor=f34147",
  },
  {
    name: "Priya Mehta",
    role: "Electronics Trader",
    content: "We used a recommended tool in the trip and it definitely worked perfectly. The team handled everything from visa to factory visits seamlessly.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PM&backgroundColor=1e88e5",
  },
  {
    name: "Amit Shah",
    role: "Home Decor Business",
    content: "It's been used as an awesome tool for everyone. I'm in my 3rd year using them. Their language support and vendor network is unmatched!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=43a047",
  },
  {
    name: "Vikram Singh",
    role: "Furniture Importer",
    content: "Per team that we recommend are extremely valuable and experienced. The wholesale market tours were eye-opening for our business.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VS&backgroundColor=fb8c00",
  },
  {
    name: "Neha Gupta",
    role: "Fashion Retailer",
    content: "Suprans is so convenient that our team and highly reliable option! The entire trip was well organized and professional.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NG&backgroundColor=8e24aa",
  },
  {
    name: "Sanjay Patel",
    role: "Auto Parts Dealer",
    content: "Congratulations for creating this awesome experience! Factory visits gave us direct access to manufacturers at best prices.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SP&backgroundColor=00acc1",
  },
];

const faqs = [
  {
    q: "What is included in the tour package?",
    a: "Our packages include return flights, 4-5 star hotel accommodation, all meals (Indian vegetarian options available), Canton Fair buyer badge, airport transfers, local transportation, bilingual guide, and complete visa documentation support."
  },
  {
    q: "Do I need prior experience in importing?",
    a: "No! Our tours are designed for both beginners and experienced traders. We provide hands-on guidance at every step - from product selection to supplier negotiation and quality inspection."
  },
  {
    q: "How do I get a visa for China?",
    a: "We provide complete visa assistance including documentation preparation, application submission guidance, and follow-up. Our team has helped 500+ travelers get their China business visa successfully."
  },
  {
    q: "Can I customize my factory visits?",
    a: "Absolutely! While we have pre-planned visits to top manufacturers, we can arrange custom factory visits based on your product requirements. Just share your needs 2 weeks before departure."
  },
  {
    q: "What is the group size?",
    a: "We keep our groups small (15-25 people) to ensure personalized attention. Each group includes experienced importers and first-time visitors, creating great networking opportunities."
  },
];

function PackageCard({ pkg }: { pkg: TravelPackage }) {
  const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price;
  const seatsLeft = pkg.seatsLeft ?? 10;
  const isLowSeats = seatsLeft <= 5;
  const bookingAmount = pkg.bookingAmount || 30000;
  
  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row" data-testid={`card-package-${pkg.id}`}>
      <div className="relative md:w-72 h-40 md:h-auto flex-shrink-0">
        <img
          src={getImage(pkg.image)}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="bg-[#F34147] text-white border-0 px-3 py-1">
              {Math.round(((pkg.originalPrice! - pkg.price) / pkg.originalPrice!) * 100)}% OFF
            </Badge>
          )}
          {isLowSeats && seatsLeft > 0 && (
            <Badge className="bg-orange-500 text-white border-0 px-3 py-1 animate-pulse" data-testid={`badge-seats-${pkg.id}`}>
              <Flame className="w-3 h-3 mr-1" />
              Only {seatsLeft} seats left
            </Badge>
          )}
        </div>
        {seatsLeft === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 text-[#F34147]" />
          <span>{pkg.destination}</span>
        </div>
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
          {pkg.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
          {pkg.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-[#F34147]" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[#F34147]" />
            <span>{pkg.groupSize}</span>
          </div>
          <div className="flex items-center gap-1">
            <Hotel className="w-4 h-4 text-[#F34147]" />
            <span>{pkg.accommodation}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount && (
                <span className="text-gray-400 line-through text-sm mr-2">
                  {formatPrice(pkg.originalPrice!)}
                </span>
              )}
              <span className="text-2xl font-bold text-[#F34147]">
                {formatPrice(pkg.price)}
              </span>
              <span className="text-xs text-gray-500 ml-1">(+5%GST + 5% TCS)</span>
            </div>
            <Link href={`/travel/${pkg.slug}`}>
              <Button className="bg-[#F34147] hover:bg-[#D93036] text-white" data-testid={`button-book-${pkg.id}`} disabled={seatsLeft === 0}>
                {seatsLeft === 0 ? "Sold Out" : "Book Now"}
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-green-600" />
              <span>Book with {formatPrice(bookingAmount)} only</span>
            </div>
            {seatsLeft > 0 && !isLowSeats && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{seatsLeft} seats available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TravelPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const { data: packages = [], isLoading } = useQuery<TravelPackage[]>({
    queryKey: ["/api/public/travel-packages"],
  });

  const cantonFairPackages = packages.filter(p => p.category === "canton_fair");
  const businessPackages = packages.filter(p => p.category === "business");
  const allPackages = [...cantonFairPackages, ...businessPackages];

  return (
    <PublicLayout>
      <div className="bg-[#FCFCFC] min-h-screen">
        {/* Hero Section with Image Background */}
        <section className="relative h-[400px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={getImage("/assets/images/travel/hong-kong-canton.png")}
              alt="Canton Fair"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              Enjoy in the best way!
            </h1>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8">
              Explore Business in China with Mr. Suprans
            </p>
            
            {/* Search Box */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 w-full max-w-4xl">
              <div className="bg-white rounded-xl p-3 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 flex-1 min-w-[150px]">
                  <Users className="w-5 h-5 text-[#F34147]" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Group Size</div>
                    <div className="text-xs text-gray-500">15-25 people</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 flex-1 min-w-[150px]">
                  <Calendar className="w-5 h-5 text-[#F34147]" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Date</div>
                    <div className="text-xs text-gray-500">April 2026</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 flex-1 min-w-[150px]">
                  <MapPin className="w-5 h-5 text-[#F34147]" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Destination</div>
                    <div className="text-xs text-gray-500">Canton Fair, China</div>
                  </div>
                </div>
                <Link href="#packages">
                  <Button className="bg-[#F34147] hover:bg-[#D93036] text-white px-6 py-6" data-testid="button-search">
                    <Search className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Must Experience Packages */}
        <section id="packages" className="py-10 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Must experience<br />
                  <span className="text-[#F34147]">packages</span>
                </h2>
              </div>
              <div className="mt-4 md:mt-0 flex items-start gap-3">
                <Plane className="w-6 h-6 text-[#F34147] flex-shrink-0 mt-1" />
                <p className="text-gray-600 text-sm max-w-sm">
                  Experience our thoughtfully designed packages that take you to the most captivating and life-changing travel destinations.
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl animate-pulse bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {allPackages.slice(0, 4).map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
            
            <div className="text-center mt-10">
              <Link href="#all-packages">
                <Button variant="outline" className="border-[#F34147] text-[#F34147] hover:bg-[#F34147]/5" data-testid="button-see-all">
                  See All Packages
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Our Service Section */}
        <section className="py-10 md:py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Our <span className="text-[#F34147]">Service</span>
              </h2>
              <div className="flex justify-center gap-2 mt-2">
                <Plane className="w-5 h-5 text-[#F34147]" />
                <Plane className="w-5 h-5 text-[#F34147] rotate-45" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Ticket, title: "Ticket Booking", desc: "Get the best deals on flights from major Indian cities with seamless booking experience." },
                { icon: Hotel, title: "Hotel Booking", desc: "We help you find the best quality hotels with premium amenities for a comfortable stay." },
                { icon: Map, title: "Tour Plan", desc: "Get the best itineraries tailored to your needs with factory visits and fair tours." },
              ].map((item, index) => (
                <div key={item.title} className="text-center p-6 md:p-8 rounded-xl md:rounded-2xl hover:shadow-lg transition-shadow group">
                  <div
                    className="w-14 h-14 md:w-20 md:h-20 bg-[#F34147]/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 transition-transform duration-500 group-hover:scale-110"
                    style={{ animationDelay: `${index * 300}ms` }}
                  >
                    <item.icon className="w-7 h-7 md:w-10 md:h-10 text-[#F34147]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Vacation Destinations */}
        <section className="py-10 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Top Business <span className="text-[#F34147]">Destinations</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map((dest, i) => (
                <div key={i} className="relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer h-48 md:h-64">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg">{dest.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Any Corner Section */}
        <section className="py-10 md:py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-[#F34147]/10 text-[#F34147] border-0 mb-4">OUR MISSION</Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                  Travel Any Corner of<br />
                  The World With Us
                </h2>
                <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                  We craft travel experiences that take you to best sourcing destinations. From Canton Fair to Yiwu markets, our expert guides help you build successful business connections.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#F34147]" />
                    <span className="text-gray-700">Factory Visits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#F34147]" />
                    <span className="text-gray-700">Canton Fair Entry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#F34147]" />
                    <span className="text-gray-700">Visa Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#F34147]" />
                    <span className="text-gray-700">Bilingual Guide</span>
                  </div>
                </div>
                
                <Link href="#packages">
                  <Button className="bg-[#F34147] hover:bg-[#D93036] text-white px-8" data-testid="button-explore">
                    Explore Tours
                  </Button>
                </Link>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden relative">
                      <img src={cantonPhase2} alt="Tour" className="w-full h-48 object-cover" />
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-[#F34147]">
                        300+ Tours
                      </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden">
                      <img src={cantonPhase3} alt="Tour" className="w-full h-32 object-cover" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-2xl overflow-hidden relative">
                      <img src={wuxiEvTour} alt="Tour" className="w-full h-32 object-cover" />
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-[#F34147]">
                        150+ Countries
                      </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden relative">
                      <img src={foshanTour} alt="Tour" className="w-full h-48 object-cover" />
                      <div className="absolute bottom-3 left-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-[#F34147]">
                        5000+ Clients
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Happy Client Stories */}
        <section className="py-10 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Happy <span className="text-[#F34147]">Client Stories</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Packages Grid */}
        <section id="all-packages" className="py-10 md:py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Don't Miss The <span className="text-[#F34147]">Best Deals</span>
              </h2>
            </div>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 rounded-2xl animate-pulse bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {allPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group" data-testid={`card-grid-${pkg.id}`}>
                    <div className="relative h-36 md:h-48">
                      <img
                        src={getImage(pkg.image)}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                          {pkg.duration}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{pkg.title}</h3>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{pkg.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#F34147]">{formatPrice(pkg.price)}</span>
                        <Link href={`/travel/${pkg.slug}`}>
                          <Button size="sm" variant="outline" className="border-[#F34147] text-[#F34147] hover:bg-[#F34147] hover:text-white">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Frequently Asked <span className="text-[#F34147]">Questions</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  data-testid={`faq-${i}`}
                >
                  <button
                    className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between min-h-[48px]"
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    data-testid={`button-faq-${i}`}
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#F34147] transition-transform flex-shrink-0 ${
                        expandedFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-6 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-10 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden">
              <img 
                src={cantonFairImage} 
                alt="Canton Fair" 
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-[#F34147]/85" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  Don't Miss The Best Deals!
                </h2>
                <p className="text-white/90 mb-8 max-w-lg">
                  Register today for our upcoming Canton Fair tour and get exclusive early bird discounts.
                </p>
                <a href="https://wa.me/919350818272" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-[#F34147] hover:bg-gray-100 font-bold px-8" data-testid="button-register-cta">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Register Today
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
