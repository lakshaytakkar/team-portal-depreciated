export type VendorOrderStatus = "New" | "Quoted" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type VendorStoreStatus = "Connected" | "Syncing" | "Disconnected";
export type VendorClientStatus = "Active" | "Inactive";
export type VendorTrackingStatus = "Label Created" | "Picked Up" | "In Transit" | "Out for Delivery" | "Delivered";
export type VendorLedgerType = "Credit" | "Debit";
export type VendorLedgerPaymentStatus = "Paid" | "Pending" | "Overdue";
export type VendorProductStockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export interface VendorClient {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  shopifyDomain: string;
  planTier: "Starter" | "Growth" | "Enterprise";
  status: VendorClientStatus;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
}

export interface VendorStore {
  id: string;
  clientId: string;
  storeName: string;
  domain: string;
  productCount: number;
  orderCount: number;
  status: VendorStoreStatus;
  lastSync: string;
  createdDate: string;
}

export interface VendorProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  category: string;
  weight: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  stockStatus: VendorProductStockStatus;
  stockQuantity: number;
}

export interface VendorOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VendorOrder {
  id: string;
  shopifyOrderNumber: string;
  storeId: string;
  storeName: string;
  customerName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: VendorOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: VendorOrderStatus;
  quotedCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorTracking {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  status: VendorTrackingStatus;
  shipDate: string;
  estimatedDelivery: string;
  statusUpdates: { status: VendorTrackingStatus; date: string; location: string }[];
}

export interface VendorLedgerEntry {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  description: string;
  invoiceNumber: string;
  type: VendorLedgerType;
  amount: number;
  balance: number;
  paymentStatus: VendorLedgerPaymentStatus;
}
