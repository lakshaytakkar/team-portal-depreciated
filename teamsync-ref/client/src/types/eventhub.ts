export interface NetworkingEvent {
  id: string;
  name: string;
  type: "Seminar" | "Workshop" | "Conference" | "Investor Meet" | "Launch Event" | "Roundtable";
  date: string;
  endDate: string;
  venue: string;
  venueId: string;
  city: string;
  status: "upcoming" | "live" | "completed" | "cancelled";
  totalAttendees: number;
  checkedIn: number;
  budget: number;
  actualSpend: number;
  organizer: string;
  description: string;
  tags: string[];
}

export interface EventAttendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  eventId: string;
  ticketType: "VIP" | "Standard" | "Speaker" | "Sponsor";
  checkedIn: boolean;
  checkedInAt?: string;
  registeredDate: string;
  source: "Direct" | "Referral" | "LinkedIn" | "Email Campaign";
  notes: string;
}

export interface EventVendor {
  id: string;
  name: string;
  category: "AV & Tech" | "Catering" | "Photography" | "Decoration" | "Security" | "Transport" | "Marketing";
  specialty: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  ratePerDay: number;
  rating: number;
  eventsAssigned: string[];
  notes: string;
}

export interface EventVenue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  type: "Convention Centre" | "Hotel Ballroom" | "Boutique Hotel" | "Co-working Space" | "Outdoor";
  pricePerDay: number;
  rating: number;
  amenities: string[];
  status: "available" | "booked" | "maintenance";
  contactName: string;
  contactPhone: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: "Venue" | "Catering" | "AV & Tech" | "Marketing" | "Transport" | "Decoration" | "Miscellaneous";
  description: string;
  plannedAmount: number;
  actualAmount: number;
  status: "on-track" | "over-budget" | "under-budget" | "pending";
}

export interface EventInquiry {
  id: string;
  clientName: string;
  eventType: "Corporate" | "Wedding" | "Social" | "Conference" | "Exhibition";
  expectedGuests: number;
  tentativeDate: string;
  budgetRange: string;
  source: "Website" | "Referral" | "Instagram" | "LinkedIn" | "Direct";
  status: "New" | "Contacted" | "Proposal Sent" | "Qualified" | "Lost" | "Converted";
  createdAt: string;
  lastFollowUp?: string;
}
