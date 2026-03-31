export type AssetCategory = "Laptop" | "Monitor" | "Mouse" | "Keyboard" | "Phone" | "Tablet" | "Headphones" | "Printer" | "Other";
export type AssetCondition = "new" | "good" | "fair" | "poor";
export type AssetStatus = "available" | "assigned" | "in-repair" | "retired";
export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: AssetCondition;
  status: AssetStatus;
  imageUrl: string;
  warrantyExpiry: string;
  location: string;
  notes: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  employeeName: string;
  assignedDate: string;
  returnDate: string | null;
  notes: string;
}
