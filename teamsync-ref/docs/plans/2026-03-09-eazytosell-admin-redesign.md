# EazyToSell (ETS) Admin Redesign — Final Design Specification

**Date**: 2026-03-09
**Status**: Approved for implementation
**Authors**: Synthesized from 4 agent analyses + existing codebase audit

---

## Executive Summary

TeamSync already has a complete ETS vertical with **10 pages (4,676 lines)** at `client/src/pages/ets/`, built with mock data. The work is to:
1. Create Supabase `ets_*` tables
2. Build `server/ets-api.ts` Express router
3. Rewire all 10 pages from mock data to real API queries
4. Add 1 missing page (`/ets/reviews`)

The price engine already exists in `client/src/lib/mock-data-ets.ts` as `calculateEtsPrices()` and will be ported server-side for bulk recalculation.

---

## 1. Data Model Decision: TeamSync Mock Stages Win

### Pipeline Stages — 8-Stage Model (TeamSync mock)

The TeamSync mock uses **8 stages** which better reflect the actual China-to-India retail franchise lifecycle:

```
new-lead → qualified → token-paid → store-design → inventory-ordered → in-transit → launched → reordering
```

**Why not the original 9-stage model?**
The original EazyToSell used CRM-style stages (`New Inquiry`, `Qualification Sent`, `Discovery Call`, `Proposal Sent`, `Negotiation`, `Token Paid`, `In Execution`, `Launched`, `Lost`). These are too granular for the pre-token phase and too vague for the post-token phase. The TeamSync 8-stage model:
- Consolidates pre-token stages into `new-lead` → `qualified` (all the CRM nurturing happens here)
- Expands post-token stages into operational milestones: `store-design`, `inventory-ordered`, `in-transit`
- Adds `reordering` for active repeat clients (missing from original)
- Drops `Lost` as a pipeline stage; instead, use a boolean `is_lost` flag with `lost_reason` field

**Rationale**: The 10 existing TeamSync pages (4,676 lines) already use the 8-stage model. Changing stages would require rewriting every page. The 8-stage model is also more operationally useful.

### Order Statuses — TeamSync Mock (6 stages)

```
ordered → factory-ready → shipped → customs → warehouse → dispatched
```

These map to the actual China-to-India supply chain better than the original's generic 5-stage model.

### Payment Types — TeamSync Mock

```
token | milestone | final
```

Statuses: `received | pending | overdue`

### Product Model — Simplified from Original

The TeamSync mock uses a simpler product model without `status` field (uses `isVisible` boolean instead) and adds `isHeroSku` and `marginTier` fields not in the original. **Keep the TeamSync model** as the existing pages depend on it.

### Score System — Simplified

The TeamSync mock uses a single `score` (0-100) instead of the original's 6-factor scoring (0-18). **Keep the single score** — the 6-factor breakdown can be computed from sub-fields but the UI already renders a single number.

---

## 2. Final Database Schema

### Table Summary

| # | Table | Purpose | Est. Rows |
|---|-------|---------|-----------|
| 1 | `ets_clients` | CRM pipeline with scoring, store details, financials | 10s–100s |
| 2 | `ets_products` | Product catalog with pricing inputs | 100s–1000s |
| 3 | `ets_categories` | Product categories with duty/GST rates | 7–30 |
| 4 | `ets_orders` | Order tracking (China → India) | 10s–100s |
| 5 | `ets_payments` | Payment records per client | 100s |
| 6 | `ets_price_settings` | Global pricing parameters (key-value) | 7 rows |
| 7 | `ets_whatsapp_templates` | Message templates | 10–20 |
| 8 | `ets_proposal_templates` | Proposal configs per package tier | 3 rows |
| 9 | `ets_launch_kit_submissions` | Kit review requests | 10s–100s |
| 10 | `ets_checklist_items` | Master readiness checklist | ~16 rows |
| 11 | `ets_checklist_status` | Per-client checklist completion | 16 × clients |

### CREATE TABLE SQL

```sql
-- ============================================================
-- 1. ets_categories — Product categories with duty/tax rates
-- ============================================================

CREATE TABLE ets_categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  customs_duty_percent numeric(6,2) NOT NULL DEFAULT 0,
  igst_percent numeric(6,2) NOT NULL DEFAULT 18,
  hs_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ets_categories_slug ON ets_categories (slug);

-- Seed: toys(20/18), kitchenware(15/12), stationery(10/18), decor(20/18),
--        bags(20/18), household(15/12), gifts(20/18)

-- ============================================================
-- 2. ets_products — Product catalog with pricing inputs
-- ============================================================

CREATE TABLE ets_products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  category_id bigint NOT NULL REFERENCES ets_categories(id) ON DELETE RESTRICT,
  image text,

  exw_price_yuan numeric(12,2) NOT NULL DEFAULT 0,
  units_per_carton integer NOT NULL DEFAULT 1,
  carton_length_cm numeric(8,2) NOT NULL DEFAULT 0,
  carton_width_cm numeric(8,2) NOT NULL DEFAULT 0,
  carton_height_cm numeric(8,2) NOT NULL DEFAULT 0,
  carton_weight_kg numeric(8,2),
  moq integer,
  supplier_name text,
  hs_code text,

  is_visible boolean NOT NULL DEFAULT true,
  is_hero_sku boolean NOT NULL DEFAULT false,
  margin_tier text NOT NULL DEFAULT 'standard',

  tags text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ets_products_category_id ON ets_products (category_id);
CREATE INDEX idx_ets_products_visible ON ets_products (is_visible);

-- NOTE: Calculated pricing fields (fob, cif, landed cost, mrp, margin)
-- are computed client-side via calculateEtsPrices() and NOT stored.
-- The server computes them on-the-fly when needed for API responses.

-- ============================================================
-- 3. ets_clients — CRM with pipeline, scoring, store details
-- ============================================================

CREATE TABLE ets_clients (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  state text,
  phone text,
  email text,

  stage text NOT NULL DEFAULT 'new-lead',
  days_in_stage integer NOT NULL DEFAULT 0,
  stage_changed_at timestamptz DEFAULT now(),
  is_lost boolean NOT NULL DEFAULT false,
  lost_reason text,

  store_size integer,
  package_tier text NOT NULL DEFAULT 'lite',
  score integer NOT NULL DEFAULT 0,
  lead_source text,
  assigned_to text,

  total_paid numeric(12,2) NOT NULL DEFAULT 0,
  pending_dues numeric(12,2) NOT NULL DEFAULT 0,

  last_note text,
  next_action text,
  next_action_date text,

  store_address text,
  store_name text,
  store_type text,
  store_floor text,
  nearby_landmark text,
  monthly_rent numeric(12,2),
  expected_footfall integer,
  market_type text,

  gst_number text,
  pan_number text,
  manager_name text,
  manager_phone text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ets_clients_stage ON ets_clients (stage);
CREATE INDEX idx_ets_clients_score ON ets_clients (score DESC);
CREATE INDEX idx_ets_clients_created_at ON ets_clients (created_at DESC);
CREATE INDEX idx_ets_clients_assigned_to ON ets_clients (assigned_to);

-- ============================================================
-- 4. ets_orders — Order tracking (China → India supply chain)
-- ============================================================

CREATE TABLE ets_orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id bigint NOT NULL REFERENCES ets_clients(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  status text NOT NULL DEFAULT 'ordered',
  eta_days integer NOT NULL DEFAULT 0,
  value_inr numeric(12,2) NOT NULL DEFAULT 0,
  item_count integer NOT NULL DEFAULT 0,
  is_flagged boolean NOT NULL DEFAULT false,
  documents jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ets_orders_client_id ON ets_orders (client_id);
CREATE INDEX idx_ets_orders_status ON ets_orders (status);

-- ============================================================
-- 5. ets_payments — Payment tracking per client
-- ============================================================

CREATE TABLE ets_payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id bigint NOT NULL REFERENCES ets_clients(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL DEFAULT 'milestone',
  status text NOT NULL DEFAULT 'pending',
  date text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ets_payments_client_id ON ets_payments (client_id);
CREATE INDEX idx_ets_payments_status ON ets_payments (status);

-- ============================================================
-- 6. ets_price_settings — Global pricing configuration
-- ============================================================

CREATE TABLE ets_price_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value numeric(12,4) NOT NULL,
  label text NOT NULL,
  unit text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed data:
-- exchange_rate = 12.0 (₹/¥)
-- sourcing_commission = 5 (%)
-- freight_per_cbm = 8000 (₹)
-- insurance_percent = 0.5 (%)
-- sw_surcharge_percent = 10 (%)
-- our_markup_percent = 25 (%)
-- target_store_margin = 50 (%)

-- ============================================================
-- 7. ets_whatsapp_templates — Sales communication templates
-- ============================================================

CREATE TABLE ets_whatsapp_templates (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'follow-up',
  variables text[],
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_ets_whatsapp_templates_category ON ets_whatsapp_templates (category);

-- ============================================================
-- 8. ets_proposal_templates — Package tier configurations
-- ============================================================

CREATE TABLE ets_proposal_templates (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  package_tier text NOT NULL UNIQUE,
  store_size integer NOT NULL DEFAULT 0,
  total_investment numeric(12,2) NOT NULL DEFAULT 0,
  sku_count integer NOT NULL DEFAULT 0,
  category_mix jsonb DEFAULT '{}'::jsonb,
  investment_breakdown jsonb DEFAULT '[]'::jsonb,
  timeline jsonb DEFAULT '[]'::jsonb,
  inclusions text[],
  exclusions text[],
  payment_schedule jsonb DEFAULT '[]'::jsonb
);

-- ============================================================
-- 9. ets_launch_kit_submissions — Kit review requests
-- ============================================================

CREATE TABLE ets_launch_kit_submissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id bigint NOT NULL REFERENCES ets_clients(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_investment numeric(12,2) DEFAULT 0,
  total_units integer DEFAULT 0,
  budget numeric(12,2) DEFAULT 500000,
  comments text,
  submitted_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ets_submissions_client_id ON ets_launch_kit_submissions (client_id);
CREATE INDEX idx_ets_submissions_status ON ets_launch_kit_submissions (status);

-- ============================================================
-- 10. ets_checklist_items — Master readiness checklist
-- ============================================================

CREATE TABLE ets_checklist_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- Seed: 16 items matching client-detail.tsx generateChecklist()
-- CK-01: Discovery call completed
-- CK-02: Store location finalized
-- ... (through CK-16)

-- ============================================================
-- 11. ets_checklist_status — Per-client checklist completion
-- ============================================================

CREATE TABLE ets_checklist_status (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id bigint NOT NULL REFERENCES ets_clients(id) ON DELETE CASCADE,
  item_id bigint NOT NULL REFERENCES ets_checklist_items(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (client_id, item_id)
);

CREATE INDEX idx_ets_checklist_status_client_id ON ets_checklist_status (client_id);
```

---

## 3. API Endpoints — `server/ets-api.ts`

The router will be mounted at `/api/ets` in `server/routes.ts` (same pattern as `legalnationsRouter` at `/api/legalnations`).

### Clients (6 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/clients` | List all clients, with `?search=`, `?stage=`, `?tier=` filters | Pipeline, Dashboard |
| `GET` | `/clients/:id` | Get single client + payments + checklist status | Client Detail |
| `POST` | `/clients` | Create new client | Pipeline (Add Client) |
| `PATCH` | `/clients/:id` | Update client fields (stage change, score, notes) | Pipeline DnD, Client Detail |
| `DELETE` | `/clients/:id` | Delete client | Client Detail |

### Products (5 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/products` | List all products with category join | Products |
| `POST` | `/products` | Create product | Products (Add) |
| `PATCH` | `/products/:id` | Update product fields | Products (toggle visibility, hero, tier) |
| `DELETE` | `/products/:id` | Delete product | Products |
| `POST` | `/products/bulk` | CSV bulk import | Products |

### Categories (4 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/categories` | List all categories with duty rates | Products, Settings, Calculator |
| `POST` | `/categories` | Create category | Settings |
| `PATCH` | `/categories/:id` | Update duty/IGST rates | Settings |
| `DELETE` | `/categories/:id` | Delete category | Settings |

### Orders (4 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/orders` | List all orders, `?status=`, `?client_id=` | Orders, Dashboard |
| `POST` | `/orders` | Create order | Orders |
| `PATCH` | `/orders/:id` | Update status, tracking, flag | Orders |
| `DELETE` | `/orders/:id` | Delete order | Orders |

### Payments (4 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/payments` | List all payments, `?status=`, `?client_id=` | Payments, Dashboard |
| `POST` | `/payments` | Record payment | Payments, Client Detail |
| `PATCH` | `/payments/:id` | Update payment status | Payments |
| `DELETE` | `/payments/:id` | Delete payment | Payments |

### Settings (2 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/settings` | Get all price settings | Settings, Calculator, Products |
| `POST` | `/settings` | Upsert price setting (key/value) | Settings |

### Templates (2 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/templates` | List WhatsApp templates, `?category=` | Templates |
| `GET` | `/proposal-templates` | List proposal tier configs | Proposals, Settings |

### Submissions (3 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/submissions` | List kit submissions, `?status=` | Reviews, Dashboard |
| `POST` | `/submissions` | Create submission | Client Detail |
| `PATCH` | `/submissions/:id` | Approve/reject | Reviews |

### Stats (1 endpoint)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/stats` | Aggregated dashboard stats | Dashboard |

### Checklist (2 endpoints)

| Method | Path | Purpose | Used By |
|--------|------|---------|---------|
| `GET` | `/checklist/:clientId` | Get checklist items + status for client | Client Detail |
| `PATCH` | `/checklist/:statusId` | Toggle checklist item completion | Client Detail |

**Total: 33 endpoints**

---

## 4. Per-Page Wiring Instructions

### 4.1 Dashboard (`client/src/pages/ets/dashboard.tsx` — 373 lines)

**Current**: Imports `etsClients`, `etsOrders`, `etsPayments` from mock-data-ets.ts. Computes all stats client-side.

**Changes**:
1. Replace mock imports with `useQuery({ queryKey: ['/api/ets/stats'] })`
2. Replace `etsClients` list with `useQuery({ queryKey: ['/api/ets/clients'], queryParams: { limit: 5, sort: 'created_at' } })` for recent clients
3. Replace `etsOrders` filter with `useQuery({ queryKey: ['/api/ets/orders'], queryParams: { active: true } })` for active orders
4. Add loading skeletons (already present)
5. Remove `useSimulatedLoading()` — use real `isLoading` from queries

**Stats endpoint should return**:
```typescript
{
  totalClients: number;
  qualifiedClients: number;
  tokenPaidClients: number;
  launchedClients: number;
  totalTokensCollected: number;
  pendingInvoices: number;
  estimatedPipelineValue: number;
  stageCounts: Record<string, number>;
  alerts: Array<{ id, type, title, detail, severity }>;
}
```

### 4.2 Pipeline (`client/src/pages/ets/pipeline.tsx` — 559 lines)

**Current**: Imports `etsClients`, filters/groups client-side. Kanban DnD with `KanbanBoard`. Toast on stage change.

**Changes**:
1. Replace `etsClients` with `useQuery({ queryKey: ['/api/ets/clients'] })`
2. `handleCardMove` → `useMutation` calling `PATCH /api/ets/clients/:id` with `{ stage: newStage }`, invalidate `['/api/ets/clients']`
3. `handleAddNote` → `useMutation` calling `PATCH /api/ets/clients/:id` with `{ last_note: noteText }`
4. Keep client-side filtering (stage, tier, city search) — just filter the fetched data
5. Remove `useSimulatedLoading()` — use `isLoading` from query

### 4.3 Client Detail (`client/src/pages/ets/client-detail.tsx` — 746 lines)

**Current**: Finds client from mock array by ID. Generates checklist/timeline/notes from stage index.

**Changes**:
1. Replace `etsClients.find()` with `useQuery({ queryKey: ['/api/ets/clients', clientId] })`
2. Replace `etsPayments.filter()` with data from client detail response (payments included)
3. Replace `generateChecklist()` with `useQuery({ queryKey: ['/api/ets/checklist', clientId] })`
4. Checklist toggle → `useMutation` calling `PATCH /api/ets/checklist/:statusId`
5. "Move to Next Stage" → `useMutation` calling `PATCH /api/ets/clients/:id`
6. "Add Note" → `useMutation` calling `PATCH /api/ets/clients/:id`
7. Keep timeline generation client-side (derived from client data)

### 4.4 Products (`client/src/pages/ets/products.tsx` — 564 lines)

**Current**: Imports `etsProducts`, computes pricing client-side with `calculateEtsPrices()`.

**Changes**:
1. Replace `initialProducts` with `useQuery({ queryKey: ['/api/ets/products'] })`
2. Fetch settings with `useQuery({ queryKey: ['/api/ets/settings'] })` for price calculation
3. Fetch categories with `useQuery({ queryKey: ['/api/ets/categories'] })` for duty rates
4. Keep `calculateEtsPrices()` client-side (already in mock-data-ets.ts, will remain as utility)
5. `toggleVisibility` → `useMutation` calling `PATCH /api/ets/products/:id`
6. `toggleHeroSku` → `useMutation` calling `PATCH /api/ets/products/:id`
7. `bulkToggleVisibility` → multiple `PATCH` calls or a bulk endpoint

### 4.5 Calculator (`client/src/pages/ets/calculator.tsx` — 582 lines)

**Current**: Pure client-side calculator using `calculateEtsPrices()` and `defaultPriceSettings`.

**Changes**:
1. Fetch real settings with `useQuery({ queryKey: ['/api/ets/settings'] })`
2. Fetch categories with `useQuery({ queryKey: ['/api/ets/categories'] })`
3. Keep `calculateEtsPrices()` as-is — this is inherently a client-side computation
4. Pre-populate settings from API instead of hardcoded defaults

### 4.6 Orders (`client/src/pages/ets/orders.tsx` — 447 lines)

**Current**: Imports `etsOrders` from mock data.

**Changes**:
1. Replace `etsOrders` with `useQuery({ queryKey: ['/api/ets/orders'] })`
2. Status changes → `useMutation` calling `PATCH /api/ets/orders/:id`
3. Flag toggle → `useMutation` calling `PATCH /api/ets/orders/:id`

### 4.7 Payments (`client/src/pages/ets/payments.tsx` — 352 lines)

**Current**: Imports `etsPayments` from mock data.

**Changes**:
1. Replace `etsPayments` with `useQuery({ queryKey: ['/api/ets/payments'] })`
2. "Add Payment" → `useMutation` calling `POST /api/ets/payments`
3. Status update → `useMutation` calling `PATCH /api/ets/payments/:id`

### 4.8 Proposals (`client/src/pages/ets/proposals.tsx` — 413 lines)

**Current**: Imports `etsProposalTemplates` from mock data. Client-side proposal generation.

**Changes**:
1. Replace `etsProposalTemplates` with `useQuery({ queryKey: ['/api/ets/proposal-templates'] })`
2. Keep proposal generation logic client-side (PDF/display)

### 4.9 Templates (`client/src/pages/ets/templates.tsx` — 268 lines)

**Current**: Imports `etsWhatsAppTemplates` from mock data. Read-only display with copy-to-clipboard.

**Changes**:
1. Replace mock import with `useQuery({ queryKey: ['/api/ets/templates'] })`
2. Keep category filter client-side

### 4.10 Settings (`client/src/pages/ets/settings.tsx` — 372 lines)

**Current**: Imports `defaultPriceSettings`, `ETS_CATEGORY_DUTY_RATES`, `etsProposalTemplates`. Edit mode with local state.

**Changes**:
1. Replace `defaultPriceSettings` with `useQuery({ queryKey: ['/api/ets/settings'] })`
2. Replace `ETS_CATEGORY_DUTY_RATES` with `useQuery({ queryKey: ['/api/ets/categories'] })`
3. Replace `etsProposalTemplates` with `useQuery({ queryKey: ['/api/ets/proposal-templates'] })`
4. "Save Changes" → `useMutation` calling `POST /api/ets/settings` for each changed setting + `PATCH /api/ets/categories/:id` for changed duty rates

### 4.11 Reviews (NEW — `client/src/pages/ets/reviews.tsx`)

**New page**: Launch Kit review/approval queue.

**Implementation**:
1. `useQuery({ queryKey: ['/api/ets/submissions'], queryParams: { status: 'pending' } })`
2. Card layout: client name, submission date, total investment, total units, budget utilization
3. Approve button → `useMutation` calling `PATCH /api/ets/submissions/:id` with `{ status: 'approved' }`
4. Reject button → `useMutation` calling `PATCH /api/ets/submissions/:id` with `{ status: 'rejected' }`
5. ~120 lines, simple card list with PageShell

**Route**: Add `/ets/reviews` to App.tsx
**Nav**: Add under "Tools" in verticals-config.ts

---

## 5. Phased Implementation Plan

### Phase 1: Full Backend + Rewire All Pages (Sprint 1-2)

Since ALL 10 pages already exist with working UI, Phase 1 can be ambitious — it's purely backend + rewiring.

**Deliverables**:

| Task | Est. Lines | Priority |
|------|-----------|----------|
| Create all 11 Supabase tables (run SQL) | SQL script | P0 |
| Build `server/ets-api.ts` Express router (33 endpoints) | ~600 lines | P0 |
| Register router in `server/routes.ts` | ~5 lines | P0 |
| Seed data script (`scripts/seed-ets.ts`) | ~200 lines | P0 |
| Rewire Dashboard (mock → API) | ~30 lines changed | P0 |
| Rewire Pipeline (mock → API + mutations) | ~50 lines changed | P0 |
| Rewire Products (mock → API + mutations) | ~40 lines changed | P0 |
| Rewire Calculator (mock → API settings) | ~15 lines changed | P1 |
| Rewire Orders (mock → API) | ~25 lines changed | P1 |
| Rewire Payments (mock → API) | ~25 lines changed | P1 |
| Rewire Client Detail (mock → API + mutations) | ~60 lines changed | P1 |
| Rewire Settings (mock → API + mutations) | ~40 lines changed | P1 |
| Rewire Templates (mock → API) | ~10 lines changed | P2 |
| Rewire Proposals (mock → API) | ~15 lines changed | P2 |
| Add Reviews page | ~120 new lines | P2 |

**Phase 1 Total**: ~600 lines new (API router) + ~200 lines seed + ~330 lines changes across pages + ~120 new page = **~1,250 lines**

### Phase 2: Enhanced Features (Sprint 3)

Features from original EazyToSell NOT in TeamSync mock pages:

| Feature | Original Status | Decision |
|---------|----------------|----------|
| 6-factor lead scoring (Budget/Location/Operator/Timeline/Experience/Engagement) | Full breakdown in ClientDetail | **Phase 2**: Add sub-score fields to ets_clients, add score breakdown UI to client detail |
| 44-item readiness checklist across 7 categories | Extensive checklist in ClientDetail | **Phase 2**: Current mock has 16 items, expand to full 44 |
| CSV bulk product import | Products page had CSV import dialog | **Phase 2**: Add CSV upload dialog + `POST /api/ets/products/bulk` |
| Public qualification form | Auto-creates client with scores | **Dropped**: TeamSync is an admin tool, not a public-facing app |
| Launch kit builder (product selection) | Client adds products to kit | **Phase 2**: Add kit management tab to Client Detail |
| Client category preferences | Budget allocation per category | **Dropped**: Low usage, adds complexity |
| FAQ items | Public FAQ content | **Dropped**: Admin tool doesn't need public FAQ |
| Recalculate all products endpoint | Bulk price recalculation | **Phase 2**: Add "Recalculate All" button to Settings |

### Phase 2 Deliverables

| Task | Est. Lines |
|------|-----------|
| Add 6-factor scoring to ets_clients schema + Client Detail UI | ~100 lines |
| Expand checklist to 44 items with 7 categories | ~50 lines SQL + ~80 lines UI |
| CSV bulk import dialog for Products | ~150 lines |
| Launch kit builder in Client Detail | ~200 lines |
| "Recalculate All Products" in Settings | ~30 lines |

---

## 6. Architecture Notes

### File Structure

```
server/
  ets-api.ts              # Express router (mounted at /api/ets)
  routes.ts               # Add: app.use("/api/ets", etsRouter)

client/src/lib/
  mock-data-ets.ts        # Keep calculateEtsPrices() + types, remove mock data arrays
  ets-config.ts           # Keep status configs (already exists)

client/src/pages/ets/
  dashboard.tsx           # Rewire to API
  pipeline.tsx            # Rewire to API
  client-detail.tsx       # Rewire to API
  products.tsx            # Rewire to API
  calculator.tsx          # Rewire settings to API
  orders.tsx              # Rewire to API
  payments.tsx            # Rewire to API
  proposals.tsx           # Rewire to API
  templates.tsx           # Rewire to API
  settings.tsx            # Rewire to API
  reviews.tsx             # NEW page

scripts/
  seed-ets.ts             # Seed script for initial data
```

### API Pattern

Follow the `legalnationsRouter` pattern exactly:
- Use `supabase` client from `server/supabase.ts`
- All queries use `.select("*")` with appropriate filters
- Error handling: try/catch with `console.error("[ets]", err.message)` + `res.status(500).json({ error })`
- Updates: `delete updates.id; delete updates.created_at; updates.updated_at = new Date().toISOString()`

### Price Engine Strategy

The `calculateEtsPrices()` function in `mock-data-ets.ts` is correct and complete. It will:
- **Stay client-side** for real-time calculator and product table rendering
- **Be duplicated server-side** only if a "Recalculate All" bulk endpoint is added in Phase 2
- Take `EtsPriceInputs` (product fields + global settings + category duty rates)
- Return `EtsPriceResult` with full breakdown

### Query Key Convention

All ETS queries use array keys for proper cache invalidation:
```typescript
queryKey: ['/api/ets/clients']
queryKey: ['/api/ets/clients', clientId]
queryKey: ['/api/ets/products']
queryKey: ['/api/ets/orders']
queryKey: ['/api/ets/payments']
queryKey: ['/api/ets/settings']
queryKey: ['/api/ets/categories']
queryKey: ['/api/ets/templates']
queryKey: ['/api/ets/submissions']
queryKey: ['/api/ets/checklist', clientId]
queryKey: ['/api/ets/stats']
queryKey: ['/api/ets/proposal-templates']
```

---

## 7. Gaps Analysis: Original vs TeamSync Mock

### Features IN TeamSync but NOT in Original EazyToSell

| Feature | TeamSync Page | Notes |
|---------|--------------|-------|
| Proposals page | `/ets/proposals` | Investment breakdown generator per package tier |
| Calculator page | `/ets/calculator` | Standalone price calculator (was embedded in Products) |
| Orders page | `/ets/orders` | Dedicated order tracking with 6-stage China→India pipeline |
| Hero SKU designation | Products | `isHeroSku` flag for featured products |
| Margin tier classification | Products | `marginTier`: premium/standard/value |
| `reordering` stage | Pipeline | Post-launch repeat order tracking |

### Features IN Original but NOT in TeamSync Mock

| Feature | Status | Decision |
|---------|--------|----------|
| 6-factor lead scoring UI | Missing | Phase 2 — add breakdown to client detail |
| 44-item categorized checklist | Simplified to 16 | Phase 2 — expand |
| CSV bulk import | Missing | Phase 2 — add to products |
| Add/Edit product form (Sheet) | Missing | Phase 1 — needed for real CRUD |
| Add client form | Missing | Phase 1 — needed for pipeline |
| Record payment dialog | Missing from Payments page | Phase 1 — add form dialog |
| Launch kit builder | Missing | Phase 2 |
| Public qualification form | Missing | Dropped — admin-only tool |
| WhatsApp Business API | Placeholder | Dropped — future epic |

---

## 8. Seed Data Requirements

The seed script (`scripts/seed-ets.ts`) must populate:

1. **7 categories** with duty/IGST rates (matching mock data)
2. **7 price settings** with default values (matching `defaultPriceSettings`)
3. **20 products** (matching `etsProducts` mock array)
4. **15 clients** (matching `etsClients` mock array)
5. **8 orders** (matching `etsOrders` mock array)
6. **12 payments** (matching `etsPayments` mock array)
7. **3 proposal templates** (matching `etsProposalTemplates` mock array)
8. **4+ WhatsApp templates** (matching `etsWhatsAppTemplates` mock array)
9. **16 checklist items** (matching `generateChecklist()` items)

This ensures the app looks identical after rewiring — same data, just from Supabase instead of TypeScript arrays.
