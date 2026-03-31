# ERP & Store Management System — Developer Guide

> This is the single source of truth for building our ERP.
> Written from a business perspective so any developer can understand what to build, why, and how it all connects.
> Based on a full reverse-engineering of MargBooks (a live Indian ERP with 2600+ products, 470 suppliers, multi-branch support).

---

## What Are We Building?

A cloud-based ERP for retail/grocery/supermarket stores that handles:
- **Selling stuff** (bills, returns, orders, estimates, POS counter sales)
- **Buying stuff** (purchase bills, returns, orders, goods received)
- **Tracking inventory** (what's in stock, where, expiry dates, reorder alerts)
- **Managing money** (who owes us, who we owe, bank accounts, cheques, cash)
- **Running the business** (daily cash handling, reports, GST compliance, loyalty programs)
- **Multi-branch** (one HQ, multiple stores, each with their own stock and cash)

Think of it as: **Billing + Inventory + Accounting + CRM in one app.**

---

## The Big Picture — How a Store Uses This Daily

```
Morning:
  Manager opens the app → Opens cash day (starting cash balance)

During the day:
  Cashier creates Sale Bills → customer pays → stock reduces automatically
  Purchase bills come in → stock increases → supplier gets credited
  Customers return items → Sale Return created → stock comes back

Evening:
  Cashier closes the day → system shows total cash collected
  Manager reviews → deposits cash to bank → approves day closure

End of month:
  Accountant runs reports → GST returns → Profit & Loss → Balance Sheet
```

---

## The Sidebar — Every Module Explained

The left sidebar has 14 sections. Here's what each one does and every page inside it.

---

### 1. DASHBOARD

**What**: The home screen. Shows business health at a glance.
**Who uses it**: Everyone (owner, manager, cashier).

**Build these widgets** (each is a card on the dashboard):

| Widget | What it shows | Visual |
|--------|--------------|--------|
| Net Sale | This month's total sales vs last month, with a 12-month line chart | Line chart + number |
| Net Purchase | Same for purchases | Line chart + number |
| Gross Profit | Sales minus purchases | Line chart + number |
| Cash in Hand | How much cash/UPI/bank money came in and went out today | Bar chart (3 bars) |
| Due Payment | Who hasn't paid us yet (split by Patients and Parties) | Tabs + table |
| Fund Summary | Bank balance, cash balance, deposits, withdrawals, cheques pending | Key-value list |
| Outstanding | Money others owe us (receivable) and money we owe others (payable), current vs overdue | Key-value list |
| Business | GST we need to pay (CGST + SGST + IGST) | Key-value list |
| New Added | Count of new items, suppliers, customers, categories added this month | Count badges |
| Stock Alerts | Count of expired, near-expiry, reorder-needed, dump stock, minimum stock items | Count badges with colors |
| Pending | Count of pending sale challans, sale orders, purchase orders, purchase challans | Count badges |

**Controls on dashboard**:
- Branch dropdown (switch between stores)
- Date range filter (default: Last 30 Days)
- "Finish setting up" wizard banner with % completion
- Dashboard settings panel (themes, language, subscription)

---

### 2. MASTER — The Foundation Data

**What**: All the reference data that everything else depends on. You set this up once, then use it everywhere.

Think of Masters as your **dictionaries**. Before you can create a sale bill, you need parties (customers/suppliers), items (products), tax categories, units of measurement, etc.

#### 2A. Accounts Master — People & Money Accounts

**Ledger (Party) Master** — This is the BIG one. Every customer, supplier, bank account, expense head is a "ledger."

LIST PAGE:
- Table showing: Code | Name | Station | Balance | Edit/Delete buttons
- Search by: Name, Code, Mobile, DL No., Address, GSTIN
- Quick actions: View PDC cheques (F6), Ledger statement (F4), Outstanding (F8)

CREATE/EDIT FORM (32 fields across 6 tabs):

```
GENERAL INFO:
  - Alternate Code (auto-generated)
  - Party Name* (required)
  - Account Group* (dropdown: Sundry Debtors, Sundry Creditors, Bank, Cash, etc.)
  - Station* (delivery area/region)
  - Mail To (email)
  - Address (3 lines)
  - Country → State → City → Pincode
  - Currency (for foreign parties)
  - Branch (which store this party belongs to)
  - Parent Ledger (for sub-accounts)

RIGHT PANEL:
  - Balancing Method (Bill by Bill or Running Balance)
  - Opening Balance (₹ amount + Dr/Cr toggle)
  - Credit Days (how many days credit we give)
  - Phone, Mobile 1*, Mobile 2, WhatsApp

TABS AT BOTTOM:
  Tab 1: GST/Tax Details → Ledger Type (Unregistered/Registered/Composition), PAN, GSTIN
  Tab 2: Licence Info → Drug License No., FSSAI No. (for pharmacy/food)
  Tab 3: Contact Info → Contact person, Designation
  Tab 4: Bank Details → Bank name, Account No., IFSC, Branch
  Tab 5: Loyalty Details → Loyalty card number, points config
  Tab 6: Others → Custom notes

BOTTOM BAR: GST Verification button | F10 Save | F9 Clear | Esc Close
```

**Account Group** — Tree structure that organizes ledgers.
- Shows as expandable tree (Assets → Current Assets → Sundry Debtors)
- Create: Group Name* + Under Group* + Prohibited (Yes/No)
- System comes with default groups (don't let users delete these)

**Sale Type** — Different kinds of sales (Regular, Export, Counter, GST Exempt).
- Create: Short Name*, Nature (Sales), Taxability (Taxable/Exempted/Nil/Zero Rated)
- Links to GST ledgers (CGST/SGST/IGST accounts)

**Purchase Type** — Same idea for purchases.

#### 2B. Inventory Master — Products & Storage

**Item Master** — Every product you sell. THIS IS THE SECOND BIG FORM.

LIST PAGE:
- Shows: Product name | Packing | Company | HSN | Rate
- Search: By name, barcode, anywhere, top-selling
- Quick actions: F4 Ledger, F6 Old Rates history, F7 Substitutes, F8 Salt/composition, F9 Company, Alt+F11 Category

CREATE/EDIT FORM (52 fields, tabbed):

```
BASIC INFO (left):
  - Barcode (scannable)
  - Print Label (Yes/No)
  - Product Name* (required)
  - Supply Type (Goods or Services)
  - Packing (e.g. "10x10 tablets")
  - Unit 1st* (Tab, Strip, Box, Kg, etc.)
  - Unit 2 (secondary unit)
  - Unit Conversion (how many unit-2 in unit-1)
  - Decimal allowed (Yes/No)
  - HSN/SAC Code* (tax classification)
  - Tax Category* (5%, 12%, 18%, 28%)
  - Company/Agency* (which supplier)
  - Salt/Composition (ingredients)
  - Category
  - Rack (shelf location)

RATES (center):
  - MRP: ₹ 0.00
  - Purchase Rate: ₹ 0.00
  - Cost: ₹ 0.00 (auto-calculated)
  - Sale Rate: ₹ 0.00

PHARMACY FLAGS (for pharma businesses, hide for grocery):
  - Narcotics (Yes/No)
  - Schedule H / H1 (Yes/No)
  - Schedule Drug (Yes/No)
  - Prescription Required (Yes/No)
  - Storage Type (Normal/Cold)

ADVANCE INFO (right panel tabs):
  Discount tab: Discount type, Item Disc %, Volume Disc 1 & 2, Max Disc %
  Quantity tab: Min Stock, Max Stock, Reorder Level, Reorder Qty
  Other Info tab: Alias, Batch tracking, Expiry tracking
  Extra Info tab: Custom fields
```

**Other Inventory Masters** (simple CRUD — just name + maybe a few fields):

| Master | Fields | Purpose |
|--------|--------|---------|
| Store | Branch*, Code*, Name*, Address | Where stock is kept (Main Store, Cold Room, etc.) |
| Rack | Rack No, Store, Name* | Shelf within a store |
| Company/Agency | Name*, Sub-group option | Suppliers/brands (470 in demo) |
| Category | Name* | Product categories |
| Salt/Composition | Name* | Ingredients (for pharma/food) |
| HSN/SAC | Code*, Name | Government tax codes |
| Unit | Name*, Alternate Unit | Units of measurement (Pcs, Kg, Box, Strip) |
| Manufacturer | Name*, Mobile, Address | Who makes the product |

#### 2C. Pricing & Discounts

**Agency General Discount** — Set default discount for an entire supplier.
- Grid editor (not a separate form): Agency Name | Discount Type (Per Unit/Lumpsum/Percentage) | Value
- No Create button — it's an inline-editable grid

**Item Wise Discount** — Set discount per product.
- Same inline grid: Item Name | Discount | Effective dates
- F10 to save changes, Esc to cancel

**Price List** — Different price lists for different branches or customer types.
- Create: Price List Name, then set per-item MRP overrides

**Sales Promotions/Schemes** — Buy-X-Get-Y, flat discounts, combos.
- Create: Scheme Name*, Type (Buy X Get Y / Discount / Combo), Selection (Item/Category/Agency)
- Then set: Start/End date, Min Qty, Free Qty, Discount %

#### 2D. Other Masters

**Station** — Delivery areas. Just a name field. Used for grouping customers by region.

**Patient** — For pharmacy. 18 fields: Mobile*, Code, Name, Gender, Age, Ledger link, Address, WhatsApp, etc.

**Doctor** — For pharmacy. 13 fields: Mobile, Code, Reg No., Name*, Hospital, Commission %, Address, etc.

**Prescription** — Links patient + doctor + items with dosage info.

**Opening Stock** — Enter initial stock when starting the system. Select Branch + Store, then enter items with batch, qty, rate.

**Multi Currency** — Define currencies: Name*, Symbol*, String, Sub-string. (e.g. "Dollar", "$", "Dollars", "Cents")

**Exchange Rate** — Set conversion rate per currency with date, plus History view.

---

### 3. SALE — Selling to Customers

This is where the daily action happens. 6 types of sale transactions, each slightly different:

#### 3A. Sale Bill (THE CORE — build this first)

This is the most-used screen in the entire app. A cashier uses it 100+ times a day.

LIST PAGE:
- Table: Bill No | Date | Party | Amount | Status | Actions (View/Edit/Print/Cancel)
- Filter by date range
- Search by bill no, party name

CREATE FORM — 3 sections:

```
HEADER:
  - Sale Type (dropdown: Regular, Export, Counter, etc.)
  - Bill No. (auto-generated, sequential)
  - Bill Date (today by default)
  - Party Name* (autocomplete — type and pick customer)
  - Doctor (autocomplete, optional — pharmacy only)
  - Patient (autocomplete, optional — pharmacy only)
  - Reference No. (optional)
  - Narration/Notes (optional)

ITEM GRID (the main table — rows of products):
  Each row has these columns:
  | # | Item* | Batch | Expiry | Qty* | Free | Unit | MRP | Rate | Disc% | Disc₹ | Taxable | GST% | CGST | SGST | Amount |

  How it works:
  1. Cashier types item name or scans barcode → autocomplete picks item
  2. System shows available batches (with expiry dates) → cashier picks one
  3. Cashier enters Qty → system auto-fills: Rate (from master), MRP, GST%, and calculates everything
  4. Cashier can override discount, rate if needed
  5. Press Enter or Tab → moves to next row → repeat

TOTALS (bottom):
  - Subtotal (sum of all line amounts)
  - Total Discount
  - Taxable Amount
  - CGST / SGST / IGST totals (auto-calculated)
  - Cess (if applicable)
  - Round Off (auto, rounds to nearest rupee)
  - GRAND TOTAL

PAYMENT (bottom bar):
  - Payment Mode: Cash | UPI App | Bank | Cheque | Credit (tabs or radio)
  - Amount field (defaults to Grand Total)
  - If Bank: select which bank
  - If Cheque: enter cheque number
  - If UPI: enter reference number
  - If Credit: amount goes to party's outstanding

ACTIONS:
  - F10 = Save & Print
  - F9 = Save & Start New
  - F5 = Hold (save as draft, come back later)
  - Esc = Close without saving
  - Print settings for invoice format
```

**What happens when you save a Sale Bill:**
1. Stock reduces for each item (from the selected batch)
2. Party's outstanding increases (if credit sale)
3. Cash/Bank ledger gets the payment entry
4. GST ledgers get updated
5. Invoice number increments
6. Activity log records who created it

#### 3B. Sale Return
Same form as Sale Bill, but:
- Must reference an original bill number
- Stock INCREASES (items come back)
- Party's outstanding DECREASES
- Has a "Return Reason" field

#### 3C. Sale Challan (Delivery Note)
Same item grid, but:
- No payment section (goods sent, bill not yet made)
- Status: Pending
- Can be "converted" to a Sale Bill later
- Stock reduces when challan is created

#### 3D. Sale Order
- Customer places an order, we haven't delivered yet
- No stock impact
- Status: Pending → Delivered
- Can be converted to Challan or Bill

#### 3E. Estimate / Quotation
- Price quote for a customer
- No stock impact, no payment
- Can be converted to Sale Order or Bill
- Prints as "Quotation" instead of "Invoice"

#### 3F. Counter Sale (POS Mode)
Simplified sale for walk-in customers:
- No party name needed (auto "Cash Sale")
- Focus on barcode scanning → quantity → pay → done
- Quick payment collection
- Immediate receipt print
- Used at the billing counter

---

### 4. PURCHASE — Buying from Suppliers

Mirror image of Sale. 4 transaction types:

#### 4A. Purchase Bill
Same structure as Sale Bill but:
- Supplier instead of Customer
- Supplier's invoice number and date (reference fields)
- Stock INCREASES
- We OWE the supplier (payable increases)

#### 4B. Purchase Return
- Return items to supplier
- Stock DECREASES
- Supplier owes us (payable decreases)

#### 4C. Purchase Challan (Goods Received Note)
- Goods arrived but supplier bill hasn't come yet
- Stock increases
- Pending → converted to Purchase Bill when invoice arrives

#### 4D. Purchase Order
- We ordered from supplier, nothing delivered yet
- No stock impact
- Pending → can convert to Challan or Bill

---

### 5. ACCOUNTING TRANSACTIONS — Money Movement

These are for moving money between accounts that aren't tied to buying/selling products.

Each one follows the same pattern:
- LIST PAGE: Voucher No | Date | Amount | Party | Actions
- CREATE FORM: Date, Voucher No (auto), line items (Account + Amount), Remark

#### 5A. Receipt Voucher
**When**: Customer pays us (not at time of sale — for credit collections).
- Payment Mode (Cash/Bank) + lines: which customer paid how much
- Example: "Customer ABC paid ₹5000 against old invoices"

#### 5B. Payment Voucher
**When**: We pay someone (rent, salary, supplier payment outside purchase).
- Lines: which account + how much
- Example: "Paid ₹10,000 rent to Landlord"

#### 5C. Debit Note
**When**: We're owed money (price difference, damaged goods claim).
- Increases what someone owes us

#### 5D. Credit Note
**When**: We owe someone money (price adjustment in their favor).
- Increases what we owe

#### 5E. Contra Voucher
**When**: Moving money between our own accounts.
- Example: "Deposited ₹50,000 cash into HDFC Bank"
- From Account → To Account → Amount

#### 5F. Journal Voucher
**When**: Accounting adjustments that don't fit anywhere else.
- Multiple Dr/Cr lines that must balance (total debits = total credits)
- Has GST Expenses toggle
- Example: "Adjusting opening balances"

#### 5G. PDC Payment (Post-Dated Cheque)
**When**: We give someone a cheque dated in the future.
- Party + Bank + Cheque No + Cheque Date + Amount
- Status tracking: Pending → Deposited → Cleared/Bounced

#### 5H. PDC Receipt
Same but receiving a future-dated cheque from someone.

#### 5I. Bank Reconciliation
**What**: Match our records with the bank statement.
- Select Bank from dropdown
- Shows unreconciled transactions
- Tick off which ones match the bank statement
- Saves reconciliation status + remark

---

### 6. STOCK MANAGEMENT — Physical Inventory

#### 6A. Stock Transfer
**When**: Moving products between stores or branches.
- From Branch/Store → To Branch/Store
- Item grid: Item + Batch + Qty
- Stock reduces in source, increases in destination

#### 6B. Physical Stock (Stock Audit)
**When**: Counting actual stock vs system stock.
- Create: Entry No, Date, Store, Type (Full/Partial), Remark
- System shows: Item | Batch | System Qty | _[you enter]_ Physical Qty | Difference
- F10 "Process Data" → adjusts stock to match reality

#### 6C. Bill of Materials
**When**: You assemble/manufacture products from components.
- Parent item → list of component items with quantities
- When you "produce", components reduce, parent increases

---

### 7. DAILY CASHBOOK — Cash Handling

#### 7A. Open/Close Cash Day
**Flow**:
1. Start of shift: Click "Start Billing" → cash session opens with opening balance
2. All bills during the day are tracked under this session
3. End of shift: Click "Close Day" → shows summary:
   - Total Cash Received
   - Total Expenses
   - Net Cash
4. Submit for approval

#### 7B. Cash Deposits
- After closing day, deposit cash to bank
- Select Bank (HDFC, Bank of India, etc.)
- Table shows: Date | Cash Receipt | Expenses | Net Cash (last 10 days)
- Enter deposit amount, attach counter slips

#### 7C. Day Closure Approval
- Manager/owner view
- List of pending day closures from all cashiers
- Approve or Reject with remarks

#### 7D. Cash Transfer
- Transfer cash from one cashier to another
- Shows: Current Cash Balance
- Enter Transfer Amount + Select User (dropdown of cashiers)
- Submit → money moves between users

---

### 8. BANKING

#### 8A. Cheque Book Management
- Register cheque books: Bank*, Cheque From*, Cheque To*, Date
- Track individual cheques: Issued → Cleared → Bounced → Cancelled → Reused
- Actions: Create/F2, Modify/F3, Delete, Show All, Cancel Cheque, Reuse Cheque

#### 8B-D. Online Payment / Statement / Reconciliation
- Bank integration features (connect to bank APIs for live data)
- Auto-reconciliation matching
- (These can be Phase 2 — start with manual reconciliation)

---

### 9. REPORTS — Business Intelligence

All reports follow the same pattern:
- Filter panel (date range, branch, party, item, etc.)
- Custom Design button (pick which columns to show)
- Export: PDF, Excel, Print
- Configuration: Save report templates

**Build these 11 report types:**

| Report | What it answers |
|--------|----------------|
| **Sales Report** | How much did we sell? By day, by party, by item, by category. Sales register for GST. |
| **Purchase Report** | How much did we buy? Same breakdowns as sales. |
| **Stock Report** | What's in stock? Current stock, valuation, expiry report, near-expiry, reorder needed, batch-wise |
| **Outstanding Report** | Who owes us money? Who do we owe? Aging analysis (30/60/90 day buckets) |
| **Ledger Report** | Transaction history for any account. Trial Balance. Group-wise summary. |
| **GST Reports** | GSTR-1, GSTR-2, GSTR-3B, HSN Summary. Export as JSON for government portal. |
| **Profit & Loss** | Revenue minus expenses = profit. Standard accounting format. |
| **Balance Sheet** | Assets vs Liabilities snapshot. Standard accounting format. |
| **Day Book** | Every transaction that happened today, all types combined. |
| **Cash Book** | Cash transactions only. Opening + receipts - payments = closing. |
| **Bank Book** | Bank transactions only. Per bank account. |

---

### 10. CRM — Customer Relationship

#### 10A. Loyalty Management System
Configuration page (not a CRUD list):
- Point Apply On: Item Wise or Bill Amount
- Point Calculation: Fraction or Range of Amount
- Point Value (how many points per rupee)
- Point Redeem Rate (how many rupees per point)
- Minimum Amount (minimum purchase to earn points)
- OTP Required (Yes/No for redemption)
- Apply To: All Items or Selected Items

**How it works at billing**: Customer makes a purchase → points auto-earned → shown on receipt → next visit, cashier can apply points as discount.

#### 10B. Prescription Reminder (Pharmacy)
- Report showing patients whose medicines are about to run out
- Based on prescription duration and last purchase date
- Can send SMS/WhatsApp reminders

#### 10C. Pending Approvals
- Central queue for all things needing manager approval
- Day closures, credit overrides, discount overrides, etc.

---

### 11. SETTINGS & CONFIGURATION

#### 11A. Company Profile
- Company name, address, logo, GSTIN, PAN
- Financial year setup (April-March)
- Base currency

#### 11B. User Management
- Create users: Name, Email, Mobile, Password
- Assign Roles: Admin, Manager, Cashier, Service Staff
- Set Branch access (which branches can this user see?)
- Counter assignment (for cashbook)

#### 11C. Control Room (THE MEGA CONFIG)
This is where you configure everything about how the app behaves:
- Per-module permissions (Create/Edit/View/Delete/Print/Export per role)
- Billing settings (auto-print, round-off rules, series numbering)
- Inventory settings (batch tracking, expiry mandatory, barcode format)
- Tax/GST settings
- Print template customization
- Notification preferences

#### 11D. Theme & Language (from dashboard settings panel)
- 8 themes: Default (teal), Orange, LightGreen, Dark Green, Purple, Magenta, Brown, Blue
- 6 languages: English, Hindi, Telugu, Malayalam, Punjabi, Gujarati

#### 11E. Setup Wizard
- Dashboard banner: "85% completed — Finish setting up →"
- Steps: Company details → Branch → Users → Tax → Import items → Opening balance → Bank setup
- Track completion %, show next step

---

## KEYBOARD SHORTCUTS (Global)

Build these as global hotkeys throughout the app:

| Key | Action | Where |
|-----|--------|-------|
| Alt+N | New Sale Bill | Anywhere |
| F2 | Create new record | Any list page |
| F3 | Edit/Modify selected | Any list page |
| F4 | View Ledger statement | Ledger/Item context |
| F5 | Hold bill (save draft) | Sale/Purchase bill |
| F6 | View PDC / Old Rates | Ledger/Item context |
| F7 | Substitute items / Show All | Item/Cheque context |
| F8 | View Salt / Outstanding | Item/Ledger context |
| F9 | View Company / Clear form | Item context / Forms |
| F10 | Save | Any form |
| Esc | Close/Cancel | Any form |
| Del | Delete selected | Any list page |
| Alt+F11 | Category view | Item list |

---

## UI PATTERNS — How Pages Look

There are only 4 page patterns in the whole app. Build these as reusable templates:

### Pattern 1: Master List Page (used ~25 times)
```
┌──────────────────────────────────────────────────┐
│ Page Title    [WATCH VIDEO]          [← Back]    │
├──────────────────────────────────────────────────┤
│ [Search box ▼ Search By] [Search...]  [Create/F2]│
├──────────────────────────────────────────────────┤
│ Code │ Name              │ Other │ Balance │ ✏️🗑️│
│ 001  │ ABC Traders       │ ...   │ ₹5,000  │ ✏️🗑️│
│ 002  │ XYZ Pharmacy      │ ...   │ ₹2,300  │ ✏️🗑️│
│ ...  │                   │       │         │     │
└──────────────────────────────────────────────────┘
│ F10 Save │ F9 Clear │ Esc Close                  │
```

### Pattern 2: Transaction List Page (used ~15 times)
```
┌──────────────────────────────────────────────────┐
│ Voucher Type    [WATCH VIDEO]        [← Back]    │
├──────────────────────────────────────────────────┤
│ [Search...] [Create/F2]        [Today] [Custom]  │
├──────────────────────────────────────────────────┤
│ No.  │ Date     │ Party        │ Amount  │ Action│
│ S001 │ 25/03/26 │ ABC Traders  │ ₹12,500 │ 👁✏️🖨│
│ S002 │ 25/03/26 │ Walk-in      │ ₹450    │ 👁✏️🖨│
└──────────────────────────────────────────────────┘
```

### Pattern 3: Bill/Voucher Create Form (used ~12 times)
```
┌──────────────────────────────────────────────────┐
│ Create Sale Bill [WATCH VIDEO]       [← Back]    │
├──────────────────────────────────────────────────┤
│ Type: [Regular ▼]  No: [S001]  Date: [25/03/26] │
│ Party: [_________________ autocomplete]          │
├──────────────────────────────────────────────────┤
│ # │ Item*        │ Batch │ Qty │ Rate  │ Amount  │
│ 1 │ Paracetamol  │ B012  │  5  │ 10.00 │  50.00  │
│ 2 │ Crocin       │ B089  │  2  │ 25.00 │  50.00  │
│ 3 │ [type here...│       │     │       │         │
├──────────────────────────────────────────────────┤
│                    Subtotal: ₹100.00             │
│                    CGST 6%:  ₹6.00               │
│                    SGST 6%:  ₹6.00               │
│                    Round Off: -₹0.00             │
│                    TOTAL:    ₹112.00             │
├──────────────────────────────────────────────────┤
│ [Cash] [UPI] [Bank] [Credit]     Amount: ₹112   │
├──────────────────────────────────────────────────┤
│ F10 Save & Print │ F9 Save & New │ Esc Close    │
└──────────────────────────────────────────────────┘
```

### Pattern 4: Dashboard Widget Card (used ~11 times)
```
┌────────────────────────┐
│ Net Sale    ↑ 12.5%    │
│ ₹45,230    from ₹40,200│
│ ┌──────────────────┐   │
│ │  📈 line chart   │   │
│ └──────────────────┘   │
└────────────────────────┘
```

---

## COMPLETE PAGE COUNT

| Module | Pages | Notes |
|--------|-------|-------|
| Login | 2 | Email step + Password step |
| Dashboard | 1 + settings panel | 11 widgets |
| Master - Ledger | 2 | List + Create/Edit (32 fields, 6 tabs) |
| Master - Account Groups | 2 | Tree view + Create |
| Master - Sale/Purchase Types | 4 | 2 lists + 2 create forms |
| Master - Items | 2 | List + Create/Edit (52 fields, 4 tabs) |
| Master - Simple (Store, Rack, Category, Salt, HSN, Unit, Manufacturer, Station) | 16 | 8 lists + 8 create forms |
| Master - Agency/Company | 2 | List + Create |
| Master - Discounts | 2 | 2 inline grid editors |
| Master - Pharmacy (Patient, Doctor, Prescription) | 6 | 3 lists + 3 create forms |
| Master - Pricing (Price List, Schemes, Currency, Exchange Rate) | 6 | 3 lists + 2 create + 1 config |
| Branch Management | 5 | Branch list, price list, transfers, reorder |
| Sale Transactions | 12 | 6 types × (list + create form) |
| Purchase Transactions | 8 | 4 types × (list + create form) |
| Accounting Vouchers | 16 | 8 types × (list + create form) |
| Stock Management | 5 | 3 types × list + 2 create forms |
| Daily Cashbook | 4 | Open/Close, Deposits, Approval, Transfer |
| Banking | 4 | Cheque book + 3 integration pages |
| CRM | 3 | Loyalty config, Prescription reminder, Approvals |
| Reports | 11 | Sales, Purchase, Stock, Outstanding, Ledger, GST, P&L, Balance Sheet, Day/Cash/Bank Book |
| Settings | 5 | Profile, Users, Control Room, Theme, Setup Wizard |
| **TOTAL** | **~111 unique screens** | |

---

## BUILD ORDER — What to Build First

**Phase 1 — Walk before you run (Weeks 1-4)**
1. Login (email → password → JWT → redirect)
2. App shell (sidebar + topbar + branch selector)
3. Dashboard (static layout with placeholder widgets)
4. Ledger Master (CRUD) — this teaches you the Pattern 1 template
5. Item Master (CRUD) — this teaches you the complex form pattern
6. Simple masters (Category, Unit, HSN, Store, Rack, Station, Manufacturer, Salt, Agency)

**Phase 2 — Start selling (Weeks 5-8)**
7. Sale Bill (list + create form with item grid) — THIS IS THE HARDEST SCREEN
8. Purchase Bill (reuse 80% of Sale Bill)
9. Sale Return + Purchase Return
10. Counter Sale (POS)
11. Stock automatically updating on bills

**Phase 3 — Money management (Weeks 9-11)**
12. Receipt + Payment vouchers
13. Journal, Contra, Debit Note, Credit Note
14. PDC cheques
15. Bank Reconciliation

**Phase 4 — Operations (Weeks 12-14)**
16. Stock Transfer
17. Physical Stock audit
18. Daily Cashbook (open/close, deposits, approval, transfer)
19. Cheque management

**Phase 5 — Reporting & Intelligence (Weeks 15-18)**
20. Report engine (reusable template with filters + export)
21. All 11 report types
22. Dashboard widgets (connect to real data)

**Phase 6 — Advanced (Weeks 19-22)**
23. CRM Loyalty system
24. Sale Order, Estimate, Challans (all reuse Bill form)
25. Multi-currency
26. Sales promotions/schemes
27. Branch transfers
28. Prescription management (pharmacy)

**Phase 7 — Polish (Weeks 23-24)**
29. Control Room (mega settings page)
30. User management + roles + permissions
31. Setup Wizard
32. Keyboard shortcuts
33. Print templates
34. Themes + languages

---

## WHAT TO REUSE — Don't Build Things Twice

| Build Once | Reuse In |
|-----------|----------|
| Master List Page template | All 25+ master lists |
| Bill/Voucher Create form | Sale Bill, Purchase Bill, Returns, Challans, Orders, Estimates |
| Voucher Create form (simpler) | Receipt, Payment, Journal, Contra, Debit Note, Credit Note, PDC |
| Autocomplete component | Party search, Item search, Doctor, Patient, everywhere |
| Item Grid component | All bill forms, Stock transfer, Physical stock, Opening stock |
| Tax Calculator | All bills (CGST + SGST or IGST based on state) |
| Report template | All 11 reports |
| Dashboard Widget card | All 11 dashboard widgets |

**In practice, if you build 8 components well, you've built 80% of the app.**

---

## REFERENCE

- Screenshots: `scrapers/margbooks/screenshots/pages/` (122 files) + `forms/` (139 files)
- Raw API data: `scrapers/margbooks/data/margbooks-complete-findings.json`
- Form field data: `scrapers/margbooks/data/margbooks-deep-forms.json`
- Investigation scripts: `scrapers/margbooks/scripts/`
- Technical blueprint (DB schema, APIs): `erp/ERP_BLUEPRINT.md`
- Detailed screen specs: `erp/ERP_SCREENS_AND_FLOWS.md`
