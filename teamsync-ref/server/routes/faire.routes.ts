import type { Express } from "express";
import multer from "multer";
import {
  getStoreCredentials,
  listStores,
  syncOrders,
  syncProducts,
  updateStoreProfile,
  getStoreOrders,
  getAllOrders,
  getStoreProducts,
  getAllProducts,
  getStoreCounts,
  getAllRetailers,
  getRetailer,
  extractAndUpsertRetailersFromOrders,
  listVendors,
  upsertVendor,
  deleteVendor,
  getProductVendors,
  setProductVendor,
  removeProductVendor,
  getTransactionAttachments,
  addTransactionAttachment,
  uploadTransactionProof,
  getTransactionProofUrl,
  listSellerApplications,
  getSellerApplication,
  upsertSellerApplication,
  deleteSellerApplication,
  addApplicationFollowup,
  deleteApplicationFollowup,
  upsertApplicationLink,
  deleteApplicationLink,
  getRetailerEnrichment,
  upsertRetailerEnrichment,
  getBankTransactions,
  updateBankTransaction,
  addBankTransaction,
  listLedgerParties,
  getLedgerParty,
  upsertLedgerParty,
  getLedgerPartyTransactions,
  addLedgerPartyTransaction,
  updateLedgerPartyTransaction,
  getPartyBalance,
  getTaskActivity,
  addTaskComment,
  addTaskLink,
  uploadTaskFile,
  deleteTaskActivity,
} from "../supabase";
import { fetchAllOrders, fetchAllProducts, fetchBrandProfile, fetchProduct, updateVariantInventory } from "../faire-api";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const productCache: { data: unknown[] | null; ts: number } = { data: null, ts: 0 };
const PRODUCT_CACHE_TTL = 5 * 60 * 1000;
const productImageCache: Map<string, string | null> = new Map();
const storeSummaryCache: { data: unknown | null; ts: number } = { data: null, ts: 0 };
const SUMMARY_CACHE_TTL = 5 * 60 * 1000;

const FAIRE_API_BASE = "https://www.faire.com/external-api/v2";

async function faireRequest(
  method: string,
  path: string,
  oauthToken: string,
  appCredentials: string,
  body?: object
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(`${FAIRE_API_BASE}${path}`, {
    method,
    headers: {
      "X-FAIRE-OAUTH-ACCESS-TOKEN": oauthToken,
      "X-FAIRE-APP-CREDENTIALS": appCredentials,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export function registerFaireRoutes(app: Express): void {
  app.get("/api/faire/stores", async (req, res) => {
    try {
      const stores = await listStores();
      const includeSummary = req.query.summary !== undefined;
      if (!includeSummary) {
        return res.json({ stores });
      }
      if (storeSummaryCache.data && Date.now() - storeSummaryCache.ts < SUMMARY_CACHE_TTL) {
        return res.json({ stores, summary: storeSummaryCache.data });
      }
      const allOrders = await getAllOrders({ limit: 5000 });
      const summary: Record<string, {
        total_orders: number;
        total_revenue_cents: number;
        unique_retailers: number;
        orders_new: number;
        orders_processing: number;
        orders_in_transit: number;
        orders_delivered: number;
        orders_canceled: number;
        total_products: number;
        avg_order_value_cents: number;
        last_order_at: string | null;
      }> = {};
      for (const store of stores) {
        summary[store.id] = {
          total_orders: 0, total_revenue_cents: 0, unique_retailers: 0,
          orders_new: 0, orders_processing: 0, orders_in_transit: 0,
          orders_delivered: 0, orders_canceled: 0, total_products: 0,
          avg_order_value_cents: 0, last_order_at: null,
        };
      }
      const retailerSets: Record<string, Set<string>> = {};
      for (const rawOrder of allOrders) {
        const order = rawOrder as Record<string, unknown>;
        const storeId = order._storeId as string;
        if (!summary[storeId]) continue;
        if (!retailerSets[storeId]) retailerSets[storeId] = new Set();
        summary[storeId].total_orders++;
        const items = (order.items as { price_cents?: number; quantity?: number }[]) ?? [];
        const orderTotal = items.reduce((s, i) => s + (i.price_cents ?? 0) * (i.quantity ?? 1), 0);
        summary[storeId].total_revenue_cents += orderTotal;
        const state = order.state as string;
        if (state === "NEW") summary[storeId].orders_new++;
        else if (state === "PROCESSING") summary[storeId].orders_processing++;
        else if (state === "PRE_TRANSIT" || state === "IN_TRANSIT") summary[storeId].orders_in_transit++;
        else if (state === "DELIVERED") summary[storeId].orders_delivered++;
        else if (state === "CANCELED") summary[storeId].orders_canceled++;
        const retailerId = order.retailer_id as string;
        if (retailerId) retailerSets[storeId].add(retailerId);
        const createdAt = order.created_at as string;
        if (createdAt && (!summary[storeId].last_order_at || createdAt > summary[storeId].last_order_at!)) {
          summary[storeId].last_order_at = createdAt;
        }
      }
      for (const storeId of Object.keys(summary)) {
        summary[storeId].unique_retailers = retailerSets[storeId]?.size ?? 0;
        if (summary[storeId].total_orders > 0) {
          summary[storeId].avg_order_value_cents = Math.round(
            summary[storeId].total_revenue_cents / summary[storeId].total_orders
          );
        }
      }
      const counts = await Promise.all(stores.map(s => getStoreCounts(s.id)));
      stores.forEach((store, i) => {
        if (summary[store.id]) summary[store.id].total_products = counts[i].total_products;
      });
      storeSummaryCache.data = summary;
      storeSummaryCache.ts = Date.now();
      return res.json({ stores, summary });
    } catch {
      return res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/faire/orders", async (req, res) => {
    const state = req.query.state as string | undefined;
    const hasLimit = req.query.limit !== undefined;
    const hasOffset = req.query.offset !== undefined;
    try {
      const opts: { limit?: number; offset?: number; state?: string } = {
        state: state && state !== "all" ? state : undefined,
      };
      if (hasLimit || hasOffset) {
        opts.limit = parseInt(req.query.limit as string) || 500;
        opts.offset = parseInt(req.query.offset as string) || 0;
      }
      const orders = await getAllOrders(opts);
      return res.json({ orders });
    } catch {
      return res.status(500).json({ error: "Failed to fetch all orders" });
    }
  });

  app.get("/api/faire/products", async (req, res) => {
    const hasLimit = req.query.limit !== undefined;
    const hasOffset = req.query.offset !== undefined;
    const slim = req.query.slim !== undefined;
    try {
      let products: unknown[];
      if (hasLimit || hasOffset) {
        products = await getAllProducts({ limit: parseInt(req.query.limit as string) || 5000, offset: parseInt(req.query.offset as string) || 0 });
      } else if (productCache.data && Date.now() - productCache.ts < PRODUCT_CACHE_TTL) {
        products = productCache.data;
      } else {
        products = await getAllProducts();
        productCache.data = products;
        productCache.ts = Date.now();
      }
      if (slim) {
        const slimProducts = products.map((p: Record<string, unknown>) => {
          const images = (p.images as { url: string }[]) ?? [];
          const thumbUrl = images[0]?.url ?? null;
          return {
            id: p.id,
            name: p.name,
            lifecycle_state: p.lifecycle_state,
            sale_state: p.sale_state,
            taxonomy_type: p.taxonomy_type,
            minimum_order_quantity: p.minimum_order_quantity,
            unit_multiplier: p.unit_multiplier,
            _storeId: p._storeId,
            thumb_url: thumbUrl,
            variants: ((p.variants as Record<string, unknown>[]) ?? []).map((v) => ({
              id: v.id,
              sku: v.sku,
              name: v.name,
              wholesale_price_cents: v.wholesale_price_cents,
              retail_price_cents: v.retail_price_cents,
              available_quantity: v.available_quantity,
              options: v.options,
              lifecycle_state: v.lifecycle_state,
              sale_state: v.sale_state,
            })),
          };
        });
        return res.json({ products: slimProducts });
      }
      return res.json({ products });
    } catch {
      return res.status(500).json({ error: "Failed to fetch all products" });
    }
  });

  app.post("/api/faire/product-thumbs", async (req, res) => {
    try {
      const { productIds, storeId } = req.body as { productIds: string[]; storeId: string };
      if (!productIds?.length || !storeId) return res.json({ thumbs: {} });

      const thumbs: Record<string, string | null> = {};
      const uncached: string[] = [];

      for (const pid of productIds) {
        if (productImageCache.has(pid)) {
          thumbs[pid] = productImageCache.get(pid) ?? null;
        } else {
          let products = productCache.data;
          if (!products) {
            products = await getAllProducts();
            productCache.data = products;
            productCache.ts = Date.now();
          }
          const local = products.find((p: any) => p.id === pid);
          if (local) {
            const images = ((local as any).images as { url: string }[]) ?? [];
            const url = images[0]?.url ?? null;
            thumbs[pid] = url;
            productImageCache.set(pid, url);
          } else {
            uncached.push(pid);
          }
        }
      }

      if (uncached.length > 0) {
        const creds = await getStoreCredentials(storeId);
        if (creds) {
          for (const pid of uncached) {
            try {
              const product = await fetchProduct(creds, pid) as Record<string, unknown> | null;
              if (product) {
                const images = (product.images as { url: string }[]) ?? [];
                const url = images[0]?.url ?? null;
                thumbs[pid] = url;
                productImageCache.set(pid, url);
              } else {
                thumbs[pid] = null;
                productImageCache.set(pid, null);
              }
            } catch {
              thumbs[pid] = null;
              productImageCache.set(pid, null);
            }
            await new Promise(r => setTimeout(r, 350));
          }
        }
      }

      return res.json({ thumbs });
    } catch (e: any) {
      console.error("[product-thumbs]", e.message);
      return res.json({ thumbs: {} });
    }
  });

  app.get("/api/faire/retailers", async (_req, res) => {
    try {
      const retailers = await getAllRetailers();
      return res.json({ retailers });
    } catch {
      return res.status(500).json({ error: "Failed to fetch retailers" });
    }
  });

  app.get("/api/faire/retailers/:retailerId", async (req, res) => {
    const { retailerId } = req.params;
    try {
      const retailer = await getRetailer(retailerId);
      if (!retailer) return res.status(404).json({ error: "Retailer not found" });
      return res.json(retailer);
    } catch {
      return res.status(500).json({ error: "Failed to fetch retailer" });
    }
  });

  app.post("/api/faire/stores/:storeId/sync", async (req, res) => {
    const { storeId } = req.params;

    const creds = await getStoreCredentials(storeId);
    if (!creds) {
      return res.status(404).json({ success: false, error: "Store not found or inactive" });
    }

    try {
      let profileSynced = false;
      try {
        const profile = await fetchBrandProfile(creds);
        await updateStoreProfile(storeId, profile);
        profileSynced = true;
      } catch (err) {
        console.error(`[sync] brand profile error for ${storeId}:`, err);
      }

      const orders = await fetchAllOrders(creds);
      const ordersSynced = await syncOrders(storeId, orders);

      const products = await fetchAllProducts(creds);
      const productsSynced = await syncProducts(storeId, products);
      productCache.data = null;
      storeSummaryCache.data = null;

      const allStoreOrders = await getStoreOrders(storeId, { limit: 5000 });
      const retailersSynced = await extractAndUpsertRetailersFromOrders(allStoreOrders);

      return res.json({
        success: true,
        orders_synced: ordersSynced,
        products_synced: productsSynced,
        retailers_synced: retailersSynced,
        profile_synced: profileSynced,
      });
    } catch (err) {
      console.error(`[sync] error for store ${storeId}:`, err);
      return res.status(502).json({ success: false, error: "Sync failed — check server logs" });
    }
  });

  app.post("/api/faire/stores/:storeId/sync-retailers", async (req, res) => {
    const { storeId } = req.params;
    try {
      const orders = await getStoreOrders(storeId, { limit: 5000 });
      const synced = await extractAndUpsertRetailersFromOrders(orders);
      return res.json({ success: true, retailers_synced: synced, total_unique: synced });
    } catch (err) {
      console.error(`[sync-retailers] error:`, err);
      return res.status(502).json({ success: false, error: "Retailer sync failed" });
    }
  });

  app.post("/api/faire/populate-retailers", async (_req, res) => {
    try {
      const allOrders = await getAllOrders();
      const synced = await extractAndUpsertRetailersFromOrders(allOrders);
      return res.json({ success: true, retailers_synced: synced });
    } catch (err) {
      console.error(`[populate-retailers] error:`, err);
      return res.status(502).json({ success: false, error: "Populate retailers failed" });
    }
  });

  app.get("/api/faire/stores/:storeId/orders", async (req, res) => {
    const { storeId } = req.params;
    const state = req.query.state as string | undefined;
    const limit = parseInt(req.query.limit as string) || 200;
    const offset = parseInt(req.query.offset as string) || 0;
    try {
      const orders = await getStoreOrders(storeId, {
        state: state && state !== "all" ? state : undefined,
        limit,
        offset,
      });
      return res.json({ orders, store_id: storeId });
    } catch {
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/faire/stores/:storeId/products", async (req, res) => {
    const { storeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 200;
    const offset = parseInt(req.query.offset as string) || 0;
    try {
      const products = await getStoreProducts(storeId, { limit, offset });
      return res.json({ products, store_id: storeId });
    } catch {
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/faire/stores/:storeId/counts", async (req, res) => {
    const { storeId } = req.params;
    try {
      const counts = await getStoreCounts(storeId);
      return res.json(counts);
    } catch {
      return res.status(500).json({ error: "Failed to fetch counts" });
    }
  });

  app.post("/api/faire/orders/:orderId/accept", async (req, res) => {
    const { orderId } = req.params;
    const { storeId } = req.body as { storeId?: string };
    if (!storeId) {
      return res.json({ success: true, state: "PROCESSING", mock: true,
        message: "Order accepted (mock mode — no store selected)" });
    }
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });
    try {
      const result = await faireRequest("POST", `/orders/${orderId}/processing`,
        creds.oauth_access_token, creds.app_credentials);
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        return res.json({ success: true, state: d?.state ?? "PROCESSING", mock: false });
      }
      const d = result.data as Record<string, unknown> | null;
      return res.status(result.status).json({
        success: false, error: d?.message ?? `Faire API returned ${result.status}`, mock: false,
      });
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  app.post("/api/faire/orders/:orderId/shipments", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, carrier, tracking_code, maker_cost_cents, shipping_type } =
      req.body as { storeId?: string; carrier?: string; tracking_code?: string; maker_cost_cents?: number; shipping_type?: string };
    if (!storeId) {
      return res.json({
        success: true,
        shipment: { id: `s_mock_${Date.now()}`, order_id: orderId, carrier: carrier ?? "UPS",
          tracking_code: tracking_code ?? "MOCK_TRACKING", maker_cost_cents: maker_cost_cents ?? 0,
          shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN", created_at: new Date().toISOString() },
        mock: true,
      });
    }
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });
    try {
      const result = await faireRequest("POST", `/orders/${orderId}/shipments`,
        creds.oauth_access_token, creds.app_credentials,
        { shipments: [{ carrier: carrier ?? "UPS", tracking_code, maker_cost_cents: maker_cost_cents ?? 0, shipping_type: shipping_type ?? "SHIP_ON_YOUR_OWN" }] });
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        const shipments = (d?.shipments as unknown[]) ?? [];
        return res.json({ success: true, shipment: shipments[0] ?? null, mock: false });
      }
      const d = result.data as Record<string, unknown> | null;
      return res.status(result.status).json({
        success: false, error: d?.message ?? `Faire API returned ${result.status}`, mock: false,
      });
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  app.post("/api/faire/orders/:orderId/cancel", async (req, res) => {
    const { orderId } = req.params;
    const { storeId, reason } = req.body as { storeId?: string; reason?: string };
    if (!storeId) {
      return res.json({ success: true, state: "CANCELED", mock: true,
        message: "Order canceled (mock mode — no store selected)" });
    }
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });
    try {
      const result = await faireRequest("POST", `/orders/${orderId}/cancel`,
        creds.oauth_access_token, creds.app_credentials, { reason });
      if (result.ok) {
        const d = result.data as Record<string, unknown> | null;
        return res.json({ success: true, state: d?.state ?? "CANCELED", mock: false });
      }
      const d = result.data as Record<string, unknown> | null;
      return res.status(result.status).json({
        success: false, error: d?.message ?? `Faire API returned ${result.status}`, mock: false,
      });
    } catch {
      return res.status(502).json({ success: false, error: "Failed to reach Faire API", mock: false });
    }
  });

  app.get("/api/faire/vendors", async (_req, res) => {
    try {
      const vendors = await listVendors();
      return res.json({ vendors });
    } catch { return res.status(500).json({ error: "Failed to fetch vendors" }); }
  });

  app.post("/api/faire/vendors", async (req, res) => {
    try {
      const v = req.body as { id?: string; name: string; contact_name: string; email: string; whatsapp: string; is_default: boolean; notes: string };
      const result = await upsertVendor(v);
      if (!result) return res.status(500).json({ error: "Failed to save vendor" });
      return res.json({ vendor: result });
    } catch { return res.status(500).json({ error: "Failed to save vendor" }); }
  });

  app.delete("/api/faire/vendors/:id", async (req, res) => {
    try {
      await deleteVendor(req.params.id);
      return res.json({ success: true });
    } catch { return res.status(500).json({ error: "Failed to delete vendor" }); }
  });

  app.get("/api/faire/products/:productId/vendors", async (req, res) => {
    try {
      const vendors = await getProductVendors(req.params.productId);
      return res.json({ vendors });
    } catch { return res.status(500).json({ error: "Failed to fetch product vendors" }); }
  });

  app.post("/api/faire/products/:productId/vendors", async (req, res) => {
    try {
      const { vendor_id, is_exclusive } = req.body as { vendor_id: string; is_exclusive?: boolean };
      await setProductVendor(req.params.productId, vendor_id, is_exclusive ?? false);
      return res.json({ success: true });
    } catch { return res.status(500).json({ error: "Failed to set product vendor" }); }
  });

  app.delete("/api/faire/products/:productId/vendors/:vendorId", async (req, res) => {
    try {
      await removeProductVendor(req.params.productId, req.params.vendorId);
      return res.json({ success: true });
    } catch { return res.status(500).json({ error: "Failed to remove product vendor" }); }
  });

  app.get("/api/faire/transactions/:id/attachments", async (req, res) => {
    try {
      const attachments = await getTransactionAttachments(req.params.id);
      const withUrls = await Promise.all(attachments.map(async a => ({
        ...a,
        url: await getTransactionProofUrl(a.storage_path),
      })));
      return res.json({ attachments: withUrls });
    } catch { return res.status(500).json({ error: "Failed to fetch attachments" }); }
  });

  app.post("/api/faire/transactions/:id/attachments", async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      req.on("data", chunk => chunks.push(chunk));
      req.on("end", async () => {
        const body = Buffer.concat(chunks);
        const fileName = (req.headers["x-file-name"] as string) ?? "file";
        const mimeType = (req.headers["content-type"] as string) ?? "application/octet-stream";
        const storagePath = await uploadTransactionProof(req.params.id, body, fileName, mimeType);
        if (!storagePath) return res.status(500).json({ error: "Upload failed" });
        const attachment = await addTransactionAttachment({
          transaction_id: req.params.id,
          file_name: fileName,
          storage_path: storagePath,
          file_size_bytes: body.length,
          mime_type: mimeType,
        });
        if (!attachment) return res.status(500).json({ error: "Failed to record attachment" });
        const url = await getTransactionProofUrl(storagePath);
        return res.json({ attachment: { ...attachment, url } });
      });
    } catch { return res.status(500).json({ error: "Failed to upload attachment" }); }
  });

  app.post("/api/faire/stores/:storeId/set-inventory", async (req, res) => {
    const { storeId } = req.params;
    const { quantity } = req.body as { quantity?: number };
    const targetQty = quantity ?? 10000;
    const creds = await getStoreCredentials(storeId);
    if (!creds) return res.status(404).json({ success: false, error: "Store not found or inactive" });

    try {
      const products = await getStoreProducts(storeId);
      let updated = 0;
      let failed = 0;
      for (const rawProduct of products) {
        const product = rawProduct as { id: string; variants?: { id: string; available_quantity?: number }[] };
        for (const variant of product.variants ?? []) {
          if (variant.available_quantity === targetQty) continue;
          const result = await updateVariantInventory(
            { oauth_access_token: creds.oauth_access_token, app_credentials: creds.app_credentials },
            product.id,
            variant.id,
            targetQty
          );
          if (result.ok) {
            updated++;
          } else {
            failed++;
            console.error(`[faire] Failed to update inventory for ${product.id}/${variant.id}: ${result.status}`);
          }
        }
      }
      return res.json({ success: true, updated, failed, target_quantity: targetQty });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return res.status(500).json({ success: false, error: msg });
    }
  });

  app.get("/api/faire/applications", async (_req, res) => {
    const apps = await listSellerApplications();
    return res.json({ applications: apps });
  });

  app.get("/api/faire/applications/:id", async (req, res) => {
    const application = await getSellerApplication(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });
    return res.json({ application });
  });

  app.post("/api/faire/applications", async (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (!body.brand_name) return res.status(400).json({ error: "brand_name is required" });
    const result = await upsertSellerApplication({ id: null, brand_name: String(body.brand_name), ...body as any });
    if (!result) return res.status(500).json({ error: "Failed to create application" });
    return res.status(201).json({ application: result });
  });

  app.patch("/api/faire/applications/:id", async (req, res) => {
    const body = req.body as Record<string, unknown>;
    if (!body.brand_name) return res.status(400).json({ error: "brand_name is required" });
    const result = await upsertSellerApplication({ id: req.params.id, brand_name: String(body.brand_name), ...body as any });
    if (!result) return res.status(500).json({ error: "Failed to update application" });
    return res.json({ application: result });
  });

  app.delete("/api/faire/applications/:id", async (req, res) => {
    await deleteSellerApplication(req.params.id);
    return res.json({ success: true });
  });

  app.post("/api/faire/applications/:id/followups", async (req, res) => {
    const body = req.body as { followup_date?: string; followup_type?: string; note?: string };
    if (!body.followup_date || !body.followup_type) return res.status(400).json({ error: "followup_date and followup_type are required" });
    const result = await addApplicationFollowup({
      application_id: req.params.id,
      followup_date: body.followup_date,
      followup_type: body.followup_type,
      note: body.note ?? null,
    });
    if (!result) return res.status(500).json({ error: "Failed to add followup" });
    return res.status(201).json({ followup: result });
  });

  app.delete("/api/faire/applications/:id/followups/:fid", async (req, res) => {
    await deleteApplicationFollowup(req.params.fid);
    return res.json({ success: true });
  });

  app.post("/api/faire/applications/:id/links", async (req, res) => {
    const body = req.body as { label?: string; url?: string; link_type?: string };
    if (!body.label || !body.url) return res.status(400).json({ error: "label and url are required" });
    const result = await upsertApplicationLink({
      id: null,
      application_id: req.params.id,
      label: body.label,
      url: body.url,
      link_type: body.link_type ?? "other",
    });
    if (!result) return res.status(500).json({ error: "Failed to add link" });
    return res.status(201).json({ link: result });
  });

  app.delete("/api/faire/applications/:id/links/:lid", async (req, res) => {
    await deleteApplicationLink(req.params.lid);
    return res.json({ success: true });
  });

  app.get("/api/faire/retailers/:retailerId/enrichment", async (req, res) => {
    const { retailerId } = req.params;
    try {
      const enrichment = await getRetailerEnrichment(retailerId);
      return res.json({ enrichment });
    } catch {
      return res.status(500).json({ error: "Failed to fetch enrichment" });
    }
  });

  app.post("/api/faire/retailers/:retailerId/enrichment", async (req, res) => {
    const { retailerId } = req.params;
    const body = req.body as {
      contact_name?: string;
      contact_email?: string;
      contact_phone?: string;
      store_address?: string;
      business_type?: string;
      store_type?: string;
      website?: string;
      instagram?: string;
      notes?: string;
      enriched_by?: string;
    };
    try {
      const enrichment = await upsertRetailerEnrichment({ retailer_id: retailerId, ...body });
      if (!enrichment) return res.status(500).json({ error: "Failed to save enrichment" });
      return res.json({ enrichment });
    } catch {
      return res.status(500).json({ error: "Failed to save enrichment" });
    }
  });

  // ── Bank Transactions ─────────────────────────────────────────────────────────

  app.get("/api/bank-transactions", async (req, res) => {
    try {
      const { source, entity, type, search, page, limit, is_business } = req.query as Record<string, string>;
      const result = await getBankTransactions({
        source: source || undefined,
        entity: entity || undefined,
        type: type || undefined,
        search: search || undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        is_business: is_business !== undefined ? is_business === "true" : undefined,
      });
      return res.json(result);
    } catch {
      return res.status(500).json({ error: "Failed to fetch bank transactions" });
    }
  });

  app.post("/api/bank-transactions", async (req, res) => {
    try {
      const tx = req.body;
      const result = await addBankTransaction(tx);
      if (!result) return res.status(500).json({ error: "Failed to add transaction" });
      return res.json({ transaction: result });
    } catch {
      return res.status(500).json({ error: "Failed to add transaction" });
    }
  });

  app.patch("/api/bank-transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body as {
        is_business?: boolean;
        category?: string;
        notes?: string;
        reconciled?: boolean;
        tags?: string[];
        faire_order_id?: string | null;
      };
      const result = await updateBankTransaction(id, patch);
      if (!result) return res.status(500).json({ error: "Failed to update transaction" });
      return res.json({ transaction: result });
    } catch {
      return res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  // ── Ledger Parties ────────────────────────────────────────────────────────────

  app.get("/api/ledger-parties", async (_req, res) => {
    try {
      const parties = await listLedgerParties();
      return res.json({ parties });
    } catch {
      return res.status(500).json({ error: "Failed to fetch ledger parties" });
    }
  });

  app.get("/api/ledger-parties/:id", async (req, res) => {
    try {
      const party = await getLedgerParty(req.params.id);
      if (!party) return res.status(404).json({ error: "Party not found" });
      return res.json({ party });
    } catch {
      return res.status(500).json({ error: "Failed to fetch party" });
    }
  });

  app.post("/api/ledger-parties", async (req, res) => {
    try {
      const result = await upsertLedgerParty(req.body);
      if (!result) return res.status(500).json({ error: "Failed to save party" });
      return res.json({ party: result });
    } catch {
      return res.status(500).json({ error: "Failed to save party" });
    }
  });

  app.patch("/api/ledger-parties/:id", async (req, res) => {
    try {
      const result = await upsertLedgerParty({ ...req.body, id: req.params.id });
      if (!result) return res.status(500).json({ error: "Failed to update party" });
      return res.json({ party: result });
    } catch {
      return res.status(500).json({ error: "Failed to update party" });
    }
  });

  app.get("/api/ledger-parties/:id/transactions", async (req, res) => {
    try {
      const txns = await getLedgerPartyTransactions(req.params.id);
      return res.json({ transactions: txns });
    } catch {
      return res.status(500).json({ error: "Failed to fetch party transactions" });
    }
  });

  app.post("/api/ledger-parties/:id/transactions", async (req, res) => {
    try {
      const result = await addLedgerPartyTransaction({ ...req.body, party_id: req.params.id });
      if (!result) return res.status(500).json({ error: "Failed to add transaction" });
      return res.json({ transaction: result });
    } catch {
      return res.status(500).json({ error: "Failed to add transaction" });
    }
  });

  app.patch("/api/ledger-party-transactions/:id", async (req, res) => {
    try {
      const result = await updateLedgerPartyTransaction(req.params.id, req.body);
      if (!result) return res.status(500).json({ error: "Failed to update transaction" });
      return res.json({ transaction: result });
    } catch {
      return res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.get("/api/ledger-parties/:id/balance", async (req, res) => {
    try {
      const balance = await getPartyBalance(req.params.id);
      return res.json({ balance });
    } catch {
      return res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  // ── Task Activity (comments, attachments, links) ──────────────────────────────

  app.get("/api/tasks/:taskId/activity", async (req, res) => {
    try {
      const items = await getTaskActivity(req.params.taskId);
      return res.json({ items });
    } catch {
      return res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  app.post("/api/tasks/:taskId/comments", async (req, res) => {
    try {
      const { content, author = "You" } = req.body as { content: string; author?: string };
      if (!content?.trim()) return res.status(400).json({ error: "content is required" });
      const item = await addTaskComment(req.params.taskId, content.trim(), author);
      if (!item) return res.status(500).json({ error: "Failed to add comment" });
      return res.json({ item });
    } catch {
      return res.status(500).json({ error: "Failed to add comment" });
    }
  });

  app.post("/api/tasks/:taskId/links", async (req, res) => {
    try {
      const { url, title = "", author = "You" } = req.body as { url: string; title?: string; author?: string };
      if (!url?.trim()) return res.status(400).json({ error: "url is required" });
      const item = await addTaskLink(req.params.taskId, url.trim(), title.trim(), author);
      if (!item) return res.status(500).json({ error: "Failed to add link" });
      return res.json({ item });
    } catch {
      return res.status(500).json({ error: "Failed to add link" });
    }
  });

  app.post("/api/tasks/:taskId/attachments", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "file is required" });
      const author = (req.body?.author as string) || "You";
      const item = await uploadTaskFile(
        req.params.taskId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        author
      );
      if (!item) return res.status(500).json({ error: "Failed to upload attachment" });
      return res.json({ item });
    } catch {
      return res.status(500).json({ error: "Failed to upload attachment" });
    }
  });

  app.delete("/api/tasks/:taskId/activity/:id", async (req, res) => {
    try {
      const ok = await deleteTaskActivity(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to delete activity" });
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Failed to delete activity" });
    }
  });
}
