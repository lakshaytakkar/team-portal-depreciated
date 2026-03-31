# ERP System - Complete Screens, Flows, CRUD & Detail Pages

> 70 unique pages documented | 110+ screenshots | Every create form field captured
> Data source: `data/margbooks-deep-forms.json` + `data/margbooks-complete-findings.json`

---

## SCREEN INDEX

| # | Module | Screen | Type | Route |
|---|--------|--------|------|-------|
| 1 | Auth | Login - Email Step | Form | `/login` |
| 2 | Auth | Login - Password Step | Form | `/login` |
| 3 | Auth | Company/Branch Selector | Modal | `/home` |
| 4 | Dashboard | Main Dashboard | Dashboard | `/dashboard` |
| 5-13 | Master | 9 Master sub-sections | Various | `/mstr/*`, `/partymaster/*`, `/item-master/*` |
| 14-19 | Sale | 6 Transaction types | List+Form | `/transaction/sale/*` |
| 20-23 | Purchase | 4 Transaction types | List+Form | `/transaction/purchase/*` |
| 24-33 | Accounting | 10 Voucher types | List+Form | `/transaction/voucher/*` |
| 34-36 | Stock | 3 Stock operations | List+Form | `/transaction/stock*` |
| 37-40 | Cashbook | 4 Cash operations | List+Form | `/cashbook/*` |
| 41-44 | Banking | 4 Banking operations | List+Form | `/banking/*` |
| 45-47 | CRM | 3 CRM pages | Config+List | `/crm/*` |
| 48-58 | Reports | 11 Report types | Report | `/report/*` |
| 59-61 | Settings | 3 Config pages | Config | `/settings/*` |

---

## 1. AUTHENTICATION MODULE

### Screen 1.1: Login - Email Step
**Route**: `accounts.margbooks.com/login`
**Type**: Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Mobile / Email ID | text | Yes | Email or 10-digit mobile |

**Buttons**: SIGN IN, Set My PIN, Login With OTP
**Flow**: Enter email → SIGN IN → validates user exists → shows password step

### Screen 1.2: Login - Password Step
**Route**: `accounts.margbooks.com/login`
**Type**: Form

| Field | Type | Required |
|-------|------|----------|
| Password | password | Yes |

**Buttons**: CONTINUE, Back, Forgot Password
**Flow**: Enter password → CONTINUE → JWT token → redirect to `books.margbooks.com/dashboard`
**API**: `POST /v4.2/Loginuser/LoginNew` → returns JWT, gateway URL, company list

### Screen 1.3: Company/Branch Selector (post-login)
**Type**: Dropdown in TopBar
**Data**: Company name + Branch list
**Flow**: Select branch → all data scoped to that branch

---

## 2. DASHBOARD

### Screen 2.1: Main Dashboard
**Route**: `/dashboard`
**Type**: Widget-based dashboard

#### Dashboard Widgets (10 configurable cards)

| Widget | Type | Data | API |
|--------|------|------|-----|
| Net Sale | Line chart + KPI | Monthly sales, % change, ₹ value | `POST /DashBoard/SalesForEachMonth` |
| Net Purchase | Line chart + KPI | Monthly purchases, % change | `POST /DashBoard/PurchaseForEachMonth` |
| Gross Profit | Line chart + KPI | Monthly profit | `GET /DashBoard/GetGrossProfit` |
| Cash in Hand | Bar chart | Cash/UPI/Bank breakdown, Payment In/Out | `GET /DashBoard/GetCashInHandData` |
| Due Payment | Table | Patients/Party tabs, Total Due | `GET /DashBoard/GetDuePaymentData` |
| Fund Summary | Key-Value list | Bank Balance, Cash Balance, Deposits, Withdrawals, Cheque for Deposit | `POST /DashBoard/GetFundSummary` |
| Outstanding | Key-Value list | Current/Overdue Receivable & Payable | `POST /DashBoard/Dashboardoutstanding` |
| Business | Key-Value list | CGST/SGST/IGST Payable | `POST /DashBoard/DashboardBusinessData` |
| New Added | Counts | Items, Agency, Customer, Category, Supplier | `POST /DashBoard/NEWLYADDEDASHBOARD` |
| Stock Alerts | Counts | Expired, Near Expired, Reorder, Dump, Minimum | `POST /DashBoard/Dashboardstock` |
| Pending | Counts | Sales Challan, Sales Order, Purchase Order, Purchase Challan | `POST /DashBoard/PENDINGDASHBOARDDATA` |

**Controls**: Branch selector dropdown, Date range (Last 30 Days), Dashboard Setting button
**Setup Wizard**: "Finish setting up" banner with % completion tracker

---

## 3. MASTER MODULE

### Screen 3.1: Ledger Master (Party/Account)

#### 3.1.1 Ledger List Page
**Route**: `/partymaster/list`
**List columns**: Ledger Code | Ledger Name | Station | Balance (₹) | Action
**Total records**: 87 ledgers
**Search options**: Name, Code, Mobile, D.L. No.
**Actions per row**: Edit (pencil), PDC (F6), Ledger Statement (F4), Outstanding (F8)
**Toolbar**: WATCH VIDEO, Create/F2, ---Blank--- filter, Toggle Dropdown
**Config dropdowns**: Code display (No/Only Transaction/Report & Transaction), Station (Y/N), Mobile mandatory (Y/N), Ledger search by, Ship To Address (Y/N)

#### 3.1.2 Create Ledger Form
**Route**: `/partymaster/create`
**Form layout**: 2-column with tabbed sections

**General Info Section (top)**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Alternate Code | text | Yes* | Auto-generated |
| Party Name | text | Yes* | Ledger/Party name |
| Account Group | autocomplete | Yes* | e.g. Sundry Debtors |
| Station | autocomplete | Yes* | Area/region |
| Mail To | text | No | Email for correspondence |
| Address (3 lines) | text | No | Full address |
| Country | autocomplete | No | Default: India |
| State | autocomplete | No | Default: Uttar Pradesh |
| City | text | No | |
| Pincode | text | No | |
| Currency | select | No | Select Currency |
| Branch | select | No | ---Blank--- |
| Parent Ledger | autocomplete | No | For sub-ledgers |

**Balance Section (right panel)**:

| Field | Type | Notes |
|-------|------|-------|
| Balancing Method | select | Bill By Bill |
| Opening Balance | currency | ₹ 0.00 |
| Dr/Cr | select | Debit/Credit |
| Credit Days | number | 0 |

**Contact Numbers (right panel)**:

| Field | Type | Required |
|-------|------|----------|
| Phone No. (Office) | tel (+91) | No |
| Mobile No. 1 | tel (+91) | Yes* |
| Mobile No. 2 | tel (+91) | No |
| WhatsApp No. | tel (+91) | No |

**Tabbed Sections (bottom)**:

| Tab | Fields |
|-----|--------|
| **GST/Tax Details** | Ledger Type (Unregistered/Registered/Composition), PAN No., GSTIN, GST State Code |
| **Licence Info** | Drug License No., FSSAI No., Other licenses |
| **Contact Info** | Contact Person, Designation, Department, Birthday |
| **Bank Details** | Bank Name, Account No., IFSC Code, Branch |
| **Loyalty Details** | Loyalty points config, Card number |
| **Others** | Custom fields, Notes |

**Bottom bar**: GST Verification button, F10 Save, F9 Clear, Esc Close

---

### Screen 3.2: Account Group

#### 3.2.1 Account Group List (Tree View)
**Route**: `/mstr/accountgroup`
**Display**: Hierarchical tree with expand/collapse
**Toolbar**: Create/F2, Collapse All
**Built-in groups**: Assets, Liabilities, Income, Expenses with nested sub-groups

#### 3.2.2 Create Account Group
| Field | Type | Required |
|-------|------|----------|
| Group Name | text | Yes* |
| Under Group | autocomplete | Yes* |
| Prohibited | select | No (Yes/No) |

---

### Screen 3.3: Sale Type Master

#### 3.3.1 Sale Type List
**Route**: `/mstr/sale-type`
**Default types**: Regular Sale, Export Sale, Deemed Export Sale, Counter Sale, GST Exempt

#### 3.3.2 Create Sale Type
| Field | Type | Required |
|-------|------|----------|
| Short Name | text | Yes* |
| Local Ledger | autocomplete | No |
| Central Ledger | autocomplete | No |
| IGST % | number | No |
| CGST % | number | No |
| SGST % | number | No |
| Cess % | number | No |
| Nature of Transaction | radio | Sales |
| Taxability | radio | Taxable / Exempted / Nil Rated / Zero Rated |
| IGST/CGST/SGST/Cess Heading | text | Auto-linked |

---

### Screen 3.4: Purchase Type Master
*Same structure as Sale Type with Purchase nature*

---

### Screen 3.5: Item Master (Product)

#### 3.5.1 Item List Page
**Route**: `/item-master/list`
**Total records**: 2,638 items
**List columns**: Product | Packing | Company | Pack | HSN | Rate
**Search options**: Description, Barcode, Any Where, Top Sale
**Function keys**: F4 Ledger, F6 Old Rates, F7 Substitute, F8 Salt, F9 Company, Alt+F11 Category
**Extra actions**: Available Stock, Shortage Qty

#### 3.5.2 Create Item Form
**Route**: `/item-master/create`
**Layout**: 3-section (Basic Info left, Rates center-right, Advance Info right panel)

**Basic Info**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Bar Code | text | No | Scannable |
| Print Label | select | Yes/No | |
| Product Name | text | Yes* | Main description |
| Supply Type | select | Goods/Services | |
| Packing | text | No | e.g. "10x10" |
| Unit 1st | autocomplete | Yes* | Primary unit (Tab, Strip, etc.) |
| Unit-2 | autocomplete | No | Secondary unit |
| Conversion | text | No | Unit conversion factor |
| Unit in Decimal | select | No (Yes/No) | |
| HSN/SAC | autocomplete | Yes* | Tax code |
| Tax Category | autocomplete | Yes* | Tax rate |
| Company (Agency) | autocomplete | Yes* | Supplier |
| Salt/Composition | autocomplete | No | Ingredients |
| Category | autocomplete | No | Product category |
| Rack | autocomplete | No | Storage location |

**Rates (center)**:

| Field | Type | Notes |
|-------|------|-------|
| M.R.P | currency | ₹ 0.00 |
| Purchase Rate | currency | ₹ 0.00 |
| Cost | currency | ₹ 0.00 (auto-calculated) |
| Sale Rate | currency | ₹ 0.00 |

**Pharmacy Controls**:

| Field | Type | Options |
|-------|------|---------|
| Narcotics | select | No/Yes |
| Schedule H | select | No/Yes |
| Schedule H1 | select | No/Yes |
| Schedule Drug | select | No/Yes |
| Presc. Required | select | No/Yes |
| Storage Type | select | Normal/Cold Storage |
| Color Type | select | ---Blank--- |
| TB Item | select | Normal |

**Advance Info (right panel tabs)**:

| Tab | Fields |
|-----|--------|
| **Discount** | Discount type (Applicable), Item Disc 1%, Volume Disc 1, Volume Disc 2, Max Disc% |
| **Quantity** | Min Stock, Max Stock, Reorder Level, Reorder Qty |
| **Other Info** | Alias, Batch required, Expiry required, MFG date |
| **Extra Info** | Custom fields |

**Bottom bar**: F10 Save, F9 Clear, Esc Close

---

### Screen 3.6: Store Master
**Route**: `/mstr/store`

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Branch | select | Yes (multi-branch) |
| Store Code | text | Yes* |
| Store Name | text | Yes* |
| Store No | text | No |
| Address (3 lines) | text | No |

---

### Screen 3.7: Rack Master
**Route**: `/mstr/rack`

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Rack No | text | No |
| Store | autocomplete | No |
| Rack Name | text | Yes* |

---

### Screen 3.8: Company/Agency Master
**Route**: `/agency-master/list`
**Total records**: 470 agencies

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Company Name | text | Yes* |
| More Option | checkbox | Expand extra fields |
| Sub Group | select | No/Yes |

**Expanded (More Option)**:
Address, Contact Person, Mobile, Email, GSTIN, PAN, DL No., Bank details

---

### Screen 3.9: Category Master
**Route**: `/mstr/category`
| Field | Type | Required |
|-------|------|----------|
| Category Name | text | Yes* |

### Screen 3.10: Salt/Composition Master
**Route**: `/mstr/salt`
| Field | Type | Required |
|-------|------|----------|
| Salt Name | text | Yes* |
| More Info | checkbox | Expand |

### Screen 3.11: HSN/SAC Master
**Route**: `/mstr/hsn`
| Field | Type | Required |
|-------|------|----------|
| Search By | select | Name/HSN Code |
| HSN Code | text | Yes* |
| HSN Name | text | No |

### Screen 3.12: Unit Master
**Route**: `/mstr/unit`
| Field | Type | Required |
|-------|------|----------|
| Unit Name | text | Yes* |
| Alternate Unit | autocomplete | No |

### Screen 3.13: Manufacturer Master
**Route**: `/mstr/manufacturer`
**Search by**: Name, Mobile No.
| Field | Type | Required |
|-------|------|----------|
| Name | text | Yes* |
| More Option | checkbox | Expand (Mobile, Address, Email) |

---

### Screen 3.14: Patient Master (Pharmacy)
**Route**: `/chemist/patient`
**Search by**: All, Mobile No, Name, Patient ID, Government ID

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Search Type | select | Filter |
| Mobile No. | text | Yes* |
| Code | text | Auto |
| Name | text | No |
| Gender | select | Male/Female/Other |
| Age | number | No |
| Linked Ledger | autocomplete | No |
| Address | textarea | No |
| Pincode | text | No |
| Phone No. | text | No |
| Email | text | No |
| WhatsApp No. | text | No |
| Manage Outstanding | checkbox | No |

### Screen 3.15: Doctor Master (Pharmacy)
**Route**: `/chemist/doctor`
**Search by**: All, Mobile No., Name, Doctor ID, Registration No

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Mobile No. | text | No |
| Code | text | Auto |
| Registration No. | text | No |
| Name | text | Yes* |
| Hospital Name | text | No |
| Commission % | number | No |
| Location Code | text | No |
| Address | textarea | No |
| Pin | text | No |
| Phone | text | No |
| Email | text | No |
| WhatsApp No. | text | No |

### Screen 3.16: Prescription
**Route**: `/chemist/prescription`
**Search by**: Prescription No., Patient Name, Patient Mobile, Doctor Name

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Prescription Code | text | Auto |
| Prescription Date | date | Yes |
| Prescription For Days | number | No |
| Patient Code | text/autocomplete | Yes |
| Patient Name | text | Auto-fill |
| Patient Address | textarea | Auto-fill |
| Patient Phone | text | Auto-fill |
| Doctor Code | text/autocomplete | No |
| Doctor Reg No. | text | Auto-fill |
| Doctor Name | text | Auto-fill |

**Item Grid** (added after header): Item name, Qty, Dosage, Duration

### Screen 3.17: Station Master
**Route**: `/mstr/station`
| Field | Type | Required |
|-------|------|----------|
| Station Name | text | Yes* |

### Screen 3.18: Opening Stock
**Route**: `/mstr/opening-stock`
| Field | Type | Required |
|-------|------|----------|
| Branch | select | Yes |
| Store | autocomplete | Yes |

**Item Grid**: Item, Batch, Qty, Rate, Amount

### Screen 3.19: Sales Promotions/Schemes
**Route**: `/mstr/scheme/list`

**Create Form**:
| Field | Type | Required | Options |
|-------|------|----------|---------|
| Scheme Name | text | Yes* | |
| Scheme Type | select | Yes | Buy X Get Y / Discount / Combo |
| Selection Criteria | select | Yes | Item / Category / Agency |

**Detail form**: Start Date, End Date, Min Qty, Free Qty, Discount %, Items grid

### Screen 3.20: Multi Currency
**Route**: `/mstr/multi-currency`
| Field | Type | Required |
|-------|------|----------|
| Currency Name | text | Yes* |
| Currency Symbol | text | Yes* |
| Currency String | text | Yes* |
| Currency Sub-string | text | Yes* |

### Screen 3.21: Exchange Rate
**Route**: `/mstr/exchangerate`
**Display**: Currency dropdown + rate entry + History button

### Screen 3.22: Agency General Discount
**Route**: `/mstr/agency-general-discount`
**Type**: Grid editor (no separate create form)
**Columns**: Agency Name, Discount Type (perUnit/No/Lumpsum/Percentage), Discount Value

### Screen 3.23: Item Wise Discount
**Route**: `/mstr/Item-wise-discount`
**Type**: Grid editor
**Actions**: F10 Update, Esc Close

---

## 4. BRANCH MANAGEMENT

### Screen 4.1: Branch List
**Route**: `/companymaster/branchList`
**Create**: Branch Name, Code, Address, Licence details (DL No. x4)

### Screen 4.2: Price List
**Route**: `/companymaster/price`
**Create**: Price List Name, MRP field, Licence details

### Screen 4.3: Branch Transfer
**Route**: `/companymaster/branchadmin?id=2`
**Create**: Transfer entries between branches

### Screen 4.4: Pending Branch Transfer List
**Route**: `/companymaster/branchtransfer?id=1`
**Actions**: Back, + Create Branch Transfer Entries

### Screen 4.5: Min/Max Qty (Reorder)
**Route**: `/companymaster/reorderqty`
**Create**: Item → Min Qty, Max Qty, Reorder Level, Reorder Qty

---

## 5. SALE TRANSACTIONS

### Screen 5.1: Sale Bill

#### 5.1.1 Sale Bill List
**Route**: `/transaction/sale/list`
**Columns**: Bill No. | Date | Party Name | Amount | Status | Actions
**Filters**: Date range, Search, Sale Type
**Actions**: View, Edit, Print, Cancel, Delete

#### 5.1.2 Create Sale Bill (CORE TRANSACTION FORM)
**Route**: `/transaction/sale/create`
**This is the most complex form in the system**

**Header Section**:
| Field | Type | Required |
|-------|------|----------|
| Sale Type | select | Yes (Regular Sale, etc.) |
| Bill No. | text | Auto-generated |
| Bill Date | date | Yes (today default) |
| Party Name | autocomplete | Yes |
| Doctor | autocomplete | No (pharmacy) |
| Patient | autocomplete | No (pharmacy) |
| Reference No. | text | No |
| Narration | textarea | No |

**Item Grid (main area)**:
| Column | Type | Notes |
|--------|------|-------|
| S.No. | auto | Row number |
| Item Name | autocomplete | Search by name/barcode |
| Batch No. | select | Auto-populated from stock |
| Expiry | date | From batch |
| MFG | date | From batch |
| Qty | number | Required |
| Free | number | Free quantity |
| Unit | text | From item master |
| MRP | currency | From batch |
| Rate | currency | Sale rate |
| Disc % | number | Discount |
| Disc Amt | currency | Auto-calculated |
| Taxable | currency | Auto-calculated |
| GST % | number | From HSN |
| CGST | currency | Auto-calculated |
| SGST | currency | Auto-calculated |
| Amount | currency | Auto-calculated |

**Totals Section (bottom)**:
| Field | Value |
|-------|-------|
| Subtotal | ₹ sum of line items |
| Discount | ₹ total discount |
| Taxable Amount | ₹ |
| CGST Total | ₹ |
| SGST Total | ₹ |
| IGST Total | ₹ (for inter-state) |
| Cess | ₹ |
| Round Off | ₹ (auto) |
| **Grand Total** | **₹ final amount** |

**Payment Section**:
| Field | Type | Options |
|-------|------|---------|
| Payment Mode | tabs/radio | Cash / UPI App / Bank / Cheque / Credit |
| Amount | currency | Defaults to Grand Total |
| Bank | select | If Bank/Cheque selected |
| Cheque No. | text | If Cheque selected |
| UPI Ref | text | If UPI selected |

**Bottom Toolbar**: F10 Save & Print, F9 Save & New, Esc Close, Hold (F5), Print Settings

---

### Screen 5.2: Sale Return
**Route**: `/transaction/salereturn/list`
**Same as Sale Bill but**:
- References original bill number
- Negative stock movement
- Return reason field

### Screen 5.3: Sale Challan (Delivery Note)
**Route**: `/transaction/salechallan/list`
**Same as Sale Bill but**: No payment section, Pending → Convert to Bill

### Screen 5.4: Sale Order
**Route**: `/transaction/saleorder/list`
**Same as Sale Bill but**: No stock reduction, Pending → Convert to Challan/Bill

### Screen 5.5: Estimate/Quotation
**Route**: `/transaction/estimate/list`
**Same as Sale Bill but**: No stock impact, No payment, Print as quotation

### Screen 5.6: Counter Sale (POS Mode)
**Route**: `/transaction/countersale`
**Simplified sale for walk-in customers**:
- No party name required (Cash Sale)
- Quick barcode scanning
- Direct payment collection
- Receipt printing

---

## 6. PURCHASE TRANSACTIONS

### Screen 6.1: Purchase Bill
**Route**: `/transaction/purchase/list`
**Same structure as Sale Bill but**:
- Supplier instead of Customer
- Purchase rates
- Stock addition instead of reduction
- Supplier invoice reference

### Screen 6.2: Purchase Return
**Route**: `/transaction/purchasereturn/list`
**References original purchase bill, negative stock**

### Screen 6.3: Purchase Challan (Goods Receipt Note)
**Route**: `/transaction/purchasechallan/list`
**Stock received but bill not yet received**

### Screen 6.4: Purchase Order
**Route**: `/transaction/purchaseorder/list`
**Order placed with supplier, no stock impact**

---

## 7. ACCOUNTING TRANSACTIONS

### Screen 7.1: Receipt Voucher
**Route**: `/transaction/voucher/receipt/53`

**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Payment Mode | autocomplete | Yes (Cash/Bank) |
| Remark | textarea | No |
| Voucher No | auto/manual | Config |

**Line Items**:
| Column | Type |
|--------|------|
| Ledger | autocomplete |
| Amount | currency |
| Narration | text |

**Tabs**: Receipt 1 (add multiple receipt lines)
**Bottom**: F10 Save, Esc Close

### Screen 7.2: Payment Voucher
**Route**: `/transaction/voucher/payment/51`
*Same structure as Receipt but payment direction*

### Screen 7.3: Debit Note
**Route**: `/transaction/voucher/debitnote/56`
| Field | Type | Required |
|-------|------|----------|
| Entry Date | date | Yes |
| Voucher No. | text | Yes* |
| Remark | textarea | No |
**Tabs**: Debit Note 1 (Party + Amount lines)

### Screen 7.4: Credit Note
**Route**: `/transaction/voucher/creditnote/57`
*Same as Debit Note, opposite direction*

### Screen 7.5: Contra Voucher
**Route**: `/transaction/voucher/contra/55`
**Purpose**: Cash ↔ Bank transfers
| Field | Type | Required |
|-------|------|----------|
| Entry Date | date | Yes |
| Voucher No. | text | Yes* |
| Remark | textarea | No |
**Lines**: From Account, To Account, Amount

### Screen 7.6: Journal Voucher
**Route**: `/transaction/voucher/journal/58`
| Field | Type | Required |
|-------|------|----------|
| Entry Date | date | Yes |
| Voucher No. | text | Yes* |
| GST Expenses | select | No |
| Remark | textarea | No |
**Lines**: Multiple Dr/Cr entries, must balance

### Screen 7.7: PDC Payment
**Route**: `/transaction/voucher/pdc-payment/62`
| Field | Type |
|-------|------|
| Ledger | autocomplete |
| Cheque Date | date |
| Cheque No. | text |
| Amount | currency |
| Bank | select |

### Screen 7.8: PDC Receipt
**Route**: `/transaction/voucher/pdc-receipt/63`
*Same as PDC Payment, receipt direction*

### Screen 7.9: Bank Reconciliation
**Route**: `/banking/reconciliation`
| Field | Type |
|-------|------|
| Select Bank | select (Bank/Bank Of India/HDFC Bank) |
| Remarks | text |
**List**: Unreconciled transactions to match against bank statement

---

## 8. STOCK MANAGEMENT

### Screen 8.1: Stock Transfer
**Route**: `/transaction/stocktransferlist`
**List**: Transfer No. | Date | From Store | To Store | Status
**Create**: Branch select → From Store → To Store → Item grid (Item, Batch, Qty)

### Screen 8.2: Physical Stock (Audit)
**Route**: `/transaction/physicalstocklist`
**Create Form**:
| Field | Type | Required |
|-------|------|----------|
| Entry No. | text | Auto |
| Date | date | Yes |
| Store | select | Yes |
| Type | select | Full/Partial |
| Remark | textarea | No |

**Process**: Enter physical counts → System shows differences → F10 Process Data

### Screen 8.3: Bill of Materials
**Assembly/manufacturing BOM**: Parent item → Component items with quantities

---

## 9. DAILY CASHBOOK

### Screen 9.1: Open/Close Cashday
**Route**: `/cashbook/openclosecashbook`
**Flow**:
1. **Start Billing** → Opens cash session for current user
2. All sale transactions recorded under this session
3. **Close Day** → Shows summary (Cash Receipt, Expenses, Net Cash)
4. Submit for approval

### Screen 9.2: Cash Deposits
**Route**: `/cashbook/CashDeposits`
**Table**: S.No. | Date | Cash Receipt (₹) | Expenses (₹) | Net Cash (₹)
**10 rows** of daily summary
**Fields**: Select Bank (Bank/Bank Of India/HDFC Bank), Difference, Remark
**Actions**: Save (F10), Close (Esc), Attached Counter Slips

### Screen 9.3: Day Closure Approval
**Route**: `/cashbook/dayclosureapproval`
**Manager view**: List of pending day closures → Approve/Reject

### Screen 9.4: Cash Transfer
**Route**: `/cashbook/cashTransfer`
| Field | Type |
|-------|------|
| Current Cash Balance | display |
| Transfer Amount | currency |
| Transfer To | select (users: rahul casier/suresh/suresh servi/rahum/shivangi mam) |
**Actions**: Submit, Cancel

---

## 10. BANKING

### Screen 10.1: Online Payment
Direct payment processing interface

### Screen 10.2: Online Statement
Bank statement import/view

### Screen 10.3: Online Reconciliation
Auto-matching bank transactions

### Screen 10.4: Cheque Management
**Route**: `/banking/chequebook`

**Cheque Book Create**:
| Field | Type | Required |
|-------|------|----------|
| Date From | date | No |
| Date To | date | No |
| Receiving Date | date | No |
| Bank/Ledger | autocomplete | Yes* |
| Cheque From | text | Yes* |
| Cheque To | text | Yes* |
| Total Cheques | text | Auto-calculated |

**Cheque Actions**: Create/F2, Modify/F3, Delete, Show All/F7, Cancel Cheque, Reuse Cheque

---

## 11. CRM MODULE

### Screen 11.1: Loyalty Management System
**Route**: `/crm/loyalty/create-loyalty`
**Type**: Configuration form (not CRUD list)

| Field | Type | Options |
|-------|------|---------|
| Point Apply On | select | Item Wise / Bill Amount |
| Point Calculation Method | select | Fraction / Range of Amount |
| Point Value | number | Points per unit/amount |
| Point Redeem Rate | number | ₹ per point |
| Minimum Amount | currency | Min purchase for earning |
| OTP Required | select | Yes / No |
| Point Rounding | select | Auto / No |
| Apply To | select | All Items / Selected Items |

### Screen 11.2: Prescription Reminder
**Route**: `/report/crm/prescription/cm-default`
**Type**: Report with Custom Design option
**34 filter fields** (Standard report template)

### Screen 11.3: Pending Approvals
**Route**: `/crm/pending-grid`
**Radio filters**: 4 approval type filters
**Grid**: Pending requests from various modules

---

## 12. REPORTS MODULE

### Report Template Pattern
All reports follow a consistent pattern:
- **Route**: `/report/{module}/cm-default`
- **Filter panel**: Date range, Branch, Party, Item, Category, etc.
- **Custom Design**: Drag-and-drop column selector
- **Export**: PDF, Excel, Print
- **Configuration**: Saved report templates

### Screen 12.1: Sales Report
**Route**: `/report/sale/cm-default`
**Sub-reports**: Daily Sales, Party-wise, Item-wise, Sales Register, HSN Summary, Sales Return

### Screen 12.2: Purchase Report
**Route**: `/report/purchase/cm-default`
**Sub-reports**: Daily Purchase, Party-wise, Item-wise, Purchase Register, HSN Summary

### Screen 12.3: Stock Report
**Route**: `/report/stock/cm-default`
**Sub-reports**: Current Stock, Stock Valuation, Expiry Report, Near Expiry, Reorder, Dump Stock, Batch-wise

### Screen 12.4: Outstanding Report
**Route**: `/report/outstanding/cm-default`
**Sub-reports**: Receivable, Payable, Aging Analysis, Party-wise
**Actions**: Configuration, Custom Design

### Screen 12.5: Ledger Report
**Route**: `/report/ledger/cm-default`
**Sub-reports**: Ledger Statement, Trial Balance, Group Summary

### Screen 12.6: GST Reports
**Route**: `/report/gst/cm-default`
**Sub-reports**: GSTR-1, GSTR-2, GSTR-3B, HSN Summary, GST Summary
**Export**: JSON format for government portal

### Screen 12.7: Profit & Loss
**Route**: `/report/profitloss/cm-default`
**Standard P&L statement with Custom Design**

### Screen 12.8: Balance Sheet
**Route**: `/report/balancesheet/cm-default`
**Standard Balance Sheet with WATCH VIDEO guide**

### Screen 12.9: Day Book
**Route**: `/report/daybook/cm-default`
**All transactions for a day with Configuration + Custom Design**

### Screen 12.10: Cash Book Report
**Route**: `/report/cashbook/cm-default`
**Cash transactions summary**

### Screen 12.11: Bank Book Report
**Route**: `/report/bankbook/cm-default`
**Bank transactions summary**

---

## 13. SETTINGS & CONFIGURATION

### Screen 13.1: Company Profile
**Route**: `/settings/profile`
**Sections**: Company info, Logo upload, Address, Tax details, Bank details

### Screen 13.2: User Management
**Route**: `/settings/user`
**CRUD**: Create users, assign roles, set branch access
**Fields**: Name, Email, Mobile, Password, Role, Branch, Counter assignment

### Screen 13.3: Control Room
**Route**: `/settings/controlroom`
**Mega-config panel with sections**:
- Master Power Settings (per field visibility/editability)
- Billing Settings
- Inventory Settings
- Tax/GST Settings
- Print Template Configuration
- Notification Settings

---

## 14. UTILITY SCREENS

### Screen 14.1: Setup Wizard
**Dashboard banner**: "Finish setting up → 85.71% Completed"
**Steps**: Company details → Branch → Users → Tax → Items → Opening Balance → Bank

### Screen 14.2: Dashboard Settings Panel
**Accessed from**: Settings icon on dashboard
**Options**: User Access & Privileges (Configure), Control Room (Configure), Change Theme (8 themes), Change Language (6 languages), Manage Subscription, Implementation & Training, Referral Code

### Screen 14.3: Keyboard Shortcuts Panel
**Accessed from**: Shortcut icon in top bar
**Key bindings**: Alt+N (Sale Bill), F2 (Create), F3 (Modify), F4 (Ledger), F6 (PDC/Old Rates), F7 (Substitute/Show All), F8 (Salt/Outstanding), F9 (Company/Clear), F10 (Save), Esc (Close), Del (Delete)

### Screen 14.4: Notification Panel
**Tabs**: Notifications | Announcements
**Badge**: Unread count
**Types**: System, Transaction, Approval, Alert

### Screen 14.5: Recent History
**Sidebar panel**: Last activities with timestamp, user, action, module

### Screen 14.6: Data Migration
**Key display**: Migration key for importing data from desktop Marg ERP
**View**: Migration details and status

---

## COMPLETE FLOW DIAGRAMS

### Flow 1: Sale Bill Creation
```
Dashboard → Sale (sidebar) → Sale Bill → Create/F2
→ Select Sale Type → Enter Party Name (autocomplete)
→ [Optional: Select Doctor/Patient]
→ Scan/Search Items → Select Batch → Enter Qty
→ System auto-calculates: Rate, Discount, Tax, Amount
→ Add more items (repeat)
→ Review Totals (Subtotal, Tax, Round-off, Grand Total)
→ Select Payment Mode (Cash/UPI/Bank/Credit)
→ F10 Save & Print → Print Invoice → Back to List
```

### Flow 2: Purchase Bill Entry
```
Dashboard → Purchase → Purchase Bill → Create/F2
→ Select Purchase Type → Enter Supplier
→ Enter Supplier Invoice No. & Date
→ Add Items with Batch, Expiry, Qty, Rate
→ System calculates Tax
→ Review & Save (F10)
→ Stock automatically updated
```

### Flow 3: Daily Cash Cycle
```
Start of Day:
  Cashbook → Open/Close Cashday → Start Billing
  → Cash session opens with opening balance

During Day:
  Create Sale Bills → Payment collected
  Create Receipts/Payments → Cash movements

End of Day:
  Cashbook → Open/Close Cashday → Close Day
  → Review: Cash Receipt, Expenses, Net Cash
  → Cash Deposits → Select Bank → Record deposit
  → Submit for Manager Approval

Manager:
  Cashbook → Manage Approvals → Approve/Reject
```

### Flow 4: Stock Management
```
Reorder Alert (Dashboard) → Purchase Order (create)
→ Supplier confirms → Purchase Challan (goods received)
→ Purchase Bill (invoice received) → Stock updated
→ Stock Transfer (if multi-store)
→ Sale Bill (stock reduced)
→ Physical Stock Audit → Adjust differences
```

### Flow 5: Accounting Cycle
```
Sale/Purchase transactions auto-post to ledgers
→ Manual adjustments via Journal/Contra vouchers
→ Receipt/Payment for settling outstanding
→ PDC management for future cheques
→ Bank Reconciliation (match with statement)
→ Reports: Trial Balance → P&L → Balance Sheet
→ GST Reports → File returns
```

### Flow 6: CRM - Loyalty Points
```
Admin: CRM → Loyalty Management → Configure rules
→ Set point calculation method, redeem rate
Customer makes purchase:
→ Points earned automatically based on bill amount
→ Points shown on receipt
Customer redeems:
→ At billing, apply loyalty points as discount
→ OTP verification (if configured)
```

---

## SCREEN COUNT SUMMARY

| Category | List Pages | Create Forms | Edit Forms | Detail Views | Config Pages | Reports | Total |
|----------|-----------|-------------|------------|-------------|-------------|---------|-------|
| Auth | 2 | - | - | - | - | - | 2 |
| Dashboard | 1 | - | - | - | 1 | - | 2 |
| Master - Accounts | 4 | 4 | 4 | 4 | - | - | 16 |
| Master - Inventory | 10 | 10 | 10 | - | - | - | 30 |
| Master - Discounts | 2 | - | - | - | - | - | 2 |
| Master - Other (Pharmacy) | 3 | 3 | 3 | - | - | - | 9 |
| Master - Misc | 5 | 5 | - | - | - | - | 10 |
| Branch | 5 | 4 | - | - | - | - | 9 |
| Sale | 6 | 6 | 6 | 6 | - | - | 24 |
| Purchase | 4 | 4 | 4 | 4 | - | - | 16 |
| Accounting | 8 | 8 | 8 | - | - | - | 24 |
| Stock | 3 | 3 | - | - | - | - | 6 |
| Cashbook | 4 | - | - | - | - | - | 4 |
| Banking | 4 | 1 | - | - | - | - | 5 |
| CRM | 1 | - | - | - | 1 | 1 | 3 |
| Reports | - | - | - | - | - | 11 | 11 |
| Settings | - | 1 | - | - | 2 | - | 3 |
| Utilities | - | - | - | - | 5 | - | 5 |
| **TOTAL** | **62** | **49** | **35** | **14** | **9** | **12** | **181** |

### Grand Total: ~181 unique screens/views to build
