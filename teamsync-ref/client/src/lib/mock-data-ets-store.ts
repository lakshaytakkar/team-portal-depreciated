import type { StoreStatus, StorePackage, EtsStoreStatus, EtsStoreConfig, EtsStaffMember } from "@/types/ets-store";
export type { StoreStatus, StorePackage, EtsStoreStatus, EtsStoreConfig, EtsStaffMember };


let _storeStatus: EtsStoreStatus = {
  status: "active",
  package: "Pro",
  onboardingStep: 3,
  launchDate: "2024-11-15",
};

let _storeConfig: EtsStoreConfig = {
  storeName: "EazyToSell - Rajesh Store",
  storeAddress: "Shop 12, Kamla Nagar, New Delhi - 110007",
  storeCity: "Delhi",
  storePincode: "110007",
  gstin: "07AABCU9603R1ZP",
  ownerName: "Rajesh Kumar",
  ownerPhone: "+91 98110 45678",
  ownerEmail: "rajesh@example.in",
  upiId: "eazytosell@upi",
  logoUrl: null,
  currency: "INR",
};

let _staffMembers: EtsStaffMember[] = [
  { id: "s1", name: "Ramesh Kumar", phone: "+91 98765 43210", role: "cashier", pin: "1234", active: true },
  { id: "s2", name: "Priya Sharma", phone: "+91 87654 32109", role: "cashier", pin: "5678", active: false },
];

export function getStoreStatus(): EtsStoreStatus {
  return { ..._storeStatus };
}

export function setStoreStatus(status: Partial<EtsStoreStatus>): void {
  _storeStatus = { ..._storeStatus, ...status };
}

export function getStoreConfig(): EtsStoreConfig {
  return { ..._storeConfig };
}

export function setStoreConfig(config: Partial<EtsStoreConfig>): void {
  _storeConfig = { ..._storeConfig, ...config };
}

export function getStaffMembers(): EtsStaffMember[] {
  return _staffMembers.map(m => ({ ...m }));
}

export function addStaffMember(member: Omit<EtsStaffMember, "id">): EtsStaffMember {
  const newMember: EtsStaffMember = {
    ...member,
    id: `s${Date.now()}`,
  };
  _staffMembers = [..._staffMembers, newMember];
  return { ...newMember };
}

export function updateStaffMember(id: string, updates: Partial<Omit<EtsStaffMember, "id">>): EtsStaffMember | null {
  const idx = _staffMembers.findIndex(m => m.id === id);
  if (idx === -1) return null;
  _staffMembers = _staffMembers.map(m => m.id === id ? { ...m, ...updates } : m);
  return { ..._staffMembers[idx], ...updates };
}

export function deactivateStaffMember(id: string): boolean {
  const idx = _staffMembers.findIndex(m => m.id === id);
  if (idx === -1) return false;
  _staffMembers = _staffMembers.map(m => m.id === id ? { ...m, active: false } : m);
  return true;
}
