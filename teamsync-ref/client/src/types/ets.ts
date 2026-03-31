export type EtsPipelineStage =
  | "new-lead"
  | "qualified"
  | "token-paid"
  | "store-design"
  | "inventory-ordered"
  | "in-transit"
  | "launched"
  | "reordering";

export type EtsOrderStatus =
  | "ordered"
  | "factory-ready"
  | "shipped"
  | "customs"
  | "warehouse"
  | "dispatched";

export type EtsProductCategory =
  | "toys"
  | "kitchenware"
  | "stationery"
  | "decor"
  | "bags"
  | "household"
  | "gifts";
export type EtsPackageTier = "lite" | "pro" | "elite";
export interface EtsClient {
  id: string;
  name: string;
  city: string;
  phone: string;
  storeSize: number;
  packageTier: EtsPackageTier;
  stage: EtsPipelineStage;
  daysInStage: number;
  lastNote: string;
  totalPaid: number;
  pendingDues: number;
  score: number;
  leadSource: string;
  assignedTo: string;
  nextAction: string;
  nextActionDate: string;
  createdDate: string;
}

export interface EtsProduct {
  id: string;
  name: string;
  category: EtsProductCategory;
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
  dutyPercent: number;
  igstPercent: number;
  isVisible: boolean;
  isHeroSku: boolean;
  marginTier: "standard" | "premium" | "value";
}

export interface EtsOrderDocument {
  name: string;
  type: "packing-list" | "invoice" | "bill-of-lading" | "customs-declaration";
}

export interface EtsOrder {
  id: string;
  clientId: string;
  clientName: string;
  status: EtsOrderStatus;
  etaDays: number;
  valueInr: number;
  itemCount: number;
  createdDate: string;
  documents: EtsOrderDocument[];
  isFlagged: boolean;
}

export interface EtsPayment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: "token" | "milestone" | "final";
  status: "received" | "pending" | "overdue";
  date: string;
  notes: string;
}

export interface EtsProposalBreakdownItem {
  item: string;
  amount: number;
  category: "interior" | "inventory" | "services" | "technology";
}

export interface EtsProposalTimeline {
  week: string;
  activity: string;
}

export interface EtsProposalTemplate {
  id: string;
  packageTier: EtsPackageTier;
  storeSize: number;
  totalInvestment: number;
  skuCount: number;
  categoryMix: Record<string, number>;
  investmentBreakdown: EtsProposalBreakdownItem[];
  timeline: EtsProposalTimeline[];
  inclusions: string[];
  exclusions: string[];
  paymentSchedule: { milestone: string; percent: number }[];
}

export interface EtsWhatsAppTemplate {
  id: string;
  title: string;
  content: string;
  category: "follow-up" | "proposal" | "update" | "welcome";
  variables: string[];
}

export interface EtsPriceSetting {
  key: string;
  value: number;
  label: string;
  unit: string;
}

export interface EtsPriceInputs {
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLengthCm: number;
  cartonWidthCm: number;
  cartonHeightCm: number;
  categoryDutyPercent: number;
  categoryIgstPercent: number;
  exchangeRate: number;
  sourcingCommission: number;
  freightPerCbm: number;
  insurancePercent: number;
  swSurchargePercent: number;
  ourMarkupPercent: number;
  targetStoreMargin: number;
  chaPortPercent?: number;
  domesticFreightPercent?: number;
  mrpTaggingCostPerUnit?: number;
  openingInventoryMarkup?: number;
}

export interface EtsPriceResult {
  fobPriceYuan: number;
  fobPriceInr: number;
  cbmPerUnit: number;
  freightPerUnit: number;
  cifPriceInr: number;
  customsDuty: number;
  swSurcharge: number;
  igst: number;
  chaPortCost: number;
  domesticFreightCost: number;
  mrpTaggingCost: number;
  totalLandedCost: number;
  storeLandingPrice: number;
  openingInventoryPrice: number;
  suggestedMrp: number;
  storeMarginPercent: number;
  storeMarginRs: number;
  marginWarning: boolean;
}

export interface EtsCalcTemplate {
  id: string;
  name: string;
  category: EtsProductCategory;
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
}
