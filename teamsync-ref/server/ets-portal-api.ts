import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const etsSupabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
      db: { schema: "easytosell" },
    })
  : null as any;

export const etsPortalRouter = Router();

function mapClient(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    city: row.city,
    state: row.state,
    phone: row.phone,
    stage: row.stage,
    storeSize: row.store_size,
    storeAddress: row.store_address,
    storeArea: row.store_area,
    storeFrontage: row.store_frontage,
    storeName: row.store_name,
    storeType: row.store_type,
    storeFloor: row.store_floor,
    nearbyLandmark: row.nearby_landmark,
    monthlyRent: row.monthly_rent != null ? parseFloat(row.monthly_rent) : null,
    expectedFootfall: row.expected_footfall,
    operatingHours: row.operating_hours,
    marketType: row.market_type,
    packageTier: row.package_tier,
    daysInStage: row.days_in_stage,
    lastNote: row.last_note,
    totalPaid: parseFloat(row.total_paid) || 0,
    pendingDues: parseFloat(row.pending_dues) || 0,
    totalInvestment: parseFloat(row.total_investment) || 0,
    inventoryBudget: parseFloat(row.inventory_budget) || 0,
    score: row.score,
    leadSource: row.lead_source,
    assignedTo: row.assigned_to,
    nextAction: row.next_action,
    nextActionDate: row.next_action_date,
    createdDate: row.created_at ? row.created_at.split("T")[0] : "",
    managerName: row.manager_name,
    managerPhone: row.manager_phone,
    gstNumber: row.gst_number,
    panNumber: row.pan_number,
    bankName: row.bank_name,
    bankAccountNumber: row.bank_account_number,
    bankIfsc: row.bank_ifsc,
    estimatedLaunchDate: row.estimated_launch_date,
    qualificationFormCompleted: row.qualification_form_completed,
    agreementSigned: row.agreement_signed,
    scopeDocShared: row.scope_doc_shared,
    profileCompleted: row.profile_completed,
    onboardingStep: row.onboarding_step,
  };
}

function mapOrder(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    status: row.status,
    etaDays: row.eta_days,
    valueInr: parseFloat(row.value_inr) || 0,
    itemCount: row.item_count,
    createdDate: row.created_at ? row.created_at.split("T")[0] : "",
    documents: row.documents || [],
    isFlagged: row.is_flagged,
  };
}

function mapPayment(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    amount: parseFloat(row.amount) || 0,
    type: row.type,
    status: row.status,
    date: row.date,
    notes: row.notes,
    description: row.description,
    method: row.method,
  };
}

function mapChecklist(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    itemId: row.item_id,
    clientId: row.client_id,
    completed: row.completed,
    label: row.ets_checklist_items?.label || "",
    sortOrder: row.ets_checklist_items?.sort_order || 0,
  };
}

function mapMessage(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    sender: row.sender,
    senderName: row.sender_name,
    content: row.content,
    read: row.read,
    createdAt: row.created_at,
  };
}

function mapProduct(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    categoryId: row.category_id,
    categoryName: row.ets_categories?.name || row.category_name || "",
    category: row.category,
    tags: row.tags || [],
    exwPriceYuan: parseFloat(row.exw_price_yuan) || 0,
    unitsPerCarton: row.units_per_carton || 1,
    cartonLength: parseFloat(row.carton_length_cm) || 0,
    cartonWidth: parseFloat(row.carton_width_cm) || 0,
    cartonHeight: parseFloat(row.carton_height_cm) || 0,
    cartonWeightKg: parseFloat(row.carton_weight_kg) || 0,
    moq: row.moq,
    supplierName: row.supplier_name,
    hsCode: row.hs_code,
    dutyPercent: parseFloat(row.duty_percent) || 0,
    igstPercent: parseFloat(row.igst_percent) || 0,
    isVisible: row.is_visible !== false,
    isHeroSku: row.is_hero_sku === true,
    marginTier: row.margin_tier || "standard",
    costPrice: parseFloat(row.cost_price) || 0,
    mrp: parseFloat(row.mrp) || 0,
    status: row.status || "Active",
    fobPriceYuan: parseFloat(row.fob_price_yuan) || 0,
    fobPriceInr: parseFloat(row.fob_price_inr) || 0,
    cbmPerUnit: parseFloat(row.cbm_per_unit) || 0,
    freightPerUnit: parseFloat(row.freight_per_unit) || 0,
    cifPriceInr: parseFloat(row.cif_price_inr) || 0,
    customsDuty: parseFloat(row.customs_duty) || 0,
    swSurcharge: parseFloat(row.sw_surcharge) || 0,
    igst: parseFloat(row.igst) || 0,
    totalLandedCost: parseFloat(row.total_landed_cost) || 0,
    storeLandingPrice: parseFloat(row.store_landing_price) || 0,
    suggestedMrp: parseFloat(row.suggested_mrp) || 0,
    storeMarginPercent: parseFloat(row.store_margin_percent) || 0,
    storeMarginRs: parseFloat(row.store_margin_rs) || 0,
  };
}

function mapCategory(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    dutyPercent: parseFloat(row.duty_percent) || 0,
    igstPercent: parseFloat(row.igst_percent) || 0,
    productCount: row.product_count || 0,
  };
}

function mapKitItem(row: any): any {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    productId: row.product_id,
    quantity: row.quantity || 1,
    productName: row.ets_products?.name || "",
    categoryName: row.ets_products?.ets_categories?.name || "",
    landedCost: parseFloat(row.ets_products?.landed_cost) || 0,
    mrp: parseFloat(row.ets_products?.mrp) || 0,
    unitsPerCarton: row.ets_products?.units_per_carton || 1,
  };
}

etsPortalRouter.get("/client/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Client not found" });
    res.json({ client: mapClient(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.patch("/client/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields: Record<string, string> = {
      name: "name",
      email: "email",
      phone: "phone",
      city: "city",
      state: "state",
      storeAddress: "store_address",
      storeArea: "store_area",
      storeFrontage: "store_frontage",
      managerName: "manager_name",
      managerPhone: "manager_phone",
      gstNumber: "gst_number",
      panNumber: "pan_number",
      bankName: "bank_name",
      bankAccountNumber: "bank_account_number",
      bankIfsc: "bank_ifsc",
      storeName: "store_name",
      storeType: "store_type",
      storeFloor: "store_floor",
      nearbyLandmark: "nearby_landmark",
      monthlyRent: "monthly_rent",
      expectedFootfall: "expected_footfall",
      operatingHours: "operating_hours",
      marketType: "market_type",
      profileCompleted: "profile_completed",
      onboardingStep: "onboarding_step",
      inventoryBudget: "inventory_budget",
    };

    const updateData: Record<string, any> = {};
    for (const [camelKey, snakeKey] of Object.entries(allowedFields)) {
      if (req.body[camelKey] !== undefined) {
        updateData[snakeKey] = req.body[camelKey];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    const { data, error } = await etsSupabase
      .from("ets_clients")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ client: mapClient(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/orders", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_orders")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ orders: (data || []).map(mapOrder) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/payments", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_payments")
      .select("*")
      .eq("client_id", id)
      .order("date", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ payments: (data || []).map(mapPayment) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/checklist", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_checklist_status")
      .select("*, ets_checklist_items(label, sort_order)")
      .eq("client_id", id)
      .order("item_id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ checklist: (data || []).map(mapChecklist) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.patch("/client/:clientId/checklist/:statusId", async (req, res) => {
  try {
    const { statusId } = req.params;
    const { completed } = req.body;
    const { data, error } = await etsSupabase
      .from("ets_checklist_status")
      .update({ completed })
      .eq("id", statusId)
      .select("*, ets_checklist_items(label, sort_order)")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ item: mapChecklist(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("client_messages")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ messages: (data || []).map(mapMessage) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.post("/client/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, senderName } = req.body;
    const { data, error } = await etsSupabase
      .from("client_messages")
      .insert({
        client_id: parseInt(id),
        sender: "client",
        sender_name: senderName || "Client",
        content,
        read: false,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: mapMessage(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.post("/client/:id/messages/mark-read", async (req, res) => {
  try {
    const { id } = req.params;
    await etsSupabase
      .from("client_messages")
      .update({ read: true })
      .eq("client_id", id)
      .eq("sender", "team")
      .eq("read", false);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/proposal", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: client } = await etsSupabase
      .from("ets_clients")
      .select("package_tier")
      .eq("id", id)
      .single();
    if (!client) return res.status(404).json({ error: "Client not found" });

    const { data: template } = await etsSupabase
      .from("ets_proposal_templates")
      .select("*")
      .eq("package_tier", client.package_tier)
      .single();
    res.json({ template: template || null });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/products", async (_req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_products")
      .select("*, ets_categories(name)")
      .order("name", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ products: (data || []).map(mapProduct) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/categories", async (_req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ categories: (data || []).map(mapCategory) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.get("/client/:id/kit-items", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await etsSupabase
      .from("ets_kit_items")
      .select("*, ets_products(name, landed_cost, mrp, units_per_carton, ets_categories(name))")
      .eq("client_id", id)
      .order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ kitItems: (data || []).map(mapKitItem) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.post("/client/:id/kit-items", async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    const { data: existing } = await etsSupabase
      .from("ets_kit_items")
      .select("id, quantity")
      .eq("client_id", id)
      .eq("product_id", productId)
      .maybeSingle();

    let data, error;
    if (existing) {
      ({ data, error } = await etsSupabase
        .from("ets_kit_items")
        .update({ quantity: (existing.quantity || 0) + (quantity || 1) })
        .eq("id", existing.id)
        .select("*, ets_products(name, landed_cost, mrp, units_per_carton, ets_categories(name))")
        .single());
    } else {
      ({ data, error } = await etsSupabase
        .from("ets_kit_items")
        .insert({
          client_id: parseInt(id),
          product_id: productId,
          quantity: quantity || 1,
        })
        .select("*, ets_products(name, landed_cost, mrp, units_per_carton, ets_categories(name))")
        .single());
    }
    if (error) return res.status(500).json({ error: error.message });
    res.json({ kitItem: mapKitItem(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.patch("/client/:id/kit-items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (quantity <= 0) {
      const { error } = await etsSupabase
        .from("ets_kit_items")
        .delete()
        .eq("id", itemId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ deleted: true });
    }
    const { data, error } = await etsSupabase
      .from("ets_kit_items")
      .update({ quantity })
      .eq("id", itemId)
      .select("*, ets_products(name, landed_cost, mrp, units_per_carton, ets_categories(name))")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ kitItem: mapKitItem(data) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

etsPortalRouter.delete("/client/:id/kit-items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { error } = await etsSupabase
      .from("ets_kit_items")
      .delete()
      .eq("id", itemId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
