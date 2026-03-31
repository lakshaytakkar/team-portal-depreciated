export type PackageStatus = "active" | "sold_out" | "upcoming" | "closed";
export type LeadStatus = "new" | "contacted" | "interested" | "booked" | "cold" | "lost";
export type LeadSource = "website" | "whatsapp" | "referral" | "social" | "walk_in" | "phone";
export type BookingStatus = "confirmed" | "pending" | "cancelled";
export type PaymentStatus = "partial" | "full" | "pending" | "refunded";
export type VendorCategory = "ground_partner" | "hotel" | "guide" | "visa_agent" | "transport" | "flights" | "insurance";
export interface TourPackage {
  id: string;
  slug: string;
  name: string;
  destination: string;
  duration_days: number;
  duration_nights: number;
  price_inr: number;
  original_price_inr: number | null;
  discount_percent: number | null;
  price_note: string;
  advance_amount: number;
  max_pax: number;
  hotel_stars: 3 | 4 | 5;
  hotel_name: string;
  status: PackageStatus;
  seats_available: number;
  start_date: string | null;
  end_date: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; description: string }[];
  category: "Canton Fair" | "Custom Tour" | "Sourcing Tour";
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  business_type: string;
  interested_package_id: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  assigned_to: string;
  created_at: string;
  follow_up_date: string;
  budget_range: string;
}

export interface Payment {
  date: string;
  amount: number;
  mode: string;
  reference: string;
  note: string;
}

export interface Booking {
  id: string;
  lead_id: string;
  package_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_city: string;
  passengers: number;
  package_name: string;
  total_amount: number;
  advance_paid: number;
  balance_due: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  booking_date: string;
  travel_date: string;
  notes: string;
  visa_status: "pending" | "applied" | "approved" | "rejected";
  flight_status: "not_booked" | "booked";
  special_requests: string;
  payments: Payment[];
}

export interface ChinaHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  stars: 3 | 4 | 5;
  address: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  rate_usd_per_night: number;
  our_rate_usd: number;
  amenities: string[];
  packages_used_in: string[];
  notes: string;
  status: "active" | "inactive";
}

export interface TourVendor {
  id: string;
  name: string;
  category: VendorCategory;
  country: string;
  city: string;
  contact_person: string;
  phone: string;
  email: string;
  whatsapp: string;
  rating: number;
  notes: string;
  services: string[];
  status: "active" | "inactive";
}
