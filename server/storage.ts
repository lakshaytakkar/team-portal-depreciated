import { supabase } from "./db";
import { 
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Activity, type InsertActivity,
  type Task, type InsertTask,
  type Service, type InsertService,
  type Template, type InsertTemplate,
  type Employee, type InsertEmployee,
  type TravelPackage, type InsertTravelPackage,
  type TravelBooking, type InsertTravelBooking,
  type Event, type InsertEvent,
  type EventAttendee, type InsertEventAttendee,
  type EventHotel, type InsertEventHotel,
  type EventFlight, type InsertEventFlight,
  type EventCreative, type InsertEventCreative,
  type EventPackingItem, type InsertEventPackingItem,
  type EventCommunication, type InsertEventCommunication,
  type EventPresentation, type InsertEventPresentation,
  type EventTeamContact, type InsertEventTeamContact,
  type VenueComparison, type InsertVenueComparison,
  type EventVendor, type InsertEventVendor,
  type EventVendorItem, type InsertEventVendorItem,
  type Channel, type InsertChannel,
  type ChannelMessage, type InsertChannelMessage,
  type TeamMember, type InsertTeamMember,
  type DirectMessageConversation, type InsertDirectMessageConversation,
  type DirectMessage, type InsertDirectMessage,
  type HrEmployee, type InsertHrEmployee,
  type EmployeeDocument, type InsertEmployeeDocument,
  type Asset, type InsertAsset,
  type AssetAssignment, type InsertAssetAssignment,
  type AssetMaintenance, type InsertAssetMaintenance,
  type Attendance, type InsertAttendance,
  type LeaveRequest, type InsertLeaveRequest,
  type JobOpening, type InsertJobOpening,
  type JobPortal, type InsertJobPortal,
  type Candidate, type InsertCandidate,
  type CandidateCall, type InsertCandidateCall,
  type HrTemplate, type InsertHrTemplate,
  type Interview, type InsertInterview,
  type FaireStore, type InsertFaireStore,
  type FaireSupplier, type InsertFaireSupplier,
  type FaireProduct, type InsertFaireProduct,
  type FaireProductVariant, type InsertFaireProductVariant,
  type FaireOrder, type InsertFaireOrder,
  type FaireOrderItem, type InsertFaireOrderItem,
  type FaireShipment, type InsertFaireShipment,
  type LLCBank, type InsertLLCBank,
  type LLCClient, type InsertLLCClient,
  type LLCClientDocument, type InsertLLCClientDocument,
  type LLCClientTimeline, type InsertLLCClientTimeline,
  type WebsiteContent, type InsertWebsiteContent,
  type PaymentRequest, type InsertPaymentRequest,
  type BookingType, type InsertBookingType,
  type AvailabilitySchedule, type InsertAvailabilitySchedule,
  type AvailabilityOverride, type InsertAvailabilityOverride,
  type Booking, type InsertBooking,
  type BookingReminder, type InsertBookingReminder
} from "@shared/schema";

function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function toCamelCase<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

function toCamelCaseArray<T>(arr: Record<string, any>[]): T[] {
  return arr.map(obj => toCamelCase<T>(obj));
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Leads
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByPhone(phone: string): Promise<Lead | undefined>;
  getLeads(options?: { userId?: string; teamId?: string; role?: string }): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  getLeadsByStage(stage: string, userId?: string): Promise<Lead[]>;
  assignLead(leadId: string, userId: string | null): Promise<Lead | undefined>;
  
  // Activities
  getActivity(id: string): Promise<Activity | undefined>;
  getActivities(leadId?: string, userId?: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: string): Promise<boolean>;
  
  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasks(options?: { userId?: string; teamId?: string }): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Services
  getService(id: string): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplates(type?: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  
  // Employees
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  getActiveEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;
  
  // Travel Packages
  getTravelPackage(id: string): Promise<TravelPackage | undefined>;
  getTravelPackageBySlug(slug: string): Promise<TravelPackage | undefined>;
  getTravelPackages(): Promise<TravelPackage[]>;
  getActiveTravelPackages(): Promise<TravelPackage[]>;
  getFeaturedTravelPackages(): Promise<TravelPackage[]>;
  createTravelPackage(pkg: InsertTravelPackage): Promise<TravelPackage>;
  updateTravelPackage(id: string, updates: Partial<InsertTravelPackage>): Promise<TravelPackage | undefined>;
  deleteTravelPackage(id: string): Promise<boolean>;
  
  // Travel Bookings
  createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking>;
  getTravelBooking(id: string): Promise<TravelBooking | undefined>;
  getTravelBookingByOrderId(orderId: string): Promise<TravelBooking | undefined>;
  updateTravelBooking(id: string, updates: Partial<TravelBooking>): Promise<TravelBooking | undefined>;
  getTravelBookings(): Promise<TravelBooking[]>;
  
  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Event Attendees
  getEventAttendee(id: string): Promise<EventAttendee | undefined>;
  getEventAttendees(eventId: string): Promise<EventAttendee[]>;
  createEventAttendee(attendee: InsertEventAttendee): Promise<EventAttendee>;
  updateEventAttendee(id: string, updates: Partial<InsertEventAttendee>): Promise<EventAttendee | undefined>;
  deleteEventAttendee(id: string): Promise<boolean>;
  checkInAttendee(id: string): Promise<EventAttendee | undefined>;
  
  // Event Hotels
  getEventHotels(eventId: string): Promise<EventHotel[]>;
  createEventHotel(hotel: InsertEventHotel): Promise<EventHotel>;
  updateEventHotel(id: string, updates: Partial<InsertEventHotel>): Promise<EventHotel | undefined>;
  deleteEventHotel(id: string): Promise<boolean>;
  
  // Event Flights
  getEventFlights(eventId: string): Promise<EventFlight[]>;
  createEventFlight(flight: InsertEventFlight): Promise<EventFlight>;
  updateEventFlight(id: string, updates: Partial<InsertEventFlight>): Promise<EventFlight | undefined>;
  deleteEventFlight(id: string): Promise<boolean>;
  
  // Event Creatives
  getEventCreatives(eventId: string): Promise<EventCreative[]>;
  createEventCreative(creative: InsertEventCreative): Promise<EventCreative>;
  updateEventCreative(id: string, updates: Partial<InsertEventCreative>): Promise<EventCreative | undefined>;
  deleteEventCreative(id: string): Promise<boolean>;
  
  // Event Packing Items
  getEventPackingItems(eventId: string): Promise<EventPackingItem[]>;
  createEventPackingItem(item: InsertEventPackingItem): Promise<EventPackingItem>;
  updateEventPackingItem(id: string, updates: Partial<InsertEventPackingItem>): Promise<EventPackingItem | undefined>;
  deleteEventPackingItem(id: string): Promise<boolean>;
  
  // Event Communications
  getEventCommunications(eventId: string): Promise<EventCommunication[]>;
  createEventCommunication(comm: InsertEventCommunication): Promise<EventCommunication>;
  updateEventCommunication(id: string, updates: Partial<InsertEventCommunication>): Promise<EventCommunication | undefined>;
  deleteEventCommunication(id: string): Promise<boolean>;
  
  // Event Presentations
  getEventPresentations(eventId: string): Promise<EventPresentation[]>;
  createEventPresentation(pres: InsertEventPresentation): Promise<EventPresentation>;
  updateEventPresentation(id: string, updates: Partial<InsertEventPresentation>): Promise<EventPresentation | undefined>;
  deleteEventPresentation(id: string): Promise<boolean>;
  
  // Event Team Contacts
  getEventTeamContacts(eventId: string): Promise<EventTeamContact[]>;
  createEventTeamContact(contact: InsertEventTeamContact): Promise<EventTeamContact>;
  updateEventTeamContact(id: string, updates: Partial<InsertEventTeamContact>): Promise<EventTeamContact | undefined>;
  deleteEventTeamContact(id: string): Promise<boolean>;
  
  // Venue Comparisons
  getVenueComparisons(city?: string): Promise<VenueComparison[]>;
  getVenueComparison(id: string): Promise<VenueComparison | undefined>;
  createVenueComparison(venue: InsertVenueComparison): Promise<VenueComparison>;
  updateVenueComparison(id: string, updates: Partial<InsertVenueComparison>): Promise<VenueComparison | undefined>;
  deleteVenueComparison(id: string): Promise<boolean>;
  
  // Event Vendors
  getEventVendors(eventId: string): Promise<EventVendor[]>;
  getEventVendor(id: string): Promise<EventVendor | undefined>;
  createEventVendor(vendor: InsertEventVendor): Promise<EventVendor>;
  updateEventVendor(id: string, updates: Partial<InsertEventVendor>): Promise<EventVendor | undefined>;
  deleteEventVendor(id: string): Promise<boolean>;
  
  // Event Vendor Items
  getEventVendorItems(vendorId: string): Promise<EventVendorItem[]>;
  createEventVendorItem(item: InsertEventVendorItem): Promise<EventVendorItem>;
  updateEventVendorItem(id: string, updates: Partial<InsertEventVendorItem>): Promise<EventVendorItem | undefined>;
  deleteEventVendorItem(id: string): Promise<boolean>;
  
  // Channels
  getChannel(id: string): Promise<Channel | undefined>;
  getChannelByTeamId(teamId: string): Promise<Channel | undefined>;
  getChannels(): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  
  // Channel Messages
  getChannelMessages(channelId: string): Promise<ChannelMessage[]>;
  createChannelMessage(message: InsertChannelMessage): Promise<ChannelMessage>;
  
  // Team Members
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<boolean>;
  getUserTeams(userId: string): Promise<TeamMember[]>;
  
  // Direct Message Conversations
  getDirectMessageConversations(userId: string): Promise<DirectMessageConversation[]>;
  getDirectMessageConversation(id: string): Promise<DirectMessageConversation | undefined>;
  getOrCreateDirectMessageConversation(user1Id: string, user2Id: string): Promise<DirectMessageConversation>;
  
  // Direct Messages
  getDirectMessages(conversationId: string): Promise<DirectMessage[]>;
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  markDirectMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // All Users (for chat)
  getAllUsers(): Promise<User[]>;
  
  // HR Employees
  getHrEmployee(id: string): Promise<HrEmployee | undefined>;
  getHrEmployees(filters?: { officeUnit?: string; role?: string; status?: string; isSalesTeam?: boolean }): Promise<HrEmployee[]>;
  createHrEmployee(employee: InsertHrEmployee): Promise<HrEmployee>;
  updateHrEmployee(id: string, updates: Partial<InsertHrEmployee>): Promise<HrEmployee | undefined>;
  deleteHrEmployee(id: string): Promise<boolean>;
  
  // Employee Documents
  getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]>;
  createEmployeeDocument(doc: InsertEmployeeDocument): Promise<EmployeeDocument>;
  deleteEmployeeDocument(id: string): Promise<boolean>;
  
  // Assets
  getAsset(id: string): Promise<Asset | undefined>;
  getAssets(filters?: { category?: string; status?: string; location?: string }): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, updates: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string): Promise<boolean>;
  
  // Asset Assignments
  getAssetAssignments(assetId: string): Promise<AssetAssignment[]>;
  getEmployeeAssets(employeeId: string): Promise<AssetAssignment[]>;
  createAssetAssignment(assignment: InsertAssetAssignment): Promise<AssetAssignment>;
  updateAssetAssignment(id: string, updates: Partial<InsertAssetAssignment>): Promise<AssetAssignment | undefined>;
  
  // Asset Maintenance
  getAssetMaintenance(assetId: string): Promise<AssetMaintenance[]>;
  createAssetMaintenance(maintenance: InsertAssetMaintenance): Promise<AssetMaintenance>;
  updateAssetMaintenance(id: string, updates: Partial<InsertAssetMaintenance>): Promise<AssetMaintenance | undefined>;
  deleteAssetMaintenance(id: string): Promise<boolean>;
  
  // Attendance
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendanceByEmployee(employeeId: string): Promise<Attendance[]>;
  getAttendanceByDateRange(employeeId: string, startDate: Date, endDate: Date): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;
  bulkCreateAttendance(records: InsertAttendance[]): Promise<Attendance[]>;
  
  // Leave Requests
  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsByStatus(status: string): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined>;
  deleteLeaveRequest(id: string): Promise<boolean>;
  
  // Job Openings
  getJobOpening(id: string): Promise<JobOpening | undefined>;
  getJobOpenings(): Promise<JobOpening[]>;
  getJobOpeningsByStatus(status: string): Promise<JobOpening[]>;
  createJobOpening(opening: InsertJobOpening): Promise<JobOpening>;
  updateJobOpening(id: string, updates: Partial<InsertJobOpening>): Promise<JobOpening | undefined>;
  deleteJobOpening(id: string): Promise<boolean>;

  // Job Portals
  getJobPortals(): Promise<JobPortal[]>;
  getJobPortal(id: string): Promise<JobPortal | undefined>;
  createJobPortal(portal: InsertJobPortal): Promise<JobPortal>;
  updateJobPortal(id: string, updates: Partial<InsertJobPortal>): Promise<JobPortal | undefined>;
  deleteJobPortal(id: string): Promise<boolean>;

  // Candidates
  getCandidates(filters?: { status?: string; source?: string; appliedFor?: string }): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  getCandidateByPhone(phone: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;
  bulkCreateCandidates(candidateList: InsertCandidate[]): Promise<Candidate[]>;

  // Candidate Calls
  getCandidateCalls(candidateId: string): Promise<CandidateCall[]>;
  getCandidateCall(id: string): Promise<CandidateCall | undefined>;
  createCandidateCall(call: InsertCandidateCall): Promise<CandidateCall>;
  updateCandidateCall(id: string, updates: Partial<InsertCandidateCall>): Promise<CandidateCall | undefined>;
  deleteCandidateCall(id: string): Promise<boolean>;
  getRecentCalls(limit?: number): Promise<CandidateCall[]>;

  // HR Templates
  getHrTemplates(filters?: { category?: string; type?: string }): Promise<HrTemplate[]>;
  getHrTemplate(id: string): Promise<HrTemplate | undefined>;
  createHrTemplate(template: InsertHrTemplate): Promise<HrTemplate>;
  updateHrTemplate(id: string, updates: Partial<InsertHrTemplate>): Promise<HrTemplate | undefined>;
  deleteHrTemplate(id: string): Promise<boolean>;
  incrementHrTemplateUsage(id: string): Promise<void>;

  // Interviews
  getInterviews(filter?: 'upcoming' | 'past'): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview | undefined>;
  deleteInterview(id: string): Promise<boolean>;
  bulkCreateInterviews(interviewList: InsertInterview[]): Promise<Interview[]>;

  // Website Content
  getWebsiteContent(): Promise<WebsiteContent[]>;
  getWebsiteContentBySection(section: string): Promise<WebsiteContent[]>;
  upsertWebsiteContent(section: string, key: string, value: any, updatedBy?: string): Promise<WebsiteContent>;

  // Payment Requests
  getPaymentRequests(): Promise<PaymentRequest[]>;
  getPaymentRequest(id: string): Promise<PaymentRequest | undefined>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequest(id: string, updates: Partial<InsertPaymentRequest>): Promise<PaymentRequest | undefined>;
  deletePaymentRequest(id: string): Promise<boolean>;

  // Booking Types
  getBookingTypes(userId?: string): Promise<BookingType[]>;
  getBookingType(id: string): Promise<BookingType | undefined>;
  getBookingTypeBySlug(slug: string): Promise<BookingType | undefined>;
  createBookingType(bt: InsertBookingType): Promise<BookingType>;
  updateBookingType(id: string, updates: Partial<InsertBookingType>): Promise<BookingType | undefined>;
  deleteBookingType(id: string): Promise<boolean>;

  // Availability Schedules
  getAvailabilitySchedules(userId: string): Promise<AvailabilitySchedule[]>;
  setAvailabilitySchedules(userId: string, schedules: InsertAvailabilitySchedule[]): Promise<AvailabilitySchedule[]>;

  // Availability Overrides
  getAvailabilityOverrides(userId: string, fromDate?: string, toDate?: string): Promise<AvailabilityOverride[]>;
  createAvailabilityOverride(override: InsertAvailabilityOverride): Promise<AvailabilityOverride>;
  deleteAvailabilityOverride(id: string): Promise<boolean>;

  // Bookings
  getBookings(options?: { hostUserId?: string; status?: string; from?: string; to?: string }): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByCancelToken(token: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  getBookingsForSlotCheck(hostUserId: string, date: string): Promise<Booking[]>;
}

export class Storage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data ? toCamelCase<User>(data) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data ? toCamelCase<User>(data) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data } = await supabase.from('users').insert(toSnakeCase(user)).select().single();
    return toCamelCase<User>(data!);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const { data } = await supabase.from('users').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<User>(data) : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
  }

  async getAllUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*');
    return toCamelCaseArray<User>(data ?? []);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').eq('role', role);
    return toCamelCaseArray<User>(data ?? []);
  }

  // Leads
  async getLead(id: string): Promise<Lead | undefined> {
    const { data } = await supabase.from('leads').select('*').eq('id', id).single();
    return data ? toCamelCase<Lead>(data) : undefined;
  }

  async getLeadByPhone(phone: string): Promise<Lead | undefined> {
    const normalizedPhone = phone.replace(/\D/g, '');
    const { data } = await supabase.from('leads').select('*').eq('phone', normalizedPhone).single();
    return data ? toCamelCase<Lead>(data) : undefined;
  }

  async getLeads(options?: { userId?: string; teamId?: string; role?: string }): Promise<Lead[]> {
    const { userId, teamId, role } = options || {};
    let query = supabase.from('leads').select('*');
    
    if (role === 'superadmin' && !teamId) {
      const { data } = await query.order('created_at', { ascending: false });
      return toCamelCaseArray<Lead>(data ?? []);
    }
    
    if (teamId) {
      query = query.eq('team_id', teamId);
    }
    if (userId) {
      query = query.eq('assigned_to', userId);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    return toCamelCaseArray<Lead>(data ?? []);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const { data } = await supabase.from('leads').insert(toSnakeCase(lead as any)).select().single();
    return toCamelCase<Lead>(data!);
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const { data } = await supabase.from('leads').update(toSnakeCase(updates as any)).eq('id', id).select().single();
    return data ? toCamelCase<Lead>(data) : undefined;
  }

  async deleteLead(id: string): Promise<boolean> {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    return !error;
  }

  async getLeadsByStage(stage: string, userId?: string): Promise<Lead[]> {
    let query = supabase.from('leads').select('*').eq('stage', stage);
    if (userId) {
      query = query.eq('assigned_to', userId);
    }
    const { data } = await query.order('created_at', { ascending: false });
    return toCamelCaseArray<Lead>(data ?? []);
  }

  async assignLead(leadId: string, userId: string | null): Promise<Lead | undefined> {
    const { data } = await supabase.from('leads').update({ assigned_to: userId }).eq('id', leadId).select().single();
    return data ? toCamelCase<Lead>(data) : undefined;
  }

  // Activities
  async getActivity(id: string): Promise<Activity | undefined> {
    const { data } = await supabase.from('activities').select('*').eq('id', id).single();
    return data ? toCamelCase<Activity>(data) : undefined;
  }

  async getActivities(leadId?: string, userId?: string): Promise<Activity[]> {
    let query = supabase.from('activities').select('*');
    if (leadId) {
      query = query.eq('lead_id', leadId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data } = await query.order('created_at', { ascending: false });
    return toCamelCaseArray<Activity>(data ?? []);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const { data } = await supabase.from('activities').insert(toSnakeCase(activity)).select().single();
    return toCamelCase<Activity>(data!);
  }

  async deleteActivity(id: string): Promise<boolean> {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    return !error;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
    return data ? toCamelCase<Task>(data) : undefined;
  }

  async getTasks(options?: { userId?: string; teamId?: string }): Promise<Task[]> {
    const { userId, teamId } = options || {};
    let query = supabase.from('tasks').select('*');
    if (teamId) {
      query = query.eq('team_id', teamId);
    }
    if (userId) {
      query = query.eq('assigned_to', userId);
    }
    const { data } = await query.order('due_date', { ascending: false });
    return toCamelCaseArray<Task>(data ?? []);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const { data } = await supabase.from('tasks').insert(toSnakeCase(task as any)).select().single();
    return toCamelCase<Task>(data!);
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const { data } = await supabase.from('tasks').update(toSnakeCase(updates as any)).eq('id', id).select().single();
    return data ? toCamelCase<Task>(data) : undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    return !error;
  }

  // Services
  async getService(id: string): Promise<Service | undefined> {
    const { data } = await supabase.from('services').select('*').eq('id', id).single();
    return data ? toCamelCase<Service>(data) : undefined;
  }

  async getServices(): Promise<Service[]> {
    const { data } = await supabase.from('services').select('*').eq('is_active', true);
    return toCamelCaseArray<Service>(data ?? []);
  }

  async createService(service: InsertService): Promise<Service> {
    const { data } = await supabase.from('services').insert(toSnakeCase(service)).select().single();
    return toCamelCase<Service>(data!);
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const { data } = await supabase.from('services').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<Service>(data) : undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    const { data } = await supabase.from('templates').select('*').eq('id', id).single();
    return data ? toCamelCase<Template>(data) : undefined;
  }

  async getTemplates(type?: string): Promise<Template[]> {
    let query = supabase.from('templates').select('*');
    if (type) {
      query = query.eq('type', type);
    }
    const { data } = await query;
    return toCamelCaseArray<Template>(data ?? []);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const { data } = await supabase.from('templates').insert(toSnakeCase(template)).select().single();
    return toCamelCase<Template>(data!);
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    const { data } = await supabase.from('templates').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<Template>(data) : undefined;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    return !error;
  }

  // Employees
  async getEmployee(id: string): Promise<Employee | undefined> {
    const { data } = await supabase.from('employees').select('*').eq('id', id).single();
    return data ? toCamelCase<Employee>(data) : undefined;
  }

  async getEmployees(): Promise<Employee[]> {
    const { data } = await supabase.from('employees').select('*').order('display_order', { ascending: true });
    return toCamelCaseArray<Employee>(data ?? []);
  }

  async getActiveEmployees(): Promise<Employee[]> {
    const { data } = await supabase.from('employees').select('*').eq('is_active', true).order('display_order', { ascending: true });
    return toCamelCaseArray<Employee>(data ?? []);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const { data } = await supabase.from('employees').insert(toSnakeCase(employee)).select().single();
    return toCamelCase<Employee>(data!);
  }

  async updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const { data } = await supabase.from('employees').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<Employee>(data) : undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    return !error;
  }

  // Travel Packages
  async getTravelPackage(id: string): Promise<TravelPackage | undefined> {
    const { data } = await supabase.from('travel_packages').select('*').eq('id', id).single();
    return data ? toCamelCase<TravelPackage>(data) : undefined;
  }

  async getTravelPackageBySlug(slug: string): Promise<TravelPackage | undefined> {
    const { data } = await supabase.from('travel_packages').select('*').eq('slug', slug).single();
    return data ? toCamelCase<TravelPackage>(data) : undefined;
  }

  async getTravelPackages(): Promise<TravelPackage[]> {
    const { data } = await supabase.from('travel_packages').select('*').order('display_order', { ascending: true });
    return toCamelCaseArray<TravelPackage>(data ?? []);
  }

  async getActiveTravelPackages(): Promise<TravelPackage[]> {
    const { data } = await supabase.from('travel_packages').select('*').eq('is_active', true).order('display_order', { ascending: true });
    return toCamelCaseArray<TravelPackage>(data ?? []);
  }

  async getFeaturedTravelPackages(): Promise<TravelPackage[]> {
    const { data } = await supabase.from('travel_packages').select('*').eq('is_active', true).eq('is_featured', true).order('display_order', { ascending: true });
    return toCamelCaseArray<TravelPackage>(data ?? []);
  }

  async createTravelPackage(pkg: InsertTravelPackage): Promise<TravelPackage> {
    const { data } = await supabase.from('travel_packages').insert(toSnakeCase(pkg as any)).select().single();
    return toCamelCase<TravelPackage>(data!);
  }

  async updateTravelPackage(id: string, updates: Partial<InsertTravelPackage>): Promise<TravelPackage | undefined> {
    const { data } = await supabase.from('travel_packages').update(toSnakeCase(updates as any)).eq('id', id).select().single();
    return data ? toCamelCase<TravelPackage>(data) : undefined;
  }

  async deleteTravelPackage(id: string): Promise<boolean> {
    const { error } = await supabase.from('travel_packages').delete().eq('id', id);
    return !error;
  }

  // Travel Bookings
  async createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking> {
    const { data } = await supabase.from('travel_bookings').insert(toSnakeCase(booking)).select().single();
    return toCamelCase<TravelBooking>(data!);
  }

  async getTravelBooking(id: string): Promise<TravelBooking | undefined> {
    const { data } = await supabase.from('travel_bookings').select('*').eq('id', id).single();
    return data ? toCamelCase<TravelBooking>(data) : undefined;
  }

  async getTravelBookingByOrderId(orderId: string): Promise<TravelBooking | undefined> {
    const { data } = await supabase.from('travel_bookings').select('*').eq('razorpay_order_id', orderId).single();
    return data ? toCamelCase<TravelBooking>(data) : undefined;
  }

  async updateTravelBooking(id: string, updates: Partial<TravelBooking>): Promise<TravelBooking | undefined> {
    const snakeUpdates = toSnakeCase(updates as any);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('travel_bookings').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<TravelBooking>(data) : undefined;
  }

  async getTravelBookings(): Promise<TravelBooking[]> {
    const { data } = await supabase.from('travel_bookings').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<TravelBooking>(data ?? []);
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    const { data } = await supabase.from('events').select('*').eq('id', id).single();
    return data ? toCamelCase<Event>(data) : undefined;
  }

  async getEvents(): Promise<Event[]> {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    return toCamelCaseArray<Event>(data ?? []);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    const { data } = await supabase.from('events').select('*')
      .neq('status', 'cancelled')
      .neq('status', 'draft')
      .gte('date', now.toISOString())
      .order('date', { ascending: true });
    return toCamelCaseArray<Event>(data ?? []);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const { data } = await supabase.from('events').insert(toSnakeCase(event)).select().single();
    return toCamelCase<Event>(data!);
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const { data } = await supabase.from('events').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<Event>(data) : undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    return !error;
  }

  // Event Attendees
  async getEventAttendee(id: string): Promise<EventAttendee | undefined> {
    const { data } = await supabase.from('event_attendees').select('*').eq('id', id).single();
    return data ? toCamelCase<EventAttendee>(data) : undefined;
  }

  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    const { data } = await supabase.from('event_attendees').select('*').eq('event_id', eventId).order('created_at', { ascending: true });
    return toCamelCaseArray<EventAttendee>(data ?? []);
  }

  async createEventAttendee(attendee: InsertEventAttendee): Promise<EventAttendee> {
    const { data } = await supabase.from('event_attendees').insert(toSnakeCase(attendee)).select().single();
    return toCamelCase<EventAttendee>(data!);
  }

  async updateEventAttendee(id: string, updates: Partial<InsertEventAttendee>): Promise<EventAttendee | undefined> {
    const { data } = await supabase.from('event_attendees').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventAttendee>(data) : undefined;
  }

  async deleteEventAttendee(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_attendees').delete().eq('id', id);
    return !error;
  }

  async checkInAttendee(id: string): Promise<EventAttendee | undefined> {
    const { data } = await supabase.from('event_attendees')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', id).select().single();
    return data ? toCamelCase<EventAttendee>(data) : undefined;
  }

  // Event Hotels
  async getEventHotels(eventId: string): Promise<EventHotel[]> {
    const { data } = await supabase.from('event_hotels').select('*').eq('event_id', eventId).order('check_in', { ascending: true });
    return toCamelCaseArray<EventHotel>(data ?? []);
  }

  async createEventHotel(hotel: InsertEventHotel): Promise<EventHotel> {
    const { data } = await supabase.from('event_hotels').insert(toSnakeCase(hotel)).select().single();
    return toCamelCase<EventHotel>(data!);
  }

  async updateEventHotel(id: string, updates: Partial<InsertEventHotel>): Promise<EventHotel | undefined> {
    const { data } = await supabase.from('event_hotels').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventHotel>(data) : undefined;
  }

  async deleteEventHotel(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_hotels').delete().eq('id', id);
    return !error;
  }

  // Event Flights
  async getEventFlights(eventId: string): Promise<EventFlight[]> {
    const { data } = await supabase.from('event_flights').select('*').eq('event_id', eventId).order('departure_time', { ascending: true });
    return toCamelCaseArray<EventFlight>(data ?? []);
  }

  async createEventFlight(flight: InsertEventFlight): Promise<EventFlight> {
    const { data } = await supabase.from('event_flights').insert(toSnakeCase(flight)).select().single();
    return toCamelCase<EventFlight>(data!);
  }

  async updateEventFlight(id: string, updates: Partial<InsertEventFlight>): Promise<EventFlight | undefined> {
    const { data } = await supabase.from('event_flights').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventFlight>(data) : undefined;
  }

  async deleteEventFlight(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_flights').delete().eq('id', id);
    return !error;
  }

  // Event Creatives
  async getEventCreatives(eventId: string): Promise<EventCreative[]> {
    const { data } = await supabase.from('event_creatives').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
    return toCamelCaseArray<EventCreative>(data ?? []);
  }

  async createEventCreative(creative: InsertEventCreative): Promise<EventCreative> {
    const { data } = await supabase.from('event_creatives').insert(toSnakeCase(creative)).select().single();
    return toCamelCase<EventCreative>(data!);
  }

  async updateEventCreative(id: string, updates: Partial<InsertEventCreative>): Promise<EventCreative | undefined> {
    const { data } = await supabase.from('event_creatives').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventCreative>(data) : undefined;
  }

  async deleteEventCreative(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_creatives').delete().eq('id', id);
    return !error;
  }

  // Event Packing Items
  async getEventPackingItems(eventId: string): Promise<EventPackingItem[]> {
    const { data } = await supabase.from('event_packing_items').select('*').eq('event_id', eventId).order('category', { ascending: true });
    return toCamelCaseArray<EventPackingItem>(data ?? []);
  }

  async createEventPackingItem(item: InsertEventPackingItem): Promise<EventPackingItem> {
    const { data } = await supabase.from('event_packing_items').insert(toSnakeCase(item)).select().single();
    return toCamelCase<EventPackingItem>(data!);
  }

  async updateEventPackingItem(id: string, updates: Partial<InsertEventPackingItem>): Promise<EventPackingItem | undefined> {
    const { data } = await supabase.from('event_packing_items').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventPackingItem>(data) : undefined;
  }

  async deleteEventPackingItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_packing_items').delete().eq('id', id);
    return !error;
  }

  // Event Communications
  async getEventCommunications(eventId: string): Promise<EventCommunication[]> {
    const { data } = await supabase.from('event_communications').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
    return toCamelCaseArray<EventCommunication>(data ?? []);
  }

  async createEventCommunication(comm: InsertEventCommunication): Promise<EventCommunication> {
    const { data } = await supabase.from('event_communications').insert(toSnakeCase(comm)).select().single();
    return toCamelCase<EventCommunication>(data!);
  }

  async updateEventCommunication(id: string, updates: Partial<InsertEventCommunication>): Promise<EventCommunication | undefined> {
    const { data } = await supabase.from('event_communications').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventCommunication>(data) : undefined;
  }

  async deleteEventCommunication(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_communications').delete().eq('id', id);
    return !error;
  }

  // Event Presentations
  async getEventPresentations(eventId: string): Promise<EventPresentation[]> {
    const { data } = await supabase.from('event_presentations').select('*').eq('event_id', eventId).order('order', { ascending: true });
    return toCamelCaseArray<EventPresentation>(data ?? []);
  }

  async createEventPresentation(pres: InsertEventPresentation): Promise<EventPresentation> {
    const { data } = await supabase.from('event_presentations').insert(toSnakeCase(pres)).select().single();
    return toCamelCase<EventPresentation>(data!);
  }

  async updateEventPresentation(id: string, updates: Partial<InsertEventPresentation>): Promise<EventPresentation | undefined> {
    const { data } = await supabase.from('event_presentations').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventPresentation>(data) : undefined;
  }

  async deleteEventPresentation(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_presentations').delete().eq('id', id);
    return !error;
  }

  // Event Team Contacts
  async getEventTeamContacts(eventId: string): Promise<EventTeamContact[]> {
    const { data } = await supabase.from('event_team_contacts').select('*')
      .eq('event_id', eventId)
      .order('role', { ascending: true })
      .order('name', { ascending: true });
    return toCamelCaseArray<EventTeamContact>(data ?? []);
  }

  async createEventTeamContact(contact: InsertEventTeamContact): Promise<EventTeamContact> {
    const { data } = await supabase.from('event_team_contacts').insert(toSnakeCase(contact)).select().single();
    return toCamelCase<EventTeamContact>(data!);
  }

  async updateEventTeamContact(id: string, updates: Partial<InsertEventTeamContact>): Promise<EventTeamContact | undefined> {
    const { data } = await supabase.from('event_team_contacts').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventTeamContact>(data) : undefined;
  }

  async deleteEventTeamContact(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_team_contacts').delete().eq('id', id);
    return !error;
  }

  // Venue Comparisons
  async getVenueComparisons(city?: string): Promise<VenueComparison[]> {
    let query = supabase.from('venue_comparisons').select('*');
    if (city) {
      query = query.eq('city', city);
      const { data } = await query
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      return toCamelCaseArray<VenueComparison>(data ?? []);
    }
    const { data } = await query
      .order('city', { ascending: true })
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    return toCamelCaseArray<VenueComparison>(data ?? []);
  }

  async getVenueComparison(id: string): Promise<VenueComparison | undefined> {
    const { data } = await supabase.from('venue_comparisons').select('*').eq('id', id).single();
    return data ? toCamelCase<VenueComparison>(data) : undefined;
  }

  async createVenueComparison(venue: InsertVenueComparison): Promise<VenueComparison> {
    const { data } = await supabase.from('venue_comparisons').insert(toSnakeCase(venue)).select().single();
    return toCamelCase<VenueComparison>(data!);
  }

  async updateVenueComparison(id: string, updates: Partial<InsertVenueComparison>): Promise<VenueComparison | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('venue_comparisons').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<VenueComparison>(data) : undefined;
  }

  async deleteVenueComparison(id: string): Promise<boolean> {
    const { error } = await supabase.from('venue_comparisons').delete().eq('id', id);
    return !error;
  }

  // Event Vendors
  async getEventVendors(eventId: string): Promise<EventVendor[]> {
    const { data } = await supabase.from('event_vendors').select('*')
      .eq('event_id', eventId)
      .order('category', { ascending: true })
      .order('vendor_name', { ascending: true });
    return toCamelCaseArray<EventVendor>(data ?? []);
  }

  async getEventVendor(id: string): Promise<EventVendor | undefined> {
    const { data } = await supabase.from('event_vendors').select('*').eq('id', id).single();
    return data ? toCamelCase<EventVendor>(data) : undefined;
  }

  async createEventVendor(vendor: InsertEventVendor): Promise<EventVendor> {
    const { data } = await supabase.from('event_vendors').insert(toSnakeCase(vendor)).select().single();
    return toCamelCase<EventVendor>(data!);
  }

  async updateEventVendor(id: string, updates: Partial<InsertEventVendor>): Promise<EventVendor | undefined> {
    const { data } = await supabase.from('event_vendors').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventVendor>(data) : undefined;
  }

  async deleteEventVendor(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_vendors').delete().eq('id', id);
    return !error;
  }

  // Event Vendor Items
  async getEventVendorItems(vendorId: string): Promise<EventVendorItem[]> {
    const { data } = await supabase.from('event_vendor_items').select('*')
      .eq('vendor_id', vendorId)
      .order('item_name', { ascending: true });
    return toCamelCaseArray<EventVendorItem>(data ?? []);
  }

  async createEventVendorItem(item: InsertEventVendorItem): Promise<EventVendorItem> {
    const { data } = await supabase.from('event_vendor_items').insert(toSnakeCase(item)).select().single();
    return toCamelCase<EventVendorItem>(data!);
  }

  async updateEventVendorItem(id: string, updates: Partial<InsertEventVendorItem>): Promise<EventVendorItem | undefined> {
    const { data } = await supabase.from('event_vendor_items').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<EventVendorItem>(data) : undefined;
  }

  async deleteEventVendorItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('event_vendor_items').delete().eq('id', id);
    return !error;
  }

  // Channels
  async getChannel(id: string): Promise<Channel | undefined> {
    const { data } = await supabase.from('channels').select('*').eq('id', id).single();
    return data ? toCamelCase<Channel>(data) : undefined;
  }

  async getChannelByTeamId(teamId: string): Promise<Channel | undefined> {
    const { data } = await supabase.from('channels').select('*').eq('team_id', teamId).single();
    return data ? toCamelCase<Channel>(data) : undefined;
  }

  async getChannels(): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').order('name', { ascending: true });
    return toCamelCaseArray<Channel>(data ?? []);
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const { data } = await supabase.from('channels').insert(toSnakeCase(channel)).select().single();
    return toCamelCase<Channel>(data!);
  }

  // Channel Messages
  async getChannelMessages(channelId: string): Promise<ChannelMessage[]> {
    const { data } = await supabase.from('channel_messages').select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
    return toCamelCaseArray<ChannelMessage>(data ?? []);
  }

  async createChannelMessage(message: InsertChannelMessage): Promise<ChannelMessage> {
    const { data } = await supabase.from('channel_messages').insert(toSnakeCase(message)).select().single();
    return toCamelCase<ChannelMessage>(data!);
  }

  // Team Members
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data } = await supabase.from('team_members').select('*')
      .eq('team_id', teamId)
      .order('role', { ascending: false })
      .order('created_at', { ascending: true });
    return toCamelCaseArray<TeamMember>(data ?? []);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const { data } = await supabase.from('team_members').select('*').eq('id', id).single();
    return data ? toCamelCase<TeamMember>(data) : undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const { data } = await supabase.from('team_members').insert(toSnakeCase(member)).select().single();
    return toCamelCase<TeamMember>(data!);
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    return !error;
  }

  async getUserTeams(userId: string): Promise<TeamMember[]> {
    const { data } = await supabase.from('team_members').select('*').eq('user_id', userId);
    return toCamelCaseArray<TeamMember>(data ?? []);
  }

  // Direct Message Conversations
  async getDirectMessageConversations(userId: string): Promise<DirectMessageConversation[]> {
    const { data } = await supabase.from('direct_message_conversations').select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    return toCamelCaseArray<DirectMessageConversation>(data ?? []);
  }

  async getDirectMessageConversation(id: string): Promise<DirectMessageConversation | undefined> {
    const { data } = await supabase.from('direct_message_conversations').select('*').eq('id', id).single();
    return data ? toCamelCase<DirectMessageConversation>(data) : undefined;
  }

  async getOrCreateDirectMessageConversation(user1Id: string, user2Id: string): Promise<DirectMessageConversation> {
    const { data: existing } = await supabase.from('direct_message_conversations').select('*')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`);
    
    if (existing && existing.length > 0) {
      return toCamelCase<DirectMessageConversation>(existing[0]);
    }

    const { data } = await supabase.from('direct_message_conversations')
      .insert({ user1_id: user1Id, user2_id: user2Id })
      .select().single();
    return toCamelCase<DirectMessageConversation>(data!);
  }

  // Direct Messages
  async getDirectMessages(conversationId: string): Promise<DirectMessage[]> {
    const { data } = await supabase.from('direct_messages').select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return toCamelCaseArray<DirectMessage>(data ?? []);
  }

  async createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    const { data } = await supabase.from('direct_messages').insert(toSnakeCase(message)).select().single();
    await supabase.from('direct_message_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', message.conversationId);
    return toCamelCase<DirectMessage>(data!);
  }

  async markDirectMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase.from('direct_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const conversations = await this.getDirectMessageConversations(userId);
    let count = 0;
    for (const conv of conversations) {
      const { count: unreadCount } = await supabase.from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', userId);
      count += (unreadCount || 0);
    }
    return count;
  }

  // HR Employees
  async getHrEmployee(id: string): Promise<HrEmployee | undefined> {
    const { data } = await supabase.from('hr_employees').select('*').eq('id', id).single();
    return data ? toCamelCase<HrEmployee>(data) : undefined;
  }

  async getHrEmployees(filters?: { officeUnit?: string; role?: string; status?: string; isSalesTeam?: boolean }): Promise<HrEmployee[]> {
    let query = supabase.from('hr_employees').select('*');
    if (filters?.officeUnit) query = query.eq('office_unit', filters.officeUnit);
    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.isSalesTeam !== undefined) query = query.eq('is_sales_team', filters.isSalesTeam);
    
    const { data } = await query.order('name', { ascending: true });
    return toCamelCaseArray<HrEmployee>(data ?? []);
  }

  async createHrEmployee(employee: InsertHrEmployee): Promise<HrEmployee> {
    const { data } = await supabase.from('hr_employees').insert(toSnakeCase(employee)).select().single();
    return toCamelCase<HrEmployee>(data!);
  }

  async updateHrEmployee(id: string, updates: Partial<InsertHrEmployee>): Promise<HrEmployee | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('hr_employees').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<HrEmployee>(data) : undefined;
  }

  async deleteHrEmployee(id: string): Promise<boolean> {
    const { error } = await supabase.from('hr_employees').delete().eq('id', id);
    return !error;
  }

  // Employee Documents
  async getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    const { data } = await supabase.from('employee_documents').select('*')
      .eq('employee_id', employeeId)
      .order('uploaded_at', { ascending: false });
    return toCamelCaseArray<EmployeeDocument>(data ?? []);
  }

  async createEmployeeDocument(doc: InsertEmployeeDocument): Promise<EmployeeDocument> {
    const { data } = await supabase.from('employee_documents').insert(toSnakeCase(doc)).select().single();
    return toCamelCase<EmployeeDocument>(data!);
  }

  async deleteEmployeeDocument(id: string): Promise<boolean> {
    const { error } = await supabase.from('employee_documents').delete().eq('id', id);
    return !error;
  }

  // Assets
  async getAsset(id: string): Promise<Asset | undefined> {
    const { data } = await supabase.from('assets').select('*').eq('id', id).single();
    return data ? toCamelCase<Asset>(data) : undefined;
  }

  async getAssets(filters?: { category?: string; status?: string; location?: string }): Promise<Asset[]> {
    let query = supabase.from('assets').select('*');
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.location) query = query.eq('location', filters.location);
    
    const { data } = await query.order('created_at', { ascending: false });
    return toCamelCaseArray<Asset>(data ?? []);
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const { data } = await supabase.from('assets').insert(toSnakeCase(asset)).select().single();
    return toCamelCase<Asset>(data!);
  }

  async updateAsset(id: string, updates: Partial<InsertAsset>): Promise<Asset | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('assets').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<Asset>(data) : undefined;
  }

  async deleteAsset(id: string): Promise<boolean> {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    return !error;
  }

  // Asset Assignments
  async getAssetAssignments(assetId: string): Promise<AssetAssignment[]> {
    const { data } = await supabase.from('asset_assignments').select('*')
      .eq('asset_id', assetId)
      .order('assigned_date', { ascending: false });
    return toCamelCaseArray<AssetAssignment>(data ?? []);
  }

  async getEmployeeAssets(employeeId: string): Promise<AssetAssignment[]> {
    const { data } = await supabase.from('asset_assignments').select('*')
      .eq('employee_id', employeeId)
      .is('returned_date', null)
      .order('assigned_date', { ascending: false });
    return toCamelCaseArray<AssetAssignment>(data ?? []);
  }

  async createAssetAssignment(assignment: InsertAssetAssignment): Promise<AssetAssignment> {
    const { data } = await supabase.from('asset_assignments').insert(toSnakeCase(assignment)).select().single();
    return toCamelCase<AssetAssignment>(data!);
  }

  async updateAssetAssignment(id: string, updates: Partial<InsertAssetAssignment>): Promise<AssetAssignment | undefined> {
    const { data } = await supabase.from('asset_assignments').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<AssetAssignment>(data) : undefined;
  }

  // Asset Maintenance
  async getAssetMaintenance(assetId: string): Promise<AssetMaintenance[]> {
    const { data } = await supabase.from('asset_maintenance').select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });
    return toCamelCaseArray<AssetMaintenance>(data ?? []);
  }

  async createAssetMaintenance(maintenance: InsertAssetMaintenance): Promise<AssetMaintenance> {
    const { data } = await supabase.from('asset_maintenance').insert(toSnakeCase(maintenance)).select().single();
    return toCamelCase<AssetMaintenance>(data!);
  }

  async updateAssetMaintenance(id: string, updates: Partial<InsertAssetMaintenance>): Promise<AssetMaintenance | undefined> {
    const { data } = await supabase.from('asset_maintenance').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<AssetMaintenance>(data) : undefined;
  }

  async deleteAssetMaintenance(id: string): Promise<boolean> {
    const { error } = await supabase.from('asset_maintenance').delete().eq('id', id);
    return !error;
  }

  // Attendance methods
  async getAttendance(id: string): Promise<Attendance | undefined> {
    const { data } = await supabase.from('attendance').select('*').eq('id', id).single();
    return data ? toCamelCase<Attendance>(data) : undefined;
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data } = await supabase.from('attendance').select('*')
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .order('employee_id', { ascending: true });
    return toCamelCaseArray<Attendance>(data ?? []);
  }

  async getAttendanceByEmployee(employeeId: string): Promise<Attendance[]> {
    const { data } = await supabase.from('attendance').select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false });
    return toCamelCaseArray<Attendance>(data ?? []);
  }

  async getAttendanceByDateRange(employeeId: string, startDate: Date, endDate: Date): Promise<Attendance[]> {
    const { data } = await supabase.from('attendance').select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });
    return toCamelCaseArray<Attendance>(data ?? []);
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const { data } = await supabase.from('attendance').insert(toSnakeCase(record)).select().single();
    return toCamelCase<Attendance>(data!);
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const { data } = await supabase.from('attendance').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<Attendance>(data) : undefined;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    return !error;
  }

  async bulkCreateAttendance(records: InsertAttendance[]): Promise<Attendance[]> {
    if (records.length === 0) return [];
    const snakeRecords = records.map(r => toSnakeCase(r));
    const { data } = await supabase.from('attendance').insert(snakeRecords).select();
    return toCamelCaseArray<Attendance>(data ?? []);
  }

  // Leave Request methods
  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    const { data } = await supabase.from('leave_requests').select('*').eq('id', id).single();
    return data ? toCamelCase<LeaveRequest>(data) : undefined;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const { data } = await supabase.from('leave_requests').select('*').order('applied_at', { ascending: false });
    return toCamelCaseArray<LeaveRequest>(data ?? []);
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    const { data } = await supabase.from('leave_requests').select('*')
      .eq('employee_id', employeeId)
      .order('applied_at', { ascending: false });
    return toCamelCaseArray<LeaveRequest>(data ?? []);
  }

  async getLeaveRequestsByStatus(status: string): Promise<LeaveRequest[]> {
    const { data } = await supabase.from('leave_requests').select('*')
      .eq('status', status)
      .order('applied_at', { ascending: false });
    return toCamelCaseArray<LeaveRequest>(data ?? []);
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const { data } = await supabase.from('leave_requests').insert(toSnakeCase(request)).select().single();
    return toCamelCase<LeaveRequest>(data!);
  }

  async updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined> {
    const { data } = await supabase.from('leave_requests').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<LeaveRequest>(data) : undefined;
  }

  async deleteLeaveRequest(id: string): Promise<boolean> {
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    return !error;
  }

  // Job Openings
  async getJobOpening(id: string): Promise<JobOpening | undefined> {
    const { data } = await supabase.from('job_openings').select('*').eq('id', id).single();
    return data ? toCamelCase<JobOpening>(data) : undefined;
  }

  async getJobOpenings(): Promise<JobOpening[]> {
    const { data } = await supabase.from('job_openings').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<JobOpening>(data ?? []);
  }

  async getJobOpeningsByStatus(status: string): Promise<JobOpening[]> {
    const { data } = await supabase.from('job_openings').select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    return toCamelCaseArray<JobOpening>(data ?? []);
  }

  async createJobOpening(opening: InsertJobOpening): Promise<JobOpening> {
    const { data } = await supabase.from('job_openings').insert(toSnakeCase(opening)).select().single();
    return toCamelCase<JobOpening>(data!);
  }

  async updateJobOpening(id: string, updates: Partial<InsertJobOpening>): Promise<JobOpening | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('job_openings').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<JobOpening>(data) : undefined;
  }

  async deleteJobOpening(id: string): Promise<boolean> {
    const { error } = await supabase.from('job_openings').delete().eq('id', id);
    return !error;
  }

  // Job Portals
  async getJobPortals(): Promise<JobPortal[]> {
    const { data } = await supabase.from('job_portals').select('*').order('name', { ascending: true });
    return toCamelCaseArray<JobPortal>(data ?? []);
  }

  async getJobPortal(id: string): Promise<JobPortal | undefined> {
    const { data } = await supabase.from('job_portals').select('*').eq('id', id).single();
    return data ? toCamelCase<JobPortal>(data) : undefined;
  }

  async createJobPortal(portal: InsertJobPortal): Promise<JobPortal> {
    const { data } = await supabase.from('job_portals').insert(toSnakeCase(portal)).select().single();
    return toCamelCase<JobPortal>(data!);
  }

  async updateJobPortal(id: string, updates: Partial<InsertJobPortal>): Promise<JobPortal | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('job_portals').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<JobPortal>(data) : undefined;
  }

  async deleteJobPortal(id: string): Promise<boolean> {
    const { error } = await supabase.from('job_portals').delete().eq('id', id);
    return !error;
  }

  // Candidates
  async getCandidates(filters?: { status?: string; source?: string; appliedFor?: string }): Promise<Candidate[]> {
    let query = supabase.from('candidates').select('*');
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.source) query = query.eq('source', filters.source);
    if (filters?.appliedFor) query = query.eq('applied_for', filters.appliedFor);
    
    const { data } = await query.order('created_at', { ascending: false });
    return toCamelCaseArray<Candidate>(data ?? []);
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    const { data } = await supabase.from('candidates').select('*').eq('id', id).single();
    return data ? toCamelCase<Candidate>(data) : undefined;
  }

  async getCandidateByPhone(phone: string): Promise<Candidate | undefined> {
    const { data } = await supabase.from('candidates').select('*').eq('phone', phone).single();
    return data ? toCamelCase<Candidate>(data) : undefined;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const { data } = await supabase.from('candidates').insert(toSnakeCase(candidate)).select().single();
    return toCamelCase<Candidate>(data!);
  }

  async updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('candidates').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<Candidate>(data) : undefined;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    return !error;
  }

  async bulkCreateCandidates(candidateList: InsertCandidate[]): Promise<Candidate[]> {
    if (candidateList.length === 0) return [];
    const snakeRecords = candidateList.map(c => toSnakeCase(c));
    const { data } = await supabase.from('candidates').insert(snakeRecords).select();
    return toCamelCaseArray<Candidate>(data ?? []);
  }

  // Candidate Calls
  async getCandidateCalls(candidateId: string): Promise<CandidateCall[]> {
    const { data } = await supabase.from('candidate_calls').select('*')
      .eq('candidate_id', candidateId)
      .order('call_date', { ascending: false });
    return toCamelCaseArray<CandidateCall>(data ?? []);
  }

  async getCandidateCall(id: string): Promise<CandidateCall | undefined> {
    const { data } = await supabase.from('candidate_calls').select('*').eq('id', id).single();
    return data ? toCamelCase<CandidateCall>(data) : undefined;
  }

  async createCandidateCall(call: InsertCandidateCall): Promise<CandidateCall> {
    const { data } = await supabase.from('candidate_calls').insert(toSnakeCase(call)).select().single();
    return toCamelCase<CandidateCall>(data!);
  }

  async updateCandidateCall(id: string, updates: Partial<InsertCandidateCall>): Promise<CandidateCall | undefined> {
    const { data } = await supabase.from('candidate_calls').update(toSnakeCase(updates)).eq('id', id).select().single();
    return data ? toCamelCase<CandidateCall>(data) : undefined;
  }

  async deleteCandidateCall(id: string): Promise<boolean> {
    const { error } = await supabase.from('candidate_calls').delete().eq('id', id);
    return !error;
  }

  async getRecentCalls(limit: number = 50): Promise<CandidateCall[]> {
    const { data } = await supabase.from('candidate_calls').select('*')
      .order('call_date', { ascending: false })
      .limit(limit);
    return toCamelCaseArray<CandidateCall>(data ?? []);
  }

  // HR Templates
  async getHrTemplates(filters?: { category?: string; type?: string }): Promise<HrTemplate[]> {
    let query = supabase.from('hr_templates').select('*');
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.type) query = query.eq('type', filters.type);
    
    const { data } = await query.order('name', { ascending: true });
    return toCamelCaseArray<HrTemplate>(data ?? []);
  }

  async getHrTemplate(id: string): Promise<HrTemplate | undefined> {
    const { data } = await supabase.from('hr_templates').select('*').eq('id', id).single();
    return data ? toCamelCase<HrTemplate>(data) : undefined;
  }

  async createHrTemplate(template: InsertHrTemplate): Promise<HrTemplate> {
    const { data } = await supabase.from('hr_templates').insert(toSnakeCase(template)).select().single();
    return toCamelCase<HrTemplate>(data!);
  }

  async updateHrTemplate(id: string, updates: Partial<InsertHrTemplate>): Promise<HrTemplate | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('hr_templates').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<HrTemplate>(data) : undefined;
  }

  async deleteHrTemplate(id: string): Promise<boolean> {
    const { error } = await supabase.from('hr_templates').delete().eq('id', id);
    return !error;
  }

  async incrementHrTemplateUsage(id: string): Promise<void> {
    const { data: existing } = await supabase.from('hr_templates').select('usage_count').eq('id', id).single();
    const currentCount = existing?.usage_count ?? 0;
    await supabase.from('hr_templates').update({ usage_count: currentCount + 1 }).eq('id', id);
  }

  // Interviews
  async getInterviews(filter?: 'upcoming' | 'past'): Promise<Interview[]> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let query = supabase.from('interviews').select('*');
    
    if (filter === 'upcoming') {
      const { data } = await query.gte('interview_date', now.toISOString()).order('interview_date', { ascending: true });
      return toCamelCaseArray<Interview>(data ?? []);
    } else if (filter === 'past') {
      const { data } = await query.lt('interview_date', now.toISOString()).order('interview_date', { ascending: false });
      return toCamelCaseArray<Interview>(data ?? []);
    }
    const { data } = await query.order('interview_date', { ascending: false });
    return toCamelCaseArray<Interview>(data ?? []);
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    const { data } = await supabase.from('interviews').select('*').eq('id', id).single();
    return data ? toCamelCase<Interview>(data) : undefined;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const { data } = await supabase.from('interviews').insert(toSnakeCase(interview)).select().single();
    return toCamelCase<Interview>(data!);
  }

  async updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('interviews').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<Interview>(data) : undefined;
  }

  async deleteInterview(id: string): Promise<boolean> {
    const { error } = await supabase.from('interviews').delete().eq('id', id);
    return !error;
  }

  async bulkCreateInterviews(interviewList: InsertInterview[]): Promise<Interview[]> {
    if (interviewList.length === 0) return [];
    const snakeRecords = interviewList.map(i => toSnakeCase(i));
    const { data } = await supabase.from('interviews').insert(snakeRecords).select();
    return toCamelCaseArray<Interview>(data ?? []);
  }

  // ============================================================================
  // FAIRE WHOLESALE METHODS
  // ============================================================================

  // Faire Stores
  async getFaireStores(): Promise<FaireStore[]> {
    const { data } = await supabase.from('faire_stores').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<FaireStore>(data ?? []);
  }

  async getFaireStore(id: string): Promise<FaireStore | undefined> {
    const { data } = await supabase.from('faire_stores').select('*').eq('id', id).single();
    return data ? toCamelCase<FaireStore>(data) : undefined;
  }

  async createFaireStore(store: InsertFaireStore): Promise<FaireStore> {
    const { data } = await supabase.from('faire_stores').insert(toSnakeCase(store)).select().single();
    return toCamelCase<FaireStore>(data!);
  }

  async updateFaireStore(id: string, updates: Partial<InsertFaireStore>): Promise<FaireStore | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('faire_stores').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<FaireStore>(data) : undefined;
  }

  async deleteFaireStore(id: string): Promise<boolean> {
    const { error } = await supabase.from('faire_stores').delete().eq('id', id);
    return !error;
  }

  // Faire Suppliers
  async getFaireSuppliers(): Promise<FaireSupplier[]> {
    const { data } = await supabase.from('faire_suppliers').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<FaireSupplier>(data ?? []);
  }

  async getFaireSupplier(id: string): Promise<FaireSupplier | undefined> {
    const { data } = await supabase.from('faire_suppliers').select('*').eq('id', id).single();
    return data ? toCamelCase<FaireSupplier>(data) : undefined;
  }

  async createFaireSupplier(supplier: InsertFaireSupplier): Promise<FaireSupplier> {
    const { data } = await supabase.from('faire_suppliers').insert(toSnakeCase(supplier)).select().single();
    return toCamelCase<FaireSupplier>(data!);
  }

  async updateFaireSupplier(id: string, updates: Partial<InsertFaireSupplier>): Promise<FaireSupplier | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('faire_suppliers').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<FaireSupplier>(data) : undefined;
  }

  async deleteFaireSupplier(id: string): Promise<boolean> {
    const { error } = await supabase.from('faire_suppliers').delete().eq('id', id);
    return !error;
  }

  // Faire Products
  async getFaireProducts(): Promise<FaireProduct[]> {
    const { data } = await supabase.from('faire_products').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<FaireProduct>(data ?? []);
  }

  async getFaireProduct(id: string): Promise<FaireProduct | undefined> {
    const { data } = await supabase.from('faire_products').select('*').eq('id', id).single();
    return data ? toCamelCase<FaireProduct>(data) : undefined;
  }

  async createFaireProduct(product: InsertFaireProduct): Promise<FaireProduct> {
    const { data } = await supabase.from('faire_products').insert(toSnakeCase(product)).select().single();
    return toCamelCase<FaireProduct>(data!);
  }

  async updateFaireProduct(id: string, updates: Partial<InsertFaireProduct>): Promise<FaireProduct | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('faire_products').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<FaireProduct>(data) : undefined;
  }

  async deleteFaireProduct(id: string): Promise<boolean> {
    const { error } = await supabase.from('faire_products').delete().eq('id', id);
    return !error;
  }

  // Faire Orders
  async getFaireOrders(): Promise<FaireOrder[]> {
    const { data } = await supabase.from('faire_orders').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<FaireOrder>(data ?? []);
  }

  async getFaireOrder(id: string): Promise<FaireOrder | undefined> {
    const { data } = await supabase.from('faire_orders').select('*').eq('id', id).single();
    return data ? toCamelCase<FaireOrder>(data) : undefined;
  }

  async updateFaireOrder(id: string, updates: Partial<InsertFaireOrder>): Promise<FaireOrder | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('faire_orders').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<FaireOrder>(data) : undefined;
  }

  // Faire Shipments
  async getFaireShipments(): Promise<FaireShipment[]> {
    const { data } = await supabase.from('faire_shipments').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<FaireShipment>(data ?? []);
  }

  async createFaireShipment(shipment: InsertFaireShipment): Promise<FaireShipment> {
    const { data } = await supabase.from('faire_shipments').insert(toSnakeCase(shipment)).select().single();
    return toCamelCase<FaireShipment>(data!);
  }

  // ============================================================================
  // LLC CLIENTS METHODS
  // ============================================================================

  // LLC Banks
  async getLLCBanks(): Promise<LLCBank[]> {
    const { data } = await supabase.from('llc_banks').select('*').order('display_order', { ascending: true });
    return toCamelCaseArray<LLCBank>(data ?? []);
  }

  // LLC Clients
  async getLLCClients(): Promise<LLCClient[]> {
    const { data } = await supabase.from('llc_clients').select('*').order('created_at', { ascending: false });
    return toCamelCaseArray<LLCClient>(data ?? []);
  }

  async getLLCClient(id: string): Promise<LLCClient | undefined> {
    const { data } = await supabase.from('llc_clients').select('*').eq('id', id).single();
    return data ? toCamelCase<LLCClient>(data) : undefined;
  }

  async createLLCClient(client: InsertLLCClient): Promise<LLCClient> {
    const { data } = await supabase.from('llc_clients').insert(toSnakeCase(client)).select().single();
    return toCamelCase<LLCClient>(data!);
  }

  async updateLLCClient(id: string, updates: Partial<InsertLLCClient>): Promise<LLCClient | undefined> {
    const snakeUpdates = toSnakeCase(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data } = await supabase.from('llc_clients').update(snakeUpdates).eq('id', id).select().single();
    return data ? toCamelCase<LLCClient>(data) : undefined;
  }

  async deleteLLCClient(id: string): Promise<boolean> {
    const { error } = await supabase.from('llc_clients').delete().eq('id', id);
    return !error;
  }

  // LLC Client Documents
  async getLLCClientDocuments(clientId: string): Promise<LLCClientDocument[]> {
    const { data } = await supabase.from('llc_client_documents').select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    return toCamelCaseArray<LLCClientDocument>(data ?? []);
  }

  async createLLCClientDocument(document: InsertLLCClientDocument): Promise<LLCClientDocument> {
    const { data } = await supabase.from('llc_client_documents').insert(toSnakeCase(document)).select().single();
    return toCamelCase<LLCClientDocument>(data!);
  }

  // LLC Client Timeline
  async getLLCClientTimeline(clientId: string): Promise<LLCClientTimeline[]> {
    const { data } = await supabase.from('llc_client_timeline').select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    return toCamelCaseArray<LLCClientTimeline>(data ?? []);
  }

  async createLLCClientTimelineEntry(entry: InsertLLCClientTimeline): Promise<LLCClientTimeline> {
    const { data } = await supabase.from('llc_client_timeline').insert(toSnakeCase(entry)).select().single();
    return toCamelCase<LLCClientTimeline>(data!);
  }

  // Website Content
  async getWebsiteContent(): Promise<WebsiteContent[]> {
    const { data } = await supabase.from('website_content').select('*');
    return toCamelCaseArray<WebsiteContent>(data ?? []);
  }

  async getWebsiteContentBySection(section: string): Promise<WebsiteContent[]> {
    const { data } = await supabase.from('website_content').select('*').eq('section', section);
    return toCamelCaseArray<WebsiteContent>(data ?? []);
  }

  async upsertWebsiteContent(section: string, key: string, value: any, updatedBy?: string): Promise<WebsiteContent> {
    const { data } = await supabase.from('website_content').upsert(
      toSnakeCase({ section, key, value, updatedBy: updatedBy || null, updatedAt: new Date() }),
      { onConflict: 'section,key' }
    ).select().single();
    return toCamelCase<WebsiteContent>(data!);
  }

  // Payment Requests
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    const { data } = await supabase.from('payment_requests').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    return toCamelCaseArray<PaymentRequest>(data ?? []);
  }

  async getPaymentRequest(id: string): Promise<PaymentRequest | undefined> {
    const { data } = await supabase.from('payment_requests').select('*').eq('id', id).single();
    return data ? toCamelCase<PaymentRequest>(data) : undefined;
  }

  async createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest> {
    const { data } = await supabase.from('payment_requests').insert(toSnakeCase(request as any)).select().single();
    return toCamelCase<PaymentRequest>(data!);
  }

  async updatePaymentRequest(id: string, updates: Partial<InsertPaymentRequest>): Promise<PaymentRequest | undefined> {
    const { data } = await supabase.from('payment_requests').update({ ...toSnakeCase(updates as any), updated_at: new Date() }).eq('id', id).select().single();
    return data ? toCamelCase<PaymentRequest>(data) : undefined;
  }

  async deletePaymentRequest(id: string): Promise<boolean> {
    const { error } = await supabase.from('payment_requests').update({ deleted_at: new Date() }).eq('id', id);
    return !error;
  }

  // Booking Types
  async getBookingTypes(userId?: string): Promise<BookingType[]> {
    let query = supabase.from('booking_types').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;
    return toCamelCaseArray<BookingType>(data ?? []);
  }

  async getBookingType(id: string): Promise<BookingType | undefined> {
    const { data } = await supabase.from('booking_types').select('*').eq('id', id).single();
    return data ? toCamelCase<BookingType>(data) : undefined;
  }

  async getBookingTypeBySlug(slug: string): Promise<BookingType | undefined> {
    const { data } = await supabase.from('booking_types').select('*').eq('slug', slug).eq('is_active', true).single();
    return data ? toCamelCase<BookingType>(data) : undefined;
  }

  async createBookingType(bt: InsertBookingType): Promise<BookingType> {
    const { data } = await supabase.from('booking_types').insert(toSnakeCase(bt as any)).select().single();
    return toCamelCase<BookingType>(data!);
  }

  async updateBookingType(id: string, updates: Partial<InsertBookingType>): Promise<BookingType | undefined> {
    const { data } = await supabase.from('booking_types').update({ ...toSnakeCase(updates as any), updated_at: new Date() }).eq('id', id).select().single();
    return data ? toCamelCase<BookingType>(data) : undefined;
  }

  async deleteBookingType(id: string): Promise<boolean> {
    const { error } = await supabase.from('booking_types').delete().eq('id', id);
    return !error;
  }

  // Availability Schedules
  async getAvailabilitySchedules(userId: string): Promise<AvailabilitySchedule[]> {
    const { data } = await supabase.from('availability_schedules').select('*').eq('user_id', userId).eq('is_active', true).order('day_of_week');
    return toCamelCaseArray<AvailabilitySchedule>(data ?? []);
  }

  async setAvailabilitySchedules(userId: string, schedules: InsertAvailabilitySchedule[]): Promise<AvailabilitySchedule[]> {
    await supabase.from('availability_schedules').delete().eq('user_id', userId);
    if (schedules.length === 0) return [];
    const rows = schedules.map(s => toSnakeCase({ ...s, userId } as any));
    const { data } = await supabase.from('availability_schedules').insert(rows).select();
    return toCamelCaseArray<AvailabilitySchedule>(data ?? []);
  }

  // Availability Overrides
  async getAvailabilityOverrides(userId: string, fromDate?: string, toDate?: string): Promise<AvailabilityOverride[]> {
    let query = supabase.from('availability_overrides').select('*').eq('user_id', userId).order('date');
    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);
    const { data } = await query;
    return toCamelCaseArray<AvailabilityOverride>(data ?? []);
  }

  async createAvailabilityOverride(override: InsertAvailabilityOverride): Promise<AvailabilityOverride> {
    const { data } = await supabase.from('availability_overrides').insert(toSnakeCase(override as any)).select().single();
    return toCamelCase<AvailabilityOverride>(data!);
  }

  async deleteAvailabilityOverride(id: string): Promise<boolean> {
    const { error } = await supabase.from('availability_overrides').delete().eq('id', id);
    return !error;
  }

  // Bookings
  async getBookings(options?: { hostUserId?: string; status?: string; from?: string; to?: string }): Promise<Booking[]> {
    let query = supabase.from('bookings').select('*').order('start_time', { ascending: false });
    if (options?.hostUserId) query = query.eq('host_user_id', options.hostUserId);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.from) query = query.gte('start_time', options.from);
    if (options?.to) query = query.lte('start_time', options.to);
    const { data } = await query;
    return toCamelCaseArray<Booking>(data ?? []);
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const { data } = await supabase.from('bookings').select('*').eq('id', id).single();
    return data ? toCamelCase<Booking>(data) : undefined;
  }

  async getBookingByCancelToken(token: string): Promise<Booking | undefined> {
    const { data } = await supabase.from('bookings').select('*').eq('cancel_token', token).single();
    return data ? toCamelCase<Booking>(data) : undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const { data } = await supabase.from('bookings').insert(toSnakeCase(booking as any)).select().single();
    return toCamelCase<Booking>(data!);
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const { data } = await supabase.from('bookings').update({ ...toSnakeCase(updates as any), updated_at: new Date() }).eq('id', id).select().single();
    return data ? toCamelCase<Booking>(data) : undefined;
  }

  async getBookingsForSlotCheck(hostUserId: string, date: string): Promise<Booking[]> {
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;
    const { data } = await supabase.from('bookings').select('*')
      .eq('host_user_id', hostUserId)
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)
      .not('status', 'eq', 'cancelled');
    return toCamelCaseArray<Booking>(data ?? []);
  }
}

export const storage = new Storage();
