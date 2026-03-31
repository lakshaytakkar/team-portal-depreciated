export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  margin: number;
  status: "active" | "draft" | "archived";
  image: string;
  additionalImages: string[];
  orders: number;
  revenue: number;
  rating: number;
  source: "aliexpress" | "cjdropshipping" | "spocket";
  isTrending: boolean;
  isWinning: boolean;
  isLocked: boolean;
  description: string;
  sku: string;
  weight: string;
  tags: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  keywords: string[];
  productCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: "active" | "inactive";
  icon: string;
  trending?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  rating: number;
  products: number;
  avgShipping: number;
  status: "verified" | "pending" | "suspended";
}

export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "churned" | "trial";
  signupDate: string;
  lastLogin: string;
  storesConnected: number;
  productsImported: number;
  revenue: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: "website" | "referral" | "ad" | "organic";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  assignedTo: string;
  createdDate: string;
  notes: string;
}

export type PipelineStage = "new" | "contacted" | "engaged" | "qualified" | "demo_done" | "negotiation" | "converted";
export interface PipelineLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: "website" | "referral" | "ad" | "organic" | "youtube" | "instagram";
  pipelineStage: PipelineStage;
  engagementLevel: "cold" | "warm" | "hot";
  engagementScore: number;
  chaptersCompleted: number;
  totalChapters: number;
  daysInStage: number;
  assignedTo: string;
  createdDate: string;
  lastActivity: string;
  notes: string;
  callLog: { date: string; summary: string; duration: string }[];
  activitySummary: string;
  plan: "free" | "starter" | "pro" | "enterprise" | "none";
  city: string;
  country: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "canceled" | "past_due" | "trialing";
  startDate: string;
  endDate: string;
  mrr: number;
}

export interface ShopifyStore {
  id: string;
  name: string;
  owner: string;
  domain: string;
  status: "active" | "paused" | "disconnected";
  products: number;
  orders: number;
  revenue: number;
  connectedDate: string;
}

export interface CompetitorStore {
  id: string;
  name: string;
  domain: string;
  niche: string;
  estimatedRevenue: number;
  productCount: number;
  trafficRank: number;
}

export interface FulfillmentOrder {
  id: string;
  orderId: string;
  store: string;
  product: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  trackingNumber: string;
  supplier: string;
  createdDate: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  category: "billing" | "technical" | "product" | "account";
  createdDate: string;
  assignedTo: string;
}

export interface CourseChapter {
  id: string;
  title: string;
  contentType: "video" | "text" | "quiz";
  videoUrl?: string;
  duration: string;
  isPreview: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  isPreview: boolean;
  chapters: CourseChapter[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  lessons: number;
  enrolled: number;
  completionRate: number;
  status: "published" | "draft";
  instructor: string;
  modules: CourseModule[];
}

export interface RevenueMetric {
  month: string;
  mrr: number;
  newSubscriptions: number;
  churn: number;
  revenue: number;
}

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  userCount: number;
  revenue: number;
}

export interface PipelineFunnelStage {
  stage: string;
  label: string;
  count: number;
  color: string;
}

export interface LLCStatusEntry {
  stage: string;
  label: string;
  count: number;
  color: string;
}

export interface StalledClient {
  id: string;
  name: string;
  email: string;
  batch: string;
  lastActive: string;
  daysSinceActivity: number;
  llcStage: string;
  progress: number;
}

export interface ActivityFeedItem {
  id: string;
  type: "signup" | "payment" | "llc_update" | "course_complete" | "ticket" | "login" | "store_connect";
  user: string;
  description: string;
  timestamp: string;
  meta?: string;
}

export type ClientStatus = "active" | "stalled" | "graduated" | "paused";
export type LLCStatus = "pending" | "filed" | "ein_applied" | "boi_filed" | "bank_setup" | "stripe_setup" | "complete";
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  batchId: string;
  batchName: string;
  weekNumber: number;
  progress: number;
  llcStatus: LLCStatus;
  status: ClientStatus;
  lastActive: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  joinDate: string;
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  memberCount: number;
  status: "active" | "completed";
}

export type LLCStage = "pending" | "filed" | "ein_applied" | "boi_filed" | "bank_setup" | "stripe_setup" | "complete";
export interface LLCApplication {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  stage: LLCStage;
  llcName: string;
  state: string;
  appliedDate: string;
  lastUpdated: string;
  daysInStage: number;
  milestones: {
    pending?: string;
    filed?: string;
    ein_applied?: string;
    boi_filed?: string;
    bank_setup?: string;
    stripe_setup?: string;
    complete?: string;
  };
  notes: string;
  assignedTo: string;
}

export interface MentorshipSession {
  id: string;
  title: string;
  url: string;
  category: string;
  duration: string;
  sessionDate: string;
  published: boolean;
  order: number;
}

export interface OnboardingVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  order: number;
}

export interface OnboardingModule {
  id: string;
  title: string;
  description: string;
  status: "published" | "draft";
  order: number;
  videos: OnboardingVideo[];
}

export type FeatureAccessKey = "product_research" | "ai_ad_studio" | "competitor_spy" | "advanced_analytics" | "bulk_import" | "api_access" | "white_label" | "priority_support" | "mentorship" | "custom_integrations";
export interface FeatureAccess {
  key: FeatureAccessKey;
  label: string;
  enabled: boolean;
  plan: "free" | "starter" | "pro" | "enterprise";
}

export interface UserActivityLog {
  id: string;
  type: "login" | "purchase" | "course" | "llc" | "support" | "store" | "product" | "profile";
  description: string;
  timestamp: string;
}

export interface AdminNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface PaymentLinkHistory {
  id: string;
  amount: number;
  description: string;
  status: "sent" | "paid" | "expired";
  sentAt: string;
  paidAt?: string;
}

export interface UserCourseProgress {
  courseId: string;
  courseTitle: string;
  totalModules: number;
  completedModules: number;
  progress: number;
  lastAccessed: string;
  enrolled: string;
}

export interface DetailedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "churned" | "trial" | "paused";
  role: "user" | "mentor" | "admin";
  signupDate: string;
  lastLogin: string;
  batchName: string;
  weekNumber: number;
  llcStatus: LLCStatus;
  llcName: string;
  llcState: string;
  shopifyConnected: boolean;
  shopifyDomain: string;
  pipelineStage: PipelineStage;
  progress: number;
  storesConnected: number;
  productsImported: number;
  revenue: number;
  city: string;
  country: string;
  ein: string;
  website: string;
  instagram: string;
  tiktok: string;
  llcMilestones: {
    pending?: string;
    filed?: string;
    ein_applied?: string;
    boi_filed?: string;
    bank_setup?: string;
    stripe_setup?: string;
    complete?: string;
  };
  courses: UserCourseProgress[];
  featureAccess: FeatureAccess[];
  activityLog: UserActivityLog[];
  adminNotes: AdminNote[];
  paymentLinks: PaymentLinkHistory[];
  supportTickets: { id: string; subject: string; status: string; createdDate: string }[];
}
