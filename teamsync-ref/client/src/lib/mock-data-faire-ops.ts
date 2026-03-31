import type { FaireOrder } from "./mock-data-faire";
import { faireOrders, faireStores } from "./mock-data-faire";

import type { QuotationStatus, LedgerPaymentStatus, BankTransactionType, FaireFulfiller, FaireQuotationItem, FaireQuotation, FaireLedgerEntry, FaireBankTransaction } from "@/types/faire-ops";
export type { QuotationStatus, LedgerPaymentStatus, BankTransactionType, FaireFulfiller, FaireQuotationItem, FaireQuotation, FaireLedgerEntry, FaireBankTransaction };


// ─── Fulfillers ────────────────────────────────────────────────────────────────

export const faireFulfillers: FaireFulfiller[] = [
  {
    id: "fulf-001",
    name: "ShipFast Logistics",
    contact_name: "Marcus Webb",
    email: "marcus@shipfast.com",
    phone: "+1 503-555-0182",
    country: "USA",
    specialties: ["Textiles", "Candles", "Bath & Body", "Wellness"],
    rating: 4.7,
    avg_lead_days: 8,
    completed_orders: 142,
    active_quotes: 3,
  },
  {
    id: "fulf-002",
    name: "GlobalPack Co",
    contact_name: "Priya Sharma",
    email: "priya@globalpack.hk",
    phone: "+852 3500-8811",
    country: "Hong Kong",
    specialties: ["Kitchen & Dining", "Home Decor", "Rattan", "Ceramics"],
    rating: 4.5,
    avg_lead_days: 12,
    completed_orders: 98,
    active_quotes: 2,
  },
  {
    id: "fulf-003",
    name: "QuickFulfill EU",
    contact_name: "Hans Brinkmann",
    email: "hans@quickfulfill.de",
    phone: "+49 89 555-0234",
    country: "Germany",
    specialties: ["Stationery", "Artisan Goods", "Leather Goods", "Wall Art"],
    rating: 4.8,
    avg_lead_days: 6,
    completed_orders: 207,
    active_quotes: 1,
  },
  {
    id: "fulf-004",
    name: "AsiaDirect Supply",
    contact_name: "Riya Patel",
    email: "riya@asiadirect.in",
    phone: "+91 98200 45678",
    country: "India",
    specialties: ["Handwoven", "Artisan Goods", "Ceramics", "Textiles"],
    rating: 4.6,
    avg_lead_days: 10,
    completed_orders: 176,
    active_quotes: 4,
  },
];

// ─── Product image map (product_id → Unsplash URL) ─────────────────────────────

const PRODUCT_IMAGES: Record<string, string> = {
  p_prod001: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  p_prod002: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80",
  p_prod003: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
  p_prod004: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80",
  p_prod005: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
  p_prod006: "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?w=400&q=80",
  p_prod007: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
  p_prod008: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  p_prod009: "https://images.unsplash.com/photo-1571781565036-d3f759be73e4?w=400&q=80",
  p_prod010: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
};

export function getProductImage(productId: string): string {
  return PRODUCT_IMAGES[productId] ?? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80";
}

// ─── Quotations ────────────────────────────────────────────────────────────────

export const faireQuotations: FaireQuotation[] = [
  {
    id: "q_001",
    order_id: "bo_ord001",
    store_id: "store-001",
    fulfiller_id: "fulf-004",
    status: "QUOTE_RECEIVED",
    fulfiller_shipping_cost_cents: 1800,
    fulfiller_notes: "Can fulfill 4–6 business days. Using eco-friendly packaging. Handwoven throws require careful packing.",
    our_notes: "Check if the pricing leaves enough margin at 2500 bps commission.",
    lead_days: 10,
    sent_at: "2026-02-28T10:00:00Z",
    received_at: "2026-03-01T08:30:00Z",
    accepted_at: null,
    challenged_at: null,
    created_at: "2026-02-28T09:45:00Z",
    items: [
      {
        id: "qi_001a", quotation_id: "q_001", order_item_id: "oi_001a",
        variant_id: "po_var001a", product_id: "p_prod001",
        product_name: "Handwoven Cotton Throw",
        variant_options: [{ name: "Color", value: "Ivory" }],
        image_url: PRODUCT_IMAGES.p_prod001,
        ordered_quantity: 4, fulfiller_unit_cost_cents: 3100,
      },
      {
        id: "qi_001b", quotation_id: "q_001", order_item_id: "oi_001b",
        variant_id: "po_var002a", product_id: "p_prod002",
        product_name: "Soy Wax Pillar Candle Set",
        variant_options: [{ name: "Scent", value: "Lavender & Cedar" }],
        image_url: PRODUCT_IMAGES.p_prod002,
        ordered_quantity: 6, fulfiller_unit_cost_cents: 1950,
      },
    ],
  },
  {
    id: "q_002",
    order_id: "bo_ord002",
    store_id: "store-002",
    fulfiller_id: "fulf-002",
    status: "SENT",
    fulfiller_shipping_cost_cents: 0,
    fulfiller_notes: "",
    our_notes: "Preferred fulfiller for rattan goods. Awaiting response.",
    lead_days: 0,
    sent_at: "2026-02-28T11:00:00Z",
    received_at: null,
    accepted_at: null,
    challenged_at: null,
    created_at: "2026-02-28T10:50:00Z",
    items: [
      {
        id: "qi_002a", quotation_id: "q_002", order_item_id: "oi_002a",
        variant_id: "po_var003b", product_id: "p_prod003",
        product_name: "Rattan Fruit Bowl",
        variant_options: [{ name: "Size", value: "Large" }],
        image_url: PRODUCT_IMAGES.p_prod003,
        ordered_quantity: 6, fulfiller_unit_cost_cents: 0,
      },
    ],
  },
  {
    id: "q_003",
    order_id: "bo_ord003",
    store_id: "store-005",
    fulfiller_id: "fulf-001",
    status: "ACCEPTED",
    fulfiller_shipping_cost_cents: 1200,
    fulfiller_notes: "Body oil and serum packed in separate padded boxes. 3-day lead time from our warehouse in Denver.",
    our_notes: "Best margin we've seen on wellness. Approved.",
    lead_days: 3,
    sent_at: "2026-02-28T09:00:00Z",
    received_at: "2026-02-28T14:00:00Z",
    accepted_at: "2026-02-28T15:30:00Z",
    challenged_at: null,
    created_at: "2026-02-28T08:45:00Z",
    items: [
      {
        id: "qi_003a", quotation_id: "q_003", order_item_id: "oi_003a",
        variant_id: "po_var008a", product_id: "p_prod008",
        product_name: "Lavender Body Oil",
        variant_options: [{ name: "Size", value: "4oz" }],
        image_url: PRODUCT_IMAGES.p_prod008,
        ordered_quantity: 12, fulfiller_unit_cost_cents: 1000,
      },
      {
        id: "qi_003b", quotation_id: "q_003", order_item_id: "oi_003b",
        variant_id: "po_var009a", product_id: "p_prod009",
        product_name: "Rose Facial Serum",
        variant_options: [{ name: "Size", value: "1oz Dropper" }],
        image_url: PRODUCT_IMAGES.p_prod009,
        ordered_quantity: 6, fulfiller_unit_cost_cents: 1400,
      },
    ],
  },
  {
    id: "q_004",
    order_id: "bo_ord004",
    store_id: "store-001",
    fulfiller_id: "fulf-004",
    status: "ACCEPTED",
    fulfiller_shipping_cost_cents: 1600,
    fulfiller_notes: "Terracotta colorway sourced from same batch. Excellent availability. Ships in 10 days.",
    our_notes: "Margin at 28%. Acceptable. Confirmed.",
    lead_days: 10,
    sent_at: "2026-02-26T16:00:00Z",
    received_at: "2026-02-27T10:00:00Z",
    accepted_at: "2026-02-27T11:00:00Z",
    challenged_at: null,
    created_at: "2026-02-26T15:45:00Z",
    items: [
      {
        id: "qi_004a", quotation_id: "q_004", order_item_id: "oi_004a",
        variant_id: "po_var001b", product_id: "p_prod001",
        product_name: "Handwoven Cotton Throw",
        variant_options: [{ name: "Color", value: "Terracotta" }],
        image_url: PRODUCT_IMAGES.p_prod001,
        ordered_quantity: 4, fulfiller_unit_cost_cents: 3000,
      },
    ],
  },
  {
    id: "q_005",
    order_id: "bo_ord005",
    store_id: "store-002",
    fulfiller_id: "fulf-001",
    status: "ACCEPTED",
    fulfiller_shipping_cost_cents: 900,
    fulfiller_notes: "Natural and Sage colorways in stock. Ready to ship within 5 days.",
    our_notes: "Good margin. ShipFast is reliable for linens.",
    lead_days: 5,
    sent_at: "2026-02-25T13:00:00Z",
    received_at: "2026-02-25T17:00:00Z",
    accepted_at: "2026-02-26T09:00:00Z",
    challenged_at: null,
    created_at: "2026-02-25T12:45:00Z",
    items: [
      {
        id: "qi_005a", quotation_id: "q_005", order_item_id: "oi_005a",
        variant_id: "po_var004a", product_id: "p_prod004",
        product_name: "Linen Napkin Set",
        variant_options: [{ name: "Color", value: "Natural" }],
        image_url: PRODUCT_IMAGES.p_prod004,
        ordered_quantity: 8, fulfiller_unit_cost_cents: 1400,
      },
      {
        id: "qi_005b", quotation_id: "q_005", order_item_id: "oi_005b",
        variant_id: "po_var004b", product_id: "p_prod004",
        product_name: "Linen Napkin Set",
        variant_options: [{ name: "Color", value: "Sage" }],
        image_url: PRODUCT_IMAGES.p_prod004,
        ordered_quantity: 4, fulfiller_unit_cost_cents: 1400,
      },
    ],
  },
  {
    id: "q_006",
    order_id: "bo_ord006",
    store_id: "store-003",
    fulfiller_id: "fulf-003",
    status: "ACCEPTED",
    fulfiller_shipping_cost_cents: 2200,
    fulfiller_notes: "Will hand-package each journal individually as requested by retailer. 6-day lead.",
    our_notes: "Excellent margin on journals. QuickFulfill EU handles artisan goods well.",
    lead_days: 6,
    sent_at: "2026-02-24T10:00:00Z",
    received_at: "2026-02-24T16:00:00Z",
    accepted_at: "2026-02-25T09:00:00Z",
    challenged_at: null,
    created_at: "2026-02-24T09:45:00Z",
    items: [
      {
        id: "qi_006a", quotation_id: "q_006", order_item_id: "oi_006a",
        variant_id: "po_var005a", product_id: "p_prod005",
        product_name: "Hand-Stamped Leather Journal",
        variant_options: [{ name: "Color", value: "Brown" }, { name: "Design", value: "Fern" }],
        image_url: PRODUCT_IMAGES.p_prod005,
        ordered_quantity: 6, fulfiller_unit_cost_cents: 2100,
      },
      {
        id: "qi_006b", quotation_id: "q_006", order_item_id: "oi_006b",
        variant_id: "po_var005b", product_id: "p_prod005",
        product_name: "Hand-Stamped Leather Journal",
        variant_options: [{ name: "Color", value: "Tan" }, { name: "Design", value: "Wildflower" }],
        image_url: PRODUCT_IMAGES.p_prod005,
        ordered_quantity: 6, fulfiller_unit_cost_cents: 2100,
      },
    ],
  },
  {
    id: "q_007",
    order_id: "bo_ord007",
    store_id: "store-005",
    fulfiller_id: "fulf-001",
    status: "ACCEPTED",
    fulfiller_shipping_cost_cents: 1500,
    fulfiller_notes: "8oz body oil shipped cold-pack. Delivered within 8 days.",
    our_notes: "Margin 43%. Great performance from ShipFast.",
    lead_days: 8,
    sent_at: "2026-02-22T12:00:00Z",
    received_at: "2026-02-22T18:00:00Z",
    accepted_at: "2026-02-23T08:00:00Z",
    challenged_at: null,
    created_at: "2026-02-22T11:45:00Z",
    items: [
      {
        id: "qi_007a", quotation_id: "q_007", order_item_id: "oi_007a",
        variant_id: "po_var008b", product_id: "p_prod008",
        product_name: "Lavender Body Oil",
        variant_options: [{ name: "Size", value: "8oz" }],
        image_url: PRODUCT_IMAGES.p_prod008,
        ordered_quantity: 12, fulfiller_unit_cost_cents: 1600,
      },
    ],
  },
  {
    id: "q_008",
    order_id: "bo_ord008",
    store_id: "store-002",
    fulfiller_id: "fulf-002",
    status: "CHALLENGED",
    fulfiller_shipping_cost_cents: 2000,
    fulfiller_notes: "Rattan bowls require custom crating. Shipping cost reflects fragile freight.",
    our_notes: "Margin too thin at 14%. Asked for 10% reduction on unit costs.",
    lead_days: 14,
    sent_at: "2026-02-21T17:00:00Z",
    received_at: "2026-02-22T10:00:00Z",
    accepted_at: null,
    challenged_at: "2026-02-22T11:30:00Z",
    created_at: "2026-02-21T16:45:00Z",
    items: [
      {
        id: "qi_008a", quotation_id: "q_008", order_item_id: "oi_008a",
        variant_id: "po_var003a", product_id: "p_prod003",
        product_name: "Rattan Fruit Bowl",
        variant_options: [{ name: "Size", value: "Small" }],
        image_url: PRODUCT_IMAGES.p_prod003,
        ordered_quantity: 12, fulfiller_unit_cost_cents: 1500,
      },
      {
        id: "qi_008b", quotation_id: "q_008", order_item_id: "oi_008b",
        variant_id: "po_var004c", product_id: "p_prod004",
        product_name: "Linen Napkin Set",
        variant_options: [{ name: "Color", value: "Dusty Rose" }],
        image_url: PRODUCT_IMAGES.p_prod004,
        ordered_quantity: 4, fulfiller_unit_cost_cents: 1600,
      },
    ],
  },
  {
    id: "q_009",
    order_id: "bo_ord009",
    store_id: "store-001",
    fulfiller_id: "fulf-001",
    status: "ACCEPTED",
    fulfiller_shipping_cost_cents: 1300,
    fulfiller_notes: "Sandalwood & Amber candles available in bulk. Shipped within 7 days.",
    our_notes: "Reliable. Margin 34%.",
    lead_days: 7,
    sent_at: "2026-02-14T11:00:00Z",
    received_at: "2026-02-15T08:00:00Z",
    accepted_at: "2026-02-15T09:00:00Z",
    challenged_at: null,
    created_at: "2026-02-14T10:45:00Z",
    items: [
      {
        id: "qi_009a", quotation_id: "q_009", order_item_id: "oi_009a",
        variant_id: "po_var002b", product_id: "p_prod002",
        product_name: "Soy Wax Pillar Candle Set",
        variant_options: [{ name: "Scent", value: "Sandalwood & Amber" }],
        image_url: PRODUCT_IMAGES.p_prod002,
        ordered_quantity: 12, fulfiller_unit_cost_cents: 1850,
      },
    ],
  },
  {
    id: "q_010",
    order_id: "bo_ord001",
    store_id: "store-001",
    fulfiller_id: "fulf-002",
    status: "DRAFT",
    fulfiller_shipping_cost_cents: 0,
    fulfiller_notes: "",
    our_notes: "Fallback in case AsiaDirect quote is too expensive. Draft ready to send.",
    lead_days: 0,
    sent_at: null,
    received_at: null,
    accepted_at: null,
    challenged_at: null,
    created_at: "2026-03-01T07:00:00Z",
    items: [
      {
        id: "qi_010a", quotation_id: "q_010", order_item_id: "oi_001a",
        variant_id: "po_var001a", product_id: "p_prod001",
        product_name: "Handwoven Cotton Throw",
        variant_options: [{ name: "Color", value: "Ivory" }],
        image_url: PRODUCT_IMAGES.p_prod001,
        ordered_quantity: 4, fulfiller_unit_cost_cents: 0,
      },
      {
        id: "qi_010b", quotation_id: "q_010", order_item_id: "oi_001b",
        variant_id: "po_var002a", product_id: "p_prod002",
        product_name: "Soy Wax Pillar Candle Set",
        variant_options: [{ name: "Scent", value: "Lavender & Cedar" }],
        image_url: PRODUCT_IMAGES.p_prod002,
        ordered_quantity: 6, fulfiller_unit_cost_cents: 0,
      },
    ],
  },
];

// ─── Ledger ─────────────────────────────────────────────────────────────────────

function computeQuotationCost(orderId: string): { fulfiller_cost_cents: number; shipping_cost_cents: number } {
  const q = faireQuotations.find(x => x.order_id === orderId && x.status === "ACCEPTED");
  if (!q) return { fulfiller_cost_cents: 0, shipping_cost_cents: 0 };
  const items_cost = q.items.reduce((s, i) => s + i.fulfiller_unit_cost_cents * i.ordered_quantity, 0);
  return { fulfiller_cost_cents: items_cost, shipping_cost_cents: q.fulfiller_shipping_cost_cents };
}

function computeOrderGross(order: FaireOrder): number {
  return order.items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
}

function buildLedgerEntry(
  id: string, order: FaireOrder, payment_status: LedgerPaymentStatus,
  faire_paid_at: string | null, fulfiller_paid_at: string | null,
  bank_transaction_ids: string[], notes: string
): FaireLedgerEntry {
  const gross = computeOrderGross(order);
  const commission = order.payout_costs.commission_cents;
  const faire_payout = gross - commission;
  const { fulfiller_cost_cents, shipping_cost_cents } = computeQuotationCost(order.id);
  const net_margin = faire_payout - fulfiller_cost_cents - shipping_cost_cents;
  return {
    id, order_id: order.id, store_id: order.storeId,
    faire_payout_cents: faire_payout, commission_cents: commission,
    fulfiller_cost_cents, shipping_cost_cents,
    net_margin_cents: net_margin,
    payment_status, faire_paid_at, fulfiller_paid_at,
    bank_transaction_ids, notes,
  };
}

const orderMap = Object.fromEntries(faireOrders.map(o => [o.id, o]));

export const faireLedgerEntries: FaireLedgerEntry[] = [
  buildLedgerEntry("led_001", orderMap["bo_ord009"], "CLEARED",
    "2026-02-22T00:10:34Z", "2026-02-23T09:00:00Z",
    ["bt_001", "bt_007"], "Faire payout received. Fulfiller paid via wire."),
  buildLedgerEntry("led_002", orderMap["bo_ord010"], "CLEARED",
    "2026-02-24T00:10:34Z", "2026-02-25T10:00:00Z",
    ["bt_002", "bt_008"], "WELLNESS10 discount applied. Net still healthy."),
  buildLedgerEntry("led_003", orderMap["bo_ord014"], "CLEARED",
    "2026-01-27T00:10:34Z", "2026-01-28T08:00:00Z",
    ["bt_003", "bt_009"], "Large throw order. Cleared cleanly."),
  buildLedgerEntry("led_004", orderMap["bo_ord007"], "PARTIALLY_PAID",
    null, null,
    ["bt_004"], "Faire payout pending. Partial fulfiller advance paid."),
  buildLedgerEntry("led_005", orderMap["bo_ord008"], "PENDING",
    null, null,
    [], "Quotation challenged — awaiting revised fulfiller quote before payment."),
  buildLedgerEntry("led_006", orderMap["bo_ord011"], "PARTIALLY_PAID",
    null, null,
    ["bt_005"], "Macramé order. Advance paid to fulfiller. Awaiting Faire payout."),
  buildLedgerEntry("led_007", orderMap["bo_ord012"], "PENDING",
    null, null,
    [], "Honey order. Faire payout expected Mar 12."),
  buildLedgerEntry("led_008", orderMap["bo_ord013"], "PENDING",
    null, null,
    [], "Small body oil order. Low margin — monitor."),
  buildLedgerEntry("led_009", orderMap["bo_ord004"], "PARTIALLY_PAID",
    null, null,
    ["bt_006"], "Processing order. Fulfiller advance paid. Awaiting shipment confirmation."),
  buildLedgerEntry("led_010", orderMap["bo_ord005"], "PENDING",
    null, null,
    [], "Linen napkin order in transit. Payout expected."),
  buildLedgerEntry("led_011", orderMap["bo_ord006"], "PENDING",
    null, null,
    [], "Journal order — tradeshow source, good margin."),
];

// ─── Bank Transactions ─────────────────────────────────────────────────────────

export const faireBankTransactions: FaireBankTransaction[] = [
  {
    id: "bt_001", date: "2026-02-22", amount_cents: 25200, currency: "USD",
    reference: "FAIRE-PAY-28700II", bank_name: "Chase Business", type: "CREDIT",
    description: "Faire payout – order 28700II (Suprans Lifestyle)",
    mapped_order_ids: ["bo_ord009"], mapped_ledger_ids: ["led_001"], reconciled: true,
  },
  {
    id: "bt_002", date: "2026-02-24", amount_cents: 34200, currency: "USD",
    reference: "FAIRE-PAY-28680JJ", bank_name: "Chase Business", type: "CREDIT",
    description: "Faire payout – order 28680JJ (Pure Essentials)",
    mapped_order_ids: ["bo_ord010"], mapped_ledger_ids: ["led_002"], reconciled: true,
  },
  {
    id: "bt_003", date: "2026-01-27", amount_cents: 25200, currency: "USD",
    reference: "FAIRE-PAY-28400NN", bank_name: "Chase Business", type: "CREDIT",
    description: "Faire payout – order 28400NN (Suprans Lifestyle)",
    mapped_order_ids: ["bo_ord014"], mapped_ledger_ids: ["led_003"], reconciled: true,
  },
  {
    id: "bt_004", date: "2026-02-25", amount_cents: 9600, currency: "USD",
    reference: "WIRE-2026-0225-001", bank_name: "Chase Business", type: "DEBIT",
    description: "Advance payment to ShipFast Logistics – order bo_ord007",
    mapped_order_ids: ["bo_ord007"], mapped_ledger_ids: ["led_004"], reconciled: true,
  },
  {
    id: "bt_005", date: "2026-02-26", amount_cents: 14400, currency: "USD",
    reference: "WIRE-2026-0226-002", bank_name: "Chase Business", type: "DEBIT",
    description: "Fulfiller advance – QuickFulfill EU – macramé order bo_ord011",
    mapped_order_ids: ["bo_ord011"], mapped_ledger_ids: ["led_006"], reconciled: true,
  },
  {
    id: "bt_006", date: "2026-02-27", amount_cents: 7600, currency: "USD",
    reference: "WIRE-2026-0227-003", bank_name: "Chase Business", type: "DEBIT",
    description: "Partial advance to AsiaDirect Supply – throw order bo_ord004",
    mapped_order_ids: ["bo_ord004"], mapped_ledger_ids: ["led_009"], reconciled: true,
  },
  {
    id: "bt_007", date: "2026-02-23", amount_cents: 20900, currency: "USD",
    reference: "WIRE-2026-0223-004", bank_name: "Chase Business", type: "DEBIT",
    description: "Fulfiller final payment – ShipFast Logistics – candle order bo_ord009",
    mapped_order_ids: ["bo_ord009"], mapped_ledger_ids: ["led_001"], reconciled: true,
  },
  {
    id: "bt_008", date: "2026-02-25", amount_cents: 25400, currency: "USD",
    reference: "WIRE-2026-0225-005", bank_name: "Chase Business", type: "DEBIT",
    description: "Fulfiller payment – ShipFast Logistics – wellness order bo_ord010",
    mapped_order_ids: ["bo_ord010"], mapped_ledger_ids: ["led_002"], reconciled: true,
  },
  {
    id: "bt_009", date: "2026-01-28", amount_cents: 14200, currency: "USD",
    reference: "WIRE-2026-0128-006", bank_name: "Chase Business", type: "DEBIT",
    description: "Fulfiller payment – AsiaDirect Supply – throw order bo_ord014",
    mapped_order_ids: ["bo_ord014"], mapped_ledger_ids: ["led_003"], reconciled: true,
  },
  {
    id: "bt_010", date: "2026-03-01", amount_cents: 31400, currency: "USD",
    reference: "FAIRE-PAY-28780GG", bank_name: "Chase Business", type: "CREDIT",
    description: "Faire payout expected – order 28780GG (Pure Essentials) – UNMATCHED",
    mapped_order_ids: [], mapped_ledger_ids: [], reconciled: false,
  },
  {
    id: "bt_011", date: "2026-03-01", amount_cents: 22800, currency: "USD",
    reference: "FAIRE-PAY-28770HH", bank_name: "Chase Business", type: "CREDIT",
    description: "Faire payout expected – order 28770HH (LBM Home & Living) – UNMATCHED",
    mapped_order_ids: [], mapped_ledger_ids: [], reconciled: false,
  },
  {
    id: "bt_012", date: "2026-03-01", amount_cents: 18200, currency: "USD",
    reference: "WIRE-2026-0301-007", bank_name: "Chase Business", type: "DEBIT",
    description: "Fulfiller deposit – GlobalPack Co – pending order mapping",
    mapped_order_ids: [], mapped_ledger_ids: [], reconciled: false,
  },
  {
    id: "bt_013", date: "2026-02-28", amount_cents: 5600, currency: "USD",
    reference: "FAIRE-PAY-28650KK", bank_name: "Chase Business", type: "CREDIT",
    description: "Faire partial payout – macramé order – amount mismatch, verify",
    mapped_order_ids: [], mapped_ledger_ids: [], reconciled: false,
  },
  {
    id: "bt_014", date: "2026-03-01", amount_cents: 7200, currency: "USD",
    reference: "WIRE-2026-0301-008", bank_name: "Chase Business", type: "DEBIT",
    description: "Advance to ShipFast Logistics – new wellness order – unassigned",
    mapped_order_ids: [], mapped_ledger_ids: [], reconciled: false,
  },
];

export { faireOrders, faireStores };
