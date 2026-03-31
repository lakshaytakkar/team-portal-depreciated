import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ── Vertical ID compatibility layer ───────────────────────────────────────────
// The Supabase database stores the legacy vertical IDs that were in use before
// the app-level rename (hr/sales/events/admin). This layer translates between
// the new app IDs (legalnations/usdrop/goyotours/lbm) and the DB-stored IDs
// without requiring a DB migration.
//
// toDbVerticalId(appId)  → use when querying or writing to Supabase
// fromDbVerticalId(dbId) → use when returning rows to the frontend
// normalizeIncomingVerticalId(id) → accepts either old or new IDs from callers

const APP_TO_DB_VERTICAL_ID: Record<string, string> = {
  legalnations: "hr",
  usdrop: "sales",
  goyotours: "events",
  lbm: "admin",
};

const DB_TO_APP_VERTICAL_ID: Record<string, string> = {
  hr: "legalnations",
  sales: "usdrop",
  events: "goyotours",
  admin: "lbm",
};

export function toDbVerticalId(appVerticalId: string): string {
  return APP_TO_DB_VERTICAL_ID[appVerticalId] ?? appVerticalId;
}

export function fromDbVerticalId(dbVerticalId: string): string {
  return DB_TO_APP_VERTICAL_ID[dbVerticalId] ?? dbVerticalId;
}

export function normalizeIncomingVerticalId(id: string | undefined): string | undefined {
  if (!id) return id;
  // If caller passes an old DB ID directly, map it to the new app ID first,
  // then convert back to DB ID via toDbVerticalId.
  const appId = DB_TO_APP_VERTICAL_ID[id] ?? id;
  return toDbVerticalId(appId);
}

function translateVerticalId<T extends { vertical_id?: string | null }>(row: T): T {
  if (!row.vertical_id) return row;
  return { ...row, vertical_id: fromDbVerticalId(row.vertical_id) };
}

function translateVerticalIds<T extends { vertical_ids?: string[] | null }>(row: T): T {
  if (!row.vertical_ids) return row;
  return { ...row, vertical_ids: row.vertical_ids.map(fromDbVerticalId) };
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — store lookups will fail");
}

export const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null as any;

// ── Store credential helpers ───────────────────────────────────────────────────

export async function getStoreCredentials(storeId: string): Promise<{
  app_credentials: string;
  oauth_access_token: string;
} | null> {
  const { data, error } = await supabase.rpc("faire_get_store_credentials", {
    p_store_id: storeId,
  });
  if (error) {
    console.error("[supabase] getStoreCredentials error:", error.message);
    return null;
  }
  const rows = data as { app_credentials: string; oauth_access_token: string }[] | null;
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export async function listStores(): Promise<{ id: string; name: string; active: boolean; last_synced_at: string | null }[]> {
  const { data, error } = await supabase.rpc("faire_list_stores");
  if (error) {
    console.error("[supabase] listStores error:", error.message);
    return [];
  }
  return (data as { id: string; name: string; active: boolean; last_synced_at: string | null }[]) ?? [];
}

// ── Sync helpers (write) ───────────────────────────────────────────────────────

export async function syncOrders(storeId: string, orders: unknown[]): Promise<number> {
  if (orders.length === 0) return 0;
  const { data, error } = await supabase.rpc("faire_sync_orders", {
    p_store_id: storeId,
    p_orders: orders,
  });
  if (error) {
    console.error("[supabase] syncOrders error:", error.message);
    return 0;
  }
  return (data as { synced?: number })?.synced ?? 0;
}

export async function syncProducts(storeId: string, products: unknown[]): Promise<number> {
  if (products.length === 0) return 0;
  const { data, error } = await supabase.rpc("faire_sync_products", {
    p_store_id: storeId,
    p_products: products,
  });
  if (error) {
    console.error("[supabase] syncProducts error:", error.message);
    return 0;
  }
  return (data as { synced?: number })?.synced ?? 0;
}

export async function updateStoreProfile(storeId: string, profile: unknown): Promise<void> {
  const { error } = await supabase.rpc("faire_update_store_profile", {
    p_store_id: storeId,
    p_brand_profile: profile,
  });
  if (error) console.error("[supabase] updateStoreProfile error:", error.message);
}

// ── Read helpers ───────────────────────────────────────────────────────────────

export async function getStoreOrders(
  storeId: string,
  opts: { limit?: number; offset?: number; state?: string } = {}
): Promise<unknown[]> {
  const { data, error } = await supabase.rpc("faire_get_store_orders", {
    p_store_id: storeId,
    p_limit: opts.limit ?? 200,
    p_offset: opts.offset ?? 0,
    p_state: opts.state ?? null,
  });
  if (error) {
    console.error("[supabase] getStoreOrders error:", error.message);
    return [];
  }
  const rows = (data as { raw_data: unknown }[]) ?? [];
  return rows.map((r) => ({ ...(r.raw_data as object), _storeId: storeId }));
}

export async function getAllOrders(
  opts: { limit?: number; offset?: number; state?: string } = {}
): Promise<unknown[]> {
  if (opts.limit !== undefined && opts.offset !== undefined) {
    const { data, error } = await supabase.rpc("faire_get_all_orders", {
      p_limit: opts.limit,
      p_offset: opts.offset,
      p_state: opts.state ?? null,
    });
    if (error) {
      console.error("[supabase] getAllOrders error:", error.message);
      return [];
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    return rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id }));
  }
  const PAGE = 1000;
  const all: unknown[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.rpc("faire_get_all_orders", {
      p_limit: PAGE,
      p_offset: offset,
      p_state: opts.state ?? null,
    });
    if (error) {
      console.error("[supabase] getAllOrders error:", error.message);
      break;
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    if (rows.length === 0) break;
    all.push(...rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id })));
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function getStoreProducts(
  storeId: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<unknown[]> {
  const { data, error } = await supabase.rpc("faire_get_store_products", {
    p_store_id: storeId,
    p_limit: opts.limit ?? 200,
    p_offset: opts.offset ?? 0,
  });
  if (error) {
    console.error("[supabase] getStoreProducts error:", error.message);
    return [];
  }
  const rows = (data as { raw_data: unknown }[]) ?? [];
  return rows.map((r) => ({ ...(r.raw_data as object), _storeId: storeId }));
}

export async function getAllProducts(
  opts: { limit?: number; offset?: number } = {}
): Promise<unknown[]> {
  if (opts.limit && opts.offset !== undefined) {
    const { data, error } = await supabase.rpc("faire_get_all_products", {
      p_limit: opts.limit,
      p_offset: opts.offset,
    });
    if (error) {
      console.error("[supabase] getAllProducts error:", error.message);
      return [];
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    return rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id }));
  }
  const PAGE = 1000;
  const all: unknown[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.rpc("faire_get_all_products", {
      p_limit: PAGE,
      p_offset: offset,
    });
    if (error) {
      console.error("[supabase] getAllProducts error:", error.message);
      break;
    }
    const rows = (data as { raw_data: unknown; store_id: string }[]) ?? [];
    if (rows.length === 0) break;
    all.push(...rows.map((r) => ({ ...(r.raw_data as object), _storeId: r.store_id })));
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function upsertRetailer(faireRetailerId: string, rawData: unknown): Promise<void> {
  const { error } = await supabase.rpc("faire_upsert_retailer", {
    p_faire_retailer_id: faireRetailerId,
    p_raw_data: rawData,
  });
  if (error) console.error("[supabase] upsertRetailer error:", error.message);
}

interface OrderForRetailer {
  retailer_id?: string;
  _storeId?: string;
  created_at?: string;
  address?: {
    name?: string;
    company_name?: string;
    city?: string;
    state?: string;
    state_code?: string;
    country?: string;
    country_code?: string;
    postal_code?: string;
    phone_number?: string;
  };
  items?: { price_cents?: number; quantity?: number }[];
}

export async function extractAndUpsertRetailersFromOrders(
  orders: unknown[]
): Promise<number> {
  const retailerMap = new Map<string, {
    id: string;
    name: string;
    company_name: string;
    city: string;
    state: string;
    state_code: string;
    country: string;
    country_code: string;
    postal_code: string;
    phone_number: string;
    total_orders: number;
    total_spent_cents: number;
    first_order_at: string | null;
    last_order_at: string | null;
    store_ids: Set<string>;
  }>();

  for (const rawOrder of orders) {
    const order = rawOrder as OrderForRetailer;
    const rid = order.retailer_id;
    if (!rid) continue;

    if (!retailerMap.has(rid)) {
      const addr = order.address ?? {};
      retailerMap.set(rid, {
        id: rid,
        name: addr.company_name || addr.name || rid,
        company_name: addr.company_name || "",
        city: addr.city || "",
        state: addr.state || "",
        state_code: addr.state_code || "",
        country: addr.country || "",
        country_code: addr.country_code || "",
        postal_code: addr.postal_code || "",
        phone_number: addr.phone_number || "",
        total_orders: 0,
        total_spent_cents: 0,
        first_order_at: null,
        last_order_at: null,
        store_ids: new Set(),
      });
    }

    const r = retailerMap.get(rid)!;
    r.total_orders++;

    const orderTotal = (order.items ?? []).reduce(
      (sum, item) => sum + (item.price_cents ?? 0) * (item.quantity ?? 1), 0
    );
    r.total_spent_cents += orderTotal;

    if (order.created_at) {
      if (!r.first_order_at || order.created_at < r.first_order_at) r.first_order_at = order.created_at;
      if (!r.last_order_at || order.created_at > r.last_order_at) r.last_order_at = order.created_at;
    }

    if (order._storeId) r.store_ids.add(order._storeId);
  }

  let upserted = 0;
  for (const [rid, r] of retailerMap) {
    const rawData = {
      id: rid,
      name: r.name,
      company_name: r.company_name,
      city: r.city,
      state: r.state,
      state_code: r.state_code,
      country: r.country,
      country_code: r.country_code,
      postal_code: r.postal_code,
      phone_number: r.phone_number,
      total_orders: r.total_orders,
      total_spent_cents: r.total_spent_cents,
      first_order_at: r.first_order_at,
      last_order_at: r.last_order_at,
      store_ids: [...r.store_ids],
    };
    await upsertRetailer(rid, rawData);
    upserted++;
  }

  console.log(`[supabase] extractAndUpsertRetailersFromOrders: upserted ${upserted} retailers from ${orders.length} orders`);
  return upserted;
}

export async function getAllRetailers(): Promise<unknown[]> {
  const { data, error } = await supabase.rpc("faire_get_all_retailers");
  if (error) {
    console.error("[supabase] getAllRetailers error:", error.message);
    return [];
  }
  const rows = (data as { raw_data: unknown; faire_retailer_id: string }[]) ?? [];
  return rows.map((r) => r.raw_data);
}

export async function getRetailer(faireRetailerId: string): Promise<unknown | null> {
  const { data, error } = await supabase.rpc("faire_get_retailer", {
    p_faire_retailer_id: faireRetailerId,
  });
  if (error) {
    console.error("[supabase] getRetailer error:", error.message);
    return null;
  }
  const rows = (data as { raw_data: unknown }[]) ?? [];
  return rows.length > 0 ? rows[0].raw_data : null;
}

export async function getStoreCounts(storeId: string): Promise<{
  total_orders: number;
  total_products: number;
  new_orders: number;
}> {
  const { data, error } = await supabase.rpc("faire_get_store_counts", {
    p_store_id: storeId,
  });
  if (error) {
    console.error("[supabase] getStoreCounts error:", error.message);
    return { total_orders: 0, total_products: 0, new_orders: 0 };
  }
  const rows = (data as { total_orders: number; total_products: number; new_orders: number }[]) ?? [];
  if (rows.length === 0) return { total_orders: 0, total_products: 0, new_orders: 0 };
  return rows[0];
}

// ── Vendor helpers ─────────────────────────────────────────────────────────────

export interface FaireVendor {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  whatsapp: string;
  is_default: boolean;
  notes: string;
  country: string;
  rating: number;
  avg_lead_days: number;
  specialties: string[];
  completed_orders: number;
  created_at: string;
}

export async function listVendors(): Promise<FaireVendor[]> {
  const { data, error } = await supabase.rpc("faire_list_vendors");
  if (error) { console.error("[supabase] listVendors error:", error.message); return []; }
  return (data as FaireVendor[]) ?? [];
}

export async function upsertVendor(vendor: {
  id?: string;
  name: string;
  contact_name: string;
  email: string;
  whatsapp: string;
  is_default: boolean;
  notes: string;
}): Promise<FaireVendor | null> {
  const { data, error } = await supabase.rpc("faire_upsert_vendor", {
    p_id: vendor.id ?? null,
    p_name: vendor.name,
    p_contact_name: vendor.contact_name,
    p_email: vendor.email,
    p_whatsapp: vendor.whatsapp,
    p_is_default: vendor.is_default,
    p_notes: vendor.notes,
  });
  if (error) { console.error("[supabase] upsertVendor error:", error.message); return null; }
  return data as FaireVendor;
}

export async function deleteVendor(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_vendor", { p_id: id });
  if (error) console.error("[supabase] deleteVendor error:", error.message);
}

export async function getProductVendors(productId: string): Promise<{ vendor_id: string; vendor_name: string; is_exclusive: boolean }[]> {
  const { data, error } = await supabase.rpc("faire_get_product_vendors", { p_product_id: productId });
  if (error) { console.error("[supabase] getProductVendors error:", error.message); return []; }
  return (data as { vendor_id: string; vendor_name: string; is_exclusive: boolean }[]) ?? [];
}

export async function setProductVendor(productId: string, vendorId: string, isExclusive: boolean): Promise<void> {
  const { error } = await supabase.rpc("faire_set_product_vendor", {
    p_product_id: productId,
    p_vendor_id: vendorId,
    p_is_exclusive: isExclusive,
  });
  if (error) console.error("[supabase] setProductVendor error:", error.message);
}

export async function removeProductVendor(productId: string, vendorId: string): Promise<void> {
  const { error } = await supabase.rpc("faire_remove_product_vendor", {
    p_product_id: productId,
    p_vendor_id: vendorId,
  });
  if (error) console.error("[supabase] removeProductVendor error:", error.message);
}

// ── Transaction attachment helpers ─────────────────────────────────────────────

export interface TransactionAttachment {
  id: string;
  transaction_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export async function getTransactionAttachments(transactionId: string): Promise<TransactionAttachment[]> {
  const { data, error } = await supabase.rpc("faire_get_transaction_attachments", { p_transaction_id: transactionId });
  if (error) { console.error("[supabase] getTransactionAttachments error:", error.message); return []; }
  return (data as TransactionAttachment[]) ?? [];
}

export async function addTransactionAttachment(params: {
  transaction_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
}): Promise<TransactionAttachment | null> {
  const { data, error } = await supabase.rpc("faire_add_transaction_attachment", {
    p_transaction_id: params.transaction_id,
    p_file_name: params.file_name,
    p_storage_path: params.storage_path,
    p_file_size_bytes: params.file_size_bytes,
    p_mime_type: params.mime_type,
  });
  if (error) { console.error("[supabase] addTransactionAttachment error:", error.message); return null; }
  return data as TransactionAttachment;
}

export async function uploadTransactionProof(transactionId: string, file: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  const path = `${transactionId}/${Date.now()}-${fileName}`;
  const { error } = await supabase.storage.from("transaction-proofs").upload(path, file, { contentType: mimeType, upsert: false });
  if (error) { console.error("[supabase] uploadTransactionProof error:", error.message); return null; }
  return path;
}

export async function getTransactionProofUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from("transaction-proofs").createSignedUrl(storagePath, 3600);
  if (error) { console.error("[supabase] getTransactionProofUrl error:", error.message); return null; }
  return data.signedUrl;
}

// ── LegalNations Document Storage helpers ─────────────────────────────────────

export async function uploadClientDocument(
  clientId: string,
  category: string,
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<string | null> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${clientId}/${category}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from("legalnations-docs")
    .upload(path, file, { contentType: mimeType, upsert: false });
  if (error) {
    console.error("[supabase] uploadClientDocument error:", error.message);
    return null;
  }
  return path;
}

export async function getClientDocumentUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("legalnations-docs")
    .createSignedUrl(storagePath, 3600);
  if (error) {
    console.error("[supabase] getClientDocumentUrl error:", error.message);
    return null;
  }
  return data.signedUrl;
}

export async function deleteClientDocumentFile(storagePath: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from("legalnations-docs")
    .remove([storagePath]);
  if (error) {
    console.error("[supabase] deleteClientDocumentFile error:", error.message);
    return false;
  }
  return true;
}

// ── Seller Application helpers ─────────────────────────────────────────────────

export interface SellerApplication {
  id: string;
  brand_name: string;
  category: string | null;
  brand_story: string | null;
  logo_url: string | null;
  banner_url: string | null;
  email_id: string | null;
  email_type: string | null;
  application_date: string | null;
  status: string;
  marketplace_strategy: string | null;
  domain_name: string | null;
  website_url: string | null;
  etsy_store_url: string | null;
  reference_store_url: string | null;
  num_products_listed: number | null;
  listing_method: string | null;
  csv_storage_path: string | null;
  ein_storage_path: string | null;
  articles_storage_path: string | null;
  faire_reg_url: string | null;
  notes: string | null;
  linked_store_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApplicationFollowup {
  id: string;
  application_id: string;
  followup_date: string;
  followup_type: string;
  note: string | null;
  created_at: string | null;
}

export interface ApplicationLink {
  id: string;
  application_id: string;
  label: string;
  url: string;
  link_type: string;
  created_at: string | null;
}

export async function listSellerApplications(): Promise<SellerApplication[]> {
  const { data, error } = await supabase.rpc("faire_list_applications");
  if (error) { console.error("[supabase] listSellerApplications error:", error.message); return []; }
  return (data as SellerApplication[]) ?? [];
}

export async function getSellerApplication(id: string): Promise<(SellerApplication & { followups: ApplicationFollowup[]; links: ApplicationLink[] }) | null> {
  const { data, error } = await supabase.rpc("faire_get_application", { p_id: id });
  if (error) { console.error("[supabase] getSellerApplication error:", error.message); return null; }
  return data as (SellerApplication & { followups: ApplicationFollowup[]; links: ApplicationLink[] }) | null;
}

export async function upsertSellerApplication(params: {
  id?: string | null;
  brand_name: string;
  category?: string | null;
  brand_story?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  email_id?: string | null;
  email_type?: string | null;
  application_date?: string | null;
  status?: string;
  marketplace_strategy?: string | null;
  domain_name?: string | null;
  website_url?: string | null;
  etsy_store_url?: string | null;
  reference_store_url?: string | null;
  num_products_listed?: number | null;
  listing_method?: string | null;
  csv_storage_path?: string | null;
  ein_storage_path?: string | null;
  articles_storage_path?: string | null;
  faire_reg_url?: string | null;
  notes?: string | null;
  linked_store_id?: string | null;
}): Promise<SellerApplication | null> {
  const { data, error } = await supabase.rpc("faire_upsert_application", {
    p_id: params.id ?? null,
    p_brand_name: params.brand_name,
    p_category: params.category ?? null,
    p_brand_story: params.brand_story ?? null,
    p_logo_url: params.logo_url ?? null,
    p_banner_url: params.banner_url ?? null,
    p_email_id: params.email_id ?? null,
    p_email_type: params.email_type ?? "basic",
    p_application_date: params.application_date ?? null,
    p_status: params.status ?? "drafting",
    p_marketplace_strategy: params.marketplace_strategy ?? "website",
    p_domain_name: params.domain_name ?? null,
    p_website_url: params.website_url ?? null,
    p_etsy_store_url: params.etsy_store_url ?? null,
    p_reference_store_url: params.reference_store_url ?? null,
    p_num_products_listed: params.num_products_listed ?? 0,
    p_listing_method: params.listing_method ?? "manual",
    p_csv_storage_path: params.csv_storage_path ?? null,
    p_ein_storage_path: params.ein_storage_path ?? null,
    p_articles_storage_path: params.articles_storage_path ?? null,
    p_faire_reg_url: params.faire_reg_url ?? "https://www.faire.com/brand-portal/signup",
    p_notes: params.notes ?? null,
    p_linked_store_id: params.linked_store_id ?? null,
  });
  if (error) { console.error("[supabase] upsertSellerApplication error:", error.message); return null; }
  return data as SellerApplication;
}

export async function deleteSellerApplication(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_application", { p_id: id });
  if (error) console.error("[supabase] deleteSellerApplication error:", error.message);
}

export async function addApplicationFollowup(params: {
  application_id: string;
  followup_date: string;
  followup_type: string;
  note?: string | null;
}): Promise<ApplicationFollowup | null> {
  const { data, error } = await supabase.rpc("faire_add_followup", {
    p_application_id: params.application_id,
    p_followup_date: params.followup_date,
    p_followup_type: params.followup_type,
    p_note: params.note ?? null,
  });
  if (error) { console.error("[supabase] addApplicationFollowup error:", error.message); return null; }
  return data as ApplicationFollowup;
}

export async function deleteApplicationFollowup(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_followup", { p_id: id });
  if (error) console.error("[supabase] deleteApplicationFollowup error:", error.message);
}

export async function upsertApplicationLink(params: {
  id?: string | null;
  application_id: string;
  label: string;
  url: string;
  link_type?: string;
}): Promise<ApplicationLink | null> {
  const { data, error } = await supabase.rpc("faire_upsert_link", {
    p_id: params.id ?? null,
    p_application_id: params.application_id,
    p_label: params.label,
    p_url: params.url,
    p_link_type: params.link_type ?? "other",
  });
  if (error) { console.error("[supabase] upsertApplicationLink error:", error.message); return null; }
  return data as ApplicationLink;
}

export async function deleteApplicationLink(id: string): Promise<void> {
  const { error } = await supabase.rpc("faire_delete_link", { p_id: id });
  if (error) console.error("[supabase] deleteApplicationLink error:", error.message);
}

export interface RetailerEnrichment {
  retailer_id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_address: string | null;
  business_type: string | null;
  store_type: string | null;
  website: string | null;
  instagram: string | null;
  notes: string | null;
  enriched_by: string | null;
  enriched_at: string | null;
  updated_at: string | null;
}

export async function getRetailerEnrichment(retailerId: string): Promise<RetailerEnrichment | null> {
  const { data, error } = await supabase.rpc("faire_get_retailer_enrichment", {
    p_retailer_id: retailerId,
  });
  if (error) { console.error("[supabase] getRetailerEnrichment error:", error.message); return null; }
  const rows = data as RetailerEnrichment[];
  return rows?.[0] ?? null;
}

export async function upsertRetailerEnrichment(params: {
  retailer_id: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  store_address?: string | null;
  business_type?: string | null;
  store_type?: string | null;
  website?: string | null;
  instagram?: string | null;
  notes?: string | null;
  enriched_by?: string | null;
}): Promise<RetailerEnrichment | null> {
  const { data, error } = await supabase.rpc("faire_upsert_retailer_enrichment", {
    p_retailer_id: params.retailer_id,
    p_contact_name: params.contact_name ?? null,
    p_contact_email: params.contact_email ?? null,
    p_contact_phone: params.contact_phone ?? null,
    p_store_address: params.store_address ?? null,
    p_business_type: params.business_type ?? null,
    p_store_type: params.store_type ?? null,
    p_website: params.website ?? null,
    p_instagram: params.instagram ?? null,
    p_notes: params.notes ?? null,
    p_enriched_by: params.enriched_by ?? null,
  });
  if (error) { console.error("[supabase] upsertRetailerEnrichment error:", error.message); return null; }
  const rows = data as RetailerEnrichment[];
  return rows?.[0] ?? null;
}

// ── Bank Transactions ──────────────────────────────────────────────────────────

export interface BankTxRow {
  id: string;
  source: string;
  entity: string | null;
  bank_name: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd: number | null;
  type: string;
  category: string | null;
  is_business: boolean;
  tags: string[];
  reference: string | null;
  faire_order_id: string | null;
  reconciled: boolean;
  notes: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBankTransactions(filters: {
  source?: string;
  entity?: string;
  type?: string;
  search?: string;
  is_business?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<{ transactions: BankTxRow[]; total: number }> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 100;
  const offset = (page - 1) * limit;

  let q = supabase.from("bank_transactions").select("*", { count: "exact" });
  if (filters.source) q = q.eq("source", filters.source);
  if (filters.entity) q = q.eq("entity", filters.entity);
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.is_business !== undefined) q = q.eq("is_business", filters.is_business);
  if (filters.search) q = q.ilike("description", `%${filters.search}%`);
  q = q.order("date", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("[supabase] getBankTransactions error:", error.message);
    return { transactions: [], total: 0 };
  }
  return { transactions: (data ?? []) as BankTxRow[], total: count ?? 0 };
}

export async function updateBankTransaction(id: string, patch: {
  is_business?: boolean;
  category?: string;
  notes?: string;
  reconciled?: boolean;
  tags?: string[];
  faire_order_id?: string | null;
}): Promise<BankTxRow | null> {
  const { data, error } = await supabase.rpc("bank_update_transaction", {
    p_id: id,
    p_is_business: patch.is_business ?? null,
    p_category: patch.category ?? null,
    p_notes: patch.notes ?? null,
    p_reconciled: patch.reconciled ?? null,
    p_tags: patch.tags ?? null,
    p_faire_order_id: patch.faire_order_id !== undefined ? patch.faire_order_id : null,
  });
  if (error) {
    console.error("[supabase] updateBankTransaction error:", error.message);
    return null;
  }
  const rows = data as BankTxRow[];
  return rows?.[0] ?? null;
}

export async function addBankTransaction(tx: {
  source: string;
  entity?: string;
  bank_name: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  amount_usd?: number;
  type: string;
  category?: string;
  is_business?: boolean;
  tags?: string[];
  reference?: string;
  faire_order_id?: string;
  reconciled?: boolean;
  notes?: string;
}): Promise<BankTxRow | null> {
  const { data, error } = await supabase
    .from("bank_transactions")
    .insert([{ ...tx, is_business: tx.is_business ?? true, tags: tx.tags ?? [], reconciled: tx.reconciled ?? false }])
    .select()
    .single();
  if (error) {
    console.error("[supabase] addBankTransaction error:", error.message);
    return null;
  }
  return data as BankTxRow;
}

// ── Ledger Parties ─────────────────────────────────────────────────────────────

export interface LedgerParty {
  id: string;
  name: string;
  type: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  currency: string;
  credit_limit: number | null;
  credit_days: number | null;
  tags: string[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LedgerPartyTx {
  id: string;
  party_id: string;
  type: string;
  direction: string;
  date: string;
  due_date: string | null;
  amount: number;
  currency: string;
  amount_usd: number | null;
  reference: string | null;
  description: string;
  faire_order_id: string | null;
  bank_transaction_id: string | null;
  status: string;
  paid_amount: number;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function listLedgerParties(): Promise<LedgerParty[]> {
  const { data, error } = await supabase
    .from("ledger_parties")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) { console.error("[supabase] listLedgerParties error:", error.message); return []; }
  return (data ?? []) as LedgerParty[];
}

export async function getLedgerParty(id: string): Promise<LedgerParty | null> {
  const { data, error } = await supabase
    .from("ledger_parties")
    .select("*")
    .eq("id", id)
    .single();
  if (error) { console.error("[supabase] getLedgerParty error:", error.message); return null; }
  return data as LedgerParty;
}

export async function upsertLedgerParty(party: Partial<LedgerParty> & { name: string; type: string }): Promise<LedgerParty | null> {
  const { data, error } = party.id
    ? await supabase.from("ledger_parties").update({ ...party, updated_at: new Date().toISOString() }).eq("id", party.id).select().single()
    : await supabase.from("ledger_parties").insert([{ ...party, currency: party.currency ?? "USD", is_active: true }]).select().single();
  if (error) { console.error("[supabase] upsertLedgerParty error:", error.message); return null; }
  return data as LedgerParty;
}

export async function getLedgerPartyTransactions(partyId: string): Promise<LedgerPartyTx[]> {
  const { data, error } = await supabase
    .from("ledger_party_transactions")
    .select("*")
    .eq("party_id", partyId)
    .order("date", { ascending: false });
  if (error) { console.error("[supabase] getLedgerPartyTransactions error:", error.message); return []; }
  return (data ?? []) as LedgerPartyTx[];
}

export async function addLedgerPartyTransaction(tx: Partial<LedgerPartyTx> & {
  party_id: string;
  type: string;
  direction: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
}): Promise<LedgerPartyTx | null> {
  const { data, error } = await supabase
    .from("ledger_party_transactions")
    .insert([{ ...tx, status: tx.status ?? "pending", paid_amount: tx.paid_amount ?? 0, amount_usd: tx.amount_usd ?? tx.amount }])
    .select()
    .single();
  if (error) { console.error("[supabase] addLedgerPartyTransaction error:", error.message); return null; }
  return data as LedgerPartyTx;
}

export async function updateLedgerPartyTransaction(id: string, patch: Partial<LedgerPartyTx>): Promise<LedgerPartyTx | null> {
  const { data, error } = await supabase
    .from("ledger_party_transactions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateLedgerPartyTransaction error:", error.message); return null; }
  return data as LedgerPartyTx;
}

export async function getPartyBalance(partyId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_party_balance", { p_party_id: partyId });
  if (error) { console.error("[supabase] getPartyBalance error:", error.message); return 0; }
  return Number(data ?? 0);
}

// ── Task Activity (comments, attachments, links) ───────────────────────────────

export interface TaskActivityItem {
  id: string;
  task_id: string;
  type: "comment" | "attachment" | "link";
  content: string | null;
  author: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  link_url: string | null;
  link_title: string | null;
  created_at: string;
}

export async function getTaskActivity(taskId: string): Promise<TaskActivityItem[]> {
  const { data, error } = await supabase
    .from("task_activity")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) { console.error("[supabase] getTaskActivity error:", error.message); return []; }
  return (data ?? []) as TaskActivityItem[];
}

export async function addTaskComment(taskId: string, content: string, author: string): Promise<TaskActivityItem | null> {
  const { data, error } = await supabase
    .from("task_activity")
    .insert([{ task_id: taskId, type: "comment", content, author }])
    .select()
    .single();
  if (error) { console.error("[supabase] addTaskComment error:", error.message); return null; }
  return data as TaskActivityItem;
}

export async function addTaskLink(taskId: string, url: string, title: string, author: string): Promise<TaskActivityItem | null> {
  const { data, error } = await supabase
    .from("task_activity")
    .insert([{ task_id: taskId, type: "link", link_url: url, link_title: title || url, author }])
    .select()
    .single();
  if (error) { console.error("[supabase] addTaskLink error:", error.message); return null; }
  return data as TaskActivityItem;
}

export async function uploadTaskFile(
  taskId: string,
  buffer: Buffer,
  filename: string,
  mimeType: string,
  author: string
): Promise<TaskActivityItem | null> {
  const ext = filename.split(".").pop() ?? "bin";
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${taskId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("task-attachments")
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) {
    console.error("[supabase] uploadTaskFile storage error:", uploadError.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from("task-attachments").getPublicUrl(path);
  const fileUrl = urlData?.publicUrl ?? "";

  const { data, error } = await supabase
    .from("task_activity")
    .insert([{
      task_id: taskId,
      type: "attachment",
      author,
      file_url: fileUrl,
      file_name: filename,
      file_size: buffer.length,
    }])
    .select()
    .single();

  if (error) { console.error("[supabase] uploadTaskFile insert error:", error.message); return null; }
  return data as TaskActivityItem;
}

export async function deleteTaskActivity(id: string): Promise<boolean> {
  const { data: row } = await supabase
    .from("task_activity")
    .select("type, file_url")
    .eq("id", id)
    .single();

  if (row?.type === "attachment" && row?.file_url) {
    const url: string = row.file_url;
    const match = url.match(/task-attachments\/(.+)$/);
    if (match?.[1]) {
      await supabase.storage.from("task-attachments").remove([decodeURIComponent(match[1])]);
    }
  }

  const { error } = await supabase.from("task_activity").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteTaskActivity error:", error.message); return false; }
  return true;
}

// ── CORE: Verticals ────────────────────────────────────────────────────────────

export interface CoreVertical {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  tagline: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getVerticals(): Promise<CoreVertical[]> {
  const { data, error } = await supabase.from("verticals").select("*").order("name");
  if (error) { console.error("[supabase] getVerticals error:", error.message); return []; }
  return (data as CoreVertical[]) ?? [];
}

export async function getVertical(id: string): Promise<CoreVertical | null> {
  const { data, error } = await supabase.from("verticals").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getVertical error:", error.message); return null; }
  return data as CoreVertical;
}

// ── CORE: Users ────────────────────────────────────────────────────────────────

export interface CoreUser {
  id: string;
  employee_code: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  department: string | null;
  designation: string | null;
  employment_type: string | null;
  status: string;
  location: string | null;
  skills: string[];
  avatar_initials: string | null;
  avatar_url: string | null;
  salary: number | null;
  reporting_manager_id: string | null;
  joined_date: string | null;
  created_at: string;
}

export async function getUsers(verticalId?: string): Promise<CoreUser[]> {
  const vid = normalizeIncomingVerticalId(verticalId);
  if (vid) {
    const { data, error } = await supabase
      .from("user_verticals")
      .select("users(*)")
      .eq("vertical_id", vid);
    if (error) { console.error("[supabase] getUsers error:", error.message); return []; }
    return ((data ?? []) as { users: CoreUser }[]).map((r) => r.users);
  }
  const { data, error } = await supabase.from("users").select("*").order("name");
  if (error) { console.error("[supabase] getUsers error:", error.message); return []; }
  return (data as CoreUser[]) ?? [];
}

export async function getUser(id: string): Promise<CoreUser | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getUser error:", error.message); return null; }
  return data as CoreUser;
}

// ── CORE: Tasks ────────────────────────────────────────────────────────────────

export interface CoreTask {
  id: string;
  task_code: string | null;
  vertical_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  assignee_name: string | null;
  due_date: string | null;
  tags: string[];
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoreTaskInput {
  vertical_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  assignee_name?: string;
  due_date?: string;
  tags?: string[];
  created_by?: string;
  created_by_name?: string;
}

export async function getCoreTasksByVertical(verticalId?: string): Promise<CoreTask[]> {
  const vid = normalizeIncomingVerticalId(verticalId);
  let q = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (vid) q = q.eq("vertical_id", vid);
  const { data, error } = await q;
  if (error) { console.error("[supabase] getCoreTasksByVertical error:", error.message); return []; }
  return ((data as CoreTask[]) ?? []).map(translateVerticalId);
}

export async function getCoreTask(id: string): Promise<CoreTask | null> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getCoreTask error:", error.message); return null; }
  return data as CoreTask;
}

export async function createCoreTask(input: CoreTaskInput): Promise<CoreTask | null> {
  const dbInput = input.vertical_id
    ? { ...input, vertical_id: toDbVerticalId(input.vertical_id) }
    : input;
  const { data, error } = await supabase.from("tasks").insert([dbInput]).select().single();
  if (error) { console.error("[supabase] createCoreTask error:", error.message); return null; }
  return data ? translateVerticalId(data as CoreTask) : null;
}

export async function updateCoreTask(id: string, patch: Partial<CoreTaskInput>): Promise<CoreTask | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateCoreTask error:", error.message); return null; }
  return data as CoreTask;
}

export async function deleteCoreTask(id: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreTask error:", error.message); return false; }
  return true;
}

// ── CORE: Task Subtasks ────────────────────────────────────────────────────────

export interface CoreSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

export async function getCoreSubtasks(taskId: string): Promise<CoreSubtask[]> {
  const { data, error } = await supabase
    .from("task_subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("sort_order");
  if (error) { console.error("[supabase] getCoreSubtasks error:", error.message); return []; }
  return (data as CoreSubtask[]) ?? [];
}

export async function upsertCoreSubtask(input: {
  id?: string;
  task_id: string;
  title: string;
  completed?: boolean;
  sort_order?: number;
}): Promise<CoreSubtask | null> {
  const { data, error } = await supabase
    .from("task_subtasks")
    .upsert([input], { onConflict: "id" })
    .select()
    .single();
  if (error) { console.error("[supabase] upsertCoreSubtask error:", error.message); return null; }
  return data as CoreSubtask;
}

export async function deleteCoreSubtask(id: string): Promise<boolean> {
  const { error } = await supabase.from("task_subtasks").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreSubtask error:", error.message); return false; }
  return true;
}

export async function toggleCoreSubtask(id: string, completed: boolean): Promise<CoreSubtask | null> {
  const { data, error } = await supabase
    .from("task_subtasks")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] toggleCoreSubtask error:", error.message); return null; }
  return data as CoreSubtask;
}

// ── CORE: Channels ─────────────────────────────────────────────────────────────

export interface CoreChannel {
  id: string;
  vertical_id: string | null;
  name: string;
  type: string;
  description: string | null;
  member_names: string[];
  is_pinned: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  topic: string | null;
  is_private: boolean;
  is_archived: boolean;
  created_by: string | null;
  created_at: string;
}

export async function getChannelsByVertical(verticalId: string): Promise<CoreChannel[]> {
  const vid = normalizeIncomingVerticalId(verticalId) ?? verticalId;
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("vertical_id", vid)
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) { console.error("[supabase] getChannelsByVertical error:", error.message); return []; }
  return ((data as CoreChannel[]) ?? []).map(translateVerticalId);
}

export async function createChannel(input: {
  vertical_id: string;
  name: string;
  type?: string;
  description?: string;
  member_names?: string[];
  is_pinned?: boolean;
  topic?: string;
  is_private?: boolean;
  created_by?: string;
}): Promise<CoreChannel | null> {
  const dbInput = { ...input, vertical_id: toDbVerticalId(input.vertical_id) };
  const { data, error } = await supabase
    .from("channels")
    .insert([{ type: "channel", is_pinned: false, is_private: false, is_archived: false, ...dbInput }])
    .select()
    .single();
  if (error) { console.error("[supabase] createChannel error:", error.message); return null; }
  return data ? translateVerticalId(data as CoreChannel) : null;
}

export async function updateChannel(id: string, patch: Partial<CoreChannel>): Promise<CoreChannel | null> {
  const { data, error } = await supabase
    .from("channels")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateChannel error:", error.message); return null; }
  return data as CoreChannel;
}

export async function archiveChannel(id: string): Promise<boolean> {
  const { error } = await supabase.from("channels").update({ is_archived: true }).eq("id", id);
  if (error) { console.error("[supabase] archiveChannel error:", error.message); return false; }
  return true;
}

export async function findOrCreateDM(verticalId: string, memberNames: string[]): Promise<CoreChannel | null> {
  const vid = normalizeIncomingVerticalId(verticalId) ?? verticalId;
  const sorted = [...memberNames].sort();
  const { data: existing } = await supabase
    .from("channels")
    .select("*")
    .eq("vertical_id", vid)
    .eq("type", "dm")
    .contains("member_names", sorted)
    .limit(1);
  if (existing && existing.length > 0) return existing[0] as CoreChannel;
  const dmName = sorted[0];
  return createChannel({ vertical_id: vid, name: dmName, type: "dm", member_names: sorted, description: "" });
}

// ── CORE: Channel Messages ─────────────────────────────────────────────────────

export interface CoreMessage {
  id: string;
  channel_id: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  attachments: unknown[];
  reply_to_id: string | null;
  edited_at: string | null;
  is_deleted: boolean;
  reactions: Record<string, string[]>;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

export async function getChannelMessages(channelId: string, limit = 100): Promise<CoreMessage[]> {
  const { data, error } = await supabase
    .from("channel_messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) { console.error("[supabase] getChannelMessages error:", error.message); return []; }
  return (data as CoreMessage[]) ?? [];
}

export async function createChannelMessage(input: {
  channel_id: string;
  sender_name: string;
  content: string;
  sender_id?: string;
  reply_to_id?: string;
  message_type?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}): Promise<CoreMessage | null> {
  const { data: insertedRows, error: insertError } = await supabase
    .from("channel_messages")
    .insert([{ message_type: "text", reactions: {}, is_deleted: false, ...input }])
    .select();
  if (insertError) {
    console.error("[supabase] createChannelMessage insert error:", JSON.stringify(insertError));
    return null;
  }
  const data = insertedRows?.[0] ?? null;
  if (!data) {
    console.error("[supabase] createChannelMessage: insert returned no rows");
    return null;
  }
  await supabase
    .from("channels")
    .update({
      last_message: input.content,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", input.channel_id);
  try { await supabase.rpc("increment_channel_unread", { p_channel_id: input.channel_id }); } catch {}
  return data as CoreMessage;
}

export async function editMessage(id: string, content: string): Promise<CoreMessage | null> {
  const { data: rows, error } = await supabase
    .from("channel_messages")
    .update({ content, edited_at: new Date().toISOString() })
    .eq("id", id)
    .select();
  if (error) { console.error("[supabase] editMessage error:", JSON.stringify(error)); return null; }
  return (rows?.[0] as CoreMessage) ?? null;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("channel_messages")
    .update({ is_deleted: true, content: "This message was deleted" })
    .eq("id", id);
  if (error) { console.error("[supabase] deleteMessage error:", JSON.stringify(error)); return false; }
  return true;
}

export async function toggleReaction(messageId: string, emoji: string, userName: string): Promise<CoreMessage | null> {
  const { data: rows, error: fetchErr } = await supabase
    .from("channel_messages")
    .select("reactions")
    .eq("id", messageId);
  if (fetchErr || !rows?.[0]) { console.error("[supabase] toggleReaction fetch error:", fetchErr?.message); return null; }
  const msg = rows[0];
  const reactions: Record<string, string[]> = (msg.reactions as Record<string, string[]>) ?? {};
  const users: string[] = reactions[emoji] ?? [];
  if (users.includes(userName)) {
    reactions[emoji] = users.filter((u) => u !== userName);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    reactions[emoji] = [...users, userName];
  }
  const { data: updatedRows, error } = await supabase
    .from("channel_messages")
    .update({ reactions })
    .eq("id", messageId)
    .select();
  if (error) { console.error("[supabase] toggleReaction update error:", JSON.stringify(error)); return null; }
  return (updatedRows?.[0] as CoreMessage) ?? null;
}

export async function uploadChatFile(channelId: string, fileBuffer: Buffer, fileName: string): Promise<{ url: string; path: string } | null> {
  const storagePath = `${channelId}/${Date.now()}-${fileName}`;
  const { error } = await supabase.storage
    .from("chat-attachments")
    .upload(storagePath, fileBuffer, { contentType: getMimeType(fileName), upsert: false });
  if (error) { console.error("[supabase] uploadChatFile error:", JSON.stringify(error)); return null; }
  const { data: urlData } = supabase.storage
    .from("chat-attachments")
    .getPublicUrl(storagePath);
  return { url: urlData.publicUrl, path: storagePath };
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    mp4: "video/mp4", mp3: "audio/mpeg", zip: "application/zip", txt: "text/plain", csv: "text/csv", json: "application/json",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// ── CORE: Channel Read State ────────────────────────────────────────────────────

export interface ChannelReadState {
  user_id: string;
  channel_id: string;
  last_read_message_id: string | null;
  last_read_at: string;
}

export async function markChannelRead(channelId: string, userName: string, lastMessageId?: string): Promise<boolean> {
  const { data: user } = await supabase.from("users").select("id").eq("name", userName).single();
  if (!user) {
    // Mark by resetting unread_count in channels
    await supabase.from("channels").update({ unread_count: 0 }).eq("id", channelId);
    return true;
  }
  const { error } = await supabase.from("channel_read_state").upsert({
    user_id: user.id,
    channel_id: channelId,
    last_read_message_id: lastMessageId ?? null,
    last_read_at: new Date().toISOString(),
  }, { onConflict: "user_id,channel_id" });
  if (error) { console.error("[supabase] markChannelRead error:", error.message); return false; }
  await supabase.from("channels").update({ unread_count: 0 }).eq("id", channelId);
  return true;
}

export async function getUnreadCount(channelId: string, userName: string): Promise<number> {
  const { data: user } = await supabase.from("users").select("id").eq("name", userName).single();
  if (!user) return 0;
  const { data: state } = await supabase
    .from("channel_read_state")
    .select("last_read_at")
    .eq("user_id", user.id)
    .eq("channel_id", channelId)
    .single();
  if (!state) return 0;
  const { count } = await supabase
    .from("channel_messages")
    .select("id", { count: "exact", head: true })
    .eq("channel_id", channelId)
    .gt("created_at", state.last_read_at)
    .eq("is_deleted", false);
  return count ?? 0;
}

// ── CORE: Resources ────────────────────────────────────────────────────────────

export interface CoreResource {
  id: string;
  vertical_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  file_type: string | null;
  tags: string[];
  added_by: string | null;
  added_by_id: string | null;
  file_size: string | null;
  url: string | null;
  storage_path: string | null;
  is_pinned: boolean;
  version: string;
  created_at: string;
}

export async function getCoreResources(verticalId?: string): Promise<CoreResource[]> {
  const vid = normalizeIncomingVerticalId(verticalId);
  let q = supabase.from("resources").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  if (vid) q = q.eq("vertical_id", vid);
  const { data, error } = await q;
  if (error) { console.error("[supabase] getCoreResources error:", error.message); return []; }
  return ((data as CoreResource[]) ?? []).map(translateVerticalId);
}

export async function createCoreResource(input: {
  vertical_id?: string;
  title: string;
  description?: string;
  category?: string;
  file_type?: string;
  tags?: string[];
  added_by?: string;
  url?: string;
  file_size?: string;
  is_pinned?: boolean;
}): Promise<CoreResource | null> {
  const dbInput = input.vertical_id
    ? { ...input, vertical_id: toDbVerticalId(input.vertical_id) }
    : input;
  const { data, error } = await supabase.from("resources").insert([dbInput]).select().single();
  if (error) { console.error("[supabase] createCoreResource error:", error.message); return null; }
  return data ? translateVerticalId(data as CoreResource) : null;
}

export async function deleteCoreResource(id: string): Promise<boolean> {
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreResource error:", error.message); return false; }
  return true;
}

// ── CORE: Contacts ─────────────────────────────────────────────────────────────

export interface CoreContact {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  category: string | null;
  vertical_ids: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  priority: string;
  notes: string | null;
  tags: string[];
  added_by: string | null;
  added_by_id: string | null;
  is_shared: boolean;
  created_at: string;
}

export async function getCoreContacts(verticalId?: string): Promise<CoreContact[]> {
  const vid = normalizeIncomingVerticalId(verticalId);
  if (vid) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .contains("vertical_ids", [vid])
      .order("name");
    if (error) { console.error("[supabase] getCoreContacts error:", error.message); return []; }
    return ((data as CoreContact[]) ?? []).map(translateVerticalIds);
  }
  const { data, error } = await supabase.from("contacts").select("*").order("name");
  if (error) { console.error("[supabase] getCoreContacts error:", error.message); return []; }
  return ((data as CoreContact[]) ?? []).map(translateVerticalIds);
}

export async function createCoreContact(input: Partial<CoreContact>): Promise<CoreContact | null> {
  const dbInput = input.vertical_ids
    ? { ...input, vertical_ids: input.vertical_ids.map(toDbVerticalId) }
    : input;
  const { data, error } = await supabase.from("contacts").insert([dbInput]).select().single();
  if (error) { console.error("[supabase] createCoreContact error:", error.message); return null; }
  return data ? translateVerticalIds(data as CoreContact) : null;
}

export async function updateCoreContact(id: string, patch: Partial<CoreContact>): Promise<CoreContact | null> {
  const { data, error } = await supabase
    .from("contacts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateCoreContact error:", error.message); return null; }
  return data as CoreContact;
}

export async function deleteCoreContact(id: string): Promise<boolean> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreContact error:", error.message); return false; }
  return true;
}

// ── CORE: Notifications ────────────────────────────────────────────────────────

export interface CoreNotification {
  id: string;
  vertical_id: string | null;
  user_id: string | null;
  type: string;
  title: string;
  description: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export async function getCoreNotifications(verticalId?: string, userId?: string): Promise<CoreNotification[]> {
  const vid = normalizeIncomingVerticalId(verticalId);
  let q = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
  if (vid) q = q.eq("vertical_id", vid);
  if (userId) q = q.or(`user_id.eq.${userId},user_id.is.null`);
  const { data, error } = await q;
  if (error) { console.error("[supabase] getCoreNotifications error:", error.message); return []; }
  return ((data as CoreNotification[]) ?? []).map(translateVerticalId);
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) { console.error("[supabase] markNotificationRead error:", error.message); return false; }
  return true;
}

export async function markAllNotificationsRead(verticalId: string): Promise<boolean> {
  const vid = normalizeIncomingVerticalId(verticalId) ?? verticalId;
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("vertical_id", vid)
    .eq("is_read", false);
  if (error) { console.error("[supabase] markAllNotificationsRead error:", error.message); return false; }
  return true;
}

export async function seedNotifications(): Promise<{ ok: boolean; count: number }> {
  const { error: delErr } = await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) console.warn("[supabase] seedNotifications clear error:", delErr.message);

  const now = new Date();
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

  const seeds: Omit<CoreNotification, "id">[] = [
    // ── Suprans Business Services ──
    { vertical_id: "suprans", user_id: null, type: "application", title: "New GST registration request", description: "Akash Traders submitted a GST registration application. Documents uploaded — verify PAN and address proof.", action_url: "/suprans/tasks", is_read: false, created_at: ago(5) },
    { vertical_id: "suprans", user_id: null, type: "finance", title: "ITR filing deadline approaching", description: "12 clients have pending ITR filings due by March 31. Prioritize Sharma Enterprises and Patel Industries.", action_url: "/suprans/tasks", is_read: false, created_at: ago(45) },
    { vertical_id: "suprans", user_id: null, type: "system", title: "DSC renewal reminder — 3 clients", description: "Digital Signature Certificates for Gupta Foods, MK Exports, and Reddy Traders expire in 15 days.", action_url: "/suprans/tasks", is_read: false, created_at: ago(120) },
    { vertical_id: "suprans", user_id: null, type: "application", title: "MSME registration approved", description: "Sunrise Handicrafts MSME (Udyam) registration has been approved. Certificate downloaded and stored.", action_url: "/suprans/resources", is_read: true, created_at: ago(300) },
    { vertical_id: "suprans", user_id: null, type: "finance", title: "TDS return Q3 filed successfully", description: "TDS return for Q3 FY2025-26 filed for 8 clients. Acknowledgment numbers saved in documents.", action_url: "/suprans/resources", is_read: true, created_at: ago(1440) },
    { vertical_id: "suprans", user_id: null, type: "system", title: "MCA compliance alert — Annual filing", description: "5 companies need AOC-4 and MGT-7 filings. Due date: 30 days from AGM. Schedule preparation.", action_url: "/suprans/tasks", is_read: true, created_at: ago(2160) },
    { vertical_id: "suprans", user_id: null, type: "quotation", title: "New engagement letter — PKR Industries", description: "PKR Industries signed engagement letter for bookkeeping + GST filing services. Monthly retainer: ₹15,000.", action_url: "/suprans/tasks", is_read: true, created_at: ago(2880) },
    { vertical_id: "suprans", user_id: null, type: "finance", title: "GST return GSTR-3B filed — Feb", description: "February GSTR-3B filed for all 22 active clients. Total tax liability: ₹4.2L. No discrepancies found.", action_url: "/suprans/resources", is_read: true, created_at: ago(4000) },

    // ── LegalNations (hr) ──
    { vertical_id: "hr", user_id: null, type: "application", title: "LLC formation filed — QuickShop US", description: "QuickShop US LLC formation documents filed in Wyoming. Estimated processing: 5-7 business days.", action_url: "/legalnations/pipeline", is_read: false, created_at: ago(8) },
    { vertical_id: "hr", user_id: null, type: "application", title: "EIN received — BeautyBox USA LLC", description: "IRS assigned EIN 88-1234567 to BeautyBox USA LLC. Ready to proceed with bank account setup.", action_url: "/legalnations/pipeline", is_read: false, created_at: ago(60) },
    { vertical_id: "hr", user_id: null, type: "system", title: "BOI filing deadline — 3 clients", description: "Beneficial Ownership Information reports due for FastShip Global, Tokyo Trends, and HomeVibes Commerce.", action_url: "/legalnations/pipeline", is_read: false, created_at: ago(180) },
    { vertical_id: "hr", user_id: null, type: "finance", title: "Registered Agent renewal — 5 LLCs", description: "Annual registered agent fees due for 5 Wyoming LLCs. Total: $750. Invoice sent to respective clients.", action_url: "/legalnations/tasks", is_read: true, created_at: ago(360) },
    { vertical_id: "hr", user_id: null, type: "application", title: "Bank account opened — Gulf Goods LLC", description: "Mercury bank account approved for Gulf Goods America LLC. Client notified with login credentials.", action_url: "/legalnations/pipeline", is_read: true, created_at: ago(1440) },
    { vertical_id: "hr", user_id: null, type: "system", title: "Stripe setup complete — LuxeDrops", description: "Stripe Connect account verified for LuxeDrops Trading LLC. Payouts enabled. Client can start processing.", action_url: "/legalnations/pipeline", is_read: true, created_at: ago(2400) },
    { vertical_id: "hr", user_id: null, type: "application", title: "New client intake — NovaTech Solutions", description: "NovaTech Solutions submitted intake form for Delaware LLC formation. Retainer paid. Begin processing.", action_url: "/legalnations/pipeline", is_read: true, created_at: ago(3200) },
    { vertical_id: "hr", user_id: null, type: "finance", title: "Annual report filed — ShopBrasil USA", description: "Wyoming Annual Report filed for ShopBrasil USA LLC. Next due: March 2027. $60 fee processed.", action_url: "/legalnations/tasks", is_read: true, created_at: ago(4200) },

    // ── USDrop AI (sales) ──
    { vertical_id: "sales", user_id: null, type: "retailer", title: "New lead — Sneha Reddy (Hot)", description: "Sneha Reddy from Hyderabad registered via webinar funnel. Engagement score: 9/12. Assign to Vikram for follow-up.", action_url: "/usdrop/leads", is_read: false, created_at: ago(12) },
    { vertical_id: "sales", user_id: null, type: "application", title: "Batch enrollment — Beta Cohort W16", description: "3 new students enrolled in Beta Cohort W16: Priya Sharma, Jake Miller, Aisha Khan. Onboarding emails sent.", action_url: "/usdrop/clients", is_read: false, created_at: ago(90) },
    { vertical_id: "sales", user_id: null, type: "system", title: "LLC formation stalled — 2 clients", description: "Priya Sharma (QuickShop US) and Diego Costa (ShopBrasil USA) have been in current LLC stage for 14+ days.", action_url: "/usdrop/llc", is_read: false, created_at: ago(240) },
    { vertical_id: "sales", user_id: null, type: "order", title: "Course completion — Sarah Chen", description: "Sarah Chen completed 95% of Alpha Cohort curriculum. Auto-graduation criteria met. Review and confirm.", action_url: "/usdrop/users", is_read: true, created_at: ago(480) },
    { vertical_id: "sales", user_id: null, type: "inventory", title: "Winning product alert — LED Ring Light", description: "LED Ring Light 10-inch has 2,103 orders and climbing. Marked as 'Winning'. Update supplier stock levels.", action_url: "/usdrop/winning-products", is_read: true, created_at: ago(1440) },
    { vertical_id: "sales", user_id: null, type: "finance", title: "Subscription renewal — 8 users", description: "8 monthly subscriptions renewing tomorrow. Total MRR: $1,596. 2 users have expiring cards — notify.", action_url: "/usdrop/subscriptions", is_read: true, created_at: ago(2000) },
    { vertical_id: "sales", user_id: null, type: "system", title: "Shopify store sync complete", description: "All 4 managed Shopify stores synced. 23 new orders pulled, 5 products updated. No fulfillment issues.", action_url: "/usdrop/stores", is_read: true, created_at: ago(2880) },
    { vertical_id: "sales", user_id: null, type: "fulfillment", title: "New mentorship session published", description: "\"Facebook Ads for Beginners\" session (55 min) published. 3 students already viewed the recording.", action_url: "/usdrop/content/sessions", is_read: true, created_at: ago(4000) },

    // ── GoyoTours (events) ──
    { vertical_id: "events", user_id: null, type: "order", title: "New booking — Gobi Desert 5-Day", description: "James Wilson booked Gobi Desert Explorer (5 days) for Apr 15-19. Party of 4. Total: $3,200. Deposit paid.", action_url: "/goyotours/leads", is_read: false, created_at: ago(15) },
    { vertical_id: "events", user_id: null, type: "fulfillment", title: "Guide assigned — Nomadic Horseback", description: "Batbold assigned as lead guide for Nomadic Horseback Adventure (Mar 22-26). Equipment checklist sent.", action_url: "/goyotours/tasks", is_read: false, created_at: ago(75) },
    { vertical_id: "events", user_id: null, type: "system", title: "Weather advisory — Terelj region", description: "Heavy snowfall forecast for Terelj National Park (Mar 10-12). 2 tours may need itinerary adjustment.", action_url: "/goyotours/tasks", is_read: false, created_at: ago(200) },
    { vertical_id: "events", user_id: null, type: "finance", title: "Payment received — Eagle Festival", description: "Maria Santos paid remaining $1,800 for Golden Eagle Festival tour. Full payment confirmed. Voucher issued.", action_url: "/goyotours/tasks", is_read: true, created_at: ago(480) },
    { vertical_id: "events", user_id: null, type: "retailer", title: "Partner hotel confirmed — Ulaanbaatar", description: "Blue Sky Hotel confirmed group booking for Mar 20-22. 6 rooms, breakfast included. Rate: $85/night.", action_url: "/goyotours/resources", is_read: true, created_at: ago(1440) },
    { vertical_id: "events", user_id: null, type: "system", title: "Vehicle maintenance due — Land Cruiser", description: "Tour vehicle LC-003 needs 50,000km service. Schedule before Mar 15 peak season begins.", action_url: "/goyotours/tasks", is_read: true, created_at: ago(2200) },
    { vertical_id: "events", user_id: null, type: "order", title: "Group inquiry — Corporate retreat", description: "TechCorp Mongolia requesting custom 3-day team retreat in Khentii Province. 25 pax. Respond within 48hrs.", action_url: "/goyotours/leads", is_read: true, created_at: ago(3000) },
    { vertical_id: "events", user_id: null, type: "finance", title: "Q1 revenue report ready", description: "GoyoTours Q1 revenue: $42,800 across 18 tours. Avg booking value: $2,378. Export report for review.", action_url: "/goyotours/reports", is_read: true, created_at: ago(4100) },

    // ── Event Management (eventhub) ──
    { vertical_id: "eventhub", user_id: null, type: "order", title: "New inquiry — Corporate Gala Night", description: "Reliance Industries inquired about a 200-person corporate gala on Apr 5. Budget: ₹15L. Venue TBD.", action_url: "/eventhub/leads", is_read: false, created_at: ago(10) },
    { vertical_id: "eventhub", user_id: null, type: "fulfillment", title: "Vendor confirmed — Sound & Lights", description: "AudioVisual Pro confirmed for Sharma Wedding (Mar 18). Equipment list approved. Setup time: 4hrs.", action_url: "/eventhub/tasks", is_read: false, created_at: ago(55) },
    { vertical_id: "eventhub", user_id: null, type: "system", title: "Timeline alert — Mehta Sangeet", description: "Mehta Sangeet (Mar 12) is 5 days away. Caterer confirmation pending. Follow up with Royal Caterers.", action_url: "/eventhub/tasks", is_read: false, created_at: ago(150) },
    { vertical_id: "eventhub", user_id: null, type: "finance", title: "Invoice paid — Patel Reception", description: "Patel family paid final installment of ₹3.5L for reception event. Total collected: ₹8.5L. Settled.", action_url: "/eventhub/tasks", is_read: true, created_at: ago(400) },
    { vertical_id: "eventhub", user_id: null, type: "quotation", title: "Quote received — Floral arrangements", description: "Bloom & Petal quoted ₹1.2L for Agarwal Wedding floral decor. Compare with previous vendor quote.", action_url: "/eventhub/tasks", is_read: true, created_at: ago(1440) },
    { vertical_id: "eventhub", user_id: null, type: "retailer", title: "New venue partnership — Grand Orchid", description: "Grand Orchid Banquet Hall signed partnership agreement. 15% commission on referrals. 500 pax capacity.", action_url: "/eventhub/resources", is_read: true, created_at: ago(2600) },
    { vertical_id: "eventhub", user_id: null, type: "system", title: "Client feedback received — 4.8★", description: "Kapoor Anniversary event received 4.8/5 rating. Client highlighted décor and coordination. Add to testimonials.", action_url: "/eventhub/tasks", is_read: true, created_at: ago(3500) },
    { vertical_id: "eventhub", user_id: null, type: "order", title: "Repeat booking — Joshi family", description: "Joshi family booked engagement ceremony for May 10. Previous client (wedding 2024). Preferred vendor list applied.", action_url: "/eventhub/leads", is_read: true, created_at: ago(4300) },

    // ── LBM Lifestyle (admin) ──
    { vertical_id: "admin", user_id: null, type: "order", title: "New bulk order — 50 Jute Bags", description: "EcoStyle Boutique ordered 50 custom jute bags with embroidery. Delivery by Mar 20. Confirm with workshop.", action_url: "/lbm/tasks", is_read: false, created_at: ago(20) },
    { vertical_id: "admin", user_id: null, type: "inventory", title: "Low stock — Handloom Scarves (Red)", description: "Only 12 Red Handloom Scarves remaining. Next production batch: 2 weeks. Consider pre-orders.", action_url: "/lbm/tasks", is_read: false, created_at: ago(100) },
    { vertical_id: "admin", user_id: null, type: "fulfillment", title: "Shipment dispatched — Order #LBM-428", description: "Order #LBM-428 (Ceramic Planters x20) shipped via DTDC. Tracking: DT89234561. ETA: Mar 10.", action_url: "/lbm/tasks", is_read: false, created_at: ago(240) },
    { vertical_id: "admin", user_id: null, type: "finance", title: "Payment received — ₹45,000", description: "Craft Corner paid ₹45,000 for Feb invoice. Outstanding balance cleared. Update ledger.", action_url: "/lbm/tasks", is_read: true, created_at: ago(500) },
    { vertical_id: "admin", user_id: null, type: "system", title: "Design approval needed — Summer catalog", description: "Graphic designer submitted Summer 2026 catalog draft. 24 pages, 80 products. Review and approve.", action_url: "/lbm/resources", is_read: true, created_at: ago(1440) },
    { vertical_id: "admin", user_id: null, type: "quotation", title: "Vendor quote — Raw Silk fabric", description: "Varanasi Silk House quoted ₹850/meter for raw silk (50m minimum). Compare with Mysore Silks quote.", action_url: "/lbm/tasks", is_read: true, created_at: ago(2400) },
    { vertical_id: "admin", user_id: null, type: "retailer", title: "New retail partner — Urban Craft", description: "Urban Craft (Bangalore) signed consignment agreement. Initial order: 30 products across 5 categories.", action_url: "/lbm/tasks", is_read: true, created_at: ago(3200) },
    { vertical_id: "admin", user_id: null, type: "inventory", title: "Production complete — Bamboo Baskets", description: "Artisan workshop completed 100 bamboo baskets. Quality check passed. Ready for dispatch.", action_url: "/lbm/tasks", is_read: true, created_at: ago(4000) },

    // ── Developer (dev) ──
    { vertical_id: "dev", user_id: null, type: "system", title: "Deployment successful — v2.4.1", description: "TeamSync v2.4.1 deployed to production. 3 bug fixes, 2 feature enhancements. Zero downtime.", action_url: "/dev/tasks", is_read: false, created_at: ago(3) },
    { vertical_id: "dev", user_id: null, type: "application", title: "PR merged — Notifications refactor", description: "PR #287 merged: Dynamic notifications from Supabase. 4 files changed, 380 insertions. All tests pass.", action_url: "/dev/tasks", is_read: false, created_at: ago(30) },
    { vertical_id: "dev", user_id: null, type: "system", title: "Error spike — API latency > 500ms", description: "Supabase response times spiked to 520ms avg over last 15 minutes. Connection pool at 80%. Monitor.", action_url: "/dev/tasks", is_read: false, created_at: ago(90) },
    { vertical_id: "dev", user_id: null, type: "application", title: "New skill installed — frontend-design", description: "Claude skill 'frontend-design' installed successfully. Covers component patterns, accessibility, and responsive design.", action_url: "/dev/skills", is_read: true, created_at: ago(360) },
    { vertical_id: "dev", user_id: null, type: "system", title: "Database backup completed", description: "Daily Supabase backup completed. Size: 245MB. All 12 tables backed up. Retention: 30 days.", action_url: "/dev/tasks", is_read: true, created_at: ago(1440) },
    { vertical_id: "dev", user_id: null, type: "inventory", title: "Package updates available — 8 deps", description: "8 npm packages have updates: react-query, drizzle-orm, vite, lucide-react, and 4 others. Review changelogs.", action_url: "/dev/tasks", is_read: true, created_at: ago(2200) },
    { vertical_id: "dev", user_id: null, type: "system", title: "SSL certificate renewing — 14 days", description: "SSL certificate for teamsync.app expires Mar 21. Auto-renewal scheduled. Verify DNS records.", action_url: "/dev/tasks", is_read: true, created_at: ago(3000) },
    { vertical_id: "dev", user_id: null, type: "application", title: "Bug report — Dark mode toggle", description: "User reported dark mode toggle not persisting on page reload. localStorage key conflict suspected.", action_url: "/dev/tasks", is_read: true, created_at: ago(4200) },

    // ── EazyToSell (ets) ──
    { vertical_id: "ets", user_id: null, type: "retailer", title: "New client signup — FreshMart India", description: "FreshMart India registered for EazyToSell Pro plan. Store setup wizard started. Assign onboarding rep.", action_url: "/ets/pipeline", is_read: false, created_at: ago(18) },
    { vertical_id: "ets", user_id: null, type: "order", title: "Pipeline update — 3 deals moved", description: "3 deals moved to 'Proposal Sent': FreshMart India ($2,400/yr), SpiceLane ($1,800/yr), CraftBazaar ($3,600/yr).", action_url: "/ets/pipeline", is_read: false, created_at: ago(70) },
    { vertical_id: "ets", user_id: null, type: "system", title: "Meeting reminder — Demo with UrbanNest", description: "Product demo with UrbanNest Home scheduled in 2 hours. Prep: custom pricing deck + integration overview.", action_url: "/ets/tasks", is_read: false, created_at: ago(120) },
    { vertical_id: "ets", user_id: null, type: "finance", title: "Invoice overdue — TechByte Solutions", description: "TechByte Solutions invoice #ETS-1089 ($4,200) is 15 days overdue. Send second reminder.", action_url: "/ets/tasks", is_read: true, created_at: ago(480) },
    { vertical_id: "ets", user_id: null, type: "application", title: "Onboarding complete — GreenLeaf Organics", description: "GreenLeaf Organics completed all 5 onboarding steps. Store live with 45 products. First order received.", action_url: "/ets/pipeline", is_read: true, created_at: ago(1440) },
    { vertical_id: "ets", user_id: null, type: "quotation", title: "Custom integration quote — MegaStore", description: "MegaStore requested custom API integration for their ERP. Estimated effort: 40hrs. Quote: $8,000.", action_url: "/ets/tasks", is_read: true, created_at: ago(2400) },
    { vertical_id: "ets", user_id: null, type: "system", title: "Client churn risk — 2 accounts", description: "StyleHub and BookWorld haven't logged in for 30+ days. Usage dropped 80%. Schedule retention calls.", action_url: "/ets/pipeline", is_read: true, created_at: ago(3200) },
    { vertical_id: "ets", user_id: null, type: "finance", title: "Monthly revenue — Feb $18,400", description: "February MRR: $18,400 across 24 active accounts. Growth: +12% MoM. 3 new trials converting.", action_url: "/ets/tasks", is_read: true, created_at: ago(4000) },

    // ── FaireDesk (faire) ──
    { vertical_id: "faire", user_id: null, type: "order", title: "3 new wholesale orders received", description: "Toyarina received 3 new orders totalling $4,820 — review and accept before the 7-day window closes.", action_url: "/faire/orders", is_read: false, created_at: ago(2) },
    { vertical_id: "faire", user_id: null, type: "fulfillment", title: "2 orders past ship deadline", description: "Orders F-0041 and F-0038 are 48 hours past expected ship date. Retailers have been waiting.", action_url: "/faire/fulfillment", is_read: false, created_at: ago(60) },
    { vertical_id: "faire", user_id: null, type: "inventory", title: "Low stock — Bamboo Incense Holder", description: "Only 8 units left across all stores. Restock before next Faire sync to avoid cancellations.", action_url: "/faire/products", is_read: false, created_at: ago(180) },
    { vertical_id: "faire", user_id: null, type: "finance", title: "Faire payout received — $3,420", description: "February week 4 payout landed. Commission deducted: $513 (15%). Ready to reconcile.", action_url: "/faire/ledger", is_read: false, created_at: ago(300) },
    { vertical_id: "faire", user_id: null, type: "retailer", title: "New retailer — Lone Star Court", description: "Lone Star Court (Austin, TX) placed first order — $890 from Gullee Gadgets. Great follow-up opportunity.", action_url: "/faire/retailers", is_read: true, created_at: ago(1440) },
    { vertical_id: "faire", user_id: null, type: "application", title: "Docs requested — Toyarina application", description: "Faire review team requested EIN and Articles of Incorporation for Toyarina seller account application.", action_url: "/faire/applications", is_read: true, created_at: ago(1600) },
    { vertical_id: "faire", user_id: null, type: "system", title: "Store sync complete — Toyarina", description: "Toyarina sync finished: 14 orders pulled, 2 products updated, 1 retailer added.", action_url: "/faire/stores", is_read: true, created_at: ago(2200) },
    { vertical_id: "faire", user_id: null, type: "quotation", title: "Quote — Sunrise Fulfillment", description: "Quote for order F-0042 (3 items, $2,100 value) submitted. Review margin and lead time.", action_url: "/faire/quotations", is_read: true, created_at: ago(2880) },
    { vertical_id: "faire", user_id: null, type: "inventory", title: "18 draft products — Holiday Farm", description: "Holiday Farm has 18 products in DRAFT. They won't appear on Faire until published.", action_url: "/faire/products", is_read: true, created_at: ago(3500) },
    { vertical_id: "faire", user_id: null, type: "finance", title: "Unreconciled transaction — $1,240", description: "A $1,240 bank credit from Feb 26 hasn't been mapped to a Faire order. Link in Bank Transactions.", action_url: "/faire/bank-transactions", is_read: true, created_at: ago(4300) },

    // ── Vendor Portal (vendor-portal) ──
    { vertical_id: "vendor-portal", user_id: null, type: "order", title: "New PO received — PO-2026-089", description: "Purchase order from LBM Lifestyle: 200 Jute Bags, 50 Ceramic Planters. Delivery by Mar 25.", action_url: "/vendor-portal/tasks", is_read: false, created_at: ago(25) },
    { vertical_id: "vendor-portal", user_id: null, type: "fulfillment", title: "Delivery scheduled — PO-2026-085", description: "Shipment for PO-2026-085 picked up by logistics. 3 pallets, 450kg. ETA: Mar 9.", action_url: "/vendor-portal/tasks", is_read: false, created_at: ago(80) },
    { vertical_id: "vendor-portal", user_id: null, type: "system", title: "Quality inspection — Batch QC-445", description: "QC team flagged 5% defect rate on Batch QC-445 (Wooden Coasters). Below threshold but review needed.", action_url: "/vendor-portal/tasks", is_read: false, created_at: ago(200) },
    { vertical_id: "vendor-portal", user_id: null, type: "finance", title: "Invoice approved — INV-V-2026-034", description: "Invoice INV-V-2026-034 (₹2.8L) approved for payment. Expected disbursement: within 7 business days.", action_url: "/vendor-portal/tasks", is_read: true, created_at: ago(500) },
    { vertical_id: "vendor-portal", user_id: null, type: "quotation", title: "RFQ — Organic Cotton Fabric", description: "LBM Lifestyle requesting quotes for 500m organic cotton fabric. Submit pricing by Mar 12.", action_url: "/vendor-portal/tasks", is_read: true, created_at: ago(1440) },
    { vertical_id: "vendor-portal", user_id: null, type: "system", title: "Contract renewal — 30 days notice", description: "Supply agreement with LBM Lifestyle expires Apr 5. Review terms and submit renewal proposal.", action_url: "/vendor-portal/resources", is_read: true, created_at: ago(2400) },
    { vertical_id: "vendor-portal", user_id: null, type: "inventory", title: "Stock update requested", description: "Buyer requested current stock levels for all handicraft categories. Update portal inventory by Mar 10.", action_url: "/vendor-portal/tasks", is_read: true, created_at: ago(3200) },
    { vertical_id: "vendor-portal", user_id: null, type: "finance", title: "Payment received — ₹1.5L", description: "Payment of ₹1,50,000 received for January deliveries. Credited to registered bank account.", action_url: "/vendor-portal/tasks", is_read: true, created_at: ago(4000) },

    // ── HRMS (hrms) ──
    { vertical_id: "hrms", user_id: null, type: "application", title: "Leave request — Sneha Patel (3 days)", description: "Sneha Patel requested casual leave Mar 10-12. Reason: family event. Manager approval pending.", action_url: "/hrms/tasks", is_read: false, created_at: ago(10) },
    { vertical_id: "hrms", user_id: null, type: "system", title: "Attendance anomaly — 4 employees", description: "4 employees missed clock-in today: Vikram Singh, Karan Mehta, Priya Sharma, Ravi Kumar. Verify.", action_url: "/hrms/tasks", is_read: false, created_at: ago(65) },
    { vertical_id: "hrms", user_id: null, type: "finance", title: "Payroll processing — March 2026", description: "March payroll ready for processing. 28 employees, total: ₹18.4L. PF/ESI deductions calculated. Approve.", action_url: "/hrms/tasks", is_read: false, created_at: ago(180) },
    { vertical_id: "hrms", user_id: null, type: "application", title: "New joiner onboarding — Anita Roy", description: "Anita Roy (UX Designer) joining Mar 10. Desk allocated, laptop provisioned, buddy assigned: Karan.", action_url: "/hrms/tasks", is_read: true, created_at: ago(400) },
    { vertical_id: "hrms", user_id: null, type: "system", title: "Performance review cycle — Q4", description: "Q4 performance review cycle initiated. 28 reviews due by Mar 20. 12 self-assessments submitted.", action_url: "/hrms/tasks", is_read: true, created_at: ago(1440) },
    { vertical_id: "hrms", user_id: null, type: "application", title: "Expense claim submitted — ₹12,400", description: "Ravi Kumar submitted expense claim for client visit travel. ₹12,400. Receipts attached. Approve/reject.", action_url: "/hrms/tasks", is_read: true, created_at: ago(2200) },
    { vertical_id: "hrms", user_id: null, type: "finance", title: "PF challan generated — Feb", description: "February PF challan generated. Total contribution: ₹3.2L (employer + employee). File by Mar 15.", action_url: "/hrms/tasks", is_read: true, created_at: ago(3000) },
    { vertical_id: "hrms", user_id: null, type: "system", title: "Birthday reminder — 2 employees", description: "Upcoming birthdays: Meera Joshi (Mar 9), Amit Patel (Mar 11). Send wishes and arrange celebration.", action_url: "/hrms/team", is_read: true, created_at: ago(4000) },

    // ── ATS/Recruitment (ats) ──
    { vertical_id: "ats", user_id: null, type: "application", title: "15 new applications — Sr. Developer", description: "15 applications received for Senior Full-Stack Developer role. 4 match required skills. Screen and shortlist.", action_url: "/ats/jobs", is_read: false, created_at: ago(8) },
    { vertical_id: "ats", user_id: null, type: "system", title: "Interview scheduled — Tomorrow 2PM", description: "Technical interview with Arun Krishnan for Product Designer role. Panel: Karan + Sneha. Send calendar invite.", action_url: "/ats/candidates", is_read: false, created_at: ago(50) },
    { vertical_id: "ats", user_id: null, type: "application", title: "Offer accepted — Priya Nair", description: "Priya Nair accepted offer for Marketing Manager (₹18L CTC). Start date: Apr 1. Initiate background check.", action_url: "/ats/candidates", is_read: false, created_at: ago(160) },
    { vertical_id: "ats", user_id: null, type: "system", title: "Job posting expiring — 3 roles", description: "3 job postings expire in 5 days: DevOps Engineer, Content Writer, Sales Executive. Renew or close.", action_url: "/ats/jobs", is_read: true, created_at: ago(480) },
    { vertical_id: "ats", user_id: null, type: "retailer", title: "Referral received — Vikram's network", description: "Vikram Singh referred Rohit Sharma for Backend Developer role. Strong profile — 5yr experience, Node.js expert.", action_url: "/ats/candidates", is_read: true, created_at: ago(1440) },
    { vertical_id: "ats", user_id: null, type: "application", title: "Candidate withdrawn — UI Designer", description: "Kavita Mehta withdrew application for UI Designer citing competing offer. Update pipeline and source alternatives.", action_url: "/ats/candidates", is_read: true, created_at: ago(2400) },
    { vertical_id: "ats", user_id: null, type: "finance", title: "Recruitment spend — Feb report", description: "February recruitment spend: ₹85,000 across job boards, referrals, and agencies. Cost per hire: ₹28,333.", action_url: "/ats/reports", is_read: true, created_at: ago(3200) },
    { vertical_id: "ats", user_id: null, type: "system", title: "Assessment completed — 5 candidates", description: "5 candidates completed online assessment for Frontend Developer role. Average score: 72%. Top: 91%.", action_url: "/ats/candidates", is_read: true, created_at: ago(4100) },

    // ── Sales CRM (crm) ──
    { vertical_id: "crm", user_id: null, type: "order", title: "Deal won — TechCorp ($24,000)", description: "TechCorp deal closed at $24,000/year. Enterprise plan. Contract signed. Schedule kickoff call.", action_url: "/crm/pipeline", is_read: false, created_at: ago(5) },
    { vertical_id: "crm", user_id: null, type: "system", title: "Follow-up overdue — 4 leads", description: "4 leads haven't been contacted in 7+ days: InnovateTech, GreenPath, UrbanEdge, CloudFirst. Assign reps.", action_url: "/crm/leads", is_read: false, created_at: ago(45) },
    { vertical_id: "crm", user_id: null, type: "retailer", title: "New lead assigned — FinServ Global", description: "FinServ Global (Enterprise, 500+ employees) assigned to Karan. Source: LinkedIn campaign. High priority.", action_url: "/crm/leads", is_read: false, created_at: ago(120) },
    { vertical_id: "crm", user_id: null, type: "quotation", title: "Proposal sent — DataFlow Analytics", description: "Custom proposal ($36,000/yr) sent to DataFlow Analytics. Decision expected by Mar 15. Set reminder.", action_url: "/crm/pipeline", is_read: true, created_at: ago(400) },
    { vertical_id: "crm", user_id: null, type: "finance", title: "Monthly pipeline value — $142K", description: "March pipeline: $142,000 across 18 active deals. Weighted value: $89,000. Close probability: 63%.", action_url: "/crm/pipeline", is_read: true, created_at: ago(1440) },
    { vertical_id: "crm", user_id: null, type: "system", title: "Contact imported — 45 from CSV", description: "45 contacts imported from trade show CSV. 12 duplicates merged. 33 new contacts added to database.", action_url: "/crm/contacts", is_read: true, created_at: ago(2200) },
    { vertical_id: "crm", user_id: null, type: "order", title: "Renewal due — SmartRetail ($8,400)", description: "SmartRetail annual renewal due Mar 20. Current plan: Professional. Upsell opportunity: Enterprise tier.", action_url: "/crm/pipeline", is_read: true, created_at: ago(3000) },
    { vertical_id: "crm", user_id: null, type: "system", title: "Email campaign results — 32% open rate", description: "\"Spring 2026\" campaign: 1,200 sent, 384 opened (32%), 67 clicked (5.6%). 8 demo requests generated.", action_url: "/crm/reports", is_read: true, created_at: ago(4200) },

    // ── Finance & Accounts (finance) ──
    { vertical_id: "finance", user_id: null, type: "finance", title: "3 invoices due this week", description: "Invoices due: INV-2026-089 (₹4.5L, Mar 8), INV-2026-091 (₹2.1L, Mar 10), INV-2026-093 (₹6.8L, Mar 12).", action_url: "/finance/tasks", is_read: false, created_at: ago(15) },
    { vertical_id: "finance", user_id: null, type: "application", title: "Expense report — Feb approved", description: "February company expense report approved. Total: ₹8.2L. Categories: Travel (35%), Software (28%), Office (22%).", action_url: "/finance/tasks", is_read: false, created_at: ago(90) },
    { vertical_id: "finance", user_id: null, type: "system", title: "Bank reconciliation pending — HDFC", description: "HDFC current account has 12 unreconciled transactions from last week. Total: ₹3.4L. Match and clear.", action_url: "/finance/tasks", is_read: false, created_at: ago(200) },
    { vertical_id: "finance", user_id: null, type: "finance", title: "Budget utilization — 78% of Q4", description: "Q4 budget utilized: 78% (₹24.6L of ₹31.5L). Marketing overspent by 12%. IT under by 15%. Review.", action_url: "/finance/reports", is_read: true, created_at: ago(500) },
    { vertical_id: "finance", user_id: null, type: "system", title: "GST input credit — ₹2.1L available", description: "₹2.1L input tax credit available for March GSTR-3B filing. Verify invoices before claiming.", action_url: "/finance/tasks", is_read: true, created_at: ago(1440) },
    { vertical_id: "finance", user_id: null, type: "application", title: "Vendor payment batch — 8 vendors", description: "8 vendor payments queued: total ₹12.4L. All invoices verified and approved. Process batch payment.", action_url: "/finance/tasks", is_read: true, created_at: ago(2400) },
    { vertical_id: "finance", user_id: null, type: "finance", title: "Cash flow forecast — Next 30 days", description: "Projected inflow: ₹28L. Projected outflow: ₹22L. Net positive: ₹6L. No liquidity concerns.", action_url: "/finance/reports", is_read: true, created_at: ago(3200) },
    { vertical_id: "finance", user_id: null, type: "system", title: "Audit preparation — FY25-26", description: "Statutory audit for FY 2025-26 begins Apr 15. Pre-audit checklist: 18 of 25 items completed.", action_url: "/finance/tasks", is_read: true, created_at: ago(4100) },

    // ── Order & Fulfillment (oms) ──
    { vertical_id: "oms", user_id: null, type: "order", title: "12 new orders — last 2 hours", description: "12 orders received across 3 channels: Shopify (7), Amazon (3), Direct (2). Total value: ₹1.8L.", action_url: "/oms/tasks", is_read: false, created_at: ago(5) },
    { vertical_id: "oms", user_id: null, type: "fulfillment", title: "Shipment delayed — ORD-4521", description: "Order ORD-4521 (Bangalore) delayed by logistics partner. Original ETA was today. New ETA: Mar 9.", action_url: "/oms/tasks", is_read: false, created_at: ago(40) },
    { vertical_id: "oms", user_id: null, type: "inventory", title: "Stock alert — 5 SKUs below threshold", description: "5 SKUs below reorder point: SKU-101, SKU-234, SKU-567, SKU-890, SKU-345. Generate purchase orders.", action_url: "/oms/tasks", is_read: false, created_at: ago(150) },
    { vertical_id: "oms", user_id: null, type: "system", title: "Return request — ORD-4498", description: "Customer requested return for ORD-4498 (Defective item). RMA #RMA-0089 created. Approve pickup.", action_url: "/oms/tasks", is_read: true, created_at: ago(400) },
    { vertical_id: "oms", user_id: null, type: "fulfillment", title: "Warehouse pick complete — Batch B-78", description: "Batch B-78: 35 orders picked and packed. Ready for carrier pickup at 4PM. Verify shipping labels.", action_url: "/oms/tasks", is_read: true, created_at: ago(1440) },
    { vertical_id: "oms", user_id: null, type: "finance", title: "COD remittance received — ₹45,000", description: "Logistics partner remitted ₹45,000 for COD orders delivered Feb 25-28. Reconcile with order records.", action_url: "/oms/tasks", is_read: true, created_at: ago(2200) },
    { vertical_id: "oms", user_id: null, type: "order", title: "Bulk order — B2B client", description: "Wholesale order from RetailMart: 500 units across 8 SKUs. Value: ₹3.2L. Delivery: Mar 20.", action_url: "/oms/tasks", is_read: true, created_at: ago(3000) },
    { vertical_id: "oms", user_id: null, type: "system", title: "Channel sync — Amazon catalog updated", description: "Amazon catalog sync complete: 12 price updates, 3 new listings, 1 listing deactivated.", action_url: "/oms/tasks", is_read: true, created_at: ago(4000) },

    // ── SMM / Social (social) ──
    { vertical_id: "social", user_id: null, type: "system", title: "Post scheduled — Instagram Reel", description: "\"Spring Collection BTS\" reel scheduled for Mar 8, 11:00 AM IST. Auto-publish enabled. Preview approved.", action_url: "/social/tasks", is_read: false, created_at: ago(10) },
    { vertical_id: "social", user_id: null, type: "retailer", title: "Engagement spike — LinkedIn post", description: "\"2026 D2C Trends\" LinkedIn post reached 12,400 impressions, 340 reactions, 89 comments. Trending.", action_url: "/social/reports", is_read: false, created_at: ago(55) },
    { vertical_id: "social", user_id: null, type: "finance", title: "Ad spend — Feb campaign report", description: "February ad spend: ₹1.8L across Meta (60%), Google (30%), LinkedIn (10%). ROAS: 3.2x. CPL: ₹420.", action_url: "/social/reports", is_read: false, created_at: ago(180) },
    { vertical_id: "social", user_id: null, type: "application", title: "Content approval needed — 5 posts", description: "5 posts pending approval for next week: 2 Instagram carousels, 1 LinkedIn article, 2 Twitter threads.", action_url: "/social/tasks", is_read: true, created_at: ago(400) },
    { vertical_id: "social", user_id: null, type: "system", title: "Follower milestone — 10K Instagram", description: "Brand Instagram account crossed 10,000 followers! Unlocked swipe-up stories. Plan celebration post.", action_url: "/social/reports", is_read: true, created_at: ago(1440) },
    { vertical_id: "social", user_id: null, type: "order", title: "Influencer collab — content delivered", description: "Influencer @craftlover delivered 3 reels and 5 stories. View count: 45K combined. Review and reshare.", action_url: "/social/tasks", is_read: true, created_at: ago(2400) },
    { vertical_id: "social", user_id: null, type: "system", title: "Negative mention detected", description: "Brand mentioned negatively on Twitter by @unhappycustomer. Topic: delayed delivery. Draft response.", action_url: "/social/tasks", is_read: true, created_at: ago(3200) },
    { vertical_id: "social", user_id: null, type: "retailer", title: "UGC submission — Product review", description: "3 new user-generated reviews submitted for featured products. Curate best for social proof campaign.", action_url: "/social/tasks", is_read: true, created_at: ago(4000) },

    { vertical_id: "rnd", user_id: null, type: "system", title: "Product research validated — Bamboo Towels", description: "Bamboo Fiber Kitchen Towels passed validation: low competition, 55% margin, 3 supplier quotes received. Ready for sourcing.", action_url: "/rnd/product-research", is_read: false, created_at: ago(8) },
    { vertical_id: "rnd", user_id: null, type: "application", title: "New pitch idea submitted — AI Forecasting", description: "Lakshay submitted 'AI-Powered Inventory Forecasting SaaS' pitch. Estimated effort: Large. Needs review by R&D committee.", action_url: "/rnd/pitch-ideas", is_read: false, created_at: ago(65) },
    { vertical_id: "rnd", user_id: null, type: "retailer", title: "Market intel — India D2C report published", description: "RedSeer Consulting published updated India D2C market report. Projected $100B by 2025. Key segments: beauty, wellness, electronics.", action_url: "/rnd/market-intelligence", is_read: false, created_at: ago(200) },
    { vertical_id: "rnd", user_id: null, type: "system", title: "Key finding — Shopify Q4 earnings analysis", description: "Shopify merchant solutions revenue grew 31% YoY. Shop Pay GMV crossed $16B. Bundled payments becoming primary revenue driver.", action_url: "/rnd/key-findings", is_read: true, created_at: ago(420) },
    { vertical_id: "rnd", user_id: null, type: "finance", title: "SaaS tool evaluation — Clerk vs Auth0", description: "Completed Clerk vs Auth0 comparison for TeamSync auth. Clerk wins on DX and pricing ($0-$99 vs $23-$240). Full analysis ready.", action_url: "/rnd/saas-references", is_read: true, created_at: ago(1500) },
    { vertical_id: "rnd", user_id: null, type: "order", title: "Project report updated — CRM vertical", description: "CRM vertical completion moved from 68% to 74%. Deal pipeline and email sequences now live. Next: payment links.", action_url: "/rnd/project-reports", is_read: true, created_at: ago(2200) },
    { vertical_id: "rnd", user_id: null, type: "application", title: "Competitor alert — Zoho launches AI assistant", description: "Zoho released Zia AI assistant with predictive deal scoring. 73% accuracy claimed. Review implications for our CRM vertical.", action_url: "/rnd/key-findings", is_read: true, created_at: ago(3000) },
    { vertical_id: "rnd", user_id: null, type: "system", title: "Research milestone — 15 products validated", description: "Product research pipeline hit 15 validated products this quarter. Top categories: health & wellness, home & kitchen, fashion accessories.", action_url: "/rnd/product-research", is_read: true, created_at: ago(4200) },
  ];

  const { data, error } = await supabase.from("notifications").insert(seeds).select("id");
  if (error) { console.error("[supabase] seedNotifications error:", error.message); return { ok: false, count: 0 }; }
  return { ok: true, count: data?.length ?? 0 };
}

// ── CORE: Tickets ───────────────────────────────────────────────────────────────

export interface CoreTicket {
  id: string;
  ticket_code: string;
  vertical_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  created_by: string | null;
  tags: string[];
  resolution: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoreTicketInput {
  vertical_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  reported_by?: string;
  assigned_to?: string;
  created_by?: string;
  tags?: string[];
  resolution?: string;
  due_date?: string;
}

export async function getCoreTickets(filters: {
  verticalId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ tickets: CoreTicket[]; total: number }> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const offset = (page - 1) * limit;

  const vid = normalizeIncomingVerticalId(filters.verticalId);
  let q = supabase.from("tickets").select("*", { count: "exact" });
  if (vid) q = q.eq("vertical_id", vid);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.priority) q = q.eq("priority", filters.priority);
  if (filters.assignedTo) q = q.eq("assigned_to", filters.assignedTo);
  if (filters.search) q = q.or(`title.ilike.%${filters.search}%,ticket_code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("[supabase] getCoreTickets error:", error.message);
    return { tickets: [], total: 0 };
  }
  return { tickets: ((data ?? []) as CoreTicket[]).map(translateVerticalId), total: count ?? 0 };
}

export async function getCoreTicket(id: string): Promise<CoreTicket | null> {
  const { data, error } = await supabase.from("tickets").select("*").eq("id", id).single();
  if (error) { console.error("[supabase] getCoreTicket error:", error.message); return null; }
  return data as CoreTicket;
}

export async function createCoreTicket(input: CoreTicketInput): Promise<CoreTicket | null> {
  const dbInput = input.vertical_id
    ? { ...input, vertical_id: toDbVerticalId(input.vertical_id) }
    : input;
  const { data, error } = await supabase.from("tickets").insert([dbInput]).select().single();
  if (error) { console.error("[supabase] createCoreTicket error:", error.message); return null; }
  return data ? translateVerticalId(data as CoreTicket) : null;
}

export async function updateCoreTicket(id: string, patch: Partial<CoreTicketInput>): Promise<CoreTicket | null> {
  const { data, error } = await supabase
    .from("tickets")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) { console.error("[supabase] updateCoreTicket error:", error.message); return null; }
  return data as CoreTicket;
}

export async function deleteCoreTicket(id: string): Promise<boolean> {
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) { console.error("[supabase] deleteCoreTicket error:", error.message); return false; }
  return true;
}
