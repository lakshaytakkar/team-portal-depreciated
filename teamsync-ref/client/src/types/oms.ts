export type OmsFulfillmentType = "inventory" | "dropship";
export type OmsLocationType = "rack" | "shelf" | "bin" | "zone";
export type OmsInventoryStatus = "ok" | "low" | "critical" | "overstock";
export type OmsPOStatus = "draft" | "sent" | "confirmed" | "partially-received" | "received" | "cancelled";
export type OmsOrderType = "b2b" | "b2c" | "dropship";
export type OmsChannel = "shopify" | "faire" | "manual" | "whatsapp" | "website";
export type OmsOrderStatus = "pending" | "confirmed" | "picking" | "packed" | "dispatched" | "delivered" | "cancelled" | "on-hold";
export type OmsPaymentMode = "prepaid" | "cod" | "credit";
export type OmsPaymentStatus = "paid" | "pending" | "failed";
export type OmsCourier = "Delhivery" | "Shiprocket" | "DTDC" | "BlueDart" | "Ekart" | "Self";
export type OmsShipmentStatus = "created" | "picked_up" | "in-transit" | "out-for-delivery" | "delivered" | "rto" | "lost";
export type OmsReturnStatus = "requested" | "picked_up" | "received" | "qc-pass" | "qc-fail" | "restocked" | "refunded";
export type OmsResolutionType = "refund" | "replacement" | "restock-only";
export interface OmsProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  hsnCode: string;
  mrp: number;
  costPrice: number;
  weightGrams: number;
  dimensions: { l: number; w: number; h: number };
  isActive: boolean;
  fulfillmentType: OmsFulfillmentType;
}

export interface OmsLocation {
  id: string;
  code: string;
  name: string;
  type: OmsLocationType;
  zone: string;
  capacityUnits: number;
  currentUnits: number;
}

export interface OmsInventory {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  locationId: string;
  locationCode: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  reorderPoint: number;
  reorderQty: number;
  lastUpdated: string;
  status: OmsInventoryStatus;
}

export interface OmsSupplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  city: string;
  state: string;
  paymentTerms: string;
  leadTimeDays: number;
  rating: number;
  categories: string[];
  isActive: boolean;
}

export interface OmsPOLine {
  productId: string;
  sku: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
}

export interface OmsPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: OmsPOStatus;
  lines: OmsPOLine[];
  totalAmount: number;
  orderedDate: string;
  expectedDate: string;
  receivedDate?: string;
  createdBy: string;
}

export interface OmsOrderLine {
  productId: string;
  sku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  fulfillmentType: OmsFulfillmentType;
}

export interface OmsOrder {
  id: string;
  orderNumber: string;
  type: OmsOrderType;
  channel: OmsChannel;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  lines: OmsOrderLine[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  gstAmount: number;
  totalAmount: number;
  status: OmsOrderStatus;
  paymentMode: OmsPaymentMode;
  paymentStatus: OmsPaymentStatus;
  orderDate: string;
  assignedTo: string;
  shipmentId?: string;
}

export interface OmsShipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  courier: OmsCourier;
  awbNumber: string;
  weightGrams: number;
  status: OmsShipmentStatus;
  shippedDate: string;
  expectedDelivery: string;
  deliveredDate?: string;
  city: string;
  state: string;
  pincode: string;
  codAmount: number;
  lastMilestone: string;
}

export interface OmsReturnItem {
  sku: string;
  productName: string;
  qty: number;
  condition: string;
}

export interface OmsReturn {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  items: OmsReturnItem[];
  status: OmsReturnStatus;
  requestedDate: string;
  pickedDate?: string;
  receivedDate?: string;
  qcNotes: string;
  resolutionType: OmsResolutionType;
  handledBy: string;
}
