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

export const etsRouter = Router();

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
    storeArea: row.store_area,
    storeFrontage: row.store_frontage,
    storeAddress: row.store_address,
    storeName: row.store_name,
    storeType: row.store_type,
    storeFloor: row.store_floor,
    nearbyLandmark: row.nearby_landmark,
    monthlyRent: row.monthly_rent != null ? parseFloat(row.monthly_rent) : null,
    expectedFootfall: row.expected_footfall,
    marketType: row.market_type,
    packageTier: row.package_tier,
    selectedPackage: row.selected_package,
    daysInStage: row.days_in_stage,
    lastNote: row.last_note,
    notes: row.notes,
    totalPaid: parseFloat(row.total_paid) || 0,
    pendingDues: parseFloat(row.pending_dues) || 0,
    totalInvestment: parseFloat(row.total_investment) || 0,
    inventoryBudget: parseFloat(row.inventory_budget) || 0,
    score: row.total_score || row.score || 0,
    leadSource: row.lead_source,
    assignedTo: row.assigned_to,
    nextAction: row.next_action,
    nextActionDate: row.next_action_date,
    managerName: row.manager_name,
    managerPhone: row.manager_phone,
    gstNumber: row.gst_number,
    panNumber: row.pan_number,
    bankName: row.bank_name,
    bankAccountNumber: row.bank_account_number,
    bankIfsc: row.bank_ifsc,
    totalScore: row.total_score || 0,
    scoreBudget: row.score_budget || 0,
    scoreLocation: row.score_location || 0,
    scoreOperator: row.score_operator || 0,
    scoreTimeline: row.score_timeline || 0,
    scoreExperience: row.score_experience || 0,
    scoreEngagement: row.score_engagement || 0,
    launchPhase: row.launch_phase,
    estimatedLaunchDate: row.estimated_launch_date,
    actualLaunchDate: row.actual_launch_date,
    qualificationFormCompleted: row.qualification_form_completed,
    scopeDocShared: row.scope_doc_shared,
    agreementSigned: row.agreement_signed,
    operatingHours: row.operating_hours,
    profileCompleted: row.profile_completed,
    onboardingStep: row.onboarding_step,
    createdDate: row.created_at ? row.created_at.split("T")[0] : "",
  };
}

function mapProduct(row: any): any {
  if (!row) return row;
  const cat = row.ets_categories;
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    categoryId: row.category_id,
    tags: row.tags || [],
    exwPriceYuan: parseFloat(row.exw_price_yuan) || 0,
    unitsPerCarton: row.units_per_carton,
    cartonLength: parseFloat(row.carton_length_cm) || 0,
    cartonWidth: parseFloat(row.carton_width_cm) || 0,
    cartonHeight: parseFloat(row.carton_height_cm) || 0,
    cartonWeightKg: parseFloat(row.carton_weight_kg) || 0,
    moq: row.moq,
    supplierName: row.supplier_name,
    hsCode: row.hs_code,
    dutyPercent: cat ? parseFloat(cat.customs_duty_percent) || 0 : 0,
    igstPercent: cat ? parseFloat(cat.igst_percent) || 0 : 0,
    isVisible: row.is_visible,
    isHeroSku: row.is_hero_sku,
    marginTier: row.margin_tier,
    category: cat ? cat.slug : row.category_id,
    categoryName: cat ? cat.name : "",
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

function mapOrder(row: any): any {
  if (!row) return row;
  return {
    ...row,
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    etaDays: row.eta_days,
    valueInr: parseFloat(row.value_inr) || 0,
    itemCount: row.item_count,
    createdDate: row.created_at ? row.created_at.split("T")[0] : "",
    isFlagged: row.is_flagged,
  };
}

function mapPayment(row: any): any {
  if (!row) return row;
  return {
    ...row,
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    amount: parseFloat(row.amount) || 0,
  };
}

function mapProposalTemplate(row: any): any {
  if (!row) return row;
  return {
    ...row,
    id: row.id,
    packageTier: row.package_tier,
    storeSize: row.store_size,
    totalInvestment: parseFloat(row.total_investment) || 0,
    skuCount: row.sku_count,
    categoryMix: row.category_mix,
    investmentBreakdown: row.investment_breakdown,
    paymentSchedule: row.payment_schedule,
  };
}

function mapWhatsAppTemplate(row: any): any {
  if (!row) return row;
  return {
    ...row,
    id: row.id,
    sortOrder: row.sort_order,
  };
}

function mapChecklist(row: any): any {
  if (!row) return row;
  const item = row.ets_checklist_items;
  return {
    id: row.id,
    itemId: row.item_id,
    clientId: row.client_id,
    completed: row.completed,
    label: item ? item.label : "",
    sortOrder: item ? item.sort_order : 0,
  };
}

etsRouter.get("/stats", async (_req, res) => {
  try {
    const [clientsRes, ordersRes, paymentsRes] = await Promise.all([
      etsSupabase.from("ets_clients").select("id, stage, package_tier, total_paid, pending_dues, score"),
      etsSupabase.from("ets_orders").select("id, status, value_inr, is_flagged"),
      etsSupabase.from("ets_payments").select("id, status, amount, type"),
    ]);

    if (clientsRes.error) throw clientsRes.error;
    if (ordersRes.error) throw ordersRes.error;
    if (paymentsRes.error) throw paymentsRes.error;

    const clients = clientsRes.data || [];
    const orders = ordersRes.data || [];
    const payments = paymentsRes.data || [];

    const stageCounts: Record<string, number> = {};
    clients.forEach((c: any) => {
      stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
    });

    const totalClients = clients.length;
    const qualifiedClients = clients.filter((c: any) => c.stage !== "new-lead").length;
    const tokenPaidClients = clients.filter((c: any) =>
      ["token-paid", "store-design", "inventory-ordered", "in-transit", "launched", "reordering"].includes(c.stage)
    ).length;
    const launchedClients = clients.filter((c: any) =>
      ["launched", "reordering"].includes(c.stage)
    ).length;

    const totalTokensCollected = payments
      .filter((p: any) => p.type === "token" && p.status === "received")
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    const pendingInvoices = payments
      .filter((p: any) => p.status === "pending" || p.status === "overdue")
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    const estimatedPipelineValue = clients.reduce(
      (sum: number, c: any) => sum + parseFloat(c.total_paid) + parseFloat(c.pending_dues), 0
    );

    const alerts: any[] = [];
    const overduePayments = payments.filter((p: any) => p.status === "overdue");
    overduePayments.forEach((p: any) => {
      alerts.push({ id: `alert-pay-${p.id}`, type: "payment", title: "Overdue Payment", detail: `₹${parseFloat(p.amount).toLocaleString()} overdue`, severity: "high" });
    });
    const flaggedOrders = orders.filter((o: any) => o.is_flagged);
    flaggedOrders.forEach((o: any) => {
      alerts.push({ id: `alert-ord-${o.id}`, type: "order", title: "Flagged Order", detail: `Order #${o.id} flagged`, severity: "medium" });
    });

    res.json({
      totalClients,
      qualifiedClients,
      tokenPaidClients,
      launchedClients,
      totalTokensCollected,
      pendingInvoices,
      estimatedPipelineValue,
      stageCounts,
      alerts,
    });
  } catch (err: any) {
    console.error("[ets] GET /stats error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/clients", async (req, res) => {
  try {
    const { search, stage, tier, sort, limit = "500" } = req.query;

    let query = etsSupabase
      .from("ets_clients")
      .select("*", { count: "exact" });

    if (search) {
      const s = `%${search}%`;
      query = query.or(`name.ilike.${s},city.ilike.${s},phone.ilike.${s}`);
    }
    if (stage) query = query.eq("stage", stage);
    if (tier) query = query.eq("package_tier", tier);

    if (sort === "score") {
      query = query.order("score", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.limit(parseInt(limit as string));

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ clients: (data || []).map(mapClient), total: count });
  } catch (err: any) {
    console.error("[ets] GET /clients error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [clientRes, paymentsRes, checklistRes] = await Promise.all([
      etsSupabase.from("ets_clients").select("*").eq("id", id).single(),
      etsSupabase.from("ets_payments").select("*").eq("client_id", id).order("date", { ascending: false }),
      etsSupabase.from("ets_checklist_status").select("*, ets_checklist_items(label, sort_order)").eq("client_id", id).order("item_id"),
    ]);

    if (clientRes.error) throw clientRes.error;

    res.json({
      client: mapClient(clientRes.data),
      payments: (paymentsRes.data || []).map(mapPayment),
      checklist: (checklistRes.data || []).map(mapChecklist),
    });
  } catch (err: any) {
    console.error("[ets] GET /clients/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/clients", async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.stage) body.stage = "new-lead";
    const { data, error } = await etsSupabase
      .from("ets_clients")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    res.json(mapClient(data));
  } catch (err: any) {
    console.error("[ets] POST /clients error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date().toISOString();

    if (updates.stage) {
      updates.stage_changed_at = new Date().toISOString();
      updates.days_in_stage = 0;
    }

    const { data, error } = await etsSupabase
      .from("ets_clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(mapClient(data));
  } catch (err: any) {
    console.error("[ets] PATCH /clients/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.delete("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await etsSupabase.from("ets_clients").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[ets] DELETE /clients/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/products", async (_req, res) => {
  try {
    const { data, error, count } = await etsSupabase
      .from("ets_products")
      .select("*, ets_categories(name, slug, customs_duty_percent, igst_percent)", { count: "exact" })
      .order("id")
      .range(0, 4999);

    if (error) throw error;
    res.json({ products: (data || []).map(mapProduct), total: count });
  } catch (err: any) {
    console.error("[ets] GET /products error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/products", async (req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_products")
      .insert(req.body)
      .select("*, ets_categories(name, slug, customs_duty_percent, igst_percent)")
      .single();

    if (error) throw error;
    res.json(mapProduct(data));
  } catch (err: any) {
    console.error("[ets] POST /products error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    delete updates.ets_categories;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await etsSupabase
      .from("ets_products")
      .update(updates)
      .eq("id", id)
      .select("*, ets_categories(name, slug, customs_duty_percent, igst_percent)")
      .single();

    if (error) throw error;
    res.json(mapProduct(data));
  } catch (err: any) {
    console.error("[ets] PATCH /products/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await etsSupabase.from("ets_products").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[ets] DELETE /products/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/categories", async (_req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_categories")
      .select("*")
      .order("id");

    if (error) throw error;
    res.json({ categories: data });
  } catch (err: any) {
    console.error("[ets] GET /categories error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/categories", async (req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_categories")
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[ets] POST /categories error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await etsSupabase
      .from("ets_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[ets] PATCH /categories/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await etsSupabase.from("ets_categories").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[ets] DELETE /categories/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/orders", async (req, res) => {
  try {
    const { status, client_id } = req.query;

    let query = etsSupabase
      .from("ets_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (client_id) query = query.eq("client_id", client_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ orders: (data || []).map(mapOrder) });
  } catch (err: any) {
    console.error("[ets] GET /orders error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/orders", async (req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_orders")
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json(mapOrder(data));
  } catch (err: any) {
    console.error("[ets] POST /orders error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await etsSupabase
      .from("ets_orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(mapOrder(data));
  } catch (err: any) {
    console.error("[ets] PATCH /orders/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await etsSupabase.from("ets_orders").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[ets] DELETE /orders/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/payments", async (req, res) => {
  try {
    const { status, client_id } = req.query;

    let query = etsSupabase
      .from("ets_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (client_id) query = query.eq("client_id", client_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ payments: (data || []).map(mapPayment) });
  } catch (err: any) {
    console.error("[ets] GET /payments error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/payments", async (req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_payments")
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json(mapPayment(data));
  } catch (err: any) {
    console.error("[ets] POST /payments error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await etsSupabase
      .from("ets_payments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(mapPayment(data));
  } catch (err: any) {
    console.error("[ets] PATCH /payments/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.delete("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await etsSupabase.from("ets_payments").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("[ets] DELETE /payments/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/settings", async (_req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_price_settings")
      .select("*")
      .order("id");

    if (error) throw error;
    res.json({ settings: data });
  } catch (err: any) {
    console.error("[ets] GET /settings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/settings", async (req, res) => {
  try {
    const { key, value, label, unit } = req.body;

    const { data, error } = await etsSupabase
      .from("ets_price_settings")
      .upsert({ key, value, label, unit, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[ets] POST /settings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/templates", async (req, res) => {
  try {
    const { category } = req.query;

    let query = etsSupabase
      .from("ets_whatsapp_templates")
      .select("*")
      .order("sort_order");

    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ templates: (data || []).map(mapWhatsAppTemplate) });
  } catch (err: any) {
    console.error("[ets] GET /templates error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/proposal-templates", async (_req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_proposal_templates")
      .select("*")
      .order("total_investment");

    if (error) throw error;
    res.json({ templates: (data || []).map(mapProposalTemplate) });
  } catch (err: any) {
    console.error("[ets] GET /proposal-templates error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/submissions", async (req, res) => {
  try {
    const { status } = req.query;

    let query = etsSupabase
      .from("ets_launch_kit_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ submissions: data });
  } catch (err: any) {
    console.error("[ets] GET /submissions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.post("/submissions", async (req, res) => {
  try {
    const { data, error } = await etsSupabase
      .from("ets_launch_kit_submissions")
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[ets] POST /submissions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/submissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;

    const { data, error } = await etsSupabase
      .from("ets_launch_kit_submissions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("[ets] PATCH /submissions/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.get("/checklist/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;

    const { data, error } = await etsSupabase
      .from("ets_checklist_status")
      .select("*, ets_checklist_items(label, sort_order)")
      .eq("client_id", clientId)
      .order("item_id");

    if (error) throw error;
    res.json({ checklist: (data || []).map(mapChecklist) });
  } catch (err: any) {
    console.error("[ets] GET /checklist/:clientId error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

etsRouter.patch("/checklist/:statusId", async (req, res) => {
  try {
    const { statusId } = req.params;
    const { completed } = req.body;

    const { data, error } = await etsSupabase
      .from("ets_checklist_status")
      .update({ completed, updated_at: new Date().toISOString() })
      .eq("id", statusId)
      .select("*, ets_checklist_items(label, sort_order)")
      .single();

    if (error) throw error;
    res.json(mapChecklist(data));
  } catch (err: any) {
    console.error("[ets] PATCH /checklist/:statusId error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
