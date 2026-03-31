import { loadDb, saveDb, genId } from "./db";
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
  type BookingReminder, type InsertBookingReminder,
  type Contact, type InsertContact,
  type Deal, type InsertDeal,
  type Appointment, type InsertAppointment,
  type Ticket, type InsertTicket,
  type AuditLog, type InsertAuditLog,
  type Notification, type InsertNotification,
} from "@shared/schema";

// ── helpers ──────────────────────────────────────────────────────────────────

function now(): string { return new Date().toISOString(); }

function col<T>(table: string): T[] {
  const db = loadDb();
  return (db[table] ?? []) as T[];
}

function set<T>(table: string, rows: T[]): void {
  const db = loadDb();
  db[table] = rows as any[];
  saveDb(db);
}

function insert<T extends Record<string, any>>(table: string, data: any): T {
  const rows = col<T>(table);
  const row: T = { id: genId(), createdAt: now(), ...data } as T;
  rows.push(row);
  set(table, rows);
  return row;
}

function findById<T extends { id: string }>(table: string, id: string): T | undefined {
  return col<T>(table).find(r => r.id === id);
}

function updateById<T extends { id: string }>(table: string, id: string, updates: Partial<T>): T | undefined {
  const rows = col<T>(table);
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...updates, updatedAt: now() };
  set(table, rows);
  return rows[idx];
}

function deleteById(table: string, id: string): boolean {
  const rows = col<any>(table);
  const next = rows.filter(r => r.id !== id);
  if (next.length === rows.length) return false;
  set(table, next);
  return true;
}

function sortBy<T>(arr: T[], key: keyof T, dir: "asc" | "desc" = "desc"): T[] {
  return [...arr].sort((a, b) => {
    const va = a[key] as any;
    const vb = b[key] as any;
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

// ── interface ─────────────────────────────────────────────────────────────────

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  getLead(id: string): Promise<Lead | undefined>;
  getLeadByPhone(phone: string): Promise<Lead | undefined>;
  getLeads(options?: { userId?: string; teamId?: string; role?: string }): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  getLeadsByStage(stage: string, userId?: string): Promise<Lead[]>;
  assignLead(leadId: string, userId: string | null): Promise<Lead | undefined>;

  getActivity(id: string): Promise<Activity | undefined>;
  getActivities(leadId?: string, userId?: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: string): Promise<boolean>;

  getTask(id: string): Promise<Task | undefined>;
  getTasks(options?: { userId?: string; teamId?: string; leadId?: string }): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  getService(id: string): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  getTemplate(id: string): Promise<Template | undefined>;
  getTemplates(type?: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  getActiveEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  getTravelPackage(id: string): Promise<TravelPackage | undefined>;
  getTravelPackageBySlug(slug: string): Promise<TravelPackage | undefined>;
  getTravelPackages(): Promise<TravelPackage[]>;
  getActiveTravelPackages(): Promise<TravelPackage[]>;
  getFeaturedTravelPackages(): Promise<TravelPackage[]>;
  createTravelPackage(pkg: InsertTravelPackage): Promise<TravelPackage>;
  updateTravelPackage(id: string, updates: Partial<InsertTravelPackage>): Promise<TravelPackage | undefined>;
  deleteTravelPackage(id: string): Promise<boolean>;

  createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking>;
  getTravelBooking(id: string): Promise<TravelBooking | undefined>;
  getTravelBookingByOrderId(orderId: string): Promise<TravelBooking | undefined>;
  updateTravelBooking(id: string, updates: Partial<TravelBooking>): Promise<TravelBooking | undefined>;
  getTravelBookings(): Promise<TravelBooking[]>;

  getEvent(id: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  getEventAttendee(id: string): Promise<EventAttendee | undefined>;
  getEventAttendees(eventId: string): Promise<EventAttendee[]>;
  createEventAttendee(attendee: InsertEventAttendee): Promise<EventAttendee>;
  updateEventAttendee(id: string, updates: Partial<InsertEventAttendee>): Promise<EventAttendee | undefined>;
  deleteEventAttendee(id: string): Promise<boolean>;
  checkInAttendee(id: string): Promise<EventAttendee | undefined>;

  getEventHotels(eventId: string): Promise<EventHotel[]>;
  createEventHotel(hotel: InsertEventHotel): Promise<EventHotel>;
  updateEventHotel(id: string, updates: Partial<InsertEventHotel>): Promise<EventHotel | undefined>;
  deleteEventHotel(id: string): Promise<boolean>;

  getEventFlights(eventId: string): Promise<EventFlight[]>;
  createEventFlight(flight: InsertEventFlight): Promise<EventFlight>;
  updateEventFlight(id: string, updates: Partial<InsertEventFlight>): Promise<EventFlight | undefined>;
  deleteEventFlight(id: string): Promise<boolean>;

  getEventCreatives(eventId: string): Promise<EventCreative[]>;
  createEventCreative(creative: InsertEventCreative): Promise<EventCreative>;
  updateEventCreative(id: string, updates: Partial<InsertEventCreative>): Promise<EventCreative | undefined>;
  deleteEventCreative(id: string): Promise<boolean>;

  getEventPackingItems(eventId: string): Promise<EventPackingItem[]>;
  createEventPackingItem(item: InsertEventPackingItem): Promise<EventPackingItem>;
  updateEventPackingItem(id: string, updates: Partial<InsertEventPackingItem>): Promise<EventPackingItem | undefined>;
  deleteEventPackingItem(id: string): Promise<boolean>;

  getEventCommunications(eventId: string): Promise<EventCommunication[]>;
  createEventCommunication(comm: InsertEventCommunication): Promise<EventCommunication>;
  updateEventCommunication(id: string, updates: Partial<InsertEventCommunication>): Promise<EventCommunication | undefined>;
  deleteEventCommunication(id: string): Promise<boolean>;

  getEventPresentations(eventId: string): Promise<EventPresentation[]>;
  createEventPresentation(pres: InsertEventPresentation): Promise<EventPresentation>;
  updateEventPresentation(id: string, updates: Partial<InsertEventPresentation>): Promise<EventPresentation | undefined>;
  deleteEventPresentation(id: string): Promise<boolean>;

  getEventTeamContacts(eventId: string): Promise<EventTeamContact[]>;
  createEventTeamContact(contact: InsertEventTeamContact): Promise<EventTeamContact>;
  updateEventTeamContact(id: string, updates: Partial<InsertEventTeamContact>): Promise<EventTeamContact | undefined>;
  deleteEventTeamContact(id: string): Promise<boolean>;

  getVenueComparisons(city?: string): Promise<VenueComparison[]>;
  getVenueComparison(id: string): Promise<VenueComparison | undefined>;
  createVenueComparison(venue: InsertVenueComparison): Promise<VenueComparison>;
  updateVenueComparison(id: string, updates: Partial<InsertVenueComparison>): Promise<VenueComparison | undefined>;
  deleteVenueComparison(id: string): Promise<boolean>;

  getEventVendors(eventId: string): Promise<EventVendor[]>;
  getEventVendor(id: string): Promise<EventVendor | undefined>;
  createEventVendor(vendor: InsertEventVendor): Promise<EventVendor>;
  updateEventVendor(id: string, updates: Partial<InsertEventVendor>): Promise<EventVendor | undefined>;
  deleteEventVendor(id: string): Promise<boolean>;

  getEventVendorItems(vendorId: string): Promise<EventVendorItem[]>;
  createEventVendorItem(item: InsertEventVendorItem): Promise<EventVendorItem>;
  updateEventVendorItem(id: string, updates: Partial<InsertEventVendorItem>): Promise<EventVendorItem | undefined>;
  deleteEventVendorItem(id: string): Promise<boolean>;

  getChannel(id: string): Promise<Channel | undefined>;
  getChannelByTeamId(teamId: string): Promise<Channel | undefined>;
  getChannels(): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;

  getChannelMessages(channelId: string): Promise<ChannelMessage[]>;
  createChannelMessage(message: InsertChannelMessage): Promise<ChannelMessage>;

  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<boolean>;
  getUserTeams(userId: string): Promise<TeamMember[]>;

  getDirectMessageConversations(userId: string): Promise<DirectMessageConversation[]>;
  getDirectMessageConversation(id: string): Promise<DirectMessageConversation | undefined>;
  getOrCreateDirectMessageConversation(user1Id: string, user2Id: string): Promise<DirectMessageConversation>;

  getDirectMessages(conversationId: string): Promise<DirectMessage[]>;
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  markDirectMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  getAllUsers(): Promise<User[]>;

  getHrEmployee(id: string): Promise<HrEmployee | undefined>;
  getHrEmployees(filters?: { officeUnit?: string; role?: string; status?: string; isSalesTeam?: boolean }): Promise<HrEmployee[]>;
  createHrEmployee(employee: InsertHrEmployee): Promise<HrEmployee>;
  updateHrEmployee(id: string, updates: Partial<InsertHrEmployee>): Promise<HrEmployee | undefined>;
  deleteHrEmployee(id: string): Promise<boolean>;

  getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]>;
  createEmployeeDocument(doc: InsertEmployeeDocument): Promise<EmployeeDocument>;
  deleteEmployeeDocument(id: string): Promise<boolean>;

  getAsset(id: string): Promise<Asset | undefined>;
  getAssets(filters?: { category?: string; status?: string; location?: string }): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, updates: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string): Promise<boolean>;

  getAssetAssignments(assetId: string): Promise<AssetAssignment[]>;
  getEmployeeAssets(employeeId: string): Promise<AssetAssignment[]>;
  createAssetAssignment(assignment: InsertAssetAssignment): Promise<AssetAssignment>;
  updateAssetAssignment(id: string, updates: Partial<InsertAssetAssignment>): Promise<AssetAssignment | undefined>;

  getAssetMaintenance(assetId: string): Promise<AssetMaintenance[]>;
  createAssetMaintenance(maintenance: InsertAssetMaintenance): Promise<AssetMaintenance>;
  updateAssetMaintenance(id: string, updates: Partial<InsertAssetMaintenance>): Promise<AssetMaintenance | undefined>;
  deleteAssetMaintenance(id: string): Promise<boolean>;

  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendanceByEmployee(employeeId: string): Promise<Attendance[]>;
  getAttendanceByDateRange(employeeId: string, startDate: Date, endDate: Date): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;
  bulkCreateAttendance(records: InsertAttendance[]): Promise<Attendance[]>;

  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]>;
  getLeaveRequestsByStatus(status: string): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined>;
  deleteLeaveRequest(id: string): Promise<boolean>;

  getJobOpening(id: string): Promise<JobOpening | undefined>;
  getJobOpenings(): Promise<JobOpening[]>;
  getJobOpeningsByStatus(status: string): Promise<JobOpening[]>;
  createJobOpening(opening: InsertJobOpening): Promise<JobOpening>;
  updateJobOpening(id: string, updates: Partial<InsertJobOpening>): Promise<JobOpening | undefined>;
  deleteJobOpening(id: string): Promise<boolean>;

  getJobPortals(): Promise<JobPortal[]>;
  getJobPortal(id: string): Promise<JobPortal | undefined>;
  createJobPortal(portal: InsertJobPortal): Promise<JobPortal>;
  updateJobPortal(id: string, updates: Partial<InsertJobPortal>): Promise<JobPortal | undefined>;
  deleteJobPortal(id: string): Promise<boolean>;

  getCandidates(filters?: { status?: string; source?: string; appliedFor?: string }): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  getCandidateByPhone(phone: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;
  bulkCreateCandidates(candidateList: InsertCandidate[]): Promise<Candidate[]>;

  getCandidateCalls(candidateId: string): Promise<CandidateCall[]>;
  getCandidateCall(id: string): Promise<CandidateCall | undefined>;
  createCandidateCall(call: InsertCandidateCall): Promise<CandidateCall>;
  updateCandidateCall(id: string, updates: Partial<InsertCandidateCall>): Promise<CandidateCall | undefined>;
  deleteCandidateCall(id: string): Promise<boolean>;
  getRecentCalls(limit?: number): Promise<CandidateCall[]>;

  getHrTemplates(filters?: { category?: string; type?: string }): Promise<HrTemplate[]>;
  getHrTemplate(id: string): Promise<HrTemplate | undefined>;
  createHrTemplate(template: InsertHrTemplate): Promise<HrTemplate>;
  updateHrTemplate(id: string, updates: Partial<InsertHrTemplate>): Promise<HrTemplate | undefined>;
  deleteHrTemplate(id: string): Promise<boolean>;
  incrementHrTemplateUsage(id: string): Promise<void>;

  getInterviews(filter?: 'upcoming' | 'past'): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview | undefined>;
  deleteInterview(id: string): Promise<boolean>;
  bulkCreateInterviews(interviewList: InsertInterview[]): Promise<Interview[]>;

  getWebsiteContent(): Promise<WebsiteContent[]>;
  getWebsiteContentBySection(section: string): Promise<WebsiteContent[]>;
  upsertWebsiteContent(section: string, key: string, value: any, updatedBy?: string): Promise<WebsiteContent>;

  getPaymentRequests(): Promise<PaymentRequest[]>;
  getPaymentRequest(id: string): Promise<PaymentRequest | undefined>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequest(id: string, updates: Partial<InsertPaymentRequest>): Promise<PaymentRequest | undefined>;
  deletePaymentRequest(id: string): Promise<boolean>;

  getBookingTypes(userId?: string): Promise<BookingType[]>;
  getBookingType(id: string): Promise<BookingType | undefined>;
  getBookingTypeBySlug(slug: string): Promise<BookingType | undefined>;
  createBookingType(bt: InsertBookingType): Promise<BookingType>;
  updateBookingType(id: string, updates: Partial<InsertBookingType>): Promise<BookingType | undefined>;
  deleteBookingType(id: string): Promise<boolean>;

  getAvailabilitySchedules(userId: string): Promise<AvailabilitySchedule[]>;
  setAvailabilitySchedules(userId: string, schedules: InsertAvailabilitySchedule[]): Promise<AvailabilitySchedule[]>;

  getAvailabilityOverrides(userId: string, fromDate?: string, toDate?: string): Promise<AvailabilityOverride[]>;
  createAvailabilityOverride(override: InsertAvailabilityOverride): Promise<AvailabilityOverride>;
  deleteAvailabilityOverride(id: string): Promise<boolean>;

  getBookings(options?: { hostUserId?: string; status?: string; from?: string; to?: string }): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByCancelToken(token: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  getBookingsForSlotCheck(hostUserId: string, date: string): Promise<Booking[]>;

  getContact(id: string): Promise<Contact | undefined>;
  getContacts(filters?: { category?: string; teamId?: string; search?: string }): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  getDeal(id: string): Promise<Deal | undefined>;
  getDeals(filters?: { stage?: string; assignedTo?: string; teamId?: string }): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, updates: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<boolean>;

  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointments(filters?: { assignedTo?: string; teamId?: string; status?: string }): Promise<Appointment[]>;
  createAppointment(appt: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  getTicket(id: string): Promise<Ticket | undefined>;
  getTickets(filters?: { status?: string; assignedTo?: string; reportedBy?: string; teamId?: string }): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;

  getAuditLogs(filters?: { entityType?: string; entityId?: string; userId?: string; limit?: number }): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<boolean>;
  markAllNotificationsRead(userId: string): Promise<boolean>;

  // Faire
  getFaireStores(): Promise<FaireStore[]>;
  getFaireStore(id: string): Promise<FaireStore | undefined>;
  createFaireStore(store: InsertFaireStore): Promise<FaireStore>;
  updateFaireStore(id: string, updates: Partial<InsertFaireStore>): Promise<FaireStore | undefined>;
  deleteFaireStore(id: string): Promise<boolean>;
  getFaireSuppliers(): Promise<FaireSupplier[]>;
  getFaireSupplier(id: string): Promise<FaireSupplier | undefined>;
  createFaireSupplier(supplier: InsertFaireSupplier): Promise<FaireSupplier>;
  updateFaireSupplier(id: string, updates: Partial<InsertFaireSupplier>): Promise<FaireSupplier | undefined>;
  deleteFaireSupplier(id: string): Promise<boolean>;
  getFaireProducts(): Promise<FaireProduct[]>;
  getFaireProduct(id: string): Promise<FaireProduct | undefined>;
  createFaireProduct(product: InsertFaireProduct): Promise<FaireProduct>;
  updateFaireProduct(id: string, updates: Partial<InsertFaireProduct>): Promise<FaireProduct | undefined>;
  deleteFaireProduct(id: string): Promise<boolean>;
  getFaireOrders(): Promise<FaireOrder[]>;
  getFaireOrder(id: string): Promise<FaireOrder | undefined>;
  updateFaireOrder(id: string, updates: Partial<InsertFaireOrder>): Promise<FaireOrder | undefined>;
  getFaireShipments(): Promise<FaireShipment[]>;
  createFaireShipment(shipment: InsertFaireShipment): Promise<FaireShipment>;

  // LLC
  getLLCBanks(): Promise<LLCBank[]>;
  getLLCClients(): Promise<LLCClient[]>;
  getLLCClient(id: string): Promise<LLCClient | undefined>;
  createLLCClient(client: InsertLLCClient): Promise<LLCClient>;
  updateLLCClient(id: string, updates: Partial<InsertLLCClient>): Promise<LLCClient | undefined>;
  deleteLLCClient(id: string): Promise<boolean>;
  getLLCClientDocuments(clientId: string): Promise<LLCClientDocument[]>;
  createLLCClientDocument(document: InsertLLCClientDocument): Promise<LLCClientDocument>;
  getLLCClientTimeline(clientId: string): Promise<LLCClientTimeline[]>;
  createLLCClientTimelineEntry(entry: InsertLLCClientTimeline): Promise<LLCClientTimeline>;
}

// ── implementation ────────────────────────────────────────────────────────────

export class Storage implements IStorage {

  // Users
  async getUser(id: string) { return findById<User>('users', id); }
  async getUserByEmail(email: string) { return col<User>('users').find(u => u.email === email); }
  async createUser(user: InsertUser) { return insert<User>('users', user); }
  async updateUser(id: string, updates: Partial<InsertUser>) { return updateById<User>('users', id, updates as any); }
  async deleteUser(id: string) { return deleteById('users', id); }
  async getAllUsers() { return col<User>('users'); }
  async getUsersByRole(role: string) { return col<User>('users').filter(u => u.role === role); }

  // Leads
  async getLead(id: string) { return findById<Lead>('leads', id); }
  async getLeadByPhone(phone: string) {
    const norm = phone.replace(/\D/g, '');
    return col<Lead>('leads').find(l => l.phone.replace(/\D/g, '') === norm);
  }
  async getLeads(options?: { userId?: string; teamId?: string; role?: string }) {
    let rows = col<Lead>('leads');
    if (options?.teamId) rows = rows.filter(l => l.teamId === options.teamId);
    if (options?.userId) rows = rows.filter(l => l.assignedTo === options.userId);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async createLead(lead: InsertLead) { return insert<Lead>('leads', lead); }
  async updateLead(id: string, updates: Partial<InsertLead>) { return updateById<Lead>('leads', id, updates as any); }
  async deleteLead(id: string) { return deleteById('leads', id); }
  async getLeadsByStage(stage: string, userId?: string) {
    let rows = col<Lead>('leads').filter(l => l.stage === stage);
    if (userId) rows = rows.filter(l => l.assignedTo === userId);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async assignLead(leadId: string, userId: string | null) {
    return updateById<Lead>('leads', leadId, { assignedTo: userId } as any);
  }

  // Activities
  async getActivity(id: string) { return findById<Activity>('activities', id); }
  async getActivities(leadId?: string, userId?: string) {
    let rows = col<Activity>('activities');
    if (leadId) rows = rows.filter(a => a.leadId === leadId);
    else if (userId) rows = rows.filter(a => a.userId === userId);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async createActivity(activity: InsertActivity) { return insert<Activity>('activities', activity); }
  async deleteActivity(id: string) { return deleteById('activities', id); }

  // Tasks
  async getTask(id: string) { return findById<Task>('tasks', id); }
  async getTasks(options?: { userId?: string; teamId?: string; leadId?: string }) {
    let rows = col<Task>('tasks');
    if (options?.teamId) rows = rows.filter(t => t.teamId === options.teamId);
    if (options?.userId) rows = rows.filter(t => t.assignedTo === options.userId);
    if (options?.leadId) rows = rows.filter(t => t.leadId === options.leadId);
    return sortBy(rows, 'dueDate', 'desc');
  }
  async createTask(task: InsertTask) { return insert<Task>('tasks', task); }
  async updateTask(id: string, updates: Partial<InsertTask>) { return updateById<Task>('tasks', id, updates as any); }
  async deleteTask(id: string) { return deleteById('tasks', id); }

  // Services
  async getService(id: string) { return findById<Service>('services', id); }
  async getServices() { return col<Service>('services').filter(s => s.isActive); }
  async createService(service: InsertService) { return insert<Service>('services', service); }
  async updateService(id: string, updates: Partial<InsertService>) { return updateById<Service>('services', id, updates as any); }
  async deleteService(id: string) { return deleteById('services', id); }

  // Templates
  async getTemplate(id: string) { return findById<Template>('templates', id); }
  async getTemplates(type?: string) {
    let rows = col<Template>('templates');
    if (type) rows = rows.filter(t => t.type === type);
    return rows;
  }
  async createTemplate(template: InsertTemplate) { return insert<Template>('templates', template); }
  async updateTemplate(id: string, updates: Partial<InsertTemplate>) { return updateById<Template>('templates', id, updates as any); }
  async deleteTemplate(id: string) { return deleteById('templates', id); }

  // Employees
  async getEmployee(id: string) { return findById<Employee>('employees', id); }
  async getEmployees() { return sortBy(col<Employee>('employees'), 'displayOrder', 'asc'); }
  async getActiveEmployees() { return sortBy(col<Employee>('employees').filter(e => e.isActive), 'displayOrder', 'asc'); }
  async createEmployee(employee: InsertEmployee) { return insert<Employee>('employees', employee); }
  async updateEmployee(id: string, updates: Partial<InsertEmployee>) { return updateById<Employee>('employees', id, updates as any); }
  async deleteEmployee(id: string) { return deleteById('employees', id); }

  // Travel Packages
  async getTravelPackage(id: string) { return findById<TravelPackage>('travel_packages', id); }
  async getTravelPackageBySlug(slug: string) { return col<TravelPackage>('travel_packages').find(p => p.slug === slug); }
  async getTravelPackages() { return sortBy(col<TravelPackage>('travel_packages'), 'displayOrder', 'asc'); }
  async getActiveTravelPackages() { return sortBy(col<TravelPackage>('travel_packages').filter(p => p.isActive), 'displayOrder', 'asc'); }
  async getFeaturedTravelPackages() { return sortBy(col<TravelPackage>('travel_packages').filter(p => p.isActive && p.isFeatured), 'displayOrder', 'asc'); }
  async createTravelPackage(pkg: InsertTravelPackage) { return insert<TravelPackage>('travel_packages', pkg); }
  async updateTravelPackage(id: string, updates: Partial<InsertTravelPackage>) { return updateById<TravelPackage>('travel_packages', id, updates as any); }
  async deleteTravelPackage(id: string) { return deleteById('travel_packages', id); }

  // Travel Bookings
  async createTravelBooking(booking: InsertTravelBooking) { return insert<TravelBooking>('travel_bookings', { ...booking, updatedAt: now() }); }
  async getTravelBooking(id: string) { return findById<TravelBooking>('travel_bookings', id); }
  async getTravelBookingByOrderId(orderId: string) { return col<TravelBooking>('travel_bookings').find(b => b.razorpayOrderId === orderId); }
  async updateTravelBooking(id: string, updates: Partial<TravelBooking>) { return updateById<TravelBooking>('travel_bookings', id, updates as any); }
  async getTravelBookings() { return sortBy(col<TravelBooking>('travel_bookings'), 'createdAt', 'desc'); }

  // Events
  async getEvent(id: string) { return findById<Event>('events', id); }
  async getEvents() { return sortBy(col<Event>('events'), 'date', 'asc'); }
  async getUpcomingEvents() {
    const nowStr = new Date().toISOString();
    return sortBy(col<Event>('events').filter(e => e.status !== 'cancelled' && e.status !== 'draft' && (e.date as any) >= nowStr), 'date', 'asc');
  }
  async createEvent(event: InsertEvent) { return insert<Event>('events', event); }
  async updateEvent(id: string, updates: Partial<InsertEvent>) { return updateById<Event>('events', id, updates as any); }
  async deleteEvent(id: string) { return deleteById('events', id); }

  // Event Attendees
  async getEventAttendee(id: string) { return findById<EventAttendee>('event_attendees', id); }
  async getEventAttendees(eventId: string) { return sortBy(col<EventAttendee>('event_attendees').filter(a => a.eventId === eventId), 'createdAt', 'asc'); }
  async createEventAttendee(attendee: InsertEventAttendee) { return insert<EventAttendee>('event_attendees', attendee); }
  async updateEventAttendee(id: string, updates: Partial<InsertEventAttendee>) { return updateById<EventAttendee>('event_attendees', id, updates as any); }
  async deleteEventAttendee(id: string) { return deleteById('event_attendees', id); }
  async checkInAttendee(id: string) { return updateById<EventAttendee>('event_attendees', id, { checkedIn: true, checkedInAt: now() } as any); }

  // Event Hotels
  async getEventHotels(eventId: string) { return sortBy(col<EventHotel>('event_hotels').filter(h => h.eventId === eventId), 'checkIn', 'asc'); }
  async createEventHotel(hotel: InsertEventHotel) { return insert<EventHotel>('event_hotels', hotel); }
  async updateEventHotel(id: string, updates: Partial<InsertEventHotel>) { return updateById<EventHotel>('event_hotels', id, updates as any); }
  async deleteEventHotel(id: string) { return deleteById('event_hotels', id); }

  // Event Flights
  async getEventFlights(eventId: string) { return sortBy(col<EventFlight>('event_flights').filter(f => f.eventId === eventId), 'departureTime', 'asc'); }
  async createEventFlight(flight: InsertEventFlight) { return insert<EventFlight>('event_flights', flight); }
  async updateEventFlight(id: string, updates: Partial<InsertEventFlight>) { return updateById<EventFlight>('event_flights', id, updates as any); }
  async deleteEventFlight(id: string) { return deleteById('event_flights', id); }

  // Event Creatives
  async getEventCreatives(eventId: string) { return sortBy(col<EventCreative>('event_creatives').filter(c => c.eventId === eventId), 'createdAt', 'desc'); }
  async createEventCreative(creative: InsertEventCreative) { return insert<EventCreative>('event_creatives', creative); }
  async updateEventCreative(id: string, updates: Partial<InsertEventCreative>) { return updateById<EventCreative>('event_creatives', id, updates as any); }
  async deleteEventCreative(id: string) { return deleteById('event_creatives', id); }

  // Event Packing Items
  async getEventPackingItems(eventId: string) { return sortBy(col<EventPackingItem>('event_packing_items').filter(i => i.eventId === eventId), 'category', 'asc'); }
  async createEventPackingItem(item: InsertEventPackingItem) { return insert<EventPackingItem>('event_packing_items', item); }
  async updateEventPackingItem(id: string, updates: Partial<InsertEventPackingItem>) { return updateById<EventPackingItem>('event_packing_items', id, updates as any); }
  async deleteEventPackingItem(id: string) { return deleteById('event_packing_items', id); }

  // Event Communications
  async getEventCommunications(eventId: string) { return sortBy(col<EventCommunication>('event_communications').filter(c => c.eventId === eventId), 'createdAt', 'desc'); }
  async createEventCommunication(comm: InsertEventCommunication) { return insert<EventCommunication>('event_communications', comm); }
  async updateEventCommunication(id: string, updates: Partial<InsertEventCommunication>) { return updateById<EventCommunication>('event_communications', id, updates as any); }
  async deleteEventCommunication(id: string) { return deleteById('event_communications', id); }

  // Event Presentations
  async getEventPresentations(eventId: string) { return sortBy(col<EventPresentation>('event_presentations').filter(p => p.eventId === eventId), 'order' as any, 'asc'); }
  async createEventPresentation(pres: InsertEventPresentation) { return insert<EventPresentation>('event_presentations', pres); }
  async updateEventPresentation(id: string, updates: Partial<InsertEventPresentation>) { return updateById<EventPresentation>('event_presentations', id, updates as any); }
  async deleteEventPresentation(id: string) { return deleteById('event_presentations', id); }

  // Event Team Contacts
  async getEventTeamContacts(eventId: string) { return col<EventTeamContact>('event_team_contacts').filter(c => c.eventId === eventId); }
  async createEventTeamContact(contact: InsertEventTeamContact) { return insert<EventTeamContact>('event_team_contacts', contact); }
  async updateEventTeamContact(id: string, updates: Partial<InsertEventTeamContact>) { return updateById<EventTeamContact>('event_team_contacts', id, updates as any); }
  async deleteEventTeamContact(id: string) { return deleteById('event_team_contacts', id); }

  // Venue Comparisons
  async getVenueComparisons(city?: string) {
    let rows = col<VenueComparison>('venue_comparisons');
    if (city) rows = rows.filter(v => v.city === city);
    return sortBy(rows, 'name', 'asc');
  }
  async getVenueComparison(id: string) { return findById<VenueComparison>('venue_comparisons', id); }
  async createVenueComparison(venue: InsertVenueComparison) { return insert<VenueComparison>('venue_comparisons', venue); }
  async updateVenueComparison(id: string, updates: Partial<InsertVenueComparison>) { return updateById<VenueComparison>('venue_comparisons', id, updates as any); }
  async deleteVenueComparison(id: string) { return deleteById('venue_comparisons', id); }

  // Event Vendors
  async getEventVendors(eventId: string) { return sortBy(col<EventVendor>('event_vendors').filter(v => v.eventId === eventId), 'vendorName', 'asc'); }
  async getEventVendor(id: string) { return findById<EventVendor>('event_vendors', id); }
  async createEventVendor(vendor: InsertEventVendor) { return insert<EventVendor>('event_vendors', vendor); }
  async updateEventVendor(id: string, updates: Partial<InsertEventVendor>) { return updateById<EventVendor>('event_vendors', id, updates as any); }
  async deleteEventVendor(id: string) { return deleteById('event_vendors', id); }

  // Event Vendor Items
  async getEventVendorItems(vendorId: string) { return sortBy(col<EventVendorItem>('event_vendor_items').filter(i => i.vendorId === vendorId), 'itemName', 'asc'); }
  async createEventVendorItem(item: InsertEventVendorItem) { return insert<EventVendorItem>('event_vendor_items', item); }
  async updateEventVendorItem(id: string, updates: Partial<InsertEventVendorItem>) { return updateById<EventVendorItem>('event_vendor_items', id, updates as any); }
  async deleteEventVendorItem(id: string) { return deleteById('event_vendor_items', id); }

  // Channels
  async getChannel(id: string) { return findById<Channel>('channels', id); }
  async getChannelByTeamId(teamId: string) { return col<Channel>('channels').find(c => c.teamId === teamId); }
  async getChannels() { return sortBy(col<Channel>('channels'), 'name', 'asc'); }
  async createChannel(channel: InsertChannel) { return insert<Channel>('channels', channel); }

  // Channel Messages
  async getChannelMessages(channelId: string) { return sortBy(col<ChannelMessage>('channel_messages').filter(m => m.channelId === channelId), 'createdAt', 'asc'); }
  async createChannelMessage(message: InsertChannelMessage) { return insert<ChannelMessage>('channel_messages', message); }

  // Team Members
  async getTeamMembers(teamId: string) { return col<TeamMember>('team_members').filter(m => m.teamId === teamId); }
  async getTeamMember(id: string) { return findById<TeamMember>('team_members', id); }
  async createTeamMember(member: InsertTeamMember) { return insert<TeamMember>('team_members', member); }
  async deleteTeamMember(id: string) { return deleteById('team_members', id); }
  async getUserTeams(userId: string) { return col<TeamMember>('team_members').filter(m => m.userId === userId); }

  // Direct Message Conversations
  async getDirectMessageConversations(userId: string) {
    return sortBy(col<DirectMessageConversation>('dm_conversations').filter(c => c.user1Id === userId || c.user2Id === userId), 'lastMessageAt', 'desc');
  }
  async getDirectMessageConversation(id: string) { return findById<DirectMessageConversation>('dm_conversations', id); }
  async getOrCreateDirectMessageConversation(user1Id: string, user2Id: string) {
    const existing = col<DirectMessageConversation>('dm_conversations').find(
      c => (c.user1Id === user1Id && c.user2Id === user2Id) || (c.user1Id === user2Id && c.user2Id === user1Id)
    );
    if (existing) return existing;
    return insert<DirectMessageConversation>('dm_conversations', { user1Id, user2Id, lastMessageAt: now() });
  }

  // Direct Messages
  async getDirectMessages(conversationId: string) { return sortBy(col<DirectMessage>('direct_messages').filter(m => m.conversationId === conversationId), 'createdAt', 'asc'); }
  async createDirectMessage(message: InsertDirectMessage) {
    const dm = insert<DirectMessage>('direct_messages', message);
    updateById<DirectMessageConversation>('dm_conversations', message.conversationId, { lastMessageAt: now() } as any);
    return dm;
  }
  async markDirectMessagesAsRead(conversationId: string, userId: string) {
    const rows = col<DirectMessage>('direct_messages').map(m =>
      m.conversationId === conversationId && m.senderId !== userId ? { ...m, isRead: true } : m
    );
    set('direct_messages', rows);
  }
  async getUnreadMessageCount(userId: string) {
    const convs = await this.getDirectMessageConversations(userId);
    return col<DirectMessage>('direct_messages').filter(m =>
      convs.some(c => c.id === m.conversationId) && !m.isRead && m.senderId !== userId
    ).length;
  }

  // HR Employees
  async getHrEmployee(id: string) { return findById<HrEmployee>('hr_employees', id); }
  async getHrEmployees(filters?: { officeUnit?: string; role?: string; status?: string; isSalesTeam?: boolean }) {
    let rows = col<HrEmployee>('hr_employees');
    if (filters?.officeUnit) rows = rows.filter(e => e.officeUnit === filters.officeUnit);
    if (filters?.role) rows = rows.filter(e => e.role === filters.role);
    if (filters?.status) rows = rows.filter(e => e.status === filters.status);
    if (filters?.isSalesTeam !== undefined) rows = rows.filter(e => e.isSalesTeam === filters.isSalesTeam);
    return sortBy(rows, 'name', 'asc');
  }
  async createHrEmployee(employee: InsertHrEmployee) { return insert<HrEmployee>('hr_employees', employee); }
  async updateHrEmployee(id: string, updates: Partial<InsertHrEmployee>) { return updateById<HrEmployee>('hr_employees', id, updates as any); }
  async deleteHrEmployee(id: string) { return deleteById('hr_employees', id); }

  // Employee Documents
  async getEmployeeDocuments(employeeId: string) { return sortBy(col<EmployeeDocument>('employee_documents').filter(d => d.employeeId === employeeId), 'uploadedAt', 'desc'); }
  async createEmployeeDocument(doc: InsertEmployeeDocument) { return insert<EmployeeDocument>('employee_documents', doc); }
  async deleteEmployeeDocument(id: string) { return deleteById('employee_documents', id); }

  // Assets
  async getAsset(id: string) { return findById<Asset>('assets', id); }
  async getAssets(filters?: { category?: string; status?: string; location?: string }) {
    let rows = col<Asset>('assets');
    if (filters?.category) rows = rows.filter(a => a.category === filters.category);
    if (filters?.status) rows = rows.filter(a => a.status === filters.status);
    if (filters?.location) rows = rows.filter(a => a.location === filters.location);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async createAsset(asset: InsertAsset) { return insert<Asset>('assets', asset); }
  async updateAsset(id: string, updates: Partial<InsertAsset>) { return updateById<Asset>('assets', id, updates as any); }
  async deleteAsset(id: string) { return deleteById('assets', id); }

  // Asset Assignments
  async getAssetAssignments(assetId: string) { return sortBy(col<AssetAssignment>('asset_assignments').filter(a => a.assetId === assetId), 'assignedDate', 'desc'); }
  async getEmployeeAssets(employeeId: string) { return sortBy(col<AssetAssignment>('asset_assignments').filter(a => a.employeeId === employeeId && !a.returnedDate), 'assignedDate', 'desc'); }
  async createAssetAssignment(assignment: InsertAssetAssignment) { return insert<AssetAssignment>('asset_assignments', assignment); }
  async updateAssetAssignment(id: string, updates: Partial<InsertAssetAssignment>) { return updateById<AssetAssignment>('asset_assignments', id, updates as any); }

  // Asset Maintenance
  async getAssetMaintenance(assetId: string) { return sortBy(col<AssetMaintenance>('asset_maintenance').filter(m => m.assetId === assetId), 'createdAt', 'desc'); }
  async createAssetMaintenance(maintenance: InsertAssetMaintenance) { return insert<AssetMaintenance>('asset_maintenance', maintenance); }
  async updateAssetMaintenance(id: string, updates: Partial<InsertAssetMaintenance>) { return updateById<AssetMaintenance>('asset_maintenance', id, updates as any); }
  async deleteAssetMaintenance(id: string) { return deleteById('asset_maintenance', id); }

  // Attendance
  async getAttendance(id: string) { return findById<Attendance>('attendance', id); }
  async getAttendanceByDate(date: Date) {
    const d = date.toISOString().slice(0, 10);
    return col<Attendance>('attendance').filter(a => (a.date as any)?.slice(0, 10) === d);
  }
  async getAttendanceByEmployee(employeeId: string) { return sortBy(col<Attendance>('attendance').filter(a => a.employeeId === employeeId), 'date', 'desc'); }
  async getAttendanceByDateRange(employeeId: string, startDate: Date, endDate: Date) {
    const s = startDate.toISOString(), e = endDate.toISOString();
    return sortBy(col<Attendance>('attendance').filter(a => a.employeeId === employeeId && (a.date as any) >= s && (a.date as any) <= e), 'date', 'asc');
  }
  async createAttendance(record: InsertAttendance) { return insert<Attendance>('attendance', record); }
  async updateAttendance(id: string, updates: Partial<InsertAttendance>) { return updateById<Attendance>('attendance', id, updates as any); }
  async deleteAttendance(id: string) { return deleteById('attendance', id); }
  async bulkCreateAttendance(records: InsertAttendance[]) { return Promise.all(records.map(r => this.createAttendance(r))); }

  // Leave Requests
  async getLeaveRequest(id: string) { return findById<LeaveRequest>('leave_requests', id); }
  async getLeaveRequests() { return sortBy(col<LeaveRequest>('leave_requests'), 'appliedAt', 'desc'); }
  async getLeaveRequestsByEmployee(employeeId: string) { return sortBy(col<LeaveRequest>('leave_requests').filter(l => l.employeeId === employeeId), 'appliedAt', 'desc'); }
  async getLeaveRequestsByStatus(status: string) { return sortBy(col<LeaveRequest>('leave_requests').filter(l => l.status === status), 'appliedAt', 'desc'); }
  async createLeaveRequest(request: InsertLeaveRequest) { return insert<LeaveRequest>('leave_requests', request); }
  async updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>) { return updateById<LeaveRequest>('leave_requests', id, updates as any); }
  async deleteLeaveRequest(id: string) { return deleteById('leave_requests', id); }

  // Job Openings
  async getJobOpening(id: string) { return findById<JobOpening>('job_openings', id); }
  async getJobOpenings() { return sortBy(col<JobOpening>('job_openings'), 'createdAt', 'desc'); }
  async getJobOpeningsByStatus(status: string) { return sortBy(col<JobOpening>('job_openings').filter(j => j.status === status), 'createdAt', 'desc'); }
  async createJobOpening(opening: InsertJobOpening) { return insert<JobOpening>('job_openings', opening); }
  async updateJobOpening(id: string, updates: Partial<InsertJobOpening>) { return updateById<JobOpening>('job_openings', id, updates as any); }
  async deleteJobOpening(id: string) { return deleteById('job_openings', id); }

  // Job Portals
  async getJobPortals() { return sortBy(col<JobPortal>('job_portals'), 'name', 'asc'); }
  async getJobPortal(id: string) { return findById<JobPortal>('job_portals', id); }
  async createJobPortal(portal: InsertJobPortal) { return insert<JobPortal>('job_portals', portal); }
  async updateJobPortal(id: string, updates: Partial<InsertJobPortal>) { return updateById<JobPortal>('job_portals', id, updates as any); }
  async deleteJobPortal(id: string) { return deleteById('job_portals', id); }

  // Candidates
  async getCandidates(filters?: { status?: string; source?: string; appliedFor?: string }) {
    let rows = col<Candidate>('candidates');
    if (filters?.status) rows = rows.filter(c => c.status === filters.status);
    if (filters?.source) rows = rows.filter(c => c.source === filters.source);
    if (filters?.appliedFor) rows = rows.filter(c => c.appliedFor === filters.appliedFor);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async getCandidate(id: string) { return findById<Candidate>('candidates', id); }
  async getCandidateByPhone(phone: string) { return col<Candidate>('candidates').find(c => c.phone === phone); }
  async createCandidate(candidate: InsertCandidate) { return insert<Candidate>('candidates', candidate); }
  async updateCandidate(id: string, updates: Partial<InsertCandidate>) { return updateById<Candidate>('candidates', id, updates as any); }
  async deleteCandidate(id: string) { return deleteById('candidates', id); }
  async bulkCreateCandidates(candidateList: InsertCandidate[]) { return Promise.all(candidateList.map(c => this.createCandidate(c))); }

  // Candidate Calls
  async getCandidateCalls(candidateId: string) { return sortBy(col<CandidateCall>('candidate_calls').filter(c => c.candidateId === candidateId), 'callDate', 'desc'); }
  async getCandidateCall(id: string) { return findById<CandidateCall>('candidate_calls', id); }
  async createCandidateCall(call: InsertCandidateCall) { return insert<CandidateCall>('candidate_calls', call); }
  async updateCandidateCall(id: string, updates: Partial<InsertCandidateCall>) { return updateById<CandidateCall>('candidate_calls', id, updates as any); }
  async deleteCandidateCall(id: string) { return deleteById('candidate_calls', id); }
  async getRecentCalls(limit = 50) { return sortBy(col<CandidateCall>('candidate_calls'), 'callDate', 'desc').slice(0, limit); }

  // HR Templates
  async getHrTemplates(filters?: { category?: string; type?: string }) {
    let rows = col<HrTemplate>('hr_templates');
    if (filters?.category) rows = rows.filter(t => t.category === filters.category);
    if (filters?.type) rows = rows.filter(t => t.type === filters.type);
    return sortBy(rows, 'name', 'asc');
  }
  async getHrTemplate(id: string) { return findById<HrTemplate>('hr_templates', id); }
  async createHrTemplate(template: InsertHrTemplate) { return insert<HrTemplate>('hr_templates', template); }
  async updateHrTemplate(id: string, updates: Partial<InsertHrTemplate>) { return updateById<HrTemplate>('hr_templates', id, updates as any); }
  async deleteHrTemplate(id: string) { return deleteById('hr_templates', id); }
  async incrementHrTemplateUsage(id: string) {
    const t = findById<HrTemplate>('hr_templates', id);
    if (t) updateById<HrTemplate>('hr_templates', id, { usageCount: (t.usageCount ?? 0) + 1 } as any);
  }

  // Interviews
  async getInterviews(filter?: 'upcoming' | 'past') {
    const nowStr = new Date(); nowStr.setHours(0, 0, 0, 0);
    let rows = col<Interview>('interviews');
    if (filter === 'upcoming') return sortBy(rows.filter(i => new Date(i.interviewDate as any) >= nowStr), 'interviewDate', 'asc');
    if (filter === 'past') return sortBy(rows.filter(i => new Date(i.interviewDate as any) < nowStr), 'interviewDate', 'desc');
    return sortBy(rows, 'interviewDate', 'desc');
  }
  async getInterview(id: string) { return findById<Interview>('interviews', id); }
  async createInterview(interview: InsertInterview) { return insert<Interview>('interviews', interview); }
  async updateInterview(id: string, updates: Partial<InsertInterview>) { return updateById<Interview>('interviews', id, updates as any); }
  async deleteInterview(id: string) { return deleteById('interviews', id); }
  async bulkCreateInterviews(interviewList: InsertInterview[]) { return Promise.all(interviewList.map(i => this.createInterview(i))); }

  // Website Content
  async getWebsiteContent() { return col<WebsiteContent>('website_content'); }
  async getWebsiteContentBySection(section: string) { return col<WebsiteContent>('website_content').filter(w => w.section === section); }
  async upsertWebsiteContent(section: string, key: string, value: any, updatedBy?: string) {
    const rows = col<WebsiteContent>('website_content');
    const idx = rows.findIndex(w => w.section === section && w.key === key);
    if (idx !== -1) {
      rows[idx] = { ...rows[idx], value, updatedBy: updatedBy ?? null, updatedAt: now() } as any;
      set('website_content', rows);
      return rows[idx];
    }
    return insert<WebsiteContent>('website_content', { section, key, value, updatedBy: updatedBy ?? null });
  }

  // Payment Requests
  async getPaymentRequests() { return sortBy(col<PaymentRequest>('payment_requests').filter(p => !p.deletedAt), 'createdAt', 'desc'); }
  async getPaymentRequest(id: string) { return findById<PaymentRequest>('payment_requests', id); }
  async createPaymentRequest(request: InsertPaymentRequest) { return insert<PaymentRequest>('payment_requests', request); }
  async updatePaymentRequest(id: string, updates: Partial<InsertPaymentRequest>) { return updateById<PaymentRequest>('payment_requests', id, updates as any); }
  async deletePaymentRequest(id: string) { return updateById<PaymentRequest>('payment_requests', id, { deletedAt: now() } as any) !== undefined; }

  // Booking Types
  async getBookingTypes(userId?: string) {
    let rows = col<BookingType>('booking_types');
    if (userId) rows = rows.filter(b => b.userId === userId);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async getBookingType(id: string) { return findById<BookingType>('booking_types', id); }
  async getBookingTypeBySlug(slug: string) { return col<BookingType>('booking_types').find(b => b.slug === slug && b.isActive); }
  async createBookingType(bt: InsertBookingType) { return insert<BookingType>('booking_types', bt); }
  async updateBookingType(id: string, updates: Partial<InsertBookingType>) { return updateById<BookingType>('booking_types', id, updates as any); }
  async deleteBookingType(id: string) { return deleteById('booking_types', id); }

  // Availability Schedules
  async getAvailabilitySchedules(userId: string) {
    return sortBy(col<AvailabilitySchedule>('availability_schedules').filter(s => s.userId === userId && s.isActive), 'dayOfWeek', 'asc');
  }
  async setAvailabilitySchedules(userId: string, schedules: InsertAvailabilitySchedule[]) {
    const rows = col<AvailabilitySchedule>('availability_schedules').filter(s => s.userId !== userId);
    const inserted = schedules.map(s => ({ id: genId(), createdAt: now(), userId, ...s } as AvailabilitySchedule));
    set('availability_schedules', [...rows, ...inserted]);
    return inserted;
  }

  // Availability Overrides
  async getAvailabilityOverrides(userId: string, fromDate?: string, toDate?: string) {
    let rows = col<AvailabilityOverride>('availability_overrides').filter(o => o.userId === userId);
    if (fromDate) rows = rows.filter(o => (o.date as any) >= fromDate);
    if (toDate) rows = rows.filter(o => (o.date as any) <= toDate);
    return rows;
  }
  async createAvailabilityOverride(override: InsertAvailabilityOverride) { return insert<AvailabilityOverride>('availability_overrides', override); }
  async deleteAvailabilityOverride(id: string) { return deleteById('availability_overrides', id); }

  // Bookings
  async getBookings(options?: { hostUserId?: string; status?: string; from?: string; to?: string }) {
    let rows = col<Booking>('bookings');
    if (options?.hostUserId) rows = rows.filter(b => b.hostUserId === options.hostUserId);
    if (options?.status) rows = rows.filter(b => b.status === options.status);
    if (options?.from) rows = rows.filter(b => (b.startTime as any) >= options.from!);
    if (options?.to) rows = rows.filter(b => (b.startTime as any) <= options.to!);
    return sortBy(rows, 'startTime', 'desc');
  }
  async getBooking(id: string) { return findById<Booking>('bookings', id); }
  async getBookingByCancelToken(token: string) { return col<Booking>('bookings').find(b => b.cancelToken === token); }
  async createBooking(booking: InsertBooking) { return insert<Booking>('bookings', booking); }
  async updateBooking(id: string, updates: Partial<InsertBooking>) { return updateById<Booking>('bookings', id, updates as any); }
  async getBookingsForSlotCheck(hostUserId: string, date: string) {
    return col<Booking>('bookings').filter(b =>
      b.hostUserId === hostUserId &&
      b.status !== 'cancelled' &&
      (b.startTime as any)?.slice(0, 10) === date
    );
  }

  // Contacts
  async getContact(id: string) { return findById<Contact>('contacts', id); }
  async getContacts(filters?: { category?: string; teamId?: string; search?: string }) {
    let rows = col<Contact>('contacts');
    if (filters?.category) rows = rows.filter(c => c.category === filters.category);
    if (filters?.teamId) rows = rows.filter(c => c.teamId === filters.teamId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      rows = rows.filter(c => [c.name, c.email, c.phone, (c as any).organization].some(v => v?.toLowerCase().includes(s)));
    }
    return sortBy(rows, 'createdAt', 'desc');
  }
  async createContact(contact: InsertContact) { return insert<Contact>('contacts', contact); }
  async updateContact(id: string, updates: Partial<InsertContact>) { return updateById<Contact>('contacts', id, updates as any); }
  async deleteContact(id: string) { return deleteById('contacts', id); }

  // Deals
  async getDeal(id: string) { return findById<Deal>('deals', id); }
  async getDeals(filters?: { stage?: string; assignedTo?: string; teamId?: string }) {
    let rows = col<Deal>('deals');
    if (filters?.stage) rows = rows.filter(d => d.stage === filters.stage);
    if (filters?.assignedTo) rows = rows.filter(d => d.assignedTo === filters.assignedTo);
    if (filters?.teamId) rows = rows.filter(d => d.teamId === filters.teamId);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async createDeal(deal: InsertDeal) { return insert<Deal>('deals', deal); }
  async updateDeal(id: string, updates: Partial<InsertDeal>) { return updateById<Deal>('deals', id, updates as any); }
  async deleteDeal(id: string) { return deleteById('deals', id); }

  // Appointments
  async getAppointment(id: string) { return findById<Appointment>('appointments', id); }
  async getAppointments(filters?: { assignedTo?: string; teamId?: string; status?: string }) {
    let rows = col<Appointment>('appointments');
    if (filters?.assignedTo) rows = rows.filter(a => a.assignedTo === filters.assignedTo);
    if (filters?.teamId) rows = rows.filter(a => a.teamId === filters.teamId);
    if (filters?.status) rows = rows.filter(a => a.status === filters.status);
    return sortBy(rows, 'dateTime', 'asc');
  }
  async createAppointment(appt: InsertAppointment) { return insert<Appointment>('appointments', appt); }
  async updateAppointment(id: string, updates: Partial<InsertAppointment>) { return updateById<Appointment>('appointments', id, updates as any); }
  async deleteAppointment(id: string) { return deleteById('appointments', id); }

  // Tickets
  async getTicket(id: string) { return findById<Ticket>('tickets', id); }
  async getTickets(filters?: { status?: string; assignedTo?: string; reportedBy?: string; teamId?: string }) {
    let rows = col<Ticket>('tickets');
    if (filters?.status) rows = rows.filter(t => t.status === filters.status);
    if (filters?.assignedTo) rows = rows.filter(t => t.assignedTo === filters.assignedTo);
    if (filters?.reportedBy) rows = rows.filter(t => t.reportedBy === filters.reportedBy);
    if (filters?.teamId) rows = rows.filter(t => t.teamId === filters.teamId);
    return sortBy(rows, 'createdAt', 'desc');
  }
  async createTicket(ticket: InsertTicket) { return insert<Ticket>('tickets', ticket); }
  async updateTicket(id: string, updates: Partial<InsertTicket>) { return updateById<Ticket>('tickets', id, updates as any); }
  async deleteTicket(id: string) { return deleteById('tickets', id); }

  // Audit Logs
  async getAuditLogs(filters?: { entityType?: string; entityId?: string; userId?: string; limit?: number }) {
    let rows = sortBy(col<AuditLog>('audit_logs'), 'createdAt', 'desc');
    if (filters?.entityType) rows = rows.filter(l => l.entityType === filters.entityType);
    if (filters?.entityId) rows = rows.filter(l => l.entityId === filters.entityId);
    if (filters?.userId) rows = rows.filter(l => l.userId === filters.userId);
    return rows.slice(0, filters?.limit ?? 200);
  }
  async createAuditLog(log: InsertAuditLog) { return insert<AuditLog>('audit_logs', log); }

  // Notifications
  async getNotifications(userId: string) { return sortBy(col<Notification>('notifications').filter(n => n.userId === userId), 'createdAt', 'desc').slice(0, 50); }
  async createNotification(notification: InsertNotification) { return insert<Notification>('notifications', notification); }
  async markNotificationRead(id: string) { return updateById<Notification>('notifications', id, { isRead: true } as any) !== undefined; }
  async markAllNotificationsRead(userId: string) {
    const rows = col<Notification>('notifications').map(n => n.userId === userId ? { ...n, isRead: true } : n);
    set('notifications', rows);
    return true;
  }

  // Faire
  async getFaireStores() { return sortBy(col<FaireStore>('faire_stores'), 'createdAt', 'desc'); }
  async getFaireStore(id: string) { return findById<FaireStore>('faire_stores', id); }
  async createFaireStore(store: InsertFaireStore) { return insert<FaireStore>('faire_stores', store); }
  async updateFaireStore(id: string, updates: Partial<InsertFaireStore>) { return updateById<FaireStore>('faire_stores', id, updates as any); }
  async deleteFaireStore(id: string) { return deleteById('faire_stores', id); }
  async getFaireSuppliers() { return sortBy(col<FaireSupplier>('faire_suppliers'), 'createdAt', 'desc'); }
  async getFaireSupplier(id: string) { return findById<FaireSupplier>('faire_suppliers', id); }
  async createFaireSupplier(supplier: InsertFaireSupplier) { return insert<FaireSupplier>('faire_suppliers', supplier); }
  async updateFaireSupplier(id: string, updates: Partial<InsertFaireSupplier>) { return updateById<FaireSupplier>('faire_suppliers', id, updates as any); }
  async deleteFaireSupplier(id: string) { return deleteById('faire_suppliers', id); }
  async getFaireProducts() { return sortBy(col<FaireProduct>('faire_products'), 'createdAt', 'desc'); }
  async getFaireProduct(id: string) { return findById<FaireProduct>('faire_products', id); }
  async createFaireProduct(product: InsertFaireProduct) { return insert<FaireProduct>('faire_products', product); }
  async updateFaireProduct(id: string, updates: Partial<InsertFaireProduct>) { return updateById<FaireProduct>('faire_products', id, updates as any); }
  async deleteFaireProduct(id: string) { return deleteById('faire_products', id); }
  async getFaireOrders() { return sortBy(col<FaireOrder>('faire_orders'), 'createdAt', 'desc'); }
  async getFaireOrder(id: string) { return findById<FaireOrder>('faire_orders', id); }
  async updateFaireOrder(id: string, updates: Partial<InsertFaireOrder>) { return updateById<FaireOrder>('faire_orders', id, updates as any); }
  async getFaireShipments() { return sortBy(col<FaireShipment>('faire_shipments'), 'createdAt', 'desc'); }
  async createFaireShipment(shipment: InsertFaireShipment) { return insert<FaireShipment>('faire_shipments', shipment); }

  // LLC
  async getLLCBanks() { return sortBy(col<LLCBank>('llc_banks'), 'displayOrder', 'asc'); }
  async getLLCClients() { return sortBy(col<LLCClient>('llc_clients'), 'createdAt', 'desc'); }
  async getLLCClient(id: string) { return findById<LLCClient>('llc_clients', id); }
  async createLLCClient(client: InsertLLCClient) { return insert<LLCClient>('llc_clients', client); }
  async updateLLCClient(id: string, updates: Partial<InsertLLCClient>) { return updateById<LLCClient>('llc_clients', id, updates as any); }
  async deleteLLCClient(id: string) { return deleteById('llc_clients', id); }
  async getLLCClientDocuments(clientId: string) { return sortBy(col<LLCClientDocument>('llc_client_documents').filter(d => d.clientId === clientId), 'createdAt', 'desc'); }
  async createLLCClientDocument(document: InsertLLCClientDocument) { return insert<LLCClientDocument>('llc_client_documents', document); }
  async getLLCClientTimeline(clientId: string) { return sortBy(col<LLCClientTimeline>('llc_client_timeline').filter(t => t.clientId === clientId), 'createdAt', 'desc'); }
  async createLLCClientTimelineEntry(entry: InsertLLCClientTimeline) { return insert<LLCClientTimeline>('llc_client_timeline', entry); }
}

export const storage = new Storage();
