import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Offices table
export const offices = pgTable("offices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfficeSchema = createInsertSchema(offices).omit({
  id: true,
  createdAt: true,
});

export type InsertOffice = z.infer<typeof insertOfficeSchema>;
export type Office = typeof offices.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('sales_executive'),
  phone: text("phone"),
  avatar: text("avatar"),
  officeId: varchar("office_id").references(() => offices.id),
  salary: integer("salary"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull(),
  value: integer("value").notNull().default(0),
  stage: text("stage").notNull().default('new'), // 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  assignedTo: varchar("assigned_to").references(() => users.id),
  teamId: text("team_id"),
  source: text("source").notNull(),
  address: text("address"),
  avatar: text("avatar"),
  rating: integer("rating").default(0), // 1-5
  tags: jsonb("tags").$type<string[]>().default([]),
  temperature: text("temperature"), // 'hot' | 'warm' | 'cold'
  nextFollowUp: timestamp("next_follow_up"),
  wonAmount: integer("won_amount"),
  wonDate: timestamp("won_date"),
  lostReason: text("lost_reason"),
  lastConnected: jsonb("last_connected").$type<{
    date: string;
    outcome: string;
    duration: string;
    agent: string;
    nextFollowUp?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Activities table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'call' | 'email' | 'meeting' | 'stage_change' | 'note'
  notes: text("notes").notNull(),
  duration: integer("duration"), // minutes
  outcome: text("outcome"),
  fromStage: text("from_stage"),
  toStage: text("to_stage"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default('todo'), // 'todo' | 'in_progress' | 'review' | 'done'
  priority: text("priority").notNull().default('medium'), // 'low' | 'medium' | 'high'
  dueDate: timestamp("due_date").notNull(),
  assignedTo: varchar("assigned_to").notNull().references(() => users.id),
  teamId: text("team_id"),
  leadId: varchar("lead_id").references(() => leads.id, { onDelete: 'set null' }),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Services table
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug"),
  category: text("category").notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  thumbnail: text("thumbnail"),
  ctaText: text("cta_text").default('Learn More'),
  ctaLink: text("cta_link"),
  pricing: integer("pricing"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'script' | 'email' | 'message' | 'objection'
  subject: text("subject"), // for email templates
  content: text("content").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Employees table (for public-facing sales team)
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'sales_manager' | 'sales_executive' | 'support'
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // HR & Personal Details
  fatherName: text("father_name"),
  relation: text("relation"), // Son, Daughter
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  employeeType: text("employee_type"), // FTE, Internship, Intern, Maid
  salary: text("salary"),
  hasPF: boolean("has_pf").default(false),
  hasESIC: boolean("has_esic").default(false),
  panCard: text("pan_card"),
  // Bank Details
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  // Employment Status
  employmentStatus: text("employment_status").default("active"), // active, inactive, resigned
  joiningDate: text("joining_date"),
  lastWorkingDay: text("last_working_day"),
  // Link to candidate if hired from recruitment
  candidateId: varchar("candidate_id"),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Note: Callback requests are stored as leads with source='callback_request'
// The leads table handles all incoming inquiries with the source field differentiating origin

// Travel Packages table
export const travelPackages = pgTable("travel_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  destination: text("destination").notNull(),
  duration: text("duration").notNull(), // e.g., "5 Days/4 Nights"
  days: integer("days").notNull().default(5),
  nights: integer("nights").notNull().default(4),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  image: text("image").notNull(),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  category: text("category").notNull().default('business'), // 'canton_fair' | 'business' | 'sourcing'
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  inclusions: jsonb("inclusions").$type<string[]>().default([]),
  exclusions: jsonb("exclusions").$type<string[]>().default([]),
  itinerary: jsonb("itinerary").$type<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation: string;
  }[]>().default([]),
  accommodation: text("accommodation").default("4 Star Hotel"),
  meals: text("meals").default("Breakfast included"),
  transportation: text("transportation").default("Private Car + Metro"),
  groupSize: integer("group_size").default(40),
  ageRange: text("age_range").default("18-60"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  seatsLeft: integer("seats_left").default(10),
  bookingAmount: integer("booking_amount").default(30000),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTravelPackageSchema = createInsertSchema(travelPackages).omit({
  id: true,
  createdAt: true,
});

export type InsertTravelPackage = z.infer<typeof insertTravelPackageSchema>;
export type TravelPackage = typeof travelPackages.$inferSelect;

// Travel Bookings table - Track package bookings and payments
export const travelBookings = pgTable("travel_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").notNull().references(() => travelPackages.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  numberOfTravelers: integer("number_of_travelers").notNull().default(1),
  amount: integer("amount").notNull(), // Amount in paise
  currency: text("currency").notNull().default('INR'),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  status: text("status").notNull().default('pending'), // 'pending' | 'paid' | 'failed' | 'refunded'
  notes: text("notes"),
  travelDate: timestamp("travel_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTravelBookingSchema = createInsertSchema(travelBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTravelBooking = z.infer<typeof insertTravelBookingSchema>;
export type TravelBooking = typeof travelBookings.$inferSelect;

// ========== EVENT MANAGEMENT SYSTEM ==========

// Events table - Main event records (IBS and Seminar)
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ibs' | 'seminar'
  city: text("city").notNull(),
  venue: text("venue"),
  venueAddress: text("venue_address"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  capacity: integer("capacity").notNull().default(60),
  description: text("description"),
  status: text("status").notNull().default('upcoming'), // 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'sold_out'
  ticketPrice: integer("ticket_price").default(0), // price in rupees for public registration
  hiTeaTime: text("hi_tea_time"),
  lunchTime: text("lunch_time"),
  slotDuration: integer("slot_duration").default(30), // minutes, for IBS
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event Attendees table
export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  company: text("company"),
  designation: text("designation"),
  city: text("city"),
  avatar: text("avatar"), // DiceBear avatar URL
  source: text("source"), // 'website' | 'referral' | 'social' | 'direct'
  slotTime: text("slot_time"), // for IBS events
  groupNumber: integer("group_number"), // for IBS grouping (groups of 3-4)
  ticketId: text("ticket_id"), // Unique ticket ID like SBC-FEB26-001
  ticketQr: text("ticket_qr"), // Base64 encoded QR code image
  ticketStatus: text("ticket_status").notNull().default('pending'), // 'pending' | 'issued' | 'sent' | 'collected'
  ticketCount: integer("ticket_count").default(1).notNull(), // Number of tickets for this attendee
  badgePrinted: boolean("badge_printed").default(false).notNull(),
  checkedIn: boolean("checked_in").default(false).notNull(),
  checkedInAt: timestamp("checked_in_at"),
  notes: text("notes"),
  listLocked: boolean("list_locked").default(false).notNull(),
  // Extended attendee info fields
  plan: text("plan"), // Interest/plan like 'Brand Development', 'Import Business', etc.
  budget: text("budget"), // Budget like '10 lac', '1 cr', etc.
  clientStatus: text("client_status"), // 'Business' | 'Job' | 'Other'
  calledBy: text("called_by"), // Name of caller like 'Gaurav', 'Love'
  callStatus: text("call_status"), // 'Call done', 'Not ans', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({
  id: true,
  createdAt: true,
});

export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;

// Event Hotels table
export const eventHotels = pgTable("event_hotels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  hotelName: text("hotel_name").notNull(),
  hotelAddress: text("hotel_address"),
  hotelPhone: text("hotel_phone"),
  bookingUrl: text("booking_url"), // URL to booking page
  distanceFromVenue: text("distance_from_venue"), // e.g. "8-10km (20-30 minutes)"
  guestName: text("guest_name").notNull(),
  guestPhone: text("guest_phone"),
  guestType: text("guest_type").notNull().default('team'), // 'team' | 'speaker' | 'vip' | 'attendee'
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  roomType: text("room_type").notNull().default('single'), // 'single' | 'double' | 'suite'
  roomCount: integer("room_count").default(1),
  confirmationNumber: text("confirmation_number"),
  status: text("status").notNull().default('pending'), // 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  amount: integer("amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventHotelSchema = createInsertSchema(eventHotels).omit({
  id: true,
  createdAt: true,
});

export type InsertEventHotel = z.infer<typeof insertEventHotelSchema>;
export type EventHotel = typeof eventHotels.$inferSelect;

// Event Flights table
export const eventFlights = pgTable("event_flights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  passengerName: text("passenger_name").notNull(),
  passengerPhone: text("passenger_phone"),
  passengerType: text("passenger_type").notNull().default('team'), // 'team' | 'speaker' | 'vip'
  flightNumber: text("flight_number").notNull(),
  airline: text("airline"),
  bookingUrl: text("booking_url"), // URL to booking page (e.g. Skyscanner)
  departureCity: text("departure_city").notNull(),
  arrivalCity: text("arrival_city").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  pnr: text("pnr"),
  seatNumber: text("seat_number"),
  status: text("status").notNull().default('pending'), // 'pending' | 'booked' | 'confirmed' | 'checked_in' | 'boarded' | 'cancelled'
  amount: integer("amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventFlightSchema = createInsertSchema(eventFlights).omit({
  id: true,
  createdAt: true,
});

export type InsertEventFlight = z.infer<typeof insertEventFlightSchema>;
export type EventFlight = typeof eventFlights.$inferSelect;

// Event Creatives table
export const eventCreatives = pgTable("event_creatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'banner' | 'standee' | 'backdrop' | 'brochure' | 'invite' | 'social' | 'other'
  fileUrl: text("file_url"),
  dimensions: text("dimensions"),
  quantity: integer("quantity").default(1),
  vendor: text("vendor"),
  status: text("status").notNull().default('pending'), // 'pending' | 'designing' | 'approved' | 'printing' | 'ready' | 'delivered'
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventCreativeSchema = createInsertSchema(eventCreatives).omit({
  id: true,
  createdAt: true,
});

export type InsertEventCreative = z.infer<typeof insertEventCreativeSchema>;
export type EventCreative = typeof eventCreatives.$inferSelect;

// Event Packing Items table
export const eventPackingItems = pgTable("event_packing_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(), // 'banners' | 'tech' | 'stationery' | 'badges' | 'gifts' | 'documents' | 'other'
  quantity: integer("quantity").notNull().default(1),
  assignedTo: text("assigned_to"),
  status: text("status").notNull().default('pending'), // 'pending' | 'packed' | 'shipped' | 'received' | 'setup'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventPackingItemSchema = createInsertSchema(eventPackingItems).omit({
  id: true,
  createdAt: true,
});

export type InsertEventPackingItem = z.infer<typeof insertEventPackingItemSchema>;
export type EventPackingItem = typeof eventPackingItems.$inferSelect;

// Event Communications table
export const eventCommunications = pgTable("event_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  templateName: text("template_name").notNull(),
  type: text("type").notNull(), // 'email' | 'sms' | 'whatsapp'
  subject: text("subject"),
  body: text("body").notNull(),
  sentCount: integer("sent_count").default(0),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventCommunicationSchema = createInsertSchema(eventCommunications).omit({
  id: true,
  createdAt: true,
});

export type InsertEventCommunication = z.infer<typeof insertEventCommunicationSchema>;
export type EventCommunication = typeof eventCommunications.$inferSelect;

// Event Presentations table
export const eventPresentations = pgTable("event_presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  speakerName: text("speaker_name").notNull(),
  speakerDesignation: text("speaker_designation"),
  duration: integer("duration"), // minutes
  order: integer("order").default(1),
  fileUrl: text("file_url"),
  status: text("status").notNull().default('pending'), // 'pending' | 'ready' | 'presented'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventPresentationSchema = createInsertSchema(eventPresentations).omit({
  id: true,
  createdAt: true,
});

export type InsertEventPresentation = z.infer<typeof insertEventPresentationSchema>;
export type EventPresentation = typeof eventPresentations.$inferSelect;

// Event Team Contacts table - for team, exhibitors, vendors, venue staff
export const eventTeamContacts = pgTable("event_team_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'coordinator' | 'exhibitor' | 'vendor' | 'venue_staff' | 'security' | 'catering' | 'av_tech' | 'other'
  company: text("company"),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  email: text("email"),
  department: text("department"),
  notes: text("notes"),
  isEmergencyContact: boolean("is_emergency_contact").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventTeamContactSchema = createInsertSchema(eventTeamContacts).omit({
  id: true,
  createdAt: true,
});

export type InsertEventTeamContact = z.infer<typeof insertEventTeamContactSchema>;
export type EventTeamContact = typeof eventTeamContacts.$inferSelect;

// Venue Comparisons table - for staging hotel/venue options before final booking
export const venueComparisons = pgTable("venue_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  city: text("city").notNull(), // 'Delhi' | 'Chennai' | 'Hyderabad' | 'Mumbai'
  category: text("category").notNull(), // '5 Star' | '4 Star' | '3 Star'
  name: text("name").notNull(),
  airportDistance: text("airport_distance"),
  location: text("location"),
  hallImageUrl: text("hall_image_url"),
  outerImageUrl: text("outer_image_url"),
  contactPhone: text("contact_phone"),
  email: text("email"),
  pocContactPerson: text("poc_contact_person"),
  firstContactMade: boolean("first_contact_made").default(false),
  quotation: text("quotation"),
  stage: text("stage").notNull().default('pending'), // 'pending' | 'contacted' | 'quoted' | 'negotiating' | 'booked' | 'rejected'
  notes: text("notes"),
  eventId: varchar("event_id").references(() => events.id), // linked when booked
  paymentStatus: text("payment_status"), // 'pending' | 'partial' | 'full'
  paymentAmount: integer("payment_amount"),
  bookingDates: text("booking_dates"), // e.g., "Jan 31, Feb 1"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVenueComparisonSchema = createInsertSchema(venueComparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVenueComparison = z.infer<typeof insertVenueComparisonSchema>;
export type VenueComparison = typeof venueComparisons.$inferSelect;

// Event Vendors table - tracks vendors/suppliers for events
export const eventVendors = pgTable("event_vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  vendorName: text("vendor_name").notNull(),
  companyName: text("company_name"), // e.g., "Softech Group India"
  category: text("category").notNull(), // 'printables' | 'av_equipment' | 'catering' | 'decoration' | 'photography' | 'other'
  contactPhone: text("contact_phone"),
  email: text("email"),
  location: text("location"),
  rating: text("rating"), // e.g., "4.2", "4.6"
  totalAmount: integer("total_amount").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default('pending'), // 'pending' | 'partial' | 'paid'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventVendorSchema = createInsertSchema(eventVendors).omit({
  id: true,
  createdAt: true,
});

export type InsertEventVendor = z.infer<typeof insertEventVendorSchema>;
export type EventVendor = typeof eventVendors.$inferSelect;

// Event Vendor Items table - line items for each vendor
export const eventVendorItems = pgTable("event_vendor_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => eventVendors.id, { onDelete: 'cascade' }),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull().default(0), // in rupees
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventVendorItemSchema = createInsertSchema(eventVendorItems).omit({
  id: true,
  createdAt: true,
});

export type InsertEventVendorItem = z.infer<typeof insertEventVendorItemSchema>;
export type EventVendorItem = typeof eventVendorItems.$inferSelect;

// ========== TEAM CHAT SYSTEM ==========

// Team Channels table - one channel per team
export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: text("team_id").notNull().unique(), // matches team id from teams-config.ts
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdAt: true,
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

// Channel Messages table
export const channelMessages = pgTable("channel_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"), // 'image' | 'document' | 'video'
  attachmentName: text("attachment_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChannelMessageSchema = createInsertSchema(channelMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChannelMessage = z.infer<typeof insertChannelMessageSchema>;
export type ChannelMessage = typeof channelMessages.$inferSelect;

// Team Members table - assigns users to teams
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: text("team_id").notNull(), // matches team id from teams-config.ts
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default('executive'), // 'manager' | 'executive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Direct Message Conversations table - links two users for 1:1 chat
export const directMessageConversations = pgTable("direct_message_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDirectMessageConversationSchema = createInsertSchema(directMessageConversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
});

export type InsertDirectMessageConversation = z.infer<typeof insertDirectMessageConversationSchema>;
export type DirectMessageConversation = typeof directMessageConversations.$inferSelect;

// Direct Messages table - individual messages in DM conversations
export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => directMessageConversations.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"), // 'image' | 'document' | 'video'
  attachmentName: text("attachment_name"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;

// ========== HR PORTAL SYSTEM ==========

// HR Employees table - internal employee records (different from public-facing employees)
export const hrEmployees = pgTable("hr_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fatherName: text("father_name"),
  relation: text("relation"), // 'SON' | 'Daughter'
  dateOfBirth: timestamp("date_of_birth"),
  phone: text("phone"),
  email: text("email"),
  aadharAddress: text("aadhar_address"),
  role: text("role").notNull().default('Executive'), // 'Manager' | 'Executive' | 'Intern'
  employmentType: text("employment_type").default('FTE'), // 'FTE' | 'Internship' | 'Maid' | 'Intern'
  officeUnit: text("office_unit").notNull().default('Gurugram Office'), // 'Gurugram Office' | 'Rewari Office'
  department: text("department"), // 'Sales' | 'Marketing' | 'Events' | 'HR' | 'Operations' etc
  dateOfJoining: timestamp("date_of_joining"),
  salary: integer("salary"),
  pfEnabled: boolean("pf_enabled").default(false),
  esicEnabled: boolean("esic_enabled").default(false),
  panCard: text("pan_card"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  bankVerificationStatus: text("bank_verification_status").default('pending'), // 'pending' | 'verified' | 'failed'
  profilePicture: text("profile_picture"),
  status: text("status").notNull().default('active'), // 'active' | 'on_leave' | 'terminated' | 'resigned'
  linkedUserId: varchar("linked_user_id").references(() => users.id), // link to system user for login
  isSalesTeam: boolean("is_sales_team").default(false).notNull(), // for combined sales team
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHrEmployeeSchema = createInsertSchema(hrEmployees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHrEmployee = z.infer<typeof insertHrEmployeeSchema>;
export type HrEmployee = typeof hrEmployees.$inferSelect;

// Employee Documents table - documents linked to employees
export const employeeDocuments = pgTable("employee_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => hrEmployees.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'id_proof' | 'address_proof' | 'offer_letter' | 'contract' | 'certificate' | 'other'
  fileUrl: text("file_url"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments).omit({
  id: true,
  uploadedAt: true,
});

export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;

// Assets table - company assets management
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'laptop' | 'mobile' | 'furniture' | 'office_equipment' | 'vehicle' | 'other'
  serialNumber: text("serial_number"),
  brand: text("brand"),
  model: text("model"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: integer("purchase_price"),
  warrantyExpiry: timestamp("warranty_expiry"),
  status: text("status").notNull().default('available'), // 'available' | 'assigned' | 'repair' | 'retired' | 'lost'
  currentAssigneeId: varchar("current_assignee_id").references(() => hrEmployees.id),
  location: text("location"), // 'Gurugram Office' | 'Rewari Office' | 'Remote'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Asset Assignments table - history of asset assignments
export const assetAssignments = pgTable("asset_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id").notNull().references(() => assets.id, { onDelete: 'cascade' }),
  employeeId: varchar("employee_id").notNull().references(() => hrEmployees.id),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  returnedDate: timestamp("returned_date"),
  condition: text("condition").notNull().default('good'), // 'good' | 'fair' | 'poor'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssetAssignmentSchema = createInsertSchema(assetAssignments).omit({
  id: true,
  createdAt: true,
});

export type InsertAssetAssignment = z.infer<typeof insertAssetAssignmentSchema>;
export type AssetAssignment = typeof assetAssignments.$inferSelect;

// Asset Maintenance table - repairs and maintenance records
export const assetMaintenance = pgTable("asset_maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id").notNull().references(() => assets.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'repair' | 'service' | 'upgrade' | 'replacement'
  description: text("description").notNull(),
  vendor: text("vendor"),
  cost: integer("cost"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssetMaintenanceSchema = createInsertSchema(assetMaintenance).omit({
  id: true,
  createdAt: true,
});

export type InsertAssetMaintenance = z.infer<typeof insertAssetMaintenanceSchema>;
export type AssetMaintenance = typeof assetMaintenance.$inferSelect;

// Attendance table - daily attendance records
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => hrEmployees.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default('present'), // 'present' | 'absent' | 'half_day' | 'late' | 'wfh' | 'holiday' | 'weekend'
  checkInTime: text("check_in_time"),
  checkOutTime: text("check_out_time"),
  notes: text("notes"),
  markedBy: varchar("marked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// Leave Requests table
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => hrEmployees.id, { onDelete: 'cascade' }),
  leaveType: text("leave_type").notNull(), // 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid' | 'other'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default('pending'), // 'pending' | 'approved' | 'denied' | 'cancelled'
  approvedBy: varchar("approved_by").references(() => users.id),
  approverNotes: text("approver_notes"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  appliedAt: true,
  processedAt: true,
  createdAt: true,
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

// Job Openings / Hiring Requirements table
export const jobOpenings = pgTable("job_openings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  department: text("department"), // Sales, Operations, HR, Marketing, Finance, etc.
  minExperience: integer("min_experience").notNull().default(1), // in years
  maxExperience: integer("max_experience"), // optional upper bound
  industries: text("industries").array().default([]), // preferred industry background
  skills: text("skills").array().default([]), // required skills
  description: text("description"),
  requirements: text("requirements"), // detailed requirements
  positions: integer("positions").notNull().default(1), // number of openings
  priority: text("priority").notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  status: text("status").notNull().default('open'), // 'open' | 'on_hold' | 'filled' | 'cancelled'
  salary: text("salary"), // salary range or "Negotiable"
  location: text("location").default('Gurugram'),
  employmentType: text("employment_type").default('full_time'), // 'full_time' | 'part_time' | 'contract' | 'internship'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type JobOpening = typeof jobOpenings.$inferSelect;

// Job Portals - External recruitment platforms
export const jobPortals = pgTable("job_portals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Naukri, Internshala, LinkedIn, Indeed, etc.
  url: text("url").notNull(), // Login URL
  logo: text("logo"), // Logo URL or path
  userId: text("user_id"), // Login email/username
  password: text("password"), // Encrypted in production
  notes: text("notes"), // Additional notes
  isActive: boolean("is_active").default(true),
  lastAccessed: timestamp("last_accessed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobPortalSchema = createInsertSchema(jobPortals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobPortal = z.infer<typeof insertJobPortalSchema>;
export type JobPortal = typeof jobPortals.$inferSelect;

// Candidates - Job applicants/candidates for recruitment
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  source: text("source").notNull(), // Naukri, Internshala, Workindia, LinkedIn, Email, WhatsApp, Referral, etc.
  sourcePortalId: varchar("source_portal_id").references(() => jobPortals.id), // FK to job portals
  appliedFor: text("applied_for").notNull(), // Position they applied for
  jobOpeningId: varchar("job_opening_id").references(() => jobOpenings.id), // FK to job opening
  profileUrl: text("profile_url"), // Naukri/LinkedIn profile URL
  cvUrl: text("cv_url"), // CV/Resume URL
  status: text("status").default("new").notNull(), // new, contacted, interested, interview_scheduled, interviewed, offered, hired, rejected, on_hold
  currentSalary: text("current_salary"), // Current CTC
  expectedSalary: text("expected_salary"), // Expected CTC
  noticePeriod: text("notice_period"), // Days/Immediate
  experience: text("experience"), // Years of experience
  location: text("location"), // Current location
  skills: text("skills"), // Comma-separated skills
  notes: text("notes"), // General notes
  rating: integer("rating"), // 1-5 rating
  interviewDate: timestamp("interview_date"), // Scheduled interview date
  assignedTo: varchar("assigned_to").references(() => users.id), // HR team member assigned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Candidate Calls - Call logs for recruitment calls (invitation/screening)
export const candidateCalls = pgTable("candidate_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  callType: text("call_type").notNull().default("invitation"), // invitation, screening, follow_up, offer
  callDate: timestamp("call_date").notNull(),
  callStatus: text("call_status").notNull(), // connected, not_connected, busy, switched_off, wrong_number
  callResponse: text("call_response"), // interested, not_interested, maybe, interview_scheduled, rejected
  callNotes: text("call_notes"),
  duration: integer("duration"), // Call duration in seconds
  recordingUrl: text("recording_url"), // Call recording URL if available
  calledBy: varchar("called_by").references(() => users.id), // Who made the call
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCandidateCallSchema = createInsertSchema(candidateCalls).omit({
  id: true,
  createdAt: true,
});

export type InsertCandidateCall = z.infer<typeof insertCandidateCallSchema>;
export type CandidateCall = typeof candidateCalls.$inferSelect;

// HR Templates - Message templates for recruitment (WhatsApp, Email, SMS)
export const hrTemplates = pgTable("hr_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // interview_invite, rejection, follow_up, offer_letter, onboarding, etc.
  type: text("type").notNull(), // whatsapp, email, sms
  subject: text("subject"), // For emails
  content: text("content").notNull(), // Template content with placeholders
  placeholders: text("placeholders").array(), // List of placeholder variables
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHrTemplateSchema = createInsertSchema(hrTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export type InsertHrTemplate = z.infer<typeof insertHrTemplateSchema>;
export type HrTemplate = typeof hrTemplates.$inferSelect;

// Interviews - Scheduled interviews for candidates
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateName: text("candidate_name").notNull(),
  candidatePhone: text("candidate_phone").notNull(),
  candidateId: varchar("candidate_id").references(() => candidates.id), // Optional link to candidate
  interviewDate: timestamp("interview_date").notNull(),
  interviewerId: varchar("interviewer_id").references(() => users.id), // Employee conducting interview
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled, no_show
  result: text("result"), // selected, rejected, on_hold, pending
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

// ============================================================================
// ASSET TYPES TABLE
// ============================================================================

export const assetTypes = pgTable("asset_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssetTypeSchema = createInsertSchema(assetTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertAssetType = z.infer<typeof insertAssetTypeSchema>;
export type AssetType = typeof assetTypes.$inferSelect;

// ============================================================================
// FAIRE WHOLESALE TABLES
// ============================================================================

// Faire Stores (Faire brand accounts)
export const faireStores = pgTable("faire_stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  faireBrandId: text("faire_brand_id"),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  apiToken: text("api_token"),
  apiTokenEncrypted: boolean("api_token_encrypted").default(false).notNull(),
  webhookSecret: text("webhook_secret"),
  isActive: boolean("is_active").default(true).notNull(),
  autoSyncEnabled: boolean("auto_sync_enabled").default(false).notNull(),
  syncIntervalMinutes: integer("sync_interval_minutes").default(60).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  timezone: text("timezone").default("America/New_York").notNull(),
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireStoreSchema = createInsertSchema(faireStores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireStore = z.infer<typeof insertFaireStoreSchema>;
export type FaireStore = typeof faireStores.$inferSelect;

// Faire Suppliers
export const faireSuppliers = pgTable("faire_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").notNull().references(() => faireStores.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, pending, suspended
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").default("USA").notNull(),
  paymentTerms: text("payment_terms"),
  leadTimeDays: integer("lead_time_days"),
  minimumOrderAmount: numeric("minimum_order_amount"),
  notes: text("notes"),
  credentials: jsonb("credentials").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireSupplierSchema = createInsertSchema(faireSuppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireSupplier = z.infer<typeof insertFaireSupplierSchema>;
export type FaireSupplier = typeof faireSuppliers.$inferSelect;

// Faire Products
export const faireProducts = pgTable("faire_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  faireProductId: text("faire_product_id"),
  faireBrandId: text("faire_brand_id"),
  storeId: varchar("store_id").notNull().references(() => faireStores.id),
  supplierId: varchar("supplier_id").references(() => faireSuppliers.id),
  name: text("name").notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  sku: text("sku"),
  saleState: text("sale_state").notNull().default("FOR_SALE"), // FOR_SALE, SALES_PAUSED, DISCONTINUED
  lifecycleState: text("lifecycle_state").notNull().default("DRAFT"), // DRAFT, PUBLISHED, ARCHIVED
  unitMultiplier: integer("unit_multiplier").default(1).notNull(),
  minimumOrderQuantity: integer("minimum_order_quantity").default(1).notNull(),
  taxonomyType: jsonb("taxonomy_type"),
  madeInCountry: text("made_in_country"),
  preorderable: boolean("preorderable").default(false).notNull(),
  preorderDetails: jsonb("preorder_details"),
  images: text("images").array().default([]),
  metadata: jsonb("metadata"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncHash: text("sync_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireProductSchema = createInsertSchema(faireProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireProduct = z.infer<typeof insertFaireProductSchema>;
export type FaireProduct = typeof faireProducts.$inferSelect;

// Faire Product Variants
export const faireProductVariants = pgTable("faire_product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  faireVariantId: text("faire_variant_id"),
  productId: varchar("product_id").notNull().references(() => faireProducts.id, { onDelete: 'cascade' }),
  storeId: varchar("store_id").notNull().references(() => faireStores.id),
  name: text("name").notNull(),
  sku: text("sku"),
  gtin: text("gtin"),
  saleState: text("sale_state").notNull().default("FOR_SALE"),
  lifecycleState: text("lifecycle_state").notNull().default("DRAFT"),
  prices: jsonb("prices"),
  availableQuantity: integer("available_quantity").default(0).notNull(),
  reservedQuantity: integer("reserved_quantity").default(0).notNull(),
  backorderedUntil: timestamp("backordered_until"),
  options: jsonb("options"),
  measurements: jsonb("measurements"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireProductVariantSchema = createInsertSchema(faireProductVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireProductVariant = z.infer<typeof insertFaireProductVariantSchema>;
export type FaireProductVariant = typeof faireProductVariants.$inferSelect;

// Faire Orders
export const faireOrders = pgTable("faire_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  faireOrderId: text("faire_order_id").notNull(),
  displayId: text("display_id"),
  storeId: varchar("store_id").notNull().references(() => faireStores.id),
  state: text("state").notNull().default("NEW"), // NEW, PROCESSING, PRE_TRANSIT, IN_TRANSIT, DELIVERED, BACKORDERED, CANCELED
  retailerId: text("retailer_id"),
  retailerName: text("retailer_name"),
  address: jsonb("address"),
  isFreeShipping: boolean("is_free_shipping").default(false).notNull(),
  freeShippingReason: text("free_shipping_reason"),
  faireCoveredShippingCostCents: integer("faire_covered_shipping_cost_cents"),
  shipAfter: timestamp("ship_after"),
  subtotalCents: integer("subtotal_cents"),
  shippingCents: integer("shipping_cents"),
  taxCents: integer("tax_cents"),
  totalCents: integer("total_cents"),
  payoutCosts: jsonb("payout_costs"),
  estimatedPayoutAt: timestamp("estimated_payout_at"),
  purchaseOrderNumber: text("purchase_order_number"),
  notes: text("notes"),
  source: text("source"),
  paymentInitiatedAt: timestamp("payment_initiated_at"),
  salesRepName: text("sales_rep_name"),
  brandDiscounts: jsonb("brand_discounts"),
  hasPendingCancellationRequest: boolean("has_pending_cancellation_request").default(false).notNull(),
  originalOrderId: text("original_order_id"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncHash: text("sync_hash"),
  faireCreatedAt: timestamp("faire_created_at"),
  faireUpdatedAt: timestamp("faire_updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireOrderSchema = createInsertSchema(faireOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireOrder = z.infer<typeof insertFaireOrderSchema>;
export type FaireOrder = typeof faireOrders.$inferSelect;

// Faire Order Items
export const faireOrderItems = pgTable("faire_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  faireOrderItemId: text("faire_order_item_id"),
  orderId: varchar("order_id").notNull().references(() => faireOrders.id, { onDelete: 'cascade' }),
  storeId: varchar("store_id").notNull().references(() => faireStores.id),
  productId: varchar("product_id").references(() => faireProducts.id),
  variantId: varchar("variant_id").references(() => faireProductVariants.id),
  faireProductId: text("faire_product_id"),
  faireVariantId: text("faire_variant_id"),
  productName: text("product_name").notNull(),
  variantName: text("variant_name"),
  sku: text("sku"),
  quantity: integer("quantity").notNull(),
  state: text("state").notNull().default("NEW"), // NEW, CONFIRMED, BACKORDERED, SHIPPED, DELIVERED, CANCELED
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  includesTester: boolean("includes_tester").default(false).notNull(),
  testerPriceCents: integer("tester_price_cents"),
  discounts: jsonb("discounts"),
  faireCreatedAt: timestamp("faire_created_at"),
  faireUpdatedAt: timestamp("faire_updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireOrderItemSchema = createInsertSchema(faireOrderItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireOrderItem = z.infer<typeof insertFaireOrderItemSchema>;
export type FaireOrderItem = typeof faireOrderItems.$inferSelect;

// Faire Shipments
export const faireShipments = pgTable("faire_shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  faireShipmentId: text("faire_shipment_id"),
  orderId: varchar("order_id").notNull().references(() => faireOrders.id, { onDelete: 'cascade' }),
  storeId: varchar("store_id").notNull().references(() => faireStores.id),
  carrier: text("carrier"),
  trackingCode: text("tracking_code"),
  trackingUrl: text("tracking_url"),
  shippingType: text("shipping_type"),
  makerCostCents: integer("maker_cost_cents"),
  itemIds: text("item_ids").array().default([]),
  faireCreatedAt: timestamp("faire_created_at"),
  faireUpdatedAt: timestamp("faire_updated_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const insertFaireShipmentSchema = createInsertSchema(faireShipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaireShipment = z.infer<typeof insertFaireShipmentSchema>;
export type FaireShipment = typeof faireShipments.$inferSelect;

// ============================================================================
// LLC CLIENTS TABLES
// ============================================================================

// LLC Banks
export const llcBanks = pgTable("llc_banks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  website: text("website"),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLLCBankSchema = createInsertSchema(llcBanks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLLCBank = z.infer<typeof insertLLCBankSchema>;
export type LLCBank = typeof llcBanks.$inferSelect;

// LLC Clients
export const llcClients = pgTable("llc_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientCode: text("client_code").notNull(),
  serialNumber: integer("serial_number"),
  
  // Client Info
  clientName: text("client_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  country: text("country"),
  
  // LLC Info
  llcName: text("llc_name"),
  status: text("status").notNull().default("llc_booked"), // llc_booked, onboarded, under_ein, under_boi, under_banking, under_payment_gateway, delivered
  health: text("health"), // healthy, neutral, at_risk, critical
  
  // Service
  plan: text("plan").notNull().default("llc"), // elite, llc
  websiteIncluded: boolean("website_included").default(false).notNull(),
  
  // Dates
  paymentDate: timestamp("payment_date"),
  onboardingDate: timestamp("onboarding_date"),
  onboardingCallDate: timestamp("onboarding_call_date"),
  documentSubmissionDate: timestamp("document_submission_date"),
  deliveryDate: timestamp("delivery_date"),
  
  // Financial
  amountReceived: numeric("amount_received").default("0").notNull(),
  remainingPayment: numeric("remaining_payment").default("0").notNull(),
  currency: text("currency").default("INR").notNull(),
  
  // Banking
  bankId: varchar("bank_id").references(() => llcBanks.id),
  bankApproved: text("bank_approved"),
  bankStatus: text("bank_status").notNull().default("not_started"), // not_started, documents_pending, application_submitted, under_review, approved, rejected
  bankApplicationDate: timestamp("bank_application_date"),
  bankApprovalDate: timestamp("bank_approval_date"),
  
  // Assignment
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  
  // External
  externalProjectUrl: text("external_project_url"),
  
  // Notes
  notes: text("notes"),
  additionalNotes: text("additional_notes"),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  deletedAt: timestamp("deleted_at"),
});

export const insertLLCClientSchema = createInsertSchema(llcClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLLCClient = z.infer<typeof insertLLCClientSchema>;
export type LLCClient = typeof llcClients.$inferSelect;

// LLC Document Types
export const llcDocumentTypes = pgTable("llc_document_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull(),
  category: text("category").notNull(), // client_submitted, llc_documents, bank_documents, website_documents
  description: text("description"),
  isRequired: boolean("is_required").default(false).notNull(),
  forEliteOnly: boolean("for_elite_only").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLLCDocumentTypeSchema = createInsertSchema(llcDocumentTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLLCDocumentType = z.infer<typeof insertLLCDocumentTypeSchema>;
export type LLCDocumentType = typeof llcDocumentTypes.$inferSelect;

// LLC Client Documents
export const llcClientDocuments = pgTable("llc_client_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => llcClients.id, { onDelete: 'cascade' }),
  documentTypeId: varchar("document_type_id").references(() => llcDocumentTypes.id),
  
  // Document Info
  name: text("name").notNull(),
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileSize: integer("file_size").default(0).notNull(),
  mimeType: text("mime_type"),
  
  // Status
  category: text("category").notNull(), // client_submitted, llc_documents, bank_documents, website_documents
  status: text("status").notNull().default("pending"), // pending, submitted, verified, rejected, issued, delivered
  
  // Dates
  submittedDate: timestamp("submitted_date"),
  verifiedDate: timestamp("verified_date"),
  issuedDate: timestamp("issued_date"),
  expiryDate: timestamp("expiry_date"),
  
  // Tracking
  submittedBy: varchar("submitted_by"),
  verifiedBy: varchar("verified_by"),
  issuedBy: varchar("issued_by"),
  
  // Notes
  notes: text("notes"),
  rejectionReason: text("rejection_reason"),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  deletedAt: timestamp("deleted_at"),
});

export const insertLLCClientDocumentSchema = createInsertSchema(llcClientDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLLCClientDocument = z.infer<typeof insertLLCClientDocumentSchema>;
export type LLCClientDocument = typeof llcClientDocuments.$inferSelect;

// LLC Client Timeline
export const llcClientTimeline = pgTable("llc_client_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => llcClients.id, { onDelete: 'cascade' }),
  documentId: varchar("document_id").references(() => llcClientDocuments.id),
  
  // Event
  eventType: text("event_type").notNull(), // status_change, document_uploaded, document_issued, note_added, payment_received, call_scheduled, call_completed, bank_update, milestone
  title: text("title").notNull(),
  description: text("description"),
  
  // Status Change
  oldStatus: text("old_status"),
  newStatus: text("new_status"),
  
  // Metadata
  metadata: jsonb("metadata"),
  
  // Who
  performedBy: varchar("performed_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLLCClientTimelineSchema = createInsertSchema(llcClientTimeline).omit({
  id: true,
  createdAt: true,
});

export type InsertLLCClientTimeline = z.infer<typeof insertLLCClientTimelineSchema>;
export type LLCClientTimeline = typeof llcClientTimeline.$inferSelect;

// Website Content (CMS)
export const websiteContent = pgTable("website_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: text("section").notNull(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by"),
});

export const insertWebsiteContentSchema = createInsertSchema(websiteContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertWebsiteContent = z.infer<typeof insertWebsiteContentSchema>;
export type WebsiteContent = typeof websiteContent.$inferSelect;

// Payment Requests
export const paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  description: text("description").notNull(),
  receivingCompany: text("receiving_company").notNull().default("Startup Squad Pvt Ltd"),
  methods: text("methods").array().notNull().default(sql`'{}'`),
  razorpayLinkId: text("razorpay_link_id"),
  razorpayLinkUrl: text("razorpay_link_url"),
  razorpayLinkStatus: text("razorpay_link_status"),
  upiAddress: text("upi_address"),
  bankAccountNo: text("bank_account_no"),
  status: text("status").notNull().default("pending"),
  paymentScreenshotUrl: text("payment_screenshot_url"),
  paymentProofNote: text("payment_proof_note"),
  referenceId: text("reference_id"),
  notes: text("notes"),
  createdBy: varchar("created_by"),
  createdByName: text("created_by_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  deletedAt: timestamp("deleted_at"),
});

export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;

// ========== SCHEDULING & BOOKING SYSTEM ==========

export const bookingTypes = pgTable("booking_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  duration: integer("duration").notNull().default(30),
  color: text("color").default("#3B82F6"),
  price: integer("price").default(0),
  currency: text("currency").default("INR"),
  location: text("location").default("Google Meet"),
  bufferBefore: integer("buffer_before").default(0),
  bufferAfter: integer("buffer_after").default(10),
  maxBookingsPerDay: integer("max_bookings_per_day"),
  requiresApproval: boolean("requires_approval").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingTypeSchema = createInsertSchema(bookingTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBookingType = z.infer<typeof insertBookingTypeSchema>;
export type BookingType = typeof bookingTypes.$inferSelect;

export const availabilitySchedules = pgTable("availability_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAvailabilityScheduleSchema = createInsertSchema(availabilitySchedules).omit({
  id: true,
  createdAt: true,
});

export type InsertAvailabilitySchedule = z.infer<typeof insertAvailabilityScheduleSchema>;
export type AvailabilitySchedule = typeof availabilitySchedules.$inferSelect;

export const availabilityOverrides = pgTable("availability_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  isAvailable: boolean("is_available").default(false).notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAvailabilityOverrideSchema = createInsertSchema(availabilityOverrides).omit({
  id: true,
  createdAt: true,
});

export type InsertAvailabilityOverride = z.infer<typeof insertAvailabilityOverrideSchema>;
export type AvailabilityOverride = typeof availabilityOverrides.$inferSelect;

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingTypeId: varchar("booking_type_id").notNull().references(() => bookingTypes.id),
  hostUserId: varchar("host_user_id").notNull().references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("confirmed"),
  meetingLink: text("meeting_link"),
  customerNotes: text("customer_notes"),
  internalNotes: text("internal_notes"),
  cancellationReason: text("cancellation_reason"),
  rescheduledFromId: varchar("rescheduled_from_id"),
  paymentRequestId: varchar("payment_request_id"),
  cancelToken: text("cancel_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const bookingReminders = pgTable("booking_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingReminderSchema = createInsertSchema(bookingReminders).omit({
  id: true,
  createdAt: true,
});

export type InsertBookingReminder = z.infer<typeof insertBookingReminderSchema>;
export type BookingReminder = typeof bookingReminders.$inferSelect;

// ========== AI CHAT ASSISTANT ==========

export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull().default("New Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls").$type<{ type: string; toolCallId?: string; toolName?: string; args?: Record<string, unknown>; result?: unknown }[]>(),
  toolResults: jsonb("tool_results").$type<{ toolCallId?: string; result?: unknown }[]>(),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;

export const aiAttachments = pgTable("ai_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => aiMessages.id, { onDelete: 'cascade' }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiAttachmentSchema = createInsertSchema(aiAttachments).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAttachment = z.infer<typeof insertAiAttachmentSchema>;
export type AiAttachment = typeof aiAttachments.$inferSelect;

// ========== CONTACTS ==========

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  organization: text("organization"),
  designation: text("designation"),
  category: text("category").notNull().default('client'),
  city: text("city"),
  country: text("country").default('India'),
  priority: text("priority").notNull().default('medium'),
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  teamId: text("team_id"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// ========== DEALS ==========

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactId: varchar("contact_id").references(() => contacts.id, { onDelete: 'set null' }),
  leadId: varchar("lead_id").references(() => leads.id, { onDelete: 'set null' }),
  value: integer("value").notNull().default(0),
  stage: text("stage").notNull().default('discovery'),
  expectedCloseDate: timestamp("expected_close_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  teamId: text("team_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
});

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

// ========== APPOINTMENTS ==========

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull().default('meeting'),
  dateTime: timestamp("date_time").notNull(),
  duration: integer("duration").notNull().default(30),
  contactId: varchar("contact_id").references(() => contacts.id, { onDelete: 'set null' }),
  leadId: varchar("lead_id").references(() => leads.id, { onDelete: 'set null' }),
  dealId: varchar("deal_id").references(() => deals.id, { onDelete: 'set null' }),
  location: text("location"),
  notes: text("notes"),
  status: text("status").notNull().default('scheduled'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  teamId: text("team_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// ========== TICKETS ==========

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketCode: text("ticket_code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default('open'),
  priority: text("priority").notNull().default('medium'),
  category: text("category").notNull().default('general'),
  reportedBy: varchar("reported_by").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  teamId: text("team_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// ========== AUDIT LOGS ==========

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ========== NOTIFICATIONS ==========

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
