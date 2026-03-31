export type ContactCategory =
  | "visa_agent"
  | "embassy"
  | "hotel"
  | "supplier"
  | "guide"
  | "legal"
  | "finance"
  | "logistics"
  | "media"
  | "partner"
  | "government"
  | "other";

export type ContactPriority = "high" | "medium" | "low";
export interface ImportantContact {
  id: string;
  name: string;
  title: string;
  organization: string;
  category: ContactCategory;
  verticalIds: string[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  city: string;
  country: string;
  priority: ContactPriority;
  notes: string;
  tags: string[];
  added_by: string;
  created_at: string;
  is_shared: boolean;
}
