export interface PosProduct {
  id: string;
  name: string;
  barcode: string;
  mrp: number;
  category: string;
  image: string | null;
  inStock: number;
}

export interface PosBillItem {
  id: string;
  productId: string;
  name: string;
  mrp: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
}

export interface PosHeldBill {
  id: string;
  items: PosBillItem[];
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface PosSale {
  id: string;
  receiptNumber: string;
  storeId: string;
  items: PosBillItem[];
  totalAmount: number;
  paymentMethod: "cash" | "upi" | "card";
  cashReceived?: number;
  changeReturned?: number;
  timestamp: string;
  cashierId?: string;
  cashierName?: string;
}

export type StockStatus = "healthy" | "low" | "out";
export type MovementType = "sale" | "receive" | "return" | "adjustment";
export type AdjustmentReason = "physical-count" | "damaged" | "found-backroom" | "lost-stolen" | "miscount-receive";
export interface InventoryItem {
  productId: string;
  storeId: string;
  currentStock: number;
  reorderThreshold: number;
  costPrice: number;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  storeId: string;
  productId: string;
  movementType: MovementType;
  quantityChange: number;
  referenceType: string;
  referenceId: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface StockReceiveSession {
  id: string;
  storeId: string;
  referenceNumber: string;
  items: StockReceiveItem[];
  totalItems: number;
  receivedBy: string;
  timestamp: string;
}

export interface StockReceiveItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  image: string | null;
}

export interface RegisterSession {
  id: string;
  storeId: string;
  openedBy: string;
  openedAt: string;
  openingAmount: number;
  closedBy?: string;
  closedAt?: string;
  closingAmount?: number;
  expectedAmount?: number;
  difference?: number;
  status: "open" | "closed";
  notes?: string;
}

export interface ReturnRecord {
  id: string;
  referenceNumber: string;
  storeId: string;
  originalSaleId: string;
  originalReceiptNumber: string;
  items: ReturnItem[];
  totalRefund: number;
  refundMethod: "cash" | "store-credit";
  reason: string;
  processedBy: string;
  timestamp: string;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  image: string | null;
  mrp: number;
  originalQty: number;
  returnQty: number;
  lineTotal: number;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  gstin: string;
  phone: string;
  lowStockThreshold: number;
  quickAddProductIds: string[];
  autoPrintReceipt: boolean;
  storeId: string;
  partnerPackage: "Lite" | "Pro" | "Elite";
  storeStatus: "active" | "setup" | "inactive";
}
