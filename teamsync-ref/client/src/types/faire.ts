export type FaireStoreStatus = "connected" | "disconnected" | "error";
export type ProductLifecycleState = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "DELETED";
export type ProductSaleState = "FOR_SALE" | "SALES_PAUSED";
export type OrderState = "NEW" | "PROCESSING" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "PENDING_RETAILER_CONFIRMATION" | "BACKORDERED" | "CANCELED";
export type OrderItemState = "PROCESSING" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "PENDING_RETAILER_CONFIRMATION" | "BACKORDERED" | "CANCELED" | "DAMAGED_OR_MISSING";
export type OrderCancelReason = "REQUESTED_BY_RETAILER" | "RETAILER_NOT_GOOD_FIT" | "CHANGE_REPLACE_ORDER" | "ITEM_OUT_OF_STOCK" | "INCORRECT_PRICING" | "ORDER_TOO_SMALL" | "REJECT_INTERNATIONAL_ORDER" | "OTHER";
export type FreeShippingReason = "INSIDER_FREE_SHIPPING" | "FAIRE_DIRECT" | "BRAND_DISCOUNT" | "FIRST_ORDER" | "PROMO_CODE" | "FREE_SHIPPING_THRESHOLD";
export type OrderSource = "MARKETPLACE" | "FAIRE_DIRECT" | "TRADESHOW";
export type ShipmentType = "SHIP_ON_YOUR_OWN" | "FAIRE_SHIPPING_LABEL";
export interface FaireStore {
  id: string;
  name: string;
  brandToken: string;
  apiKeyConfigured: boolean;
  status: FaireStoreStatus;
  category: string;
  city: string;
  state: string;
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  avgOrderValue: number;
  activeRetailers: number;
  rating: number;
  joinedDate: string;
  lastSync: string;
  todayOrders: number;
}

export interface FaireProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  wholesale_price_cents: number;
  retail_price_cents: number;
  available_quantity: number;
  backordered_until: string | null;
  options: Array<{ name: string; value: string }>;
  lifecycle_state: ProductLifecycleState;
  sale_state: ProductSaleState;
}

export interface FaireProductReview {
  id: string;
  productId: string;
  retailer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FaireProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  variants: FaireProductVariant[];
  lifecycle_state: ProductLifecycleState;
  sale_state: ProductSaleState;
  minimum_order_quantity: number;
  units_per_case: number;
  made_in_country: string;
  taxonomy_type?: string;
  short_description?: string;
  unit_multiplier?: number;
  preorderable?: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  reviews: FaireProductReview[];
}

export interface FaireAddress {
  name: string;
  company_name?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  state_code?: string;
  postal_code: string;
  country: string;
  country_code: string;
  phone_number?: string;
}

export interface FaireOrderItemDiscount {
  id: string;
  code: string;
  includes_free_shipping: boolean;
  discount_percentage?: number;
  discount_type: "PERCENTAGE" | "FLAT_AMOUNT";
}

export interface FaireOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  price_cents: number;
  state: OrderItemState;
  includes_tester: boolean;
  discounts: FaireOrderItemDiscount[];
}

export interface FaireShipment {
  id: string;
  orderId: string;
  tracking_code: string;
  carrier: string;
  shipped_at: string;
  maker_cost_cents: number;
  shipping_type: ShipmentType;
}

export interface FairePayoutCosts {
  payout_fee_cents: number;
  payout_fee_bps: number;
  commission_cents: number;
  commission_bps: number;
}

export interface FaireBrandDiscount {
  id: string;
  code: string;
  includes_free_shipping: boolean;
  discount_percentage?: number;
  discount_type: "PERCENTAGE" | "FLAT_AMOUNT";
}

export interface FaireOrder {
  id: string;
  display_id: string;
  storeId: string;
  retailer_id: string;
  state: OrderState;
  items: FaireOrderItem[];
  shipments: FaireShipment[];
  address: FaireAddress;
  payout_costs: FairePayoutCosts;
  source: OrderSource;
  is_free_shipping: boolean;
  free_shipping_reason?: FreeShippingReason;
  faire_covered_shipping_cost?: number;
  ship_after?: string;
  payment_initiated_at?: string;
  brand_discounts: FaireBrandDiscount[];
  estimated_payout_at?: string;
  purchase_order_number?: string;
  notes: string | null;
  has_pending_retailer_cancellation_request: boolean;
  sales_rep_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FaireRetailer {
  id: string;
  name: string;
  email: string;
  retailer_token: string;
  store_name: string;
  city: string;
  state: string;
  country: string;
  website: string | null;
  instagram: string | null;
  description: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_ordered: string | null;
  storeIds: string[];
  status: "active" | "inactive";
}
