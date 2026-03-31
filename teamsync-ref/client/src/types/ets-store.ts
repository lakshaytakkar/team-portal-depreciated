export type StoreStatus = "setup" | "active";
export type StorePackage = "Lite" | "Pro" | "Elite";
export interface EtsStoreStatus {
  status: StoreStatus;
  package: StorePackage;
  onboardingStep: number;
  launchDate: string | null;
}

export interface EtsStoreConfig {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storePincode: string;
  gstin: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  upiId: string;
  logoUrl: string | null;
  currency: string;
}

export interface EtsStaffMember {
  id: string;
  name: string;
  phone: string;
  role: "owner" | "cashier";
  pin: string;
  active: boolean;
}
