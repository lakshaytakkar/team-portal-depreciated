export interface EtsPortalClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
}

export type SetupItemGroup =
  | "Shelving & Display"
  | "Technology & Hardware"
  | "Counters & Furniture"
  | "Branding & Signage"
  | "Lighting"
  | "Security";

export interface SetupItem {
  id: string;
  name: string;
  description: string;
  group: SetupItemGroup;
  priceRangeMin: number;
  priceRangeMax: number;
  recommendedQtyFor1000sqft: number;
  isEssential: boolean;
  buyLink?: string;
  imageUrl?: string;
}

export type StoreSizeSqFt = 500 | 800 | 1000;
