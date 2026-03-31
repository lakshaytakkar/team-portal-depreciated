export type Platform = "instagram" | "youtube" | "linkedin" | "facebook" | "threads";
export type MediaType = "reel" | "carousel" | "static" | "story" | "short" | "long-video";
export type PostStage = "idea" | "script" | "design" | "caption" | "approval" | "scheduled" | "published" | "rejected";
export type AssetType = "image" | "video" | "reel" | "story-template" | "logo" | "thumbnail";
export type AssignmentType = "caption" | "script" | "design" | "scheduling" | "reporting";
export interface SocialAccount {
  id: string;
  brand: string;
  platform: Platform;
  handle: string;
  followers: number;
  engagementRate: number;
  postsThisMonth: number;
  color: string;
}

export interface PostMetrics {
  reach: number;
  impressions: number;
  engagement: number;
  saves: number;
  shares: number;
  watchTime: number;
  clicks: number;
  followerGain: number;
}

export interface SocialPost {
  id: string;
  title: string;
  caption: string;
  mediaType: MediaType;
  platforms: Platform[];
  accountIds: string[];
  campaignId: string | null;
  verticalTag: string;
  stage: PostStage;
  approvalStatus: "pending" | "approved" | "rejected" | null;
  scheduledDate: string | null;
  publishedDate: string | null;
  performanceScore: number | null;
  createdBy: string;
  metrics: PostMetrics | null;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  goal: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "draft";
  platforms: Platform[];
  postCount: number;
  totalReach: number;
  totalEngagement: number;
  leads: number;
  revenue: number;
  managedBy: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: AssetType;
  brand: string;
  status: "approved" | "draft";
  uploadedBy: string;
  uploadedDate: string;
  tags: string[];
  size: string;
}

export interface ApprovalRequest {
  id: string;
  postId: string;
  postTitle: string;
  postCaption: string;
  platforms: Platform[];
  brand: string;
  submittedBy: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  approverComment: string;
  reviewedDate: string | null;
  priority: "high" | "normal";
}

export interface Assignment {
  id: string;
  title: string;
  type: AssignmentType;
  assignedTo: string;
  role: string;
  postId: string | null;
  postTitle: string | null;
  campaignId: string | null;
  dueDate: string;
  status: "pending" | "in-progress" | "done" | "overdue";
  notes: string;
}
