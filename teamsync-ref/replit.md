# TeamSync - Multi-Vertical Team Portal

## Overview
TeamSync is a multi-vertical team portal with exceptional UI/UX inspired by the Dropship.io design system. The vertical switcher shows two labeled groups: "Business Products" and "Departments". Each vertical/department has its own dashboard, pages, brand logo, and workflows. Built with React, TypeScript, Tailwind CSS, and Shadcn UI.

**Business Products** (9): Suprans Business Services (`/suprans`), LegalNations (`/legalnations`), USDrop AI (`/usdrop`), GoyoTours (`/goyotours`), LBM Lifestyle (`/lbm`), EazyToSell (`/ets`), FaireDesk (`/faire`), Vendor Portal (`/vendor`), Trip HQ (`/triphq`)

**Departments** (8): HRMS (`/hrms`), ATS (`/ats`), Sales CRM (`/crm`), Finance & Accounts (`/finance`), Order & Fulfillment OMS (`/oms`), Event Management (`/eventhub`), Developer (`/dev`), SMM (`/social`)

## Suprans Business Services (`/suprans/*`) — indigo #3730A3

Primary lead source and routing hub for all business verticals. Leads flow in → validated → enriched → assigned to vertical reps.

### Pages
- **Dashboard** `/suprans` — Command Center: 4 stat cards, vertical breakdown table (all 6 verticals with leads/assigned/converted counts), recent leads feed with quick Validate/Enrich buttons
- **Inbound** `/suprans/inbound` — 8 new unvalidated leads, search, source filter pills (Website/Referral/Instagram/LinkedIn/Google Ads/Walk-in/WhatsApp), Validate dialog with notes
- **Enrichment** `/suprans/enrichment` — 6 validated leads, AI-suggested vertical routing (e.g., "AI suggests: USDrop AI →"), Enrich dialog with vertical select, priority selector, notes
- **Assignments** `/suprans/assignments` — 5 enriched leads ready to assign, vertical+rep dropdowns, follow-up date, recently assigned table with 4 assigned leads

### Mock Data (`client/src/lib/mock-data-suprans.ts`)
- 25 leads across 6 statuses (8 new, 6 validated, 5 enriched, 4 assigned, 2 converted)
- 6 services mapped to verticals (company-formation→hr, tour-booking→events, ecommerce-setup→sales, event-management→eventhub, hr-consulting→hrms, franchise→ets)
- `VERTICAL_REP_MAP` with 3 mock reps per vertical (18 total)
- Report templates: Daily Lead Intake (employee scope) + Weekly Assignment Summary (department scope)

## Design System Architecture (Mar 2026)

### Softr-Style Locked Universal Design System
All 17 verticals and 177 pages follow a single unified design system. Structure, spacing, status display, tables, forms, and detail pages are **defined once and reused everywhere**. Only configuration (columns, statuses, brand color, labels) changes per page or vertical.

#### PRIMARY RULE: Consistent Page Margins
Every page's outermost wrapper **must** use `px-16 lg:px-24` for horizontal padding. This matches the top-navigation bar and EtsSubNavSidebar layout margins. Never use `px-6`, `px-8`, `px-10`, or any other horizontal padding on page-level containers. Inner components (cards, badges, buttons) can use their own padding, but the page shell must always be `px-16 lg:px-24`.

#### Component Systems (both canonical, unified via ds.ts)
- **`@/components/layout`**: `PageShell`, `PageHeader`, `HeroBanner`, `StatCard`, `StatGrid`, `SectionCard`, `SectionGrid`, `FilterPill`, `PrimaryAction`, `IndexToolbar`, `DataTableContainer`, `DataTH/TD/TR`, `SortableDataTH`, `DetailSection`, `DetailModal`, `InfoRow`
- **`@/components/hr`**: `DataTable` (column-config), `StatusBadge` (extended variant system), `FormDialog`, `StatsCard`, `EmptyState`, `StageStepper`
- **`@/components/ui/team-member-card`**: `TeamMemberCard` — shared thin vertical card for team member display across all verticals. Props: name, role, department, email, phone, status, location, accentColor, action callbacks (onEmailClick, onWhatsAppClick, onSlackClick, onPhoneClick). Uses `react-icons/si` for WhatsApp/Slack logos.
- **`@/components/sop/sop-modal`**: `SopModal`, `TutorialModal`, `SopTutorialButtons` — reusable SOP + Tutorial button/modal system. Each page gets two outline buttons ("SOP" with BookOpen icon, "Tutorial" with PlayCircle icon) in the header. SOP modal shows numbered step-by-step process with warnings and quick links. Tutorial modal embeds YouTube video.

#### SOP System (`client/src/lib/sop-data.ts`)
Centralized `SOP_REGISTRY` with 37+ configs keyed by `"{vertical}-{page}"` (e.g., `"faire-orders"`, `"ets-pipeline"`, `"hrms-payroll"`, `"triphq-dashboard"`). Each entry has `.sop` (title, steps with warnings/links) and `.tutorial` (title, videoUrl, description). Applied to 45 pages across 12 verticals: Faire (7), ETS (4), LegalNations (2), HRMS (5), ATS (2), CRM (3), Finance (2), OMS (2), Social (2), Suprans (2), EventHub (1), Trip HQ (12). Integration pattern: import components + `SOP_REGISTRY`, add `sopOpen`/`tutorialOpen` state, place `SopTutorialButtons` in PageHeader actions, add modals before closing `PageShell`.

#### Master Barrel: `client/src/lib/ds.ts`
Single import for all design primitives — any page can import from `@/lib/ds` instead of multiple sources.

#### Per-Vertical Config Files (`client/src/lib/{vertical}-config.ts`)
One config per vertical, each exporting `VERTICAL_COLOR` + TypeScript status types + status configs:
- `faire-config.ts`, `ats-config.ts`, `crm-config.ts`, `hrms-config.ts`, `ets-config.ts`
- `events-config.ts`, `eventhub-config.ts`, `finance-config.ts`, `oms-config.ts`, `sales-config.ts`
- `social-config.ts`, `suprans-config.ts` (also exports `VENDOR_COLOR`), `dev-config.ts`, `admin-config.ts`

#### Design Tokens (`client/src/lib/design-tokens.ts`)
Exports `DS` object — single source of truth for the entire theme. All layout/HR components reference `DS` tokens.

**Central Theme Coverage:**

| Category | DS Path | What It Defines |
|----------|---------|-----------------|
| **Colors — Accent** | `DS.color.accent` | `.DEFAULT`, `.foreground`, `.muted`, `.hover` (maps to `--primary` CSS var) |
| **Colors — Text** | `DS.color.text` | `.DEFAULT`, `.secondary`, `.inverse`, `.link`, `.disabled` (Tailwind classes) |
| **Colors — Background** | `DS.color.bg` | `.page`, `.surface`, `.surfaceRaised`, `.muted`, `.overlay`, `.input` |
| **Colors — Surface** | `DS.color.surface` | `.card`, `.popover`, `.sidebar`, `.accent` (includes border + radius) |
| **Colors — System** | `DS.color.system` | `.success`, `.warning`, `.info`, `.destructive` + foregrounds (CSS vars) |
| **Colors — Border** | `DS.color.border` | `.DEFAULT`, `.input`, `.ring` |
| **Colors — Chart** | `DS.color.chart` | 5-color palette array |
| **Colors — Status** | `DS.color.status` | `.online`, `.away`, `.busy`, `.offline` (presence indicators) |
| **Typography — Headings** | `DS.heading` | `h1`–`h6` with family, weight, size, tracking |
| **Typography — Font Family** | `DS.font.family` | `.sans`, `.heading`, `.serif`, `.mono` |
| **Typography — Font Weight** | `DS.font.weight` | `.normal`, `.medium`, `.semibold`, `.bold` |
| **Typography — Body Sizes** | `DS.font.size` | `xs` through `4xl` |
| **Typography — Line Height** | `DS.font.leading` | `.tight`, `.snug`, `.normal`, `.relaxed` |
| **Typography — Styles** | `DS.typography` | Semantic presets: `pageTitle`, `pageSubtitle`, `sectionTitle`, `bodyText`, `caption`, `heroHeadline`, etc. |
| **Roundness** | `DS.radius` | Scale: `none`→`sm`→`DEFAULT`→`lg`→`xl`→`2xl`→`full` + semantic: `.card`, `.button`, `.badge`, `.avatar`, `.input` |
| **Shadow** | `DS.shadow` | Scale: `xs`→`sm`→`md`→`lg`→`xl`→`2xl` + semantic: `.card`, `.dropdown`, `.modal`, `.btnPrimary`, `.btnSecondary` |

**CSS Custom Properties** (`client/src/index.css`):
- `:root` + `.dark` define all color vars (background, foreground, primary, secondary, muted, accent, destructive, success, warning, info, border, chart 1-5, sidebar, shadows xs-2xl, fonts, radius)
- System colors (`--success`, `--warning`, `--info`) available as Tailwind utilities: `bg-success`, `text-warning`, `border-info`, etc.

**Additional DS sections:** `page`, `table`, `toolbar`, `pill`, `primaryAction`, `card`, `grid`, `hero`, `modal`, `infoRow`

`ds.ts` re-exports `DS`, `defineTablePage`, `TablePageConfig` alongside all layout/HR/block components.

#### Block Components (`@/components/blocks` — all re-exported via `@/lib/ds`)
Comprehensive reusable block library organized by category:

- **Layout**: `TwoColumn`, `ThreeColumn`, `FourColumn`, `AsymmetricColumns` (ratios: 1:2, 2:1, 1:3, 3:1, 1:1:2, 2:1:1, 1:2:1)
- **Grid**: `CoverMediaGrid`, `SmallImageGrid`, `ButtonGrid`, `ShortcutGrid`
- **List**: `EntityCell`, `StackedList`, `ColumnedList`, `ExpandableList`
- **Detail**: `DetailBanner`, `InfoPropertyGrid`, `TabContainer`
- **Detail Views** (`detail-view-blocks.tsx`): `SmallDetailModal`, `LargeDetailSheet`, `LargeDetailDialog`, `FullPageDetailTabbed`, `FullPageDetailColumns`, `SidebarField`
- **Timeline**: `Timeline`, `ActivityFeed`
- **Form**: `FormSection`, `FormGrid`
- **Chart**: `MetricCard` (KPI with trend), `ChartBlock` (8 variants: bar, column, line, area, scatter, pie, donut, rose)
- **Calendar**: `MonthCalendar`, `WeekCalendar`, `DayCalendar`, `AgendaView`, `CalendarBlock` (tabbed wrapper)
- **Kanban**: `KanbanBoard`, `KanbanColumn`, `KanbanCard` (with priority indicators, @dnd-kit drag-and-drop, `renderCard`/`renderColumnHeader`/`onCardMove`/`columnClassName` props for customization; all 6 kanban pages unified to use these shared components)
- **Inbox**: `InboxList`, `InboxToolbar` (with filter tabs), `MessageThread`
- **Payment**: `BillingCard`, `PricingTable`, `CheckoutForm`, `InvoiceList`
- **Table**: `SimpleTable` (lightweight typed table), `QuickLinksBlock`
- **LMS**: `CourseCard`, `CourseGrid`, `ModuleAccordion`, `LessonItem`, `ProgressRing`, `QuizBlock`, `CertificateCard`, `CourseDetailHeader`
- **Access Control**: `AccessProvider` (context wrapper), `useAccessControl` (hook), `AccessGate` (permission-gating wrapper with hide/lock-overlay/blur/full-page-lock modes), `PermissionBadge`

Barrel export: `client/src/components/blocks/index.ts`

#### Rules
- **NO** inline `const statusColors: Record<string, string>` — use `<StatusBadge status={x} />` 
- **NO** inline `const BRAND = "#..."` — import `VERTICAL_COLOR` from per-vertical config
- **NO** hardcoded style values in layout/table components — use `DS.*` tokens from `@/lib/design-tokens`
- **NO** hardcoded `px-16 py-6 lg:px-24` — all pages MUST use `<PageShell>` wrapper (standardized Mar 2026)
- **StatusBadge** auto-resolves all status strings across all verticals via extended `variantMap`
- **PageShell** is now used by ALL 170+ pages across all 17 verticals — provides consistent `DS.page.shell` padding and `space-y-6` vertical rhythm
- **PageShell** accepts `className`, `data-testid`, and all standard HTML div props via `...rest`
- **ALL person names** in tables, lists, dropdowns, kanban cards, and detail pages MUST use `<PersonCell>` — DiceBear **Micah** avatar, imported from `@/components/ui/avatar-cells` or `@/lib/ds`
- **ALL company/entity names** (companies, stores, retailers, vendors, brands) MUST use `<CompanyCell>` — DiceBear **Glass** avatar with `rounded-lg`, imported from `@/components/ui/avatar-cells` or `@/lib/ds`
- **Avatar cell sizes**: `xs` (h-5 w-5), `sm` (h-6 w-6), `md` (h-8 w-8, default for tables), `lg` (h-10 w-10, for detail pages/headers)
- **NO** inline `<Avatar><AvatarImage src={getPersonAvatar(name)} />` patterns — use `<PersonCell name={name} />` instead
- **NO** plain text person/company names without avatars — every name column must have a DiceBear avatar

#### Detail View Patterns (6 canonical types)
All detail views MUST use one of these 6 patterns. New patterns from `detail-view-blocks.tsx` (import from `@/lib/ds`). `DetailModal` is pre-existing in `page-layout.tsx`.

| Pattern | Component | Source | When to Use | Size |
|---------|-----------|--------|-------------|------|
| **Small Detail Modal** | `SmallDetailModal` | `detail-view-blocks.tsx` | Quick-reference popups: payslips, policies, media previews, simple entity info | `sm` (max-w-md) or `md` (max-w-lg) |
| **Standard Detail Modal** | `DetailModal` | `page-layout.tsx` | Record detail with header/sections/footer: CRM activities, HRMS performance reviews | max-w-2xl, scrollable body (65vh) |
| **Large Detail Sheet** | `LargeDetailSheet` | `detail-view-blocks.tsx` | Complex entity side drawer with main+sidebar: tasks, comments, attachments | Sheet, max-w-[720px] |
| **Large Detail Dialog** | `LargeDetailDialog` | `detail-view-blocks.tsx` | Same as Sheet but centered overlay with main+sidebar: task details, project boards | Dialog, max-w-5xl |
| **Full-Page Tabbed** | `FullPageDetailTabbed` | `detail-view-blocks.tsx` | Deep profile pages: candidates, employees, courses (Back + Banner + Tabs) | Full page |
| **Full-Page Columns** | `FullPageDetailColumns` | `detail-view-blocks.tsx` | Multi-column dashboard: tickets, orders, quotations (Back + Header + Grid) | Full page, ratio: 7:3/6:4/3:7 |

- `SidebarField` — reusable label/value field for sidebar metadata panels in Sheet/Dialog/FullPage layouts
- **NO** ad-hoc `<Dialog><DialogContent className="max-w-md/lg">` for detail views — use `SmallDetailModal` instead
- **NO** inline two-column dialog layouts — use `LargeDetailDialog` or `LargeDetailSheet`
- **FormDialog** (from `@/components/hr/form-dialog`) remains the standard for create/edit forms — don't use detail views for forms

### Optimistic Updates (Global Pattern)
All mutations across the app follow the TanStack Query optimistic update pattern for instant UI feedback:
- **`onMutate`**: Cancel in-flight queries → snapshot previous cache → apply optimistic update → return snapshot for rollback
- **`onError`**: Restore previous cache from snapshot
- **`onSettled`**: Invalidate queries to reconcile with server truth

Applied to:
- **AI Chat** (`AIChatWidget.tsx`): delete/rename conversations
- **Team Chat** (`chat.tsx`): delete messages, toggle reactions
- **Tickets** (`tickets.tsx`): delete tickets, update status/priority/assignee
- **Ticket Detail** (`ticket-detail.tsx`): update fields
- **Tasks** (`tasks.tsx`): update status/priority/assignee/dueDate, delete activity items
- **Task Detail** (`task-detail-dialog.tsx`): delete attachments
- **Vendors** (`vendors.tsx`): delete vendors
- **Bank Transactions** (`bank-transactions.tsx`): toggle business flag, save edits (both Mercury + Faire tabs)
- **Image Studio** (`image-studio.tsx`): delete images
- **Application Detail** (`application-detail.tsx`): patch fields, change status, delete followups, delete links

#### Faire Gold Standard (orders.tsx) — Applied to All Faire Pages (Mar 2026)
All Faire index pages follow orders.tsx pattern:
- **Wrapper**: `PageShell` → `Fade` sections
- **Header**: `PageHeader` with `text-2xl font-bold`, subtitle, action buttons
- **Toolbar**: `IndexToolbar` with `w-80` search, `FilterPill` row, `FAIRE_COLOR` brand color
- **Table**: `DataTableContainer` → `DataTH`/`SortableDataTH` → `DataTR` + `DataTD`
- **Pagination**: `PAGE_SIZE=25`, "Showing X-Y of Z", page buttons with FAIRE_COLOR active state
- **Row actions**: Inline icon buttons (`ghost`/`outline`, `h-8 w-8 p-0`)
- **Detail pages**: `text-2xl font-bold` title, `InfoRow` for key-value pairs, `DetailSection` for grouped blocks

Pages standardized: applications, stores, shipments, pricing, quotations, vendors, inventory, bank-transactions, ledger, analytics, retailer-detail, product-detail, quotation-detail, order-detail, application-detail

## Core Supabase Infrastructure (Mar 2026)

Supabase project: `ngvrnwjisntjmqrtnume` (ap-southeast-1). All core tables are in the `public` schema and FK into each other. Faire-specific tables remain in the `faire` schema via RPC.

### Core Tables (9 tables — shared across all 16 portals)

| Table | Rows | Description |
|-------|------|-------------|
| `verticals` | 16 | Registry of all 16 portals (id = short name like `dev`, `faire`, `hr`) |
| `users` | 20 | Internal team members (EMP-001–EMP-020) |
| `user_verticals` | 34 | Many-to-many: user ↔ vertical membership with role |
| `tasks` | 15+ | Cross-portal tasks (T074+ for DB-created; T001–T073 reserved for mock) |
| `task_subtasks` | 0+ | Checklist items per task (cascade-deletes with parent) |
| `channels` | 0+ | Chat channels per vertical (type: channel/dm/announcement) |
| `channel_messages` | 0+ | Messages per channel |
| `resources` | 0+ | Shared documents/links per vertical |
| `contacts` | 0+ | Important contacts, supports multi-vertical via `vertical_ids TEXT[]` |
| `notifications` | 130 (seeded) | Per-vertical alerts; 8-10 per vertical, 3 unread each; `user_id NULL` = broadcast |

### FK Graph
```
verticals ←── tasks.vertical_id
verticals ←── channels.vertical_id
verticals ←── resources.vertical_id
verticals ←── notifications.vertical_id
verticals ←── user_verticals.vertical_id
users     ←── tasks.assignee_id / created_by
users     ←── channel_messages.sender_id
users     ←── resources.added_by_id
users     ←── contacts.added_by_id
users     ←── user_verticals.user_id
users     ←── notifications.user_id (nullable = broadcast)
tasks     ←── task_subtasks.task_id (ON DELETE CASCADE)
channels  ←── channel_messages.channel_id (ON DELETE CASCADE)
```

### task_code Sequence
- DB trigger `trg_assign_task_code` auto-assigns `T074+` on new task INSERT
- Mock data uses `T001–T073` (hard-coded in `sharedTaskCodeMap` in mock-data-shared.ts)

### `/api/core/*` Routes (registered in server/routes.ts)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/core/verticals` | List all 16 verticals |
| GET | `/api/core/verticals/:id` | Single vertical |
| GET | `/api/core/users?verticalId=` | All users (or filtered by vertical) |
| GET | `/api/core/users/:id` | Single user |
| GET | `/api/core/tasks?verticalId=` | Tasks (all or by vertical) |
| GET/PATCH/DELETE | `/api/core/tasks/:id` | Single task CRUD |
| GET/POST | `/api/core/tasks/:id/subtasks` | Subtask list + create |
| PATCH/DELETE | `/api/core/tasks/:id/subtasks/:sid` | Toggle/update/delete subtask |
| GET | `/api/core/channels?verticalId=` | Channels for vertical |
| GET | `/api/core/channels/:id/messages` | Messages (limit param) |
| POST | `/api/core/channels/:id/messages` | Send message |
| GET/POST | `/api/core/resources?verticalId=` | Resources CRUD |
| DELETE | `/api/core/resources/:id` | Delete resource |
| GET/POST | `/api/core/contacts?verticalId=` | Contacts CRUD |
| PATCH/DELETE | `/api/core/contacts/:id` | Update/delete contact |
| GET | `/api/core/notifications?verticalId=&userId=` | Notifications |
| POST | `/api/core/notifications/:id/read` | Mark one read |
| POST | `/api/core/notifications/read-all?verticalId=` | Mark all read |
| POST | `/api/core/notifications/seed` | Seed 8-10 notifications per vertical (all 16) |

### Tasks Page Live DB Wiring
`client/src/pages/universal/tasks.tsx` now uses:
- `useQuery(['/api/core/tasks?verticalId=X'])` — loads tasks from Supabase
- Mock data fallback when DB returns 0 tasks for a vertical
- `useMutation → POST /api/core/tasks` for task creation (persisted to DB)
- `useMutation → PATCH /api/core/tasks/:id` + optimistic cache update for status/priority/assignee/dueDate
- Subtask state remains in-memory (local `subtaskMap` state) — future phase will wire to DB

### Seeded Data
- 16 verticals (matching `verticals-config.ts` — id, name, color, tagline, description)
- 20 users (EMP-001–EMP-020) with full profile data
- 34 user-vertical memberships (cross-assigned per department)
- 15 tasks across 7 verticals (dev, faire, hr, sales, finance, admin, hrms) — task codes T074–T088

## LegalNations Supabase Integration (Mar 2026)

### Architecture
LegalNations uses real Supabase data (project `ngvrnwjisntjmqrtnume` / "teamsync") for all client management. Data lives in `public` schema with `ln_` prefix. API uses Supabase JS client with service role key (bypasses RLS). A separate dedicated Supabase project `mztxoqsijcffsyjckfqa` ("legalnations") exists but is NOT used by the app — all data is in the teamsync project.

### Tables (5 — all in `public` schema)
| Table | Rows | Description |
|-------|------|-------------|
| `ln_clients` | 249 | Core client records (SUPLLC1015–SUPLLC1248) |
| `ln_onboarding_checklist` | 5,976 | 24 checklist items per client (3 phases: Onboarding/Legal/Bank) |
| `ln_client_documents` | 0 | Document records (connected to future Supabase Storage) |
| `ln_client_credentials` | 0 | External app credentials (Gmail, Stripe, Mercury, etc.) |
| `ln_tax_filings` | 28 | Tax filing service records (45 columns incl. filing_stage, filled_1120, filled_5472, bank_statements_status, send_mail_status, etc.) |

### LLC Status Enum (13 values — in order)
LLC Booked → Onboarded → LLC Under Formation → Under EIN → Under Website Formation → EIN received → Received EIN Letter → Under BOI → Under Banking → Under Payment Gateway → Ready to Deliver → Delivered → Refunded

### API Routes (`/api/legalnations/*` — `server/legalnations-api.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/legalnations/clients?search=&status=&plan=&health=&limit=500` | List clients |
| GET | `/api/legalnations/clients/:id` | Client detail (+ checklist, docs, credentials) |
| PATCH | `/api/legalnations/clients/:id` | Update client |
| POST | `/api/legalnations/clients` | Create client |
| PATCH | `/api/legalnations/checklist/:id` | Toggle checklist item |
| POST | `/api/legalnations/clients/:id/documents` | Add document |
| DELETE | `/api/legalnations/documents/:id` | Delete document |
| POST | `/api/legalnations/clients/:id/credentials` | Add credential |
| DELETE | `/api/legalnations/credentials/:id` | Delete credential |
| GET | `/api/legalnations/tax-filings` | List tax filings |
| PATCH | `/api/legalnations/tax-filings/:id` | Update tax filing |
| GET | `/api/legalnations/stats` | Dashboard stats |

### Frontend Pages (Real Data)
| Page | Route | File |
|------|-------|------|
| Dashboard | `/legalnations` | `client/src/pages/dashboard.tsx` |
| Clients | `/legalnations/clients` | `client/src/pages/clients.tsx` |
| Client Detail | `/legalnations/clients/:id` | `client/src/pages/client-detail.tsx` |
| Tax Filing | `/legalnations/tax-filing` | `client/src/pages/tax-filing.tsx` |

### Client Detail Tabs
1. **Overview**: Client info, LLC details, banking & finance, formation timeline
2. **Onboarding**: 3-phase accordion (Onboarding/Legal/Bank) with checklist toggle
3. **Documents**: Upload/download with categories
4. **Credentials**: External app credentials table

### Tax Filing Service (Cross-Sell)
Annual US tax filing for foreign-owned LLCs. Pricing: Single Member ₹15,000+GST (₹17,700), Multi Member ₹19,000+GST (₹22,420).

**ln_tax_filings columns (45):** id, client_id (FK→ln_clients), llc_name, llc_type, amount_received, main_entity_name, contact_details, address, address_2, email_address, status, date_of_formation, notes, bank_transactions_count, ein_number, naics, principal_activity, personal_address, pan_aadhar_dl, filing_done, reference_number, fax_confirmation, tax_standing, annual_report_filed, state_annual_report_due, country, filled_1120, filled_5472, verified_ein_in_form, message, subject, recipient, fax, bank_statements_status, business_activity, date_copy, send_mail_status, tax_standing_last_checked, filing_search_url, additional_notes, filing_stage, mail_tracking_number, required_documents, created_at, updated_at

**Filing Stages (9):** Document Collection → EIN Verification → Form 1120 Preparation → Form 5472 Preparation → Review & QC → Print & Package → Mail to IRS → Awaiting Confirmation → Filed & Confirmed

**Tax Filing Page Tabs:**
1. Active Filings — DataTable with search, type/status/stage filters, WhatsApp/email actions, click for detail
2. Filing Procedure — 11-step visual guide for cross-sell and operations
3. Resources & Forms — IRS forms (1120, 5472, 1065, 8832), YouTube tutorials, LetterStream, Wyoming filing search
4. Cross-Sell Templates — WhatsApp + email templates with personalization placeholders

**Filing Detail Panel (4 tabs):**
1. Client & LLC Details — entity info, LLC details, address & banking
2. Filing Information — checkboxes (1120/5472/EIN verified/filed/annual report), NAICS, reference #, mailing & compliance
3. Communication — personalized WhatsApp/email with send buttons, IRS correspondence fields
4. Documents & Notes — pending items badges, required documents checklist with auto-status

### Seeding
Script: `scripts/seed-legalnations.ts` — parses 2 CSV files (old + new clients) + tax filing CSV. Auto-generates 24 checklist items per client with completion based on LLC status. Tax filings seeded via Supabase MCP (28 records from CSV, all mapped to existing ln_clients by LLC name).

### Phase 2 — Portal-Specific Tables (Planned, Not Yet Created)
- **HRMS**: `employees`, `departments`, `attendance`, `leaves`, `payroll`, `performance_reviews`
- **ATS**: `jobs`, `candidates`, `applications`, `interviews`, `offers`
- **CRM**: `crm_contacts`, `crm_companies`, `crm_deals`, `crm_activities`
- **Events/GoyoTours**: `tour_packages`, `bookings`, `hotels`
- **Finance**: `journal_entries`, `payment_records`
- **OMS**: `oms_orders`, `oms_inventory`, `oms_shipments`

## EazyToSell (ETS) Supabase Integration (Mar 2026)

### Architecture
EazyToSell uses the `easytosell` schema in Supabase (project `ngvrnwjisntjmqrtnume`). The Express router at `server/ets-api.ts` uses a dedicated Supabase client configured with `db: { schema: "easytosell" }`. All 10 ETS pages are fully wired to real data via TanStack Query — no mock data fallbacks remain.

### Schema Setup
- Schema exposed via `ALTER ROLE authenticator SET pgrst.db_schemas = 'public, easytosell'`
- Permissions: `GRANT USAGE ON SCHEMA easytosell TO anon, authenticated, service_role`
- All table permissions granted to `anon, authenticated, service_role`

### Data Source
Real data migrated from EazyToSell source Supabase (`cnzzmbddkurnztfjhxpp`) into TeamSync Supabase (`ngvrnwjisntjmqrtnume`) `easytosell` schema. Stage values normalized (source "In Execution"→"inventory-ordered", "Discovery Call"/"New Inquiry"→"new-lead", "Launched"→"launched", "Token Paid"→"token-paid"). Package values normalized to lowercase (Lite→lite, Pro→pro, Elite→elite).

### Tables (12 — all in `easytosell` schema)
| Table | Rows | Description |
|-------|------|-------------|
| `ets_clients` | 25 | Real client records with pipeline stage, package tier, scores, store details, banking info, onboarding state |
| `ets_products` | 990 | Real product catalog with EXW pricing, carton dims, pre-calculated landed costs, MRP, margins |
| `ets_categories` | 23 | Product categories (Headwear, Jewelry, Dressing, Accessory, Craft, etc.) with duty/IGST rates |
| `ets_orders` | 0 | Import orders (cleared — source had 0) |
| `ets_payments` | 12 | Real payment records with amounts, dates, descriptions |
| `ets_proposal_templates` | 0 | Package proposals (cleared — to be re-populated) |
| `ets_whatsapp_templates` | 9 | Real WhatsApp message templates with stage-based categories |
| `ets_checklist_items` | 44 | Real readiness checklist items with categories (Infrastructure, etc.) |
| `ets_checklist_status` | 7 | Per-client checklist completion status |
| `ets_price_settings` | 7 | Real pricing config (exchange rate 12.0, sourcing 5%, freight 8000/CBM, etc.) |
| `ets_launch_kit_submissions` | 0 | Launch kit submissions |
| `client_messages` | 0 | Client portal messages |

### API Routes (`/api/ets/*` — `server/ets-api.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ets/clients` | List all clients (mapped to camelCase) |
| GET | `/api/ets/clients/:id` | Client detail + payments + checklist |
| POST | `/api/ets/clients` | Create client |
| PATCH | `/api/ets/clients/:id` | Update client (stage, notes, etc.) |
| GET | `/api/ets/products` | List all products |
| PATCH | `/api/ets/products/:id` | Update product (visibility, hero, margin tier) |
| GET | `/api/ets/orders` | List all orders (with client name join) |
| PATCH | `/api/ets/orders/:id` | Update order (status, flag) |
| GET | `/api/ets/payments` | List all payments (with client name join) |
| PATCH | `/api/ets/payments/:id` | Update payment status |
| GET | `/api/ets/proposal-templates` | List proposal templates |
| GET | `/api/ets/templates` | List WhatsApp templates |
| GET | `/api/ets/settings` | List price settings |
| POST | `/api/ets/settings` | Upsert price settings |
| GET | `/api/ets/categories` | List product categories |
| GET | `/api/ets/calc-templates` | List calculator templates |
| PATCH | `/api/ets/checklist/:id` | Toggle checklist item completion |

### Mapper Functions
All GET responses apply camelCase mappers converting snake_case DB columns to camelCase. `mapClient` maps all client fields including store details, banking, scores, onboarding state. `mapProduct` maps raw + pre-calculated pricing fields (costPrice, mrp, totalLandedCost, suggestedMrp, storeMarginPercent, etc.) without spreading raw row. Products endpoint uses `.range(0, 4999)` to return all products.

### ets_clients Extended Columns (added for migration)
store_area, store_frontage, total_investment, bank_name, bank_account_number, bank_ifsc, auth_id, notes, total_score, score_budget, score_location, score_operator, score_timeline, score_experience, score_engagement, selected_package, launch_phase, estimated_launch_date, actual_launch_date, qualification_form_completed, scope_doc_shared, agreement_signed, operating_hours, profile_completed, onboarding_step, inventory_budget

### ets_products Extended Columns (added for migration)
cost_price, mrp, status, fob_price_yuan, fob_price_inr, cbm_per_unit, freight_per_unit, cif_price_inr, customs_duty, sw_surcharge, igst, total_landed_cost, store_landing_price, suggested_mrp, store_margin_percent, store_margin_rs

### Frontend Pages (10 — all real data)
| Page | Route | File |
|------|-------|------|
| Dashboard | `/ets` | `client/src/pages/ets/dashboard.tsx` |
| Pipeline | `/ets/pipeline` | `client/src/pages/ets/pipeline.tsx` |
| Products | `/ets/products` | `client/src/pages/ets/products.tsx` |
| Orders | `/ets/orders` | `client/src/pages/ets/orders.tsx` |
| Payments | `/ets/payments` | `client/src/pages/ets/payments.tsx` |
| Client Detail | `/ets/clients/:id` | `client/src/pages/ets/client-detail.tsx` |
| Templates | `/ets/templates` | `client/src/pages/ets/templates.tsx` |
| Proposals | `/ets/proposals` | `client/src/pages/ets/proposals.tsx` |
| Calculator | `/ets/calculator` | `client/src/pages/ets/calculator.tsx` |
| Settings | `/ets/settings` | `client/src/pages/ets/settings.tsx` |

### Client-Side Utilities (kept in `mock-data-ets.ts`)
- `calculateEtsPrices()` — full landed cost calculator (EXW → FOB → CIF → landed → MRP)
- `getDefaultPriceInputs()` / `defaultPriceSettings` — default pricing parameters
- `ETS_CATEGORY_DUTY_RATES` — category-specific duty rates
- Constants: `ETS_PIPELINE_STAGES`, `ETS_STAGE_LABELS`, `ETS_ORDER_STATUSES`, `ETS_PRODUCT_CATEGORIES`, `ETS_MRP_BANDS`
- All TypeScript interfaces: `EtsClient`, `EtsProduct`, `EtsOrder`, `EtsPayment`, `EtsProposalTemplate`, `EtsWhatsAppTemplate`, `EtsCalcTemplate`, etc.

### IDs
All entity IDs are numeric (bigint from DB), not string prefixed (e.g., `5` not `"ETC-005"`).

## ETS Role-Based Portals (`/portal-ets/*`) — Pink #ec4899

Role-gated portals for EazyToSell's internal team. Accessible via the ETS sidebar role switcher. All data is mock/frontend-only (no backend writes for portal pages).

### Product Team Portal (`/portal-ets/product`)

**Mock Data**: `client/src/lib/mock-data-product-catalog.ts` — 65 products across 7 zones, 6 supplier sources
- Types: `CatalogProduct`, `CatalogZone`, `CatalogCategory`, `CatalogSubcategory`, `ProductSource`, `ProductComplianceStatus`, `ProductLabelStatus`, `ProductTag`
- 6 sources: `china_haoduobao` (24), `china_allen` (14), `india_deodap` (9), `india_wholesaledock` (7), `india_basketo` (7), `india_other` (4)
- 3 compliance statuses: `safe` (57), `restricted` (5 — BIS/WPC), `banned` (3 — RC toys/drones/walkie-talkies)
- Fields: EXW yuan (China) or wholesale INR (India), landed cost, partner price, MRP, margin%, barcode, label status, BIS flag, compliance notes
- 7 zones → 3 categories each → 2-3 subcategories: Kitchen, Personal Care, Stationery, Home Decor, Bags & Storage, Toys & Games, Gifts & Novelty
- Helper functions: `getCatalogStats()`, `getProductsByZone()`, `SOURCE_LABELS`, `SOURCE_COLORS`, `CATALOG_ZONE_TREE`

**Pages** (file: `client/src/pages/portal/ets/product-portal.tsx`):
| Route | Export | Description |
|-------|--------|-------------|
| `/portal-ets/product` | `EtsProductPortal` (default) | Dashboard — catalog health KPIs, source bar chart, margin by origin, missing data panel |
| `/portal-ets/product/list` | `EtsProductList` | Sortable/filterable product table (65 rows), inline search, source/compliance/missing-field filters, sort by price/margin, edit button opens form |
| `/portal-ets/product/categories` | `EtsProductCategories` | 3-level expandable tree (Zone → Category → Subcategory), product counts, detail panel with edit/delete, add zone/category/subcategory forms |
| `/portal-ets/product/compliance` | `EtsProductCompliance` | Flags all non-safe products with notes, searchable, displays BIS/WPC requirements |
| `/portal-ets/product/pricing` | `EtsProductPricing` | Stub — price engine settings (Task #8) |
| `/portal-ets/product/bulk-upload` | `EtsProductBulkUpload` | CSV drag-and-drop with column template |

**Product Form** (embedded in `EtsProductList` via state — no separate route):
- 4 tabs: Basic Info (name, description, zone/category/subcategory picker, barcode, tags), Sourcing (source select, supplier, EXW or wholesale price, MOQ, carton dims), Pricing (auto-calculated for China via `calculateEtsPrices()`, manual MRP override), Compliance (status, BIS checkbox, notes, label status)
- Pricing tab wires live to sourcing inputs using `calculateEtsPrices()` from `mock-data-ets.ts`

**Nav Items** (`ets-role-config.ts` product role):
Dashboard, Products, Categories, Pricing Rules, Compliance, Bulk Upload

## Trip HQ — Travel Operations Portal (`/triphq/*`) — cyan #0891B2

Internal travel operations portal for managing sourcing trips (China/Thailand B2B, Mar 21–31 2026). 12 pages, full CRUD + file uploads, dedicated `triphq` schema in Supabase.

### Supabase Schema
- Schema: `triphq` in project `ngvrnwjisntjmqrtnume`
- Storage bucket: `triphq-files` (public)
- PostgREST config: `ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, storage, graphql_public, triphq'`
- Default trip ID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Tables (12 — all in `triphq` schema)
| Table | Description |
|-------|-------------|
| `trips` | Trip records (name, destination, dates, status) |
| `itinerary_days` | Day-by-day plan (day_number, city, morning/evening plan, hotel) |
| `contacts` | Supplier contacts (name, company, role, wechat_id, meeting_status) |
| `catalogue_products` | Products scouted (category, cny_price, moq, franchise_fit_score, status) |
| `expenses` | Budget expenses (city, category, amount, currency, payment_method) |
| `checklist_items` | Pre-departure tasks (category, deadline, is_completed) |
| `packing_items` | Packing list (item, quantity, is_packed, category) |
| `transport_legs` | Travel legs (from/to city, mode, departure/arrival, booking_ref, status) |
| `content_plans` | Content planner (title, city, status, equipment) |
| `deliverables` | Post-trip deliverables (title, status, due_date, link_url) |
| `documents` | Document repository (file_name, file_url, doc_type, city) |
| `external_apps` | External tools (app_name, url, category, icon_name) |

### API Routes (`/api/triphq/*` — `server/triphq-api.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/triphq/trips/:id` | Get trip details |
| GET | `/api/triphq/trips/:id/stats` | Dashboard stats (contacts, products, budget, checklist, content) |
| GET/POST | `/api/triphq/{entity}` | List + create for all 11 sub-entities |
| PATCH/DELETE | `/api/triphq/{entity}/:id` | Update + delete for all sub-entities |
| POST | `/api/triphq/{entity}/:id/upload` | File upload per entity (Multer → Supabase Storage) |

### Frontend Pages (12)
| Page | Route | File |
|------|-------|------|
| Dashboard | `/triphq` | `client/src/pages/triphq/dashboard.tsx` |
| Itinerary | `/triphq/itinerary` | `client/src/pages/triphq/itinerary.tsx` |
| Contacts | `/triphq/contacts` | `client/src/pages/triphq/contacts.tsx` |
| Catalogue Builder | `/triphq/catalogue` | `client/src/pages/triphq/catalogue.tsx` |
| Budget Tracker | `/triphq/budget` | `client/src/pages/triphq/budget.tsx` |
| Pre-Departure Checklist | `/triphq/checklist` | `client/src/pages/triphq/checklist.tsx` |
| Packing List | `/triphq/packing` | `client/src/pages/triphq/packing.tsx` |
| Transport | `/triphq/transport` | `client/src/pages/triphq/transport.tsx` |
| Content Planner | `/triphq/content` | `client/src/pages/triphq/content.tsx` |
| Post-Trip Deliverables | `/triphq/deliverables` | `client/src/pages/triphq/deliverables.tsx` |
| Documents Hub | `/triphq/documents` | `client/src/pages/triphq/documents.tsx` |
| External Apps | `/triphq/apps` | `client/src/pages/triphq/apps.tsx` |

### Config Files
- `client/src/lib/triphq-config.ts` — `TRIPHQ_COLOR = "#0891B2"`, status configs
- `client/src/components/brand/triphq-logo.tsx` — Compass SVG logo

### SOP Integration
12 SOP configs in `sop-data.ts` keyed `"triphq-{page}"` (dashboard, itinerary, contacts, catalogue, budget, checklist, packing, transport, content, deliverables, documents, apps). All pages have SOP + Tutorial buttons in PageHeader.

### Seed Data
- 1 trip (China Sourcing Trip 2026, Mar 21–31)
- 10 itinerary days (Bangkok → Guangzhou → Yiwu → Shenzhen → Hong Kong → Bangkok)
- 5 contacts (Allen Zhang, Charlie Wang, Mei Lin, etc.)
- 14 checklist items with deadlines
- 20 packing items across 7 categories
- 8 transport legs (flights, trains, buses)
- 5 content plans
- 12 external apps (Trip.com, DiDi, Alipay, WeChat, etc.)

## User Management & RBAC System (Mar 2026)

### Mock Data (`client/src/lib/mock-data-users.ts`)
- Types: `AppUser`, `UserGroup`, `Permission`, `PermissionCategory`
- 10 mock users across 4 statuses (activated/invited/suspended/not-invited), 3 auth methods, 4 creation methods
- 5 user groups: Super Admin (all perms), Manager (most), Team Member (limited), Viewer (read-only), Client Portal User (portal-only)
- 10 permission categories: Dashboard, Clients, Documents, Operations, Finance, HR, Reports, Settings, Users, User Groups
- `hasPermission(userGroupIds, category, action)` utility function

### Pages
- **Users & Access** `/:vertical/user-management` — Two-tab layout (Users / User Groups), DataTable with search/filter/status pills, Invite User dialog
- **User Groups** `/:vertical/user-groups` — Group cards with permission matrix, Create/Edit group dialog, member list, permission breakdown

### Access Control Components (`client/src/components/blocks/access-gate.tsx`)
- `AccessProvider` — React context providing current user groups
- `useAccessControl()` — Hook returning `{ hasAccess, userGroups, allGroups, checkPermission(category, action) }`
- `AccessGate` — Wrapper with 4 fallback modes: `hide`, `lock-overlay`, `blur`, `full-page-lock`
- `PermissionBadge` — Shows required permission as a badge

### Routes
- Registered across all 15 verticals: `/:vertical/user-management` and `/:vertical/user-groups`
- "Users & Access" nav category added to all verticals with Shield icon
- USDrop: `/usdrop/user-management` (separate from existing `/usdrop/users` which is SalesUsers)

## Developer Vertical (`/dev/*`) — DB-Backed Task Management (Mar 2026)

### Architecture
Dev vertical uses PostgreSQL (via Drizzle ORM) for project and task management. Design System is a single tabbed page. Dev Board was removed — all task views are accessed through project boards.

### Pages (6 active)
| Page | Route | File | Data Source |
|------|-------|------|-------------|
| Dashboard | `/dev` | `client/src/pages/dev/dashboard.tsx` | DB via React Query |
| Design System | `/dev/design-system` | `client/src/pages/dev/design-system.tsx` | Static (4 tabs: Style Guide, Components, Icons, Library) |
| Prompts | `/dev/prompts` | `client/src/pages/dev/prompts.tsx` | Mock data (42 prompts, 12 categories) |
| Skills | `/dev/skills` | `client/src/pages/dev/skills.tsx` | Mock data (26 Claude Skills, 8 categories) |
| Projects | `/dev/projects` | `client/src/pages/dev/projects.tsx` | DB via React Query |
| Project Board | `/dev/projects/:id` | `client/src/pages/dev/project-board.tsx` | DB via React Query |

### Database Tables (Drizzle ORM — `shared/schema.ts`)
| Table | Description |
|-------|-------------|
| `dev_projects` | Project containers (name, key, description, color, status, owner) |
| `dev_tasks` | Tasks with taskCode, status, priority, type, assignee, tags, storyPoints |
| `dev_subtasks` | Checklist items per task (title, completed, sortOrder) |
| `dev_comments` | Discussion entries per task (author, content) |

### API Routes (`/api/dev/*` — `server/dev-projects.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dev/projects` | List projects with task counts |
| GET | `/api/dev/projects/:id` | Single project |
| POST | `/api/dev/projects` | Create project |
| PATCH | `/api/dev/projects/:id` | Update project |
| DELETE | `/api/dev/projects/:id` | Delete project |
| GET | `/api/dev/projects/:id/tasks` | Tasks for a project |
| GET | `/api/dev/tasks` | All tasks |
| GET | `/api/dev/tasks/:id` | Task with subtasks and comments |
| POST | `/api/dev/tasks` | Create task |
| PATCH | `/api/dev/tasks/:id` | Update task |
| DELETE | `/api/dev/tasks/:id` | Delete task |
| POST | `/api/dev/tasks/:id/subtasks` | Add subtask |
| PATCH | `/api/dev/subtasks/:id` | Update subtask |
| POST | `/api/dev/tasks/:id/comments` | Add comment |
| POST | `/api/dev/reseed` | Force reseed all dev data |

### Seed Data (`server/dev-seed.ts`)
6 projects (TeamSync Portal, LegalNations, USDrop AI, GoyoTours, EazyToSell, Internal Tools) with 48 tasks documenting the entire build history. Replit Agent acts as the dev employee, logging all work done on the platform. Force reseed available via `POST /api/dev/reseed`.

### Prompt Library Strategy (Mar 2026)
42 professional prompts in `client/src/lib/mock-data-dev.ts` (devPrompts array). Every prompt includes a senior engineer persona prefix ("You are a X engineer with Y years of experience...").

**Categories (12):** agent, frontend, backend, database, debug, audit, testing, ux, seo, security, performance, devops

**Scope:** `narrow` (single component/feature) vs `broad` (full system/architecture)

**Prompt Management Rules:**
1. When user gives a long prompt worth preserving → add to devPrompts in mock-data-dev.ts with persona prefix
2. Deduplicate against existing prompts (check title + category before adding)
3. Every prompt must have: persona prefix, numbered sections, specific technical instructions, output format spec
4. After every significant session → run "Replit Agent Memory & Context Update" (PRM-041) to update replit.md + seed dev tasks
5. Keep prompts current — update file paths, component names, patterns as the codebase evolves

**Key Prompts by Use Case:**
- Page building: PRM-001 (scaffold), PRM-011 (datatable), PRM-014 (kanban), PRM-042 (detail page), PRM-026 (forms)
- Quality: PRM-002 (UI/UX audit), PRM-012 (code review), PRM-017 (design system compliance)
- Testing: PRM-003 (broken links), PRM-016 (typescript strict), PRM-021 (unit tests)
- Infrastructure: PRM-006 (drizzle schema), PRM-018 (supabase), PRM-035 (mock-to-db migration)
- Security: PRM-010 (API hardening), PRM-032 (XSS/injection)
- Planning: PRM-008 (vertical rebuild), PRM-039 (subagent delegation), PRM-041 (memory update)

### Claude Skills Reference (Mar 2026)
26 curated Claude Skills in `client/src/lib/mock-data-dev.ts` (claudeSkills array). Mix of official Anthropic skills and community contributions.

**Categories (8):** development, testing, security, document, design, communication, automation, data

**Sources:** official (Anthropic — github.com/anthropics/skills) | community (github.com/travisvn/awesome-claude-skills)

**Relevance Levels:** critical (must-have for TeamSync dev) → high → medium → low

**Currently Installed (4):** frontend-design, webapp-testing, claude-api, superpowers

**Key Skills by Use Case:**
- UI development: sk-001 (frontend-design), sk-005 (web-artifacts-builder)
- Testing: sk-002 (webapp-testing), sk-017 (playwright-skill)
- API/Integration: sk-003 (mcp-builder), sk-010 (claude-api)
- Security: sk-016 (Trail of Bits), sk-020 (ffuf-web-fuzzing)
- Workflow: sk-004 (skill-creator), sk-015 (superpowers), sk-022 (Skill Seekers)
- Documents: sk-006 (docx), sk-007 (xlsx), sk-008 (pdf)

## Recent Additions (Feb 2026)

### CRM Payment Links (`/crm/payment-links`)
- Multi-step Create dialog (3 steps): Customer Info → Payment Details (amount, description, company, methods) → Preview & Share
- UPI QR code generation via `qrcode` npm package with branded canvas rendering (company header, amount, UPI ID) + downloadable JPG
- Bank transfer details with individual copy buttons (HDFC accounts)
- Razorpay link placeholder (conditionally shown when company has `razorpayEnabled`)
- Share dialog: WhatsApp message builder (wa.me deep link), Email mailto link, Copy All Details, Copy Payment Link
- Mark as Paid dialog: screenshot upload (accessible dropzone with keyboard nav), confirmation note, amount display
- 3 company configs: Startup Squad Pvt Ltd, Suprans Biz Solutions, LegalNations Consulting — each with UPI IDs and bank details
- Stats row: Total Requests, Pending, Paid, Total Amount Collected
- Payment link table: search, filter pills (All/Pending/Paid/Expired)
- Grouped under CRM "Performance" nav category

### CRM Appointments (`/crm/appointments`)
- Calendar view (month grid) with colored dots on dates with appointments, month navigation, click-to-expand day details
- List view with client name, date/time, type, status, notes — sortable/filterable
- View toggle between Calendar and List modes
- Create appointment dialog: client name, email, phone, date picker, time picker, duration selector, type selector, notes
- 4 appointment types with color coding: Call (sky), Meeting (violet), Demo (amber), Consultation (emerald)
- Stats row: Total, Today, This Week, Completed
- Filters by type and status, plus search by name/ID
- 10 mock appointments across different dates, types, and statuses
- Nav entry under CRM sidebar with CalendarDays icon

### FaireDesk — Faire Order Operations Pipeline (Mar 2026)

Complete end-to-end order operations pipeline with 5 new pages:

**New Pages:**
- **Quotations** `/faire/quotations` — List + "New Quotation" dialog; 4 KPI cards; filter tabs (All/Draft/Sent/Quote Received/Accepted/Challenged); table with margin % color-coding; links to detail
- **Quotation Detail** `/faire/quotations/:id` — 3-column layout: order context (with product images) / quotation (status timeline, fulfiller card, line items, costs) / decision panel (margin health bar, action buttons); status transitions (DRAFT→SENT→QUOTE_RECEIVED→ACCEPTED/CHALLENGED/SENT_ELSEWHERE); Challenge + Send Elsewhere dialogs
- **Partner Portal** `/faire/partner-portal` — Fulfiller-facing quote submission UI; fulfiller selector; SENT quotations as cards with product image grids; inline quote submission form; updates quotation to QUOTE_RECEIVED
- **Financial Ledger** `/faire/ledger` — Per-order financials; 4 stat cards; filter tabs; full table with Faire payout vs fulfiller cost vs net margin; Mark as Cleared dialog linking bank transactions
- **Bank Transactions** `/faire/bank-transactions` — Full bank portal with 3 tabs: Faire Payouts (Supabase-backed, 4 stat cards including Personal Txns, filter tabs: All/Faire Payouts/Paid to Suppliers/Unreconciled/Personal, per-row Business/Personal toggle badge fires PATCH, Map Order modal writes faire_order_id to Supabase, Edit modal for tags + category + notes, Attachments modal), Mercury (Supabase-backed, entity filter All/Neom/Cloudnest, 2 entity cards, Edit modal), Wise (live API unchanged). All mock data removed; data sourced from `bank_transactions` Supabase table.
- **Vendors** `/faire/vendors` — Full CRUD vendor directory; Add/Edit modal with name, contact, email, WhatsApp, notes, default flag; default vendor KPI card; WhatsApp clickable links; vendor assignment badge; registered under Quotations nav section
- **Seller Applications** `/faire/applications` — Index with 6 stat cards (Total/Drafting/Applied/Pending Docs/Approved/Rejected), search + status filter, datatable; includes SOP modal (8-step process guide) and Video Tutorial modal. New Application modal creates drafts. Status badge color-coded per stage.
- **Application Detail** `/faire/applications/:id` — 2-column layout: left (7 info cards: Brand Identity, Email & Contact, Domain & Website, Marketplace Strategy, Product Listings, Legal Documents, Application Submission — all inline-editable via click-to-edit PATCH); right sidebar (Follow-up Timeline with type icons + add/delete, Quick Links with type icons + add/delete, Record Info). Action bar: status transitions (Mark Applied → Docs Requested / Mark Rejected / Mark Approved → Promote modal). Full Edit modal for batch editing all fields.

**Real Faire API integration (server/routes.ts):**
- `GET /api/faire/stores` — lists all active stores (id + name + last_synced_at, credentials never leave server)
- `GET /api/faire/orders` — all orders across all stores from Supabase cache
- `GET /api/faire/stores/:storeId/orders?state=` — filtered orders for one store
- `GET /api/faire/stores/:storeId/products` — products for one store
- `GET /api/faire/stores/:storeId/counts` — order/product counts for dashboard
- `POST /api/faire/stores/:storeId/sync` — full sync: fetches brand profile + all orders + all products from Faire API v2 → upserts into Supabase; returns `{orders_synced, products_synced}`
- `POST /api/faire/orders/:id/accept` → `POST faire.com/external-api/v2/orders/:id/processing`
- `POST /api/faire/orders/:id/cancel` → `POST faire.com/external-api/v2/orders/:id/cancel`
- `POST /api/faire/orders/:id/shipments` → `POST faire.com/external-api/v2/orders/:id/shipments`
- Routes now accept `storeId` (UUID) instead of raw token — credentials fetched server-side from Supabase

### Vendor Portal (`/vendor/*`) — purple #7C3AED (Mar 2026)

Minimal supplier-facing portal. 2 pages only. Vendors select their identity via a dropdown (persisted in `localStorage` key `vp_vendor_id`). Landing route is `/vendor/quotations`.

**Pages:**
- **Quotations** `/vendor/quotations` — 3 tabs: Open Requests (SENT quotes awaiting vendor pricing), Submitted (quotes vendor has priced), History (accepted/rejected); inline "Submit Pricing" form per quotation with item unit costs, shipping cost, lead days, and notes
- **Ledger** `/vendor/ledger` — Bank transactions filtered by vendor name keywords from `bank_transactions` table; per-vendor payment history with credit/debit filter and expandable row detail

**Vendor identity (faire_vendors Supabase table):**
- fulf-001: ShipFast Logistics (USA, 4.7★, 245 orders)
- fulf-002: GlobalPack Co (HK, 4.5★, 189 orders)
- fulf-003: QuickFulfill EU (Germany, 4.8★, 312 orders)
- fulf-004: AsiaDirect Supply (India, 4.6★, 176 orders) — default

**Wise API Client (server/wise.ts):**
- Read-only personal token — `Authorization: Bearer {WISE_API_KEY}` (stored as secret `WISE_API_KEY`)
- `getWiseProfiles()` → `GET https://api.wise.com/v2/profiles` — returns all profiles
- `getWiseBalances(profileId)` → `GET https://api.wise.com/v4/profiles/{id}/balances?types=STANDARD` — multi-currency balances
- `getWiseTransfers(profileId, limit)` → `GET https://api.wise.com/v1/profiles/{id}/transfers` — recent transfers
- `getWiseSummary()` — picks first business profile, returns `{ profile, balances }`
- Routes: `GET /api/wise/summary`, `GET /api/wise/transfers`, `GET /api/wise/sync`
- All functions handle API errors gracefully (console.error + return empty data, never crash server)

**Faire API Client (server/faire-api.ts):**
- `fetchAllOrders(creds)` — cursor-paginated, 50/page, returns all order objects
- `fetchAllProducts(creds)` — cursor-paginated, 50/page, returns all product objects
- `fetchBrandProfile(creds)` — fetches brand profile for the store
- Auth: `X-FAIRE-OAUTH-ACCESS-TOKEN` + `X-FAIRE-APP-CREDENTIALS` headers

**Supabase Integration (server/supabase.ts):**
- Project: `ngvrnwjisntjmqrtnume` (teamsync), region: ap-southeast-1
- `faire` schema with 6 tables: `stores`, `products`, `orders`, `order_items`, `shipments`
- 6 active stores: Toyarina, Holiday Farm, Super Santa, Buddha Ayurveda, Buddha Yoga, Gullee Gadgets
- Credentials stored in `faire.stores` (app_credentials + oauth_access_token per store)
- Server queries via public RPC functions with SECURITY DEFINER (PostgREST does not expose `faire` schema)
- RPC functions: `faire_list_stores`, `faire_get_store_credentials`, `faire_sync_orders`, `faire_sync_products`, `faire_get_store_orders`, `faire_get_all_orders`, `faire_get_store_products`, `faire_get_store_counts`, `faire_update_store_profile`
- Orders/products returned from Supabase include `_storeId` (internal UUID) injected server-side
- Env vars: `SUPABASE_URL` (shared), `SUPABASE_SERVICE_ROLE_KEY` (secret), `SUPABASE_ANON_KEY` (secret)

**All 18 Faire frontend pages migrated to real API data via TanStack Query (zero mock-data-faire imports):**
- **dashboard.tsx** — stores + orders + products via useQuery; computes revenue, pending fulfillment, unique retailers from real data; store cards with per-store stats grouped by `_storeId`; recent orders + top products sections
- **orders.tsx** — all orders from `/api/faire/orders`; per-store filtering; Accept/Cancel use `order._storeId`; quotation cross-references from mock-data-faire-ops; store logo (20×20 rounded) shown next to store name in table (STORE_LOGOS map keyed by store name)
- **products.tsx** — slim endpoint `/api/faire/products?slim` (~1.9MB); all 3022 products across 4 stores; SKU column; product thumbnail images from CDN; store/lifecycle/sale-state filters; search by name or SKU; pagination 50/page; bulk inventory update; Vendor column with "Assign" button per row → opens modal to select vendor + exclusive toggle; uses /api/faire/products/:id/vendors
- **order-detail.tsx** — full order data; Accept/Cancel/Add Shipment call real Faire API; quotation/fulfiller/ledger panels from mock-data-faire-ops; WhatsApp + Email share buttons in header; 40×40 product thumbnails in items table (cross-referenced from /api/faire/products?slim)
- **analytics.tsx** — WhatsApp + Email share buttons in page header that generate summary text with KPIs
- **bank-transactions.tsx** — 3-tab bank switcher: Faire Payouts (reconciliation table, filter tabs, Map to Order, attachment upload), Mercury (mock data from mock-data-finance, 2 entity cards for Neom + Cloudnest, full USD transactions table), Wise (live API via /api/wise/*, multi-currency balance cards, transfers table, Sync Now button)
- **product-detail.tsx** — full product data with image gallery; category from `taxonomy_type.name`; reviews fallback
- **inventory.tsx** — slim products; variant-level inventory with store filter
- **pricing.tsx** — slim products; variant pricing with DataTH/DataTD/DataTR + pagination; prepacks table also normalized; prepacks kept as local mock
- **fulfillment.tsx** — orders filtered to NEW/PROCESSING states; ship dialog with `_storeId`; uses PageShell + PageHeader
- **shipments.tsx** — shipments extracted from `order.shipments[]`; enriched with store/retailer info; DataTH/DataTD/DataTR + pagination
- **retailers.tsx** — retailers from `/api/faire/retailers`; paginated; "Enrich" button per row opens enrichment modal (contact name, email, phone, address, business type, store type, website, instagram, notes, enriched_by) → POST /api/faire/retailers/:id/enrichment
- **retailer-detail.tsx** — single retailer + order history; computed stats; enrichment card displayed when data exists (contact, WhatsApp button from phone, address, website/instagram links); "Enrich/Edit Enrichment" CTA button in header; empty dashed state when not yet enriched; data persisted to Supabase `retailer_enrichments` table
- **analytics.tsx** — revenue trends, order state breakdowns, geo data, top products from real data
- **stores.tsx** — store list with per-store summary stats (revenue, order count, product count, retailer count, order pipeline badges); merged `?summary` endpoint with 5min server-side cache; DualCurrency INR subtext on revenue; Sync All + per-store sync + Orders nav
- **quotations.tsx, quotation-detail.tsx, partner-portal.tsx, ledger.tsx** — orders/stores from real API; operational mock data from mock-data-faire-ops retained
- **bank-transactions.tsx** — fully rewritten; no mock data; all data from Supabase `bank_transactions` table (Faire + Mercury) or live Wise API

**Bank Transactions (Supabase `bank_transactions` table):**
- Schema: `id (UUID PK), source (faire_payout|mercury|wise), entity (neom|cloudnest|NULL), bank_name, date (DATE), description, amount (DECIMAL 15,4 native currency), currency (default USD), amount_usd (DECIMAL 15,4 normalized), type (credit|debit), category, is_business (BOOL default true), tags (TEXT[] default {}), reference, faire_order_id, reconciled (BOOL default false), notes, external_id, created_at, updated_at`
- Indexes: source, entity, date DESC
- RPC: `bank_update_transaction(p_id, p_is_business, p_category, p_notes, p_reconciled, p_tags, p_faire_order_id)` — UPDATEs and RETURNs the row
- FX rates for USD normalization: GBP=1.27, AUD=0.65, CAD=0.74, CNY=0.14, INR=0.012, USD=1.0
- Seeded data: 10 Mercury USD txns (Neom: ac004, Cloudnest: ac005) + 15 Faire payout txns (25 total)
- API routes: `GET /api/bank-transactions?source=&entity=&type=&search=&page=&limit=&is_business=` → `{transactions, total}`, `POST /api/bank-transactions` → `{transaction}`, `PATCH /api/bank-transactions/:id` → `{transaction}`

**Ledger Parties (Supabase `ledger_parties` + `ledger_party_transactions` tables):**
- `ledger_parties`: `id, name, type, contact_name, email, phone, country, currency, credit_limit, credit_days, tags[], notes, is_active, created_at, updated_at`
- `ledger_party_transactions`: `id, party_id (FK), type, direction (payable|receivable), date, due_date, amount, currency, amount_usd, reference, description, faire_order_id, bank_transaction_id, status (pending|paid|partial|overdue), paid_amount, payment_date, notes, created_at, updated_at`
- RPC: `get_party_balance(p_party_id)` — returns net balance (receivables − payables)
- Seeded: 10 parties (ShipFast, GlobalPack, QuickFillEU, AsiaDirect, Faire, Shopify, Stripe, Meta Ads, Wyoming SOS, Suprans) with transaction histories
- API routes: `GET /api/ledger-parties`, `GET /api/ledger-parties/:id`, `POST /api/ledger-parties`, `PATCH /api/ledger-parties/:id`, `GET /api/ledger-parties/:id/transactions`, `POST /api/ledger-parties/:id/transactions`, `PATCH /api/ledger-party-transactions/:id`, `GET /api/ledger-parties/:id/balance`

**Modal Architecture (global fix applied Mar 2026):**
- `dialog.tsx` `DialogContent` no longer renders built-in `<DialogPrimitive.Close>` X button — all modals manage their own close
- All faire page modals (fulfillment, pricing, product-detail, bank-transactions) use `DetailModal` from `@/components/layout`
- `DetailModal` renders its own X in the header; `footer` prop accepts any ReactNode for action buttons

**Retailer Enrichment (Supabase `retailer_enrichments` table):**
- Table: `retailer_id (PK), contact_name, contact_email, contact_phone, store_address, business_type, store_type, website, instagram, notes, enriched_by, enriched_at, updated_at`
- RPC functions: `faire_get_retailer_enrichment`, `faire_upsert_retailer_enrichment` (upsert with COALESCE — never overwrites existing fields with NULL)
- API: `GET /api/faire/retailers/:id/enrichment`, `POST /api/faire/retailers/:id/enrichment`
- WhatsApp URL formula: `https://wa.me/{digits_only}` from phone field
- Supabase functions: `getRetailerEnrichment`, `upsertRetailerEnrichment` in server/supabase.ts

**INR Dual-Currency Display (all 18 pages):**
- All USD amounts show INR conversion as muted subtext at 90x rate
- `<DualCurrency cents={n} />` — table cells: `$12.34` with `₹1,111` below
- `<DualCurrencyInline cents={n} />` — inline: `$12.34 (₹1,111)`
- `<DualFromDollars dollars={n} />` — for dollar-based values
- StatCards use `trend={formatINR(cents)}` or `trend={formatINRFromDollars(dollars)}`
- Shared utility: `client/src/lib/faire-currency.tsx`

**Slim products endpoint (`/api/faire/products?slim`):**
- Strips `images[]`, `description`, `short_description` from products; includes `thumb_url` (first image CDN URL) and `sku` per variant
- Server-side in-memory cache (5min TTL) — first load ~5s, cached loads ~0.2s
- Backend paginates Supabase RPC in 1000-row batches to fetch all 3022 products (RPC has 1000 row default)

**Mock data (client/src/lib/mock-data-faire-ops.ts):**
- 4 fulfillers: ShipFast Logistics, GlobalPack Co, QuickFulfill EU, AsiaDirect Supply
- 10 quotations in mixed statuses linked to existing orders
- 11 ledger entries with payout vs cost calculations
- 14 bank transactions (9 reconciled, 5 unreconciled)

### FaireDesk — Full Faire External API v2 Overhaul (Feb 2026)
- Removed 4 fake pages with no API backing: leads, pipeline, campaigns, disputes
- Rewrote mock-data-faire.ts to exactly match Faire External API v2: correct ID prefixes (p_, po_, bo_, oi_, s_, r_), all prices in cents, options as Array<{name,value}>, 8 OrderStates (NEW/PROCESSING/PRE_TRANSIT/IN_TRANSIT/DELIVERED/PENDING_RETAILER_CONFIRMATION/BACKORDERED/CANCELED), FaireAddress, payout_costs with commission_bps/commission_cents, display_id, source, is_free_shipping, brand_discounts, shipment tracking_code+maker_cost_cents+shipping_type
- Updated all 8 feature pages to consume corrected data model: orders, order-detail, products, product-detail, inventory, pricing, shipments, fulfillment
- Also updated dashboard, analytics, retailer-detail for correct stateConfig (8 states) and API v2 field names

### EventHub Event Inquiries (`/eventhub/leads`)
- 15 event inquiry leads (Corporate/Wedding/Social/Conference/Exhibition)
- Client cards: guest count, tentative date, budget range, source, status badges
- Stat cards: Total Inquiries, New Today, Qualified, Pipeline Value
- Under EventHub "Sales" nav category

### GoyoTours Booking Calendar (`/goyotours/calendar`)
- Monthly calendar grid (Mon-Sun), February 2026 default
- Booking pills colored by tour type (Canton Fair/Custom Tour/Sourcing Tour)
- Click-to-view detail panel on the right
- Month navigation with Today button, status filters
- Under Events "Bookings" nav category

## Finance & Accounts Department (`/finance/*`) — amber #B45309

### 4 Legal Entities
| Entity | Type | Jurisdiction | Currency |
|---|---|---|---|
| Neom International LLC | Multi-member LLC | Wyoming, USA | USD |
| Cloudnest LLC | Multi-member LLC | Wyoming, USA | USD |
| Startup Squad Pvt. Ltd. | Private Limited | Haryana, India | INR |
| Lumbee International Pvt. Ltd. | Private Limited | Haryana, India | INR |

### Pages
- **Dashboard** `/finance` — amber gradient hero, 4-company cash position cards, 6 KPI stats, monthly P&L bars, inter-company mini-table, compliance countdown, recent transactions feed
- **Ledger** `/finance/ledger` — collapsible account tree (Assets/Liabilities/Equity/Revenue/Expenses), Dr/Cr running balance per account, closing balance row, company filter
- **Transactions** `/finance/transactions` — 60 transactions, list/day-grouped toggle, company+type+gateway+search filters, EOD net totals, footer summary
- **Journal Entries** `/finance/journal` — 20 double-entry JE records, Dr=Cr balance validation, IC/SE badges, draft "Post Journal" action, left-list + right-detail panel layout
- **Inter-Company** `/finance/intercompany` — 4×4 balance matrix (open positions), explainer callout, active balances table, exchange rate bar (₹83.20/USD), settlement history
- **Payments** `/finance/payments` — Razorpay (INR) + Stripe (USD) gateway cards, 25 gateway transactions, reconciliation progress bar, unreconciled row highlighting
- **Shared Expenses** `/finance/shared-expenses` — 5 allocation rules with stacked % bars, 3 months of history table, context callout (LIPL 60% / SSPL 40% rent split)
- **Cash Book** `/finance/cashbook` — 20 petty cash entries, day-grouped with running balance, period toggle (week/month/all), category badges
- **Compliance** `/finance/compliance` — 20 filings (India GST/TDS/ROC + US IRS/Wyoming), days-countdown pills, overdue rows in red-50, collapsible rules reference, Mark Filed action
- **Reports** `/finance/reports` — P&L / Balance Sheet / Cash Flow / Trial Balance tabs, consolidated 4-company view with INR conversion, PDF/Excel export buttons

### Mock Data (`client/src/lib/mock-data-finance.ts`)
- 4 company profiles, 40 chart of accounts, 60 transactions, 20 journal entries (with lines), 12 inter-company balances, 25 gateway transactions, 5 shared expense rules, 15 monthly history entries, 20 cash book entries, 20 compliance filings, 10 exchange rates
- Multi-currency: INR (SSPL, LIPL) + USD (NEOM, CLOUD) at ₹83.20/USD

### Company Color Coding
| Company | Short | Tailwind Badge |
|---|---|---|
| Neom International LLC | NEOM | bg-sky-100 text-sky-700 |
| Cloudnest LLC | CLOUD | bg-violet-100 text-violet-700 |
| Startup Squad Pvt. Ltd. | SSPL | bg-emerald-100 text-emerald-700 |
| Lumbee International Pvt. Ltd. | LIPL | bg-amber-100 text-amber-700 |

## Department Pages

### HRMS (`/hrms/*`) — sky-blue #0EA5E9
- **Dashboard** `/hrms` — welcome banner, stats (employees/active/leave/positions), dept headcount bars, recent joiners, birthday reminders, pending leave approvals
- **Employees** `/hrms/employees` — searchable DataTable with dept/status/type filters, Add Employee dialog
- **Employee Detail** `/hrms/employees/:id` — profile header, WhatsApp+Email actions, 5-tab layout (Overview/Attendance/Leaves/Payroll/Performance)
- **Onboarding** `/hrms/onboarding` — new joiners with 6-step checklist progress bars
- **Org Chart** `/hrms/org` — recursive CSS flexbox tree with expand/collapse, dept color stripes
- **Departments** `/hrms/departments` — card grid with member expansion
- **Attendance** `/hrms/attendance` — table + calendar grid toggle, present/absent/wfh/half-day stats
- **Leaves** `/hrms/leaves` — approve/reject actions, type/status filters, Request Leave dialog
- **Holidays** `/hrms/holidays` — national/optional/company holiday lists
- **Payroll** `/hrms/payroll` — salary DataTable, Run Payroll confirmation dialog
- **Payslips** `/hrms/payslips` — processed slips with breakdown dialog (earnings/deductions/net)
- **Performance** `/hrms/performance` — review DataTable with star ratings, Start Review Cycle dialog
- **Goals** `/hrms/goals` — OKR card grid with progress bars, status badges
- **Policies** `/hrms/policies` — category filter pills, view dialog with download

### ATS (`/ats/*`) — violet #8B5CF6
- **Dashboard** `/ats` — funnel visualization, stats, active jobs list, latest candidates
- **Jobs** `/ats/jobs` — DataTable with status/priority/type filters, Create Job Opening dialog
- **Job Detail** `/ats/jobs/:id` — two-column (description+stats left, applicants right), pause/share actions
- **Candidates** `/ats/candidates` — kanban board (6 stages) + table toggle, Add Candidate dialog
- **Candidate Detail** `/ats/candidates/:id` — 4-tab layout (Profile/Applications/Interviews/Evaluations), WhatsApp+Email, activity timeline
- **Talent Pool** `/ats/pool` — passive candidates with card grid, experience level filters
- **Applications** `/ats/applications` — full DataTable with job/stage/interviewer filters, WhatsApp+Email+Schedule actions
- **Interviews** `/ats/interviews` — stats (today/week/completed/cancelled), Schedule Interview dialog, meet links
- **Evaluations** `/ats/evaluations` — completed/pending tabs, scorecard detail dialog with criteria table
- **Offers** `/ats/offers` — offer management with preview dialog (formatted offer letter), send/accept/decline actions
- **Analytics** `/ats/analytics` — funnel, source mix bars, time-to-hire by dept, top jobs, interviewer load

## Universal Reports System (All 16 Verticals)
- **Page**: `pages/universal/reports.tsx` — single shared component, auto-adapts via `detectVerticalFromUrl`
- **Route**: `/[prefix]/reports` for all 16 verticals (LBM Lifestyle also uses `/lbm/team-reports`)
- **Data**: `lib/mock-data-reports.ts` (types + assembly) + 4 group files:
  - `mock-data-reports-g1.ts` — hr, sales, events, eventhub
  - `mock-data-reports-g2.ts` — admin, dev, ets, faire
  - `mock-data-reports-g3.ts` — hrms, ats, social
  - `mock-data-reports-g4.ts` — finance, oms, crm, suprans
- **Each vertical**: 2 templates (1 Daily Employee + 1 Weekly Department), 5-7 fields each, ~10 mock submitted/pending/late reports spanning Feb 17–28 2026
- **Features**: Stats bar, filter pills, Submit Report dropdown, FormDialog with dynamic fields, file-browser list grouped by date, pending rows with "Submit Now"
- **Enhanced Report Viewer** (`components/reports/report-viewer.tsx`): Rich report view with charts and fullscreen mode
  - Key metric cards with color-coded borders and vs-previous trend arrows
  - Bar chart for numeric fields (Metrics Overview)
  - Historical trend chart comparing same-template submissions over time
  - Bullet-point rendering for text/textarea fields
  - Fullscreen mode toggle (expand icon → full-page overlay with sticky header)
- **Report Trends Dashboard** (`components/reports/report-trends.tsx`): Aggregate charts on main page
  - Submissions Over Time bar chart (last 7 periods, vertical brand color)
  - By Scope donut pie chart (Employee/Department/Executive)
  - Submissions by Template horizontal bar chart
- **Nav**: "Reports" nav item added to all 16 verticals in verticals-config.ts

## PWA (Progressive Web App)
- **Manifest**: `client/public/manifest.json` — name "TeamSync Portal", theme #225AEA, icons at 128/192/512px + SVG
- **Service Worker**: `client/public/sw.js` — network-first with shell cache fallback for offline support
- **Icons**: `client/public/icon.svg` (source), `favicon.png` (128px), `icon-192.png`, `icon-512.png` — TS logo blue gradient (#1a3fc4→#1860f0), rounded rect, bold white "TS" text
- **Install prompt**: `components/layout/pwa-install-prompt.tsx` — fixed bottom-right card, on-brand, dismissable with localStorage persistence
- **Hook**: `hooks/use-pwa-install.ts` — captures `beforeinstallprompt`, exposes `promptInstall()` and `dismiss()`
- **Note**: Install prompt fires only when browser detects installability (HTTPS + manifest + SW + engagement criteria)

## User Preferences
- Single font: Plus Jakarta Sans only (Inter fully removed)
- No custom hover color classes on Shadcn Button components
- Use Shadcn Avatar instead of raw img for profile images
- All interactive elements need data-testid attributes
- Frontend-first with mock data (no database yet)

## System Architecture

### Multi-Vertical Architecture
The portal supports multiple business verticals, each with its own navigation, brand logo, and pages:
- **Verticals Config** (`client/src/lib/verticals-config.ts`): Defines all verticals with their navigation categories and brand logos
- **Vertical Store** (`client/src/lib/vertical-store.ts`): React context for current vertical state, persisted to localStorage
- **Vertical Switcher** (`client/src/components/layout/vertical-switcher.tsx`): Dropdown in topbar to switch between verticals, shows brand logos

### Universal Sections (Cross-Vertical)
Universal pages exist under `client/src/pages/universal/` and are shared by all verticals. Each page detects its vertical via `detectVerticalFromUrl(useLocation())` and filters mock data from `client/src/lib/mock-data-shared.ts` by `verticalId`.

**Nav order (standardized for all verticals):** Dashboard → Chat → Team → Resources → Tasks → [vertical-specific sections]

- **Chat** (`/[prefix]/chat`) — Two-panel layout: 380px sidebar (Channels/DMs tabs with unread badges) + full-width message area (message bubbles, phone/video icons, send input bar)
- **Team** (`/[prefix]/team`) — Card grid of vertical team members with avatar, status dot, role, contact info, hover action row (Message/Call). "Invite Member" FormDialog header CTA. Search + department + status filters.
- **Resources** (`/[prefix]/resources`) — File card grid with pinned strip, category filter pills, grid/list toggle. Type-colored file icons (pdf=red, excel=green, ppt=orange, doc=blue, link=violet). Detail dialog with metadata + Open Resource button. "Add Resource" FormDialog.
- **Tasks** (`/[prefix]/tasks`) — Kanban board (5 columns: Backlog/Todo/In Progress/Review/Done) with task cards (priority badge, tags, due date, assignee avatar), List view, My Tasks tab. Task create dialog + Task detail dialog (subtask checklist, status select, comments). Stats row (Total/In Progress/Overdue/Done).
- **Apps & Credentials** (`/[prefix]/apps`) — 1Password-style external app directory and credential vault. Pinned in topbar across all verticals. Shows global apps (29 shared across all verticals: Gmail, Slack, WhatsApp, LinkedIn, ChatGPT, Claude, GitHub, Notion, Figma, Zoom, AWS, etc.) + vertical-specific apps. Each card: app logo (SI icons), name, description, status/environment/category/Global badges, email field with copy, masked password with show/hide toggle. Detail dialog: login URL, email, password, API key rows with copy buttons + Open Login / Open App buttons. Quick Add dialog: 18 popular app templates for fast credential entry. Stats: Total Apps, With Credentials, Global, Vertical-Specific. Filter by scope (All/Global/Vertical) + category + status.

**Shared mock data** (`client/src/lib/mock-data-shared.ts`): TypeScript interfaces + mock data for all verticals:
- `VerticalMember[]` — 4 members per vertical, with status (online/away/offline), skills, location
- `ChatChannel[]` — channels + DMs per vertical, with unread counts, isPinned, lastMessage
- `ChatMessage[]` — messages per channel, with isMe boolean for sender styling
- `SharedResource[]` — 5-6 resources per vertical, categories: Brochure/Script/Spreadsheet/Link/Presentation/Document/Template + Process/SOP/Playbook/Workflow/Learning (knowledge type with expandable content)
- `SharedTask[]` — 8-9 tasks per vertical, across all 5 statuses and 4 priorities, with subtask arrays
- `ExternalApp[]` — 29 global daily-use apps + 2-12 per vertical, with email/password/loginUrl/apiKeyHint; categories: hosting, database, ai, payment, analytics, communication, design, docs, crm, hr, productivity, other
- `QuickAddTemplate[]` — 18 popular app templates for quick credential entry

**Route renames** (existing routes moved to avoid conflicts with universal pages):
- `/legalnations/tasks` (LegalNations Task Board) → `/legalnations/task-board`
- `/dev/toolkit` (Developer Toolkit) → removed; replaced by universal `/dev/apps`
- `/dev/resources` (Developer Knowledge Base) → merged into universal `/dev/resources` (KB items appear as expandable Process/SOP/Playbook/Workflow/Learning entries)

### Universal Important Contacts (`/[prefix]/contacts`)
- **Available on ALL 11 verticals**: hr, sales, events, hub, admin, dev, ets, faire, hrms, ats, social
- Vertical-aware filtering: shows contacts scoped to the current vertical + shared contacts (`verticalIds: ["all"]`)
- 3-per-row contact cards with priority dots, category badges, country flags, tags, action buttons (WhatsApp/Email/Phone/Copy)
- Stats strip: Total, High Priority, Shared, Categories
- Search + Category filter + Priority filter
- "Add Contact" FormDialog
- Mock data: `client/src/lib/mock-data-contacts.ts` — 40 contacts across all verticals

### Active Verticals (Branded Products)
1. **FaireDesk** (id: `faire`, color: #1A6B45) — Faire B2B Wholesale Marketplace — Routes: `/faire/*`
   - Dashboard (gradient banner, store health strip, urgent actions widget, KPI cards, order state chips, recent orders + top products)
   - **Universal**: Chat, Team, Resources, Tasks
   - Stores (6 brand accounts: Suprans Lifestyle, LBM Home & Living, Gullee Craft Co., Heritage Artisan, Pure Essentials, Nature's Basket; API key dialog; sync buttons)
   - Products & Catalog (Products list with lifecycle/sale-state filters, Product Detail with variant inline editing + reviews, Inventory with low/out-of-stock highlighting, Pricing & Prepacks with margin % auto-calc)
   - Orders (state tabs: NEW/PRE_TRANSIT/IN_TRANSIT/DELIVERED/CLOSED/CANCELLED/BACK_ORDERED, accept/cancel dialogs, Order Detail with timeline stepper + payout breakdown)
   - Fulfillment Queue (card layout oldest-first, ship dialog with carrier + tracking)
   - Shipments (tracking copy/link, in-transit progress bar)
   - Retailers (table with WhatsApp + Email, Retailer Detail with order history)
   - Campaigns (3-per-row card grid, Create Campaign dialog)
   - Disputes (tabs: Open/Escalated/Resolved, respond + escalate actions)
   - Analytics (store tabs, KPI cards, revenue bars, top products, geo table, 6-month trend)
   - **Mock data**: `client/src/lib/mock-data-faire.ts` — all field names match Faire API v2 exactly; 6 stores, 10 products, 16 orders, 6 shipments, 13 retailers, 8 campaigns, 10 disputes
   - **Logo**: `client/src/components/brand/faire-logo.tsx`

2. **LegalNations** (id: `hr`, color: #225AEA) — US Company Formation & Compliance Operations — Routes: `/legalnations/*`
   - Dashboard (operations overview: active formations, stuck/delayed, avg time, team load)
   - **Universal**: Chat, Team, Resources, Tasks
   - Clients (All Clients, Client Detail with stage progression, Client Intake, Stage Overview)
   - Operations (Formation Pipeline kanban, Task Board at `/legalnations/task-board`, Escalations)
   - Documents (Document Vault, Templates)
   - Compliance (Compliance Tracker, Annual Reports)
   - Analytics (Formation Analytics, Team Performance)
   - 7-stage workflow: Lead Converted → Intake → Formation Filed → EIN → BOI Filing → Bank/Stripe → Completion
2. **USDrop AI** (id: `sales`, color: #F34147) — D2C Dropshipping SaaS Admin Command Center — Routes: `/usdrop/*`
   - **Dashboard** `/usdrop` — Command Center with Pipeline Funnel, LLC Status Breakdown, Stalled Clients, Activity Feed, 4 stat cards
   - **Pipeline** `/usdrop/leads` — Pre-sales pipeline: Kanban board (7 stages: new→contacted→engaged→qualified→demo_done→negotiation→converted), Hot Leads tab, slide-over drawer with activity/notes/call log/WhatsApp
   - **Clients** — All Clients DataTable (`/usdrop/clients`) with batch/status/LLC tracking + stalled highlighting + Batch Manager tab; LLC Tracker (`/usdrop/llc`) KanbanBoard with drag-and-drop + days-stuck color coding
   - **Users & Subscriptions** (All Users `/usdrop/users`, User Detail `/usdrop/users/:id` with 7 tabs: Overview/LLC/Learning/Access/Business/Activity/Notes, Leads, Plans, Subscriptions)
   - **Products & Catalog** (Products with trending/winning/locked toggles + bulk actions + detail edit panel, Categories with 2-panel layout + subcategories, Suppliers, Winning Products)
   - **Content Management** (Courses with module/chapter drill-down + published toggles, Free Learning `/usdrop/content/free-learning` accordion CMS, Mentorship Sessions `/usdrop/content/sessions`)
   - **Operations** (Shopify Stores, Fulfillment, Competitor Stores)
   - **Support** (Tickets, Help Center)
   - **Analytics** (Revenue Analytics, User Analytics, Product Performance)
   - **Universal**: Chat, Team, Resources, Tasks, Reports, Contacts, Users & Access, Apps
3. **GoyoTours** (id: `events`, color: #E91E63) — China B2B Travel CRM for Mr. Suprans' delegation business — Routes: `/goyotours/*`
   - **Universal**: Chat, Team, Resources, Tasks, Important Contacts (`/goyotours/contacts`)
   - **Dashboard** — pink gradient welcome banner, 4 KPI cards (Revenue Collected, Bookings, Active Leads, Seats Available), horizontal package strip with progress bars, lead pipeline chips, payment summary, recent bookings table, urgent actions (overdue follow-ups + pending visas)
   - **Packages** (`/goyotours/packages`) — 7 real packages from suprans.in; status filter pills; 2-per-row cards with gradient headers, discount badges, seat progress bars, pricing with GST/TCS note, advance chip, highlights, View+Book CTAs
   - **Package Detail** (`/goyotours/packages/:id`) — day-by-day itinerary, inclusions/exclusions, pricing card (with GST breakdown), capacity widget, hotel info, Create Booking CTA, Copy Brochure Link, filtered bookings table
   - **Leads** (`/goyotours/leads`) — Kanban (New/Contacted/Interested/Booked/Cold/Lost columns) + Table view toggle; cards show business type, city, package badge, source badge, overdue follow-up warning (red), WhatsApp btn; stats (Total, New, Follow-ups Due, Conversion Rate); Add Lead FormDialog
   - **Bookings** (`/goyotours/bookings`) — DataTable: Booking ID, Client+phone, Package, Pax, Total, Advance, Balance, Payment Status, Visa, Travel Date; status + payment filter pills; stats strip; Row click → detail; Record Payment row action; New Booking FormDialog
   - **Booking Detail** (`/goyotours/bookings/:id`) — Client info, Package details (totals/advance/balance), Payment history timeline, Visa & Flight status; Actions: Record Payment, WhatsApp pre-filled reminder, Mark Visa Applied, Print Voucher; Travel countdown
   - **Hotels** (`/goyotours/hotels`) — China hotel directory; city + star filters; 3-per-row cards with rate (listed vs our), contact, amenities, packages used, status dot; Add Hotel FormDialog
   - **Vendors** (`/goyotours/vendors`) — Category pills; 3-per-row cards; ground partner "Guangzhou Connect Tours" pinned with KEY PARTNER badge; star ratings, services chips; Add Vendor FormDialog
   - **Analytics** (`/goyotours/analytics`) — 6 KPI cards, Revenue by Package bar chart, Lead Funnel, Bookings by Source, Top Cities table
   - **Mock data**: `client/src/lib/mock-data-goyo.ts` — 7 packages (full itineraries), 18 leads, 12 bookings (with payments[]), 8 China hotels, 8 vendors
4. **Event Hub** (id: `eventhub`, color: #7C3AED) — Networking Events & Engagement Platform — Routes: `/eventhub/*`
   - Dashboard (4 KPI cards: upcoming events, total attendees, active vendors, budget utilized; upcoming events grid, this week countdown, vendor status sidebar, organizers section, recently completed with check-in bars)
   - Events: All Events (DataTable with 10 events, status/type/city filters, Create Event dialog), Event Detail (5 tabs: Overview, Attendees, Vendors, Budget, Tasks checklist)
   - Attendees: All Attendees (DataTable 35 records across events, multi-filter), Live Check-in (event selector, stats, search, quick check-in input, per-attendee toggle, Check In All button)
   - Venues (card grid of 6 venues with status dot, capacity, rating, amenities, hover contact reveal, city/type/status filters)
   - Vendors (DataTable 8 vendors with star ratings, event counts, category badges, Copy Email action)
   - Operations: Budget Tracker (30 budget items, category progress bars, planned vs actual, over-budget highlighting), Analytics (type distribution bars, attendee source mix, event performance table, top vendors, budget by category)
5. **LBM Lifestyle** (id: `admin`, color: #673AB7) — Team, Settings, Reports — Routes: `/lbm/*`
6. **Developer** (id: `dev`, color: #10B981) — Internal Developer Hub — Routes: `/dev/*`
   - Dashboard (quick links to all sections, My Tasks list, Project Progress bars, recent prompts, credential status)
   - Design System (Style Guide, Components, Icons)
   - Prompts (AI prompt library — categorized by agent/frontend/backend/database/debug, model tracking)
   - Resources (Dev processes, learnings, playbooks, workflow docs)
   - **Projects** (project cards with progress, kanban board per project with 5 columns, list view toggle, sprint/assignee/priority filters, add task dialog)
     - **Project Board** has a collapsible "Links & Credentials" section per project (above filters/kanban): horizontal chip row with SI logos for GitHub/Replit/Supabase/Vercel/Figma/Notion links + inline-editable credentials mini-table (click URL or Notes to edit inline; API key hint stays read-only)
   - **Tasks** (all tasks DataTable across all projects, filters by project/status/priority/type/assignee, click opens TaskDetailDialog sheet with subtasks/comments/sidebar)
   - **Toolkit** — 3 tabs:
     - *Apps & Credentials*: scope filter (All / Universal / Per-Project); Universal shows global credentials DataTable; Per-Project shows credentials grouped by project with color dot + key badge header; inline editing on Notes cells; real SI logos throughout
     - *Important Links*: Pinned section + all links grid — cards are NOT wrapped in `<a>` to enable inline editing; click description to edit inline, click URL (shown in mono under the card) to edit inline; explicit ExternalLink icon opens URL; category badge visible
     - *Quick Tools*: staging area for dev utilities before deploying to target verticals
6. **EazyToSell** (id: `ets`, color: #F97316) — China-to-India Value Retail Franchise Ops — Routes: `/ets/*`
   - Dashboard (pipeline snapshot, revenue tracker, active orders with ETA bars, alerts for stuck items)
   - Clients: Pipeline (kanban + table toggle, 8 stages: New Lead → Qualified → Token Paid → Store Design → Inventory Ordered → In Transit → Launched → Reordering), Client Detail (profile, financial summary, stage stepper, tabs: payments/checklist/timeline/notes)
   - Catalog: Products (DataTable with price chain, hero SKU toggle, visibility, expandable pricing breakdown), Price Calculator (standalone what-if tool: EXW → FOB → CIF → Duty → IGST → Landed → Markup → MRP band, with templates)
   - Orders: Order Tracker (6-stage: Ordered → Factory Ready → Shipped → Customs → Warehouse → Dispatched, with ETA bars), Payments (collected/pending/overdue tracking)
   - Tools: Proposal Generator (investment breakdown by package tier, category mix sliders, WhatsApp copy export), Templates (WhatsApp message templates with variable placeholders)
   - Settings (pricing defaults: exchange rate, commission, freight, duties, margins; category duty rates; package tier configs)
   - Price engine ported from GitHub repo `lakshaytakkar/Eazy-Sell`: calculateEtsPrices() with MRP bands [29-999]

### Brand Logo Components
Each vertical has a unique SVG logo in hexagonal mascot style:
- `client/src/components/brand/legalnations-logo.tsx` — Scales/balance icon
- `client/src/components/brand/usdrop-ai-logo.tsx` — Box+arrow/dropship icon
- `client/src/components/brand/goyotours-logo.tsx` — Compass icon
- `client/src/components/brand/lbm-lifestyle-logo.tsx` — Heart-star/lifestyle icon
- `client/src/components/brand/developer-logo.tsx` — Terminal/code icon
- `client/src/components/brand/eazytosell-logo.tsx` — Shopping bag/lock/retail icon
- `client/src/components/brand/eventhub-logo.tsx` — Network nodes/connection graph icon (violet)

### Frontend Technology
React with TypeScript, Tailwind CSS, Shadcn UI, Wouter routing, motion/react animations.

### Routing
- All verticals use consistent `/vertical/*` URL namespacing
- Root `/` redirects to `/hr` (default vertical)
- Deep links auto-detect the correct vertical via `detectVerticalFromUrl`

### Navigation
- **Two-Level Horizontal Top Navigation**: Dynamic based on active vertical
- **Vertical Switcher**: Shows brand logo, allows switching between products (navigates to target vertical's dashboard)
- **Level 1**: Category tabs (change per vertical)
- **Level 2**: Sub-page navigation within active category — styled with primary blue background for visual separation

### Page Organization
```
client/src/pages/
├── dashboard.tsx              # LegalNations Dashboard (route: /legalnations)
├── clients.tsx                # All Clients (route: /legalnations/clients)
├── client-detail.tsx          # Client Detail (route: /legalnations/clients/:id)
├── client-intake.tsx          # Client Intake Queue (route: /legalnations/intake)
├── stage-overview.tsx         # Stage Overview (route: /legalnations/stages)
├── formation-pipeline.tsx     # Formation Pipeline Kanban (route: /legalnations/pipeline)
├── task-board.tsx             # Task Board (route: /legalnations/task-board)
├── escalations.tsx            # Escalation Flags (route: /legalnations/escalations)
├── document-vault.tsx         # Document Vault (route: /legalnations/documents)
├── templates.tsx              # Document Templates (route: /legalnations/templates)
├── compliance-tracker.tsx     # Compliance Tracker (route: /legalnations/compliance)
├── annual-reports.tsx         # Annual Reports (route: /legalnations/annual-reports)
├── formation-analytics.tsx    # Formation Analytics (route: /legalnations/analytics)
├── team-performance.tsx       # Team Performance (route: /legalnations/team-performance)
├── dev/
│   ├── dashboard.tsx          # Developer Dashboard (route: /dev)
│   ├── style-guide.tsx        # Style Guide (route: /dev/style-guide)
│   ├── components-guide.tsx   # Components Guide (route: /dev/components)
│   ├── icons-guide.tsx        # Icons Guide (route: /dev/icons)
│   ├── prompts.tsx            # AI Prompt Library (route: /dev/prompts)
│   ├── (resources.tsx removed — KB merged into universal resources)
│   ├── projects.tsx           # All Projects (route: /dev/projects)
│   ├── project-board.tsx      # Project Kanban/List Board (route: /dev/projects/:id)
│   ├── tasks.tsx              # All Tasks DataTable (route: /dev/board)
│   └── toolkit.tsx            # Apps, Credentials, Links & Quick Tools (route: /dev/toolkit)
├── sales/
│   ├── dashboard.tsx           # USDrop AI Dashboard (route: /usdrop)
│   ├── products.tsx            # Product Library (route: /usdrop/products)
│   ├── categories.tsx          # Product Categories (route: /usdrop/categories)
│   ├── suppliers.tsx           # Supplier Directory (route: /usdrop/suppliers)
│   ├── winning-products.tsx    # Top Products (route: /usdrop/winning-products)
│   ├── users.tsx               # External Users (route: /usdrop/users)
│   ├── leads.tsx               # Lead Management (route: /usdrop/leads)
│   ├── plans.tsx               # Plan Tiers (route: /usdrop/plans)
│   ├── subscriptions.tsx       # Subscriptions (route: /usdrop/subscriptions)
│   ├── stores.tsx              # Shopify Stores (route: /usdrop/stores)
│   ├── fulfillment.tsx         # Fulfillment Orders (route: /usdrop/fulfillment)
│   ├── competitors.tsx         # Competitor Stores (route: /usdrop/competitors)
│   ├── tickets.tsx             # Support Tickets (route: /usdrop/tickets)
│   ├── courses.tsx             # Learning Hub Courses (route: /usdrop/courses)
│   ├── help-center.tsx         # Help Center FAQ (route: /usdrop/help-center)
│   ├── revenue.tsx             # Revenue Analytics (route: /usdrop/revenue)
│   ├── user-analytics.tsx      # User Analytics (route: /usdrop/user-analytics)
│   └── product-performance.tsx # Product Performance (route: /usdrop/product-performance)
├── events/
│   ├── dashboard.tsx      # GoyoTours Dashboard (route: /goyotours)
│   ├── events-list.tsx    # All Events (route: /goyotours/list)
│   ├── venues.tsx         # Venue Directory (route: /goyotours/venues)
│   └── checkin.tsx        # Event Check-in (route: /goyotours/checkin)
├── eventhub/
│   ├── dashboard.tsx      # Event Hub Dashboard (route: /eventhub)
│   ├── events-list.tsx    # All Events DataTable (route: /eventhub/events)
│   ├── event-detail.tsx   # Event Detail 5-tab view (route: /eventhub/events/:id)
│   ├── attendees.tsx      # All Attendees DataTable (route: /eventhub/attendees)
│   ├── checkin.tsx        # Live Check-in (route: /eventhub/checkin)
│   ├── venues.tsx         # Venue Card Grid (route: /eventhub/venues)
│   ├── vendors.tsx        # Vendor Directory (route: /eventhub/vendors)
│   ├── budget.tsx         # Budget Tracker (route: /eventhub/budget)
│   └── analytics.tsx      # Analytics Overview (route: /eventhub/analytics)
├── admin/
│   ├── dashboard.tsx      # System Overview (route: /lbm)
│   ├── team.tsx           # Team Management (route: /lbm/team)
│   ├── settings.tsx       # System Settings (route: /lbm/settings)
│   └── reports.tsx        # Reports & Analytics (route: /lbm/reports)
├── ets/
│   ├── dashboard.tsx      # Command Center Dashboard (route: /ets)
│   ├── pipeline.tsx       # Client Pipeline Kanban+Table (route: /ets/pipeline)
│   ├── client-detail.tsx  # Client Detail (route: /ets/clients/:id)
│   ├── products.tsx       # Product Catalog with pricing (route: /ets/products)
│   ├── calculator.tsx     # Price Calculator (route: /ets/calculator)
│   ├── orders.tsx         # Order Tracker (route: /ets/orders)
│   ├── payments.tsx       # Payment Tracking (route: /ets/payments)
│   ├── proposals.tsx      # Proposal Generator (route: /ets/proposals)
│   ├── templates.tsx      # WhatsApp Templates (route: /ets/templates)
│   └── settings.tsx       # Pricing & Config Settings (route: /ets/settings)
├── universal/
│   ├── chat.tsx           # Universal Chat (route: /[prefix]/chat for all 7 verticals)
│   ├── team.tsx           # Universal Team Members (route: /[prefix]/team)
│   ├── resources.tsx      # Universal Resources Library (route: /[prefix]/resources)
│   └── tasks.tsx          # Universal Tasks Kanban (route: /[prefix]/tasks)
└── not-found.tsx          # 404
```

### LegalNations-Specific Components
- **Stage Stepper** (`client/src/components/hr/stage-stepper.tsx`): Reusable 7-step progress indicator with full and mini (dot) variants
- **Data Types** (`shared/schema.ts`): FormationClient, StageChecklist, ClientDocument, ComplianceItem, FormationTask, Escalation, TeamMember, FormationMetric, StageDefinition, DocumentTemplate

### Mock Data Files
- `client/src/lib/mock-data-shared.ts` — **Universal sections data** (all 7 verticals): `VerticalMember[]`, `ChatChannel[]`, `ChatMessage[]`, `SharedResource[]`, `SharedTask[]` with full mock data per vertical
- `client/src/lib/mock-data.ts` — LegalNations entities (20 formation clients, 45+ checklist items, 25 documents, 15 compliance items, 25 tasks, 10 escalations, 6 team members, formation metrics, document templates)
- `client/src/lib/mock-data-sales.ts` — USDrop AI entities (products, categories, suppliers, users, leads, subscriptions, stores, fulfillment, tickets, courses, plans, revenue metrics, help center articles)
- `client/src/lib/mock-data-dev.ts` — Developer vertical entities:
  - `DevProject` (6 projects: TeamSync, LegalNations, USDrop AI, GoyoTours, EazyToSell, Internal Tools)
  - `DevTask` + `DevSprint` — Kanban tasks with subtasks/comments/attachments, sprint grouping
  - `AppCredential` (10 universal credentials, tagged with `scope: "universal"`) — global API keys with real SI icon names
  - `ProjectLink` (19 entries, 2-4 per project) — per-project GitHub/Replit/Supabase/Vercel/Figma/Notion links
  - `ProjectCredential` (12 entries, 1-3 per project) — project-specific API keys (Supabase anon, Stripe live, Razorpay, etc.)
  - `ClaudeSkill` (26 skills: 16 official + 11 community, 8 categories, 4 relevance levels, 4 installed)
  - `ImportantLink` (15 entries) — global developer bookmarks (pinned + all)
  - `QuickTool` (7 tools) — utility tools with ready/wip/planned status
  - `DevPrompt` (12 prompts) — AI prompt library with model tracking
  - `DevResource` (8 resources) — dev process docs and playbooks
- `client/src/components/dev/task-detail-dialog.tsx` — Task detail Sheet panel with subtask toggles, comments, right sidebar for status/priority/type editing
- `client/src/lib/mock-data-events.ts` — GoyoTours (events, venues, attendees)
- `client/src/lib/mock-data-eventhub.ts` — Event Hub entities: NetworkingEvent (10 events across Delhi/Mumbai/Bengaluru/Pune/Chennai, varied types: Seminar/Workshop/Conference/Investor Meet/Launch Event/Roundtable), EventAttendee (35 attendees across events with ticket types VIP/Standard/Speaker/Sponsor), EventVendor (8 vendors across 7 categories with ratings), EventVenue (6 premium venues), BudgetItem (30 items with on-track/over-budget/under-budget/pending status)
- `client/src/lib/mock-data-admin.ts` — Admin (team members, activity logs, reports)
- `client/src/lib/mock-data-ets.ts` — EazyToSell entities (15 franchise clients across 8 pipeline stages, 20 products with pricing, 8 orders, 12 payments, 3 proposal templates Lite/Pro/Elite, 8 WhatsApp templates, price settings, calculator templates) + `calculateEtsPrices()` price engine

### Core UI Components
- **DataTable**: Generic reusable table with search, filters, sorting, pagination, row actions
- **StatsCard**: Stats display with AnimatedNumber, sparklines, hover lift
- **StatusBadge**: Semantic color variants (success, error, warning, info, neutral)
- **AnimatedNumber**: Spring-animated counter using motion/react
- **RadialProgress**: SVG circular progress rings with animated fill
- **FormDialog**: Standardized dialog for create/edit forms
- **EmptyState**: Illustration + message + optional action
- **Loading**: TableSkeleton, StatsCardSkeleton, Skeleton components

### Backend
Express.js (Node.js) serving the Vite frontend on port 5000.

### Image Assets
All 3D icons and illustrations use WebP format (compressed from 1024×1024 PNGs):
- Icons: 128×128 WebP (~3KB each) in `client/public/3d-icons/`
- Illustrations: 256×256 WebP (~5KB each) in `client/src/assets/illustrations/`

## Component Registry References (shadcn-compatible)
- **KokonutUI** (https://kokonutui.com): Install: `npx shadcn@latest add @kokonutui/<name>`
- **Cult-UI** (https://www.cult-ui.com): Install: `npx shadcn@beta add @cult-ui/<name>`
- **Aceternity UI** (https://ui.aceternity.com): Copy-paste from docs
- **Tool-UI** (https://www.tool-ui.com): Install: `npx assistant-ui add tool-ui <name>`
- **AI SDK Elements** (https://elements.ai-sdk.dev): Install: `npx ai-elements@latest add <name>`

## Reference Project
Analysis of Suprans Team Portal saved in `.local/reference-project-analysis.md` — covers their 6 business verticals, team hierarchy, sidebar switcher pattern, and database schema.

## External Dependencies
- React, TypeScript, Tailwind CSS, Shadcn UI, Wouter, motion/react, Express.js
- Plus Jakarta Sans (Google Fonts), DiceBear (avatars), lucide-react (icons), react-icons/si (company logos), Zod (validation)

## UI Rules (Enforced)

These rules apply to every page and must never be violated when adding or editing pages:

### 1. Page Padding Standard
All page root wrappers must use `<div className="px-16 py-6 lg:px-24">`. Never use `p-6`, `px-6`, `px-6 lg:px-12`, or any narrower wrapper as the outermost container of a page.

### 2. Full-Height App Layouts (Tasks, Chat)
For pages with a fixed-height layout (scroll area fills remaining height), do NOT wrap the whole page in `px-16`. Instead:
- Sticky bars (header bar, filter bar, stats strip): apply `px-16 lg:px-24` horizontally on each bar individually
- Scrollable content area (`<ScrollArea>`): apply `px-16 py-6 lg:px-24`
- Stats strip first/last cells: first cell uses `pl-16 lg:pl-24 pr-5`, last cell uses `pl-5 pr-16 lg:pr-24`

### 3. Stats / Metrics Rule
Only show stats cards on dashboards and list pages where the data is a meaningful operational KPI (e.g. active clients, revenue, pipeline count). Do NOT add stats to library or directory pages such as Resources.

### 4. Search Bar Rule
Only include a search bar when there are 6 or more items in a list to filter. Do not add search to small static lists.

## Task Activity Panel (Mar 2026)

All task detail modals now include a real-time Activity panel (right-side) with three sections: **Comments**, **Files** (Supabase Storage), and **Links**.

### Supabase Table: `task_activity`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Auto-generated |
| task_id | TEXT | References task ID (mock or any string) |
| type | TEXT | `'comment'` \| `'attachment'` \| `'link'` |
| content | TEXT | Comment body |
| author | TEXT | Display name (default: `'Team'`) |
| file_url | TEXT | Public Supabase Storage URL |
| file_name | TEXT | Original filename |
| file_size | INT | Bytes |
| link_url | TEXT | Full URL |
| link_title | TEXT | Optional display title |
| created_at | TIMESTAMPTZ | Auto-set |

### Supabase Storage: `task-attachments` bucket (public)
- Files stored at path: `{taskId}/{timestamp}-{filename}`
- Max 50MB per file
- Public access, no auth required
- Files deleted from Storage when activity row is deleted

### API Routes (all new)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks/:taskId/activity` | Returns `{ items: ActivityItem[] }` sorted by created_at ASC |
| POST | `/api/tasks/:taskId/comments` | Body: `{ content, author? }` → creates comment row |
| POST | `/api/tasks/:taskId/links` | Body: `{ url, title? }` → creates link row |
| POST | `/api/tasks/:taskId/attachments` | Multipart: `file` field → uploads to Supabase Storage → creates attachment row |
| DELETE | `/api/tasks/:taskId/activity/:id` | Deletes row + Storage file if attachment |

### Universal Task Detail Modal (tasks.tsx)
- Converted from `DetailModal` to raw `Dialog` at `max-w-5xl`
- Layout: `flex flex-row h-[75vh]` — left `flex-1` (description/progress/subtasks/details) + right `w-80 border-l` (activity panel)
- Activity panel has Comments, Files (with upload), and Links sections
- All 3 activity types use TanStack Query (`queryKey: ['/api/tasks', taskId, 'activity']`) + `useMutation` for writes

### Dev Task Detail Dialog (task-detail-dialog.tsx)
- Replaced static `currentTask.attachments` display with real Supabase-backed list
- Added file upload → `POST /api/tasks/:id/attachments`
- Per-attachment download link + delete button
- Comments section remains local-state only (not persisted)

---

## Chat System (Slack/WhatsApp-level Real-time) — Phase 1 Complete (Mar 2026)

### Architecture
- **Backend**: Supabase Postgres (`channels` + `channel_messages` + `channel_read_state` tables)
- **Realtime**: Supabase Realtime with `REPLICA IDENTITY FULL` on `channel_messages` and `channels` tables
- **Frontend Supabase client**: `client/src/lib/supabase-client.ts` (anon key, used for realtime only)
- **Env vars**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (shared)
- **Current user**: `localStorage.getItem('chat_user_{verticalId}')` → defaults to first vertical member; switchable via header dropdown

### DB Tables
| Table | Key Columns |
|-------|-------------|
| `channels` | id (UUID), vertical_id, name, type (channel/dm/announcement), description, member_names[], is_pinned, is_private, is_archived, topic, last_message, last_message_at, unread_count |
| `channel_messages` | id (UUID), channel_id, sender_name, content, reply_to_id (self-ref), reactions JSONB, message_type, is_deleted, edited_at, file_url, file_name, file_size |
| `channel_read_state` | (user_id, channel_id) PK, last_read_message_id, last_read_at |
| `increment_channel_unread(p_channel_id)` | SQL function to atomically increment unread count |

### Seeded Data
- 34 channels across 8 verticals (hr, sales, events, eventhub, admin, dev, faire, ets)
- ~60 messages seeded from mock data with realistic timestamps

### API Routes (`/api/core/channels/*`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/core/channels?verticalId=X` | List channels for vertical (non-archived, sorted pinned first) |
| POST | `/api/core/channels` | Create channel |
| PATCH | `/api/core/channels/:id` | Update channel |
| DELETE | `/api/core/channels/:id` | Archive channel |
| POST | `/api/core/channels/dm` | Find or create DM between members |
| GET | `/api/core/channels/:id/messages?limit=100` | Get messages (chronological) |
| POST | `/api/core/channels/:id/messages` | Send message |
| POST | `/api/core/channels/:id/upload` | Upload file attachment (multer, Supabase Storage) |
| PATCH | `/api/core/channels/:id/messages/:mid` | Edit message (sets edited_at) |
| DELETE | `/api/core/channels/:id/messages/:mid` | Soft delete (is_deleted=true) |
| POST | `/api/core/channels/:id/messages/:mid/react` | Toggle emoji reaction |
| POST | `/api/core/channels/:id/read` | Mark channel as read for user |
| GET | `/api/core/channels/:id/unread?user_name=X` | Get unread count |

### Chat Frontend Features
- **Live from DB**: All channels and messages fetched from Supabase via TanStack Query
- **Realtime**: Supabase Realtime INSERT subscription auto-appends new messages
- **Send**: Persists to DB, optimistically updates cache, scrolls to bottom
- **Message grouping**: Consecutive messages from same sender within 5min hide avatar + repeated header
- **Relative timestamps**: "just now", "5m ago", "3:45 AM", "Yesterday 3:45 AM", "Mar 5"
- **Reactions**: Quick emoji picker on hover; toggle own; reaction pills with count + tooltip
- **Reply/quote**: Sets reply_to_id in DB; shows quoted bubble above message
- **Edit/delete**: Own messages only; edit dialog; soft delete shows "This message was deleted"
- **Typing indicator**: Supabase presence broadcast; shows "[name] is typing…" with dots
- **Unread badges**: Shows count in sidebar; cleared when channel opened
- **Create channel**: Dialog with name, description, member multi-select
- **New DM**: Dialog listing vertical team members; find-or-create logic
- **Channel info panel**: Right drawer with members list, online status, description
- **User switcher**: Header dropdown to switch identity (for multi-account testing)
- **File attachments**: Paperclip button triggers hidden file input; uploads to Supabase Storage (`chat-attachments` bucket) via `POST /api/core/channels/:id/upload`; creates file message with `message_type: "file"`, `file_url`, `file_name`, `file_size`; images render inline with download button; other files show card with icon + size + download; drag-and-drop support on messages area with visual overlay; 50MB limit; spinner on Paperclip during upload
- **Jump to bottom**: Floating button when scrolled up; "New message" badge when out-of-view
- **Online status**: Green/yellow/grey dot on DMs (from verticalMembers mock status)

### Phase 2 (Planned)
- Per-message read receipts (WhatsApp-style double ticks)
- @mentions with notification
- Channel search / global message search

### 5. Detail Pages Rule
Every entity with a list page must also have a dedicated detail page or detail dialog. This applies to: clients, leads, products, events, attendees, vendors, etc.

### 6. Contact Actions Rule
Every page that lists or shows details for a person (client, lead, user, attendee, vendor) must include actionable contact buttons:
- **List pages**: WhatsApp and/or Email as inline icon-only ghost buttons in a "Contact" column (not in the dropdown menu)
- **Detail pages**: WhatsApp and Email as outline buttons in the header/profile action bar
- **WhatsApp** link: `https://wa.me/{phone.replace(/\D/g,'')}` — open in `target="_blank"` — icon: `SiWhatsapp` from `react-icons/si`, colored `text-green-600`
- **Email** link: `mailto:{email}` — icon: `Mail` from `lucide-react`
- Add `data-testid="btn-whatsapp-{id}"` and `data-testid="btn-email-{id}"` to every link
- Only add WhatsApp if the entity has a `phone` field in its type; only add Email if it has an `email` field

## AI Chat Widget

TeamSync includes a floating AI co-pilot powered by **Vercel AI SDK** and **OpenAI** (via Replit AI Integrations).

### Architecture
- **Trigger**: Flower icon button (`@assets/image_1772789030064.png`), fixed bottom-right, Framer Motion spring animations
- **Drawer mode**: Right-side panel, 420px, slides in with Framer Motion. Default view.
- **Full-page mode**: Covers entire viewport. Left sidebar (280px) shows conversation history; right side shows the active chat.
- **Streaming**: `useChat` from `@ai-sdk/react` v3 with `DefaultChatTransport` from `ai` hitting `POST /api/ai/chat`. Uses `streamText` + `pipeUIMessageStreamToResponse` for Express streaming with tool-call support. Input managed via local `useState` + `sendMessage({ text }, { body: { attachmentIds } })`.
- **Attachment Processing**: Files uploaded via `POST /api/ai/upload` are stored as base64 in `ai_attachments` table. Client tracks `pendingAttachmentIds` and sends them with the next message via `ChatRequestOptions.body`. Server fetches attachment data, converts images to `Buffer` for GPT-4o vision, and embeds text/CSV/JSON content directly in the message content parts. Pending attachment indicator shows above the input.
- **DB Tool Calling**: AI has full CRUD access to all Supabase tables (public + faire schemas) via 7 tools: `getSchema` (full schema introspection with FKs, row counts, sample data), `run_sql_query` (read-only SQL, 100 row max), `analyticsQuery` (aggregate/GROUP BY queries, 500 row max), `createRecord` (Supabase client insert), `updateRecord` (Supabase client update by ID), `deleteRecord` (Supabase client delete by ID), `generateImage` (DALL-E 3). Uses `tool()` from AI SDK v6 with `jsonSchema`. `stopWhen: stepCountIs(12)` allows complex multi-step operations. Live schema discovery at startup via `information_schema` (cached 5min) with row counts and sample data per table. Write operations validate against WRITABLE_TABLES whitelist; PROTECTED_TABLES (ai_*, verticals, generated_images) and faire schema tables are read-only.
- **Image Generation Tool**: AI can generate images via `generateImage` tool (DALL-E 3). Images stored in `generated_images` table with `source: "chat"`. Inline rendering via `[GENERATED_IMAGE:id]` marker in assistant responses.
- **Chat Search**: `GET /api/ai/conversations/search?q=...` searches titles and message content with debounced input, highlighted matches, and message snippets.
- **Media Library**: Sidebar tab in expanded chat view shows all AI-generated images (from both chat and Image Studio) in a gallery grid with download links.
- **Supabase RPC**: `exec_readonly_sql(query_text)` — SECURITY DEFINER function that validates SELECT-only, executes via `jsonb_agg(row_to_json(t))`, returns JSONB array.
- **Persistence**: All conversations and messages saved to Supabase (`ai_conversations`, `ai_messages` tables).
- **Chat History**: Sidebar in expanded view shows all conversations with inline rename (pencil icon → edit input) and delete. Drawer view shows recent 8 chats at bottom.
- **Rename**: `PATCH /api/ai/conversations/:id` with `{ title }`. Inline edit in sidebar with Enter to save, Escape to cancel.

### Files
- `client/src/components/ai-chat/AIChatWidget.tsx` — main widget (trigger, drawer, full-page modes)
- `client/src/components/ai-elements/` — AI Elements components:
  - `conversation.tsx`, `message.tsx`, `shimmer.tsx`, `suggestion.tsx` — core chat UI
  - `reasoning.tsx` — collapsible "Thinking..." panel with auto-open/close during streaming
  - `tool.tsx` — tool call visualization with status badges (Running/Completed/Error)
  - `chain-of-thought.tsx` — multi-step reasoning display with step icons and status
  - `sources.tsx` — collapsible source citations with link list
  - `code-block.tsx` — syntax-highlighted code blocks with Shiki, copy button, language selector
  - `prompt-input.tsx` — rich prompt input with file attachments, drag-drop, referenced sources
  - `attachments.tsx` — file attachment display (grid/inline/list variants) with preview and remove
- `server/ai-chat.ts` — Express router with `/api/ai/chat`, `/api/ai/conversations`, `/api/ai/conversations/:id/messages`

### Supabase Tables
```sql
ai_conversations(id uuid PK, title text, vertical_id text, created_at, updated_at)
ai_messages(id uuid PK, conversation_id uuid FK, role text, content text, created_at)
```

### Key Dependencies
- `ai` (Vercel AI SDK v6), `@ai-sdk/openai`, `@ai-sdk/react` — streaming AI
- `use-stick-to-bottom`, `streamdown`, `@streamdown/*` — chat scroll + markdown rendering
- `motion` — shimmer animation in AI elements
- `multer` — file upload handling (memory storage, 10MB limit)
- OpenAI integration configured via Replit AI Integrations (env: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Chat streaming uses `pipeTextStreamToResponse` (AI SDK v6) with `streamProtocol: "text"` in `useChat`
- **Portal Links**: AI includes clickable markdown links to portal pages when referencing specific records (orders, tasks, tickets, etc.). System prompt section 8 maps entity types to routes (e.g., `[Order #ID](/faire/orders/UUID)`). Links rendered via custom `PortalLink` component in `message.tsx` that uses wouter `navigate()` for client-side routing. Internal links (starting with `/`) navigate within the app; external links open in new tabs.

### Supabase AI Tables
```
ai_attachments(id uuid PK, conversation_id uuid FK, filename text, file_data text [base64], file_size int, mime_type text, created_at)
```

## Universal Ticket Management System (Mar 2026)

Cross-vertical ticket/issue tracking pinned in all 16 verticals as an icon in the top nav bar.

### Supabase `tickets` Table
```
tickets(id uuid PK, ticket_code text UNIQUE auto-gen TK-0001+, vertical_id text, title text, description text, status text [open/in-progress/waiting/escalated/resolved/closed], priority text [critical/high/medium/low], category text, reported_by text, assigned_to text, created_by text, tags text[], resolution text, due_date date, created_at, updated_at)
```
- Auto-increment trigger `trg_assign_ticket_code` generates `TK-0001`, `TK-0002`, etc.
- 20 seed tickets across 14 verticals (hr, sales, faire, events, hub, ets, hrms, crm, finance, oms, dev, social, ats, admin)

### Ticket API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/core/tickets?verticalId=&status=&priority=&assignedTo=&search=&page=&limit=` | List with filters + pagination |
| GET | `/api/core/tickets/:id` | Single ticket |
| POST | `/api/core/tickets` | Create (accepts both camelCase and snake_case fields) |
| PATCH | `/api/core/tickets/:id` | Update (status, priority, assigned_to, resolution, etc.) |
| DELETE | `/api/core/tickets/:id` | Delete |

### Frontend Pages
- **Index**: `client/src/pages/universal/tickets.tsx` — PageShell + HeroBanner (vertical-branded) + StatGrid (5 cards) + IndexToolbar (search + status FilterPills + priority dropdown) + DataTable with row actions (View/Assign/Status/Delete) + Create FormDialog
- **Detail**: `client/src/pages/universal/ticket-detail.tsx` — Back button + ticket code badge + status/priority badges + action bar (Change Status/Escalate/Resolve/Close/Delete) + editable details section + sidebar info card + timeline card

### Navigation
- "Tickets" nav entry added to all 16 verticals in `verticals-config.ts`
- Pinned as icon button in top navigation via `PINNED_TITLES`
- Routes: `/:vertical/tickets` (index) and `/:vertical/tickets/:id` (detail) registered in App.tsx

### AI Chat API Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat` | Stream chat response (OpenAI gpt-4o). 7 tools: getSchema, run_sql_query, analyticsQuery, createRecord, updateRecord, deleteRecord, generateImage. Live schema introspection with 5min cache. |
| GET | `/api/ai/conversations/search?q=` | Search conversations by title and message content |
| GET | `/api/ai/conversations` | List all conversations (last 50, sorted by updated_at) |
| POST | `/api/ai/conversations` | Create conversation |
| PATCH | `/api/ai/conversations/:id` | Rename conversation (body: `{ title }`) |
| GET | `/api/ai/conversations/:id/messages` | Get messages |
| DELETE | `/api/ai/conversations/:id` | Delete conversation |
| POST | `/api/ai/upload` | Upload file (multipart, conversationId required) |
| GET | `/api/ai/conversations/:id/attachments` | List attachments |
| GET | `/api/ai/attachments/:id/download` | Download attachment |
| DELETE | `/api/ai/attachments/:id` | Delete attachment |

## Image Studio (Mar 2026)

AI-powered image generation, library management, preview, and download. Integrated into the TeamSync AI full-page view (accessible via the "Image Studio" tab in the AI sidebar). No longer a separate page in vertical navigation.

### Supabase Table
```sql
generated_images(id uuid PK, prompt text, negative_prompt text, style text, aspect_ratio text, image_data text, image_url text, width int, height int, status text [pending/completed/failed], vertical_id text, error_message text, source text [studio/chat] DEFAULT 'studio', created_at, updated_at)
```

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/generate` | Create image generation request |
| GET | `/api/images` | List all generated images (last 100) |
| GET | `/api/images/:id` | Get single image |
| DELETE | `/api/images/:id` | Delete image |
| GET | `/api/images/:id/download` | Download image file |

### Frontend
- **Standalone Page**: `client/src/pages/universal/image-studio.tsx` — routed at `/{vertical}/image-studio` for all 14 verticals
- **Integrated Panel**: `ImageStudioPanel` component inside `AIChatWidget.tsx` — full Image Studio UI (generate form, library grid, preview modal) embedded in the AI full-page expanded view
- **Server**: `server/image-gen.ts` — Express router, async generation with Supabase storage
- **Navigation**: Accessible via "Image Studio" tab in the AI chat sidebar (full-page mode). Removed from vertical top-nav.
- **API Key**: Set `IMAGE_GEN_API_KEY` env var. Falls back to OpenAI integration key for DALL-E 3.

### Features
- Quick prompt suggestions (6 presets)
- Style presets: Auto, Photorealistic, Digital Art, Illustration, 3D Render, Anime, Watercolor, Oil Painting, Pixel Art, Minimalist
- Aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4
- Library with status filters (All/Completed/Pending/Failed)
- Full preview modal with prev/next navigation, copy prompt, download, delete
- Auto-polling while images are pending (3s interval)
- Generation stats sidebar

## Navigation Architecture (Mar 2026)

### Route/Nav Structure
- **17 verticals** defined in `client/src/lib/verticals-config.ts` (2075 lines)
- **~300+ routes** in `client/src/App.tsx` inside `<Switch>` block
- **Vertical detection**: `detectVerticalFromUrl()` maps URL prefixes to vertical IDs (handles prefix≠id cases: `legalnations→hr`, `usdrop→sales`, `goyotours→events`, `lbm→admin`)
- **Root redirect**: `/` → `/legalnations` via `VerticalSync`
- **Portal routes**: `/portal/legalnations/*` uses separate `PortalRouter` + `PortalLayout`
- **404 catch-all**: `<Route component={NotFound} />` at end of Switch

### Important Contacts URL Convention
- **Standard pattern**: `/{prefix}/contacts` → `UniversalImportantContacts` (used by 14 verticals)
- **Exception**: `/crm/contacts-important` — CRM needs this because `/crm/contacts` is used by `CrmContacts` (CRM-specific contacts page)
- Finance and OMS were normalized to `/contacts` (previously used `/contacts-important` unnecessarily)

## HRMS Asset Management System (Mar 2026)

Compact, full-featured asset inventory and assignment tracking within the HRMS vertical.

### Pages
| Page | Route | File |
|------|-------|------|
| Asset Index | `/hrms/assets` | `client/src/pages/hrms/assets.tsx` |
| Asset Detail | `/hrms/assets/:id` | `client/src/pages/hrms/asset-detail.tsx` |

### Features
- **Photo thumbnails**: Unsplash stock images per category displayed in table rows (48×48 rounded)
- **Tabs**: All Assets / Assigned / Unassigned with counts
- **Search + Category filter**: Search by name, serial, or asset code; dropdown filter by category
- **Pagination**: PAGE_SIZE=15
- **Create Asset flow**: DetailModal form → on submit, asset created locally + QR code generated → QR dialog with Print/Download
- **QR Code generation**: `qrcode` npm package, encodes URL to asset detail page. Print opens new window with `window.print()`. Download as PNG.
- **Assign/Unassign flow**: Inline "Assign" button for available assets in table; Assign dialog with employee select + date + notes; Unassign button on detail page
- **Detail page**: Two-column layout — left: asset header card (photo, name, code, manufacturer, serial, category, price, location) + current assignment card + assignment history table + details card; right: QR code card + Quick Info card
- **Status badges**: available (green), assigned (blue), in-repair (amber), retired (neutral)
- **Condition badges**: new (green), good (blue), fair (amber), poor (red)

### Mock Data (`client/src/lib/mock-data-assets.ts`)
- `Asset` type: id, assetCode, name, category, serialNumber, model, manufacturer, purchaseDate, purchasePrice, condition, status, imageUrl, warrantyExpiry, location, notes
- `AssetAssignment` type: id, assetId, employeeId, employeeName, assignedDate, returnDate, notes
- 18 assets across 6 categories (Laptop, Monitor, Mouse, Keyboard, Headphones, Phone, Printer)
- 15 assignment records (12 active + 3 historical with returnDate)
- FK to employees via `employeeId` referencing `mock-data-hrms.ts` employee IDs
- Helpers: `getAssetById`, `getCurrentAssignment`, `getAssignmentsForAsset`, `getAssetsForEmployee`
- `ASSET_CATEGORIES` constant array

### Config (`client/src/lib/hrms-config.ts`)
- `AssetStatus` type + `HRMS_ASSET_STATUS_CONFIG`
- `AssetCondition` type + `HRMS_ASSET_CONDITION_CONFIG`
- StatusBadge variantMap extended with asset status + condition entries

### Dependencies
- `qrcode` + `@types/qrcode` — QR code generation (canvas-based)

### Nav Fixes Applied (Mar 2026)
1. **USDrop "Leads" deduplication**: Removed duplicate "Leads" sub-item from "Users & Subscriptions" category — "Pipeline" L1 nav already links to `/usdrop/leads`
2. **Finance/OMS contacts URL normalization**: Changed from `/contacts-important` to `/contacts` (matching all other verticals; no URL conflict existed)
3. **LBM Reports consolidation**: Removed duplicate "Reports" from "System" sub-items; renamed "Team Reports" L1 to "Reports" at `/lbm/reports`; removed orphaned `/lbm/team-reports` route

## Client Portal System (Mar 2026)

Client-facing portal prototype accessible via vertical switcher under "Client Portals" section. Uses separate layout (`PortalLayout`) without TopNavigation/AnnouncementBanner/AIChatWidget.

### Architecture
- Routes: `/portal/legalnations/*` — detected via `loc.startsWith("/portal/")` in App.tsx
- Layout: `client/src/components/portal/portal-layout.tsx` — **top navigation** (no sidebar) with "LN" text logo in blue, horizontal nav links, user avatar, Preview Mode badge, mobile nav row
- Router: `PortalRouter` function in App.tsx (separate from main `Router`)
- Mock data: `client/src/lib/mock-data-portal-legalnations.ts` — client profile (Rajesh Kumar), 2 companies, documents, invoices, messages
- Spacing: `px-4 sm:px-8 lg:px-24` responsive (matching PageShell at lg breakpoint)

### Portal Pages (5)
| Page | Route | File |
|------|-------|------|
| Dashboard | `/portal/legalnations` | `client/src/pages/portal/legalnations/dashboard.tsx` |
| Companies | `/portal/legalnations/companies` | `client/src/pages/portal/legalnations/companies.tsx` |
| Documents | `/portal/legalnations/documents` | `client/src/pages/portal/legalnations/documents.tsx` |
| Invoices | `/portal/legalnations/invoices` | `client/src/pages/portal/legalnations/invoices.tsx` |
| Messages | `/portal/legalnations/messages` | `client/src/pages/portal/legalnations/messages.tsx` |

### EazyToSell Client Portal (12 pages) — Uses Admin Panel Layout
The ETS client portal uses the same admin panel layout (TopNavigation, vertical switcher, sub-navigation) as all other verticals. Registered as vertical `id: "ets-portal"`, `routePrefix: "portal-ets"`, `isPortal: true` in `verticals-config.ts`. Pages aligned with the original EazyToSell GitHub project's partner portal (https://github.com/lakshaytakkar/Eazy-Sell.git).

**Layout Normalization (Mar 2026):** All ETS portal pages standardized to consistent `p-4 md:p-6 space-y-5` with appropriate max-widths. Older pages (catalog, store, orders, payments, support, profile, invoices, launch-kit, checklist, onboarding) use `max-w-[1200px] mx-auto`. POS pages keep their individual widths. POS billing is full-height (intentional). Onboarding uses `max-w-3xl`. The TeamSync announcement banner is hidden on ETS portal routes via conditional render in App.tsx.

**Posive-Style Sidebar Navigation (Mar 2026):** All ETS portal pages with submenus use a vertical left sidebar layout instead of the horizontal blue bar. Component: `client/src/components/layout/ets-subnav-sidebar.tsx` (`EtsSubNavSidebar`). Auto-detects when the active nav category has multiple items and renders a 224px sidebar with icons, orange active state, and dot indicator. The horizontal sub-nav bar in `TopNavigation` is suppressed for the ETS portal (`isEtsPortal` check). Affected page groups: Inventory (4 items), Operations (4 items), My Store (3 items), Payments (2 items). Pages without submenus (Home, Products, POS Billing, Orders, Support, Profile) render full-width without sidebar.

**Dashboard Redesign (Mar 2026):** Premium dashboard with two states:
- **Post-launch (isLive):** Orange gradient hero, 4 live sales stat cards (Revenue/Avg Basket/Digital/Cash), 6 quick-action tiles with gradient icons, Top Selling Products with `ProductImage` thumbnails, Recent Sales feed, Stock Alerts panel with amber accent
- **Pre-launch:** Launch Progress bar, Next Steps with icons, Timeline, Store Readiness checklist, financial summary cards (Total Paid/Inventory/Manager)
- All product emojis replaced with `ProductImage` component (`client/src/components/product-image.tsx`) using Unsplash stock images across all 8 POS/operations pages

| Page | Route | File |
|------|-------|------|
| Dashboard | `/portal-ets` | `client/src/pages/portal/ets/dashboard.tsx` |
| **POS Billing** | `/portal-ets/pos` | `client/src/pages/portal/ets/pos-billing.tsx` |
| Product Catalog | `/portal-ets/catalog` | `client/src/pages/portal/ets/catalog.tsx` |
| My Store | `/portal-ets/store` | `client/src/pages/portal/ets/store.tsx` |
| Launch Kit | `/portal-ets/launch-kit` | `client/src/pages/portal/ets/launch-kit.tsx` |
| Orders | `/portal-ets/orders` | `client/src/pages/portal/ets/orders.tsx` |
| Payments | `/portal-ets/payments` | `client/src/pages/portal/ets/payments.tsx` |
| **Checkout** | `/portal-ets/checkout` | `client/src/pages/portal/ets/checkout.tsx` |
| **My Orders** | `/portal-ets/my-orders` | `client/src/pages/portal/ets/my-orders.tsx` |
| **Order Detail** | `/portal-ets/my-orders/:orderId` | `client/src/pages/portal/ets/order-detail.tsx` |
| Invoices | `/portal-ets/invoices` | `client/src/pages/portal/ets/invoices.tsx` |
| **Invoice Detail** | `/portal-ets/invoices/:invoiceId` | `client/src/pages/portal/ets/invoice-detail.tsx` |
| **Payment Milestones** | `/portal-ets/payment-milestones` | `client/src/pages/portal/ets/payment-milestones.tsx` |
| Profile | `/portal-ets/profile` | `client/src/pages/portal/ets/profile.tsx` |
| Support | `/portal-ets/support` | `client/src/pages/portal/ets/support.tsx` |
| Checklist | `/portal-ets/checklist` | `client/src/pages/portal/ets/checklist.tsx` |
| Onboarding | `/portal-ets/onboarding` | `client/src/pages/portal/ets/onboarding.tsx` |
| **Inventory** | `/portal-ets/inventory` | `client/src/pages/portal/ets/inventory.tsx` |
| **Stock Receive** | `/portal-ets/stock-receive` | `client/src/pages/portal/ets/stock-receive.tsx` |
| **Stock Adjustment** | `/portal-ets/stock-adjustment` | `client/src/pages/portal/ets/stock-adjustment.tsx` |
| **Low Stock Alerts** | `/portal-ets/low-stock-alerts` | `client/src/pages/portal/ets/low-stock-alerts.tsx` |

#### POS Billing System (`/portal-ets/pos`)
Point-of-sale billing screen for store cashiers. Renders within the standard portal layout.
- **Left panel**: Barcode scanner input (auto-focused, USB scanner compatible), product search dropdown, bill item grid (qty +/-, delete), item count + grand total, Charge button
- **Right panel**: Quick-add product tiles (8 most common items), held bills indicator with recall
- **Payment flow**: Full-screen modal with Cash (change calculator, quick amount buttons), UPI (confirmation), Card (confirmation)
- **Receipt**: 58mm thermal printer format, print via `window.print()` with print-specific CSS
- **Held bills**: Save current bill, recall later, auto-expire after 24h
- **Store lock**: POS only visible when store status is "active"
- **Haptics**: `navigator.vibrate()` on scan, add, remove, payment actions
- **Mock data**: `client/src/lib/mock-data-pos-ets.ts` — 20 products, quick-add tiles, sale history, inventory items, stock movements, stock receives, adjustment reasons, shared state mutation functions

#### Checkout, Orders & Invoices (Phase B Part 2)
- **Shared State**: `client/src/lib/ets-order-store.tsx` — React Context (`EtsOrderProvider`) wrapping all ETS portal routes. Provides: cart (add/remove/update/clear), orders, invoices, payment milestones. Seeded with 4 sample orders in various fulfillment stages (Delivered, Shipped, Processing, Pending).
- **Checkout** (`checkout.tsx`): Cart review table with qty controls, editable delivery address, "Pay ₹[total]" button with 2-second mock Razorpay loading, confetti success screen with order number, "Download Invoice" and "View Order Status" actions. Creates order + invoice on success, clears cart.
- **My Orders** (`my-orders.tsx`): Table listing all orders newest-first with order#, date, item count, total, payment badge (green Paid / yellow Pending), fulfillment badge (Processing/Shipped/Delivered/etc). Navigates to order detail.
- **Order Detail** (`order-detail.tsx`): Line items table, order summary (subtotal/delivery/total), payment details block, vertical fulfillment timeline (Order Placed → Payment Confirmed → Processing → Shipped → Out for Delivery → Delivered) with completed timestamps.
- **Invoice Detail** (`invoice-detail.tsx`): Printable invoice with EazyToSell company header, partner billing details, items table, subtotal + GST 18% + grand total, payment reference. Print/download via `window.print()`.
- **Payment Milestones** (`payment-milestones.tsx`): Vertical timeline of 4 milestones (Token ₹25K, Inventory Advance 40%, Pre-Shipping 50%, Final Settlement 10%) with Paid/Due/Upcoming status badges, dates, and "Pay Now" button on next due milestone using same mock Razorpay flow.
- **Nav**: Phase B sidebar updated to include Checkout, My Orders, Pay Milestones. Invoice list shows auto-generated invoices from order store.

#### Inventory Management System (`/portal-ets/inventory`, `/portal-ets/stock-receive`, `/portal-ets/stock-adjustment`, `/portal-ets/low-stock-alerts`)
Full stock control center with 4 sub-pages under the "Inventory" nav section:
- **Stock Overview** (`inventory.tsx`): Searchable/filterable product table with summary cards (total SKUs, healthy/low/out counts, inventory value). Click any row to open side sheet with stock movement history timeline. Filters: category, status, sort by name/stock/value.
- **Stock Receive** (`stock-receive.tsx`): Record incoming deliveries. Auto-generates SR reference numbers. Barcode scan + product search to add items with quantity controls. Confirm Receive updates shared inventory state and creates movement records. History tab shows all past receive sessions with item details.
- **Stock Adjustment** (`stock-adjustment.tsx`): Owner-only. Fix stock mismatches — scan/search product, see system count vs actual count, select reason (physical count correction, damaged, found in backroom, lost/stolen, miscount during receive). Adjustments update shared inventory and create audit trail movement records.
- **Low Stock Alerts** (`low-stock-alerts.tsx`): Products below reorder threshold sorted by urgency (out of stock → critical 1-2 → low 3-5). Shows daily sales rate (14-day avg), estimated days until stockout, and suggested reorder quantity (30-day supply).
- **Shared state**: All pages share INVENTORY and STOCK_MOVEMENTS arrays via `mock-data-pos-ets.ts`. Mutation functions (`addReceiveToInventory`, `addAdjustmentToInventory`, `updateInventoryStock`, `addStockMovement`) ensure cross-page consistency.

#### Operations (`/portal-ets/cash-register`, `/portal-ets/returns`, `/portal-ets/daily-report`, `/portal-ets/store-settings`)
Store daily operations system with 4 sub-pages under the "Operations" nav section:
- **Cash Register** (`cash-register.tsx`): Open/close daily register with cash tracking. Shows opening amount, cash sales today, expected drawer amount, and transaction count. Payment method breakdown (cash/UPI/card with progress bars). Close register flow: count cash, compare to expected, note discrepancies. History tab shows past register sessions with difference tracking.
- **Returns** (`returns.tsx`): Process product returns against original sales. Search by receipt number or browse last 20 sales. Select items to return with qty controls, choose reason (defective/wrong product/changed mind/damaged/other), pick refund method (cash/store credit). Returns update inventory via shared state. Return history with detail dialogs.
- **Daily Report** (`daily-report.tsx`): Sales analytics with date range selector (today/yesterday/week/month). Summary cards (revenue, transactions, avg basket, avg items/tx). Top sellers by qty and revenue. Payment breakdown with percentage bars. Hourly sales bar chart for single-day views. Returns summary.
- **Store Settings** (`store-settings.tsx`): Configure store name, address, GSTIN, phone, low stock threshold. Manage quick-add products for POS billing (up to 12, with search picker). Auto-print receipt toggle. Read-only system info (store ID, partner package, status).

- Layout: Uses main admin TopNavigation with EazyToSell branding (#F97316). Nav: Home, Products (Catalog / Launch Kit), POS Billing, Inventory (Stock Overview/Receive/Adjustment/Low Stock), Operations (Cash Register/Returns/Daily Report/Store Settings), My Store, Orders, Payments, Support, Profile. Large EazyToSell logo (`attached_assets/eazytosell-logo-large.png`) shown in vertical-switcher for ETS portals.
- Messages page removed (not in original project).
- API: `server/ets-portal-api.ts` — all endpoints under `/api/ets-portal/*`, uses Supabase `easytosell` schema. Key mutations: PATCH `/client/:id/profile`, PATCH `/client/:clientId/checklist/:statusId`, POST `/client/:id/kit-items`.
- Data: `client/src/lib/mock-data-portal-ets.ts` — portal client config, stage labels/descriptions, order stages. Catalog uses `normalizeProduct()` to map API fields (suggestedMrp/storeLandingPrice/categoryName) to display fields.
- Features: Product catalog with grid/list view + search + category filter + Add-to-Kit, launch kit builder with investment summary, order tracking with visual stage timeline, payment history with download, invoice search, multi-step onboarding wizard, categorized readiness checklist with toggle, profile with account details, support page with WhatsApp/Phone/Email + FAQ accordion.

### LegalNations Multi-Role Portal (`/portal-ln/*`) — #225AEA
New role-based LN portal using the admin panel layout (TopNavigation + role switcher). Registered as vertical `id: "ln-portal"`, `routePrefix: "portal-ln"`, `isPortal: true`. Original `/portal/legalnations/` and `/legalnations/` routes remain untouched.

**6 Roles** (`client/src/lib/ln-role-config.ts`):
- Admin (violet #7c3aed) — CEO command center
- Formation Specialist (sky #0ea5e9) — Pipeline execution
- Compliance Officer (emerald #10b981) — BOI filings & deadlines
- Tax Specialist (amber #f59e0b) — IRS filings
- Sales/BD (pink #ec4899) — Lead pipeline
- Client (blue #225AEA, default) — Self-service formation portal

**Role System**: `ln-role-config.ts` (role definitions + nav items), `use-ln-role.ts` (context + hook + localStorage persistence). Role switcher dropdown in TopNavigation. Non-client roles show role-specific nav items in TopNavigation L1 bar; client role uses navCategories from verticals-config.

**Client Sidebar**: `client/src/components/layout/ln-subnav-sidebar.tsx` — mirrors ETS pattern, renders for client role when active category has multiple items.

**Mock Data**: `client/src/lib/mock-data-dashboard-ln.ts` — CLIENT_PROFILE (with companies array), 7 FORMATION_STAGES, DASHBOARD_METRICS, 6 COMPLIANCE_DEADLINES, 8 RECENT_ACTIVITY, RM_CONTACT, 3 FORMATION_PACKAGES, 8 US_STATES_POPULAR, 13 LN_DOCUMENTS, 6 LN_INVOICES (with line items), 3 LN_CONVERSATIONS, 10 LN_MESSAGES, 15 LN_FAQS, TAX_FILINGS (8 entries), TAX_STATUS_LABELS/COLORS, TAX_CALENDAR_DEADLINES (10 entries).

**Task #3 Enhancements** (Mar 2026):
- Tax Specialist Dashboard: tax season progress bar (Jan–Apr timeline with milestone markers), KPI stat grid (Active/Pending/Reviews/Filed), filing activity list with click-through to detail, circular completion rate donut, quick actions panel
- Tax Filing Queue: filter pills by status, search bar, expandable filing cards with EIN/forms/revenue/due-date grid; mailing status section
- Tax Preparation Workspace: 10-step IRS procedure checklist per client; client selector panel; step toggle (checkbox), current step badge, expandable note/attach section per step; progress bar
- Tax Filing Detail: 3-level breadcrumb (Queue → Detail → Company), full entity info grid, required forms list, mailing/IRS response section, activity timeline (for filed entries)
- Tax Calendar: month-grouped deadline list, type-color-coded badges (Filing/Extension/Est.Tax/State), urgency countdown (days left), completed section
- Cross-role navigation polish:
  - Admin company table rows and pipeline rows are now clickable → navigate to `/portal-ln/formation/client/:clientId` (deep-link per client)
  - Formation Specialist pipeline cards are clickable → open `ClientDetailDialog` modal with stage history stepper
  - Admin sub-pages (Pipeline, Team, Revenue, Settings, Training) all have `← Dashboard > PageName` breadcrumbs
  - Formation sub-pages (Pipeline, KYC, EIN, Actions) all have `← Dashboard > PageName` breadcrumbs
  - Tax sub-pages (Queue, Prep, Detail, Calendar) all have breadcrumb navigation
  - Messages already had role badges (`roleBadgeColor` map) — confirmed working

| Page | Route | File |
|------|-------|------|
| Dashboard | `/portal-ln` | `client/src/pages/portal/ln/dashboard.tsx` |
| Onboarding | `/portal-ln/onboarding` | `client/src/pages/portal/ln/onboarding.tsx` |
| My Companies | `/portal-ln/companies` | `client/src/pages/portal/ln/companies.tsx` |
| Company Detail | `/portal-ln/companies/:companyId` | `client/src/pages/portal/ln/company-detail.tsx` |
| Document Vault | `/portal-ln/documents` | `client/src/pages/portal/ln/documents.tsx` |
| Invoices | `/portal-ln/invoices` | `client/src/pages/portal/ln/invoices.tsx` |
| Invoice Detail | `/portal-ln/invoices/:invoiceId` | `client/src/pages/portal/ln/invoice-detail.tsx` |
| Messages | `/portal-ln/messages` | `client/src/pages/portal/ln/messages.tsx` |
| Support | `/portal-ln/support` | `client/src/pages/portal/ln/support.tsx` |
| Profile | `/portal-ln/profile` | `client/src/pages/portal/ln/profile.tsx` |
| Admin Overview | `/portal-ln/admin` | `client/src/pages/portal/ln/admin-portal.tsx` |
| Admin Pipeline | `/portal-ln/admin/pipeline` | `admin-portal.tsx` → `LnAdminPipeline` |
| Admin Team | `/portal-ln/admin/team` | `admin-portal.tsx` → `LnAdminTeam` |
| Admin Revenue | `/portal-ln/admin/revenue` | `admin-portal.tsx` → `LnAdminRevenue` |
| Admin Settings | `/portal-ln/admin/settings` | `admin-portal.tsx` → `LnAdminSettings` |
| Formation Dashboard | `/portal-ln/formation` | `client/src/pages/portal/ln/formation-portal.tsx` |
| Formation Pipeline | `/portal-ln/formation/pipeline` | `formation-portal.tsx` → `LnFormationPipeline` |
| Formation KYC Review | `/portal-ln/formation/kyc` | `formation-portal.tsx` → `LnFormationKYC` |
| Formation EIN Tracker | `/portal-ln/formation/ein` | `formation-portal.tsx` → `LnFormationEIN` |
| Formation Stage Actions | `/portal-ln/formation/actions` | `formation-portal.tsx` → `LnFormationActions` |
| Compliance Dashboard | `/portal-ln/compliance` | `client/src/pages/portal/ln/compliance-portal.tsx` |
| Compliance BOI Queue | `/portal-ln/compliance/boi` | `compliance-portal.tsx` → `LnComplianceBOI` |
| Compliance Annual Reports | `/portal-ln/compliance/annual` | `compliance-portal.tsx` → `LnComplianceAnnual` |
| Compliance Alerts | `/portal-ln/compliance/alerts` | `compliance-portal.tsx` → `LnComplianceAlerts` |
| Compliance Client Detail | `/portal-ln/compliance/detail` | `compliance-portal.tsx` → `LnComplianceDetail` |
| Sales Dashboard | `/portal-ln/sales` | `client/src/pages/portal/ln/sales-portal.tsx` |
| Sales Lead Pipeline | `/portal-ln/sales/pipeline` | `sales-portal.tsx` → `LnSalesPipeline` |
| Sales Proposals | `/portal-ln/sales/proposals` | `sales-portal.tsx` → `LnSalesProposals` |
| Sales Follow-ups | `/portal-ln/sales/followups` | `sales-portal.tsx` → `LnSalesFollowups` |
| Sales Packages | `/portal-ln/sales/packages` | `sales-portal.tsx` → `LnSalesPackages` |
| Tax Dashboard | `/portal-ln/tax` | `client/src/pages/portal/ln/tax-portal.tsx` |
| Tax Filing Queue | `/portal-ln/tax/queue` | `tax-portal.tsx` → `LnTaxQueue` |
| Tax Preparation | `/portal-ln/tax/prep` | `tax-portal.tsx` → `LnTaxPrep` |
| Tax Filing Detail | `/portal-ln/tax/detail` | `tax-portal.tsx` → `LnTaxDetail` |
| Tax Calendar | `/portal-ln/tax/calendar` | `tax-portal.tsx` → `LnTaxCalendar` |

### Navigation Entry
- Vertical switcher (`vertical-switcher.tsx`) has two portal categories:
  - **Client Portals**: LegalNations entry (navigates to `/portal/legalnations`), LegalNations New Portal (navigates to `/portal-ln`), EazyToSell entry (navigates to `/portal-ets`)
  - **Vendor Portals**: Vendor Portal entry (navigates to `/vendor/quotations`, uses main app layout)
- Portals are flagged with `isPortal: true` in verticals-config and filtered out of "Business Products"
- LegalNations old portal uses its own `PortalLayout` component at `/portal/legalnations/`
- LegalNations new portal uses the main admin layout (TopNavigation) with role switcher at `/portal-ln/`
- EazyToSell portal uses the main admin layout (TopNavigation) with its own vertical config
- "Preview Mode" badge shown at top of old portal pages

### Icon Compatibility
- `client/src/lib/icon-compat.tsx` — Provides `SiLinkedin` as Lucide `Linkedin` fallback (removed from react-icons v5)
- `SiAmazonwebservices` — removed from imports, falls back to `Globe` via `getIcon()` function

## Architecture Refactor (Mar 2026)

### Vertical ID Rename
Application-level vertical `id` constants renamed (DB/stored `assignedVertical` values unchanged):
- `hr` → `legalnations`
- `sales` → `usdrop`
- `events` → `goyotours`
- `admin` → `lbm`

### File Structure Changes
- **LegalNations pages**: Moved from flat `client/src/pages/ln-*.tsx` to `client/src/pages/legalnations/` (15 files)
- **Design System components**: `client/src/components/hr/` → `client/src/components/ds/` (all import paths updated)
- **TypeScript types**: Extracted from 28 mock-data files into `client/src/types/*.ts` (re-exported from mock-data for backward compat)

### Server Routes Split
`server/routes.ts` monolith split into focused modules under `server/routes/`:
- `faire.routes.ts` — Faire API, bank transactions, ledger parties, task activity
- `wise.routes.ts` — Wise API (summary, transfers, sync)
- `core.routes.ts` — Core API (verticals, users, tasks, channels, resources, contacts, notifications, tickets)
`server/routes.ts` is now a thin registry that imports and calls the three register functions.
