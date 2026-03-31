export type QuotationStatus = "DRAFT" | "SENT" | "QUOTE_RECEIVED" | "ACCEPTED" | "CHALLENGED" | "SENT_ELSEWHERE";
export type LedgerPaymentStatus = "PENDING" | "PARTIALLY_PAID" | "CLEARED";
export type BankTransactionType = "CREDIT" | "DEBIT";
export interface FaireFulfiller {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  specialties: string[];
  rating: number;
  avg_lead_days: number;
  completed_orders: number;
  active_quotes: number;
}

export interface FaireQuotationItem {
  id: string;
  quotation_id: string;
  order_item_id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_options: Array<{ name: string; value: string }>;
  image_url: string;
  ordered_quantity: number;
  fulfiller_unit_cost_cents: number;
}

export interface FaireQuotation {
  id: string;
  order_id: string;
  store_id: string;
  fulfiller_id: string;
  status: QuotationStatus;
  items: FaireQuotationItem[];
  fulfiller_shipping_cost_cents: number;
  fulfiller_notes: string;
  our_notes: string;
  lead_days: number;
  sent_at: string | null;
  received_at: string | null;
  accepted_at: string | null;
  challenged_at: string | null;
  created_at: string;
}

export interface FaireLedgerEntry {
  id: string;
  order_id: string;
  store_id: string;
  faire_payout_cents: number;
  commission_cents: number;
  fulfiller_cost_cents: number;
  shipping_cost_cents: number;
  net_margin_cents: number;
  payment_status: LedgerPaymentStatus;
  faire_paid_at: string | null;
  fulfiller_paid_at: string | null;
  bank_transaction_ids: string[];
  notes: string;
}

export interface FaireBankTransaction {
  id: string;
  date: string;
  amount_cents: number;
  currency: string;
  reference: string;
  bank_name: string;
  type: BankTransactionType;
  description: string;
  mapped_order_ids: string[];
  mapped_ledger_ids: string[];
  reconciled: boolean;
}
