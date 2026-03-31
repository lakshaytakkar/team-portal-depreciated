import type { SopConfig, TutorialConfig } from "@/components/sop/sop-modal";

export const SOP_REGISTRY: Record<string, { sop: SopConfig; tutorial: TutorialConfig }> = {
  "faire-applications": {
    sop: {
      title: "Faire Seller Account Application — SOP",
      description: "Standard Operating Procedure for getting a new Faire wholesale seller account approved.",
      steps: [
        { n: 1, title: "Decide Brand Identity", body: "Choose a brand name, product category, and write a compelling brand story. Create/procure a logo and banner image. These must be ready before starting the Faire registration.", warn: "Brand name must be unique and not conflict with existing Faire sellers." },
        { n: 2, title: "Set Up Brand Email", body: "Create a dedicated email for the brand — either a branded email (name@domain.com) or a free Gmail/Outlook. Branded email significantly increases approval chances.", warn: "Use a professional-looking email. Avoid random strings or numbers." },
        { n: 3, title: "Purchase Domain & Build Website OR Create Etsy Store", body: "Faire requires evidence of an established brand. You can either: (A) Purchase a domain, build a simple website and deploy it, OR (B) Create an Etsy store with your products listed. Both options work; using Etsy is faster but option A looks more professional.", warn: "Etsy store must have at least 10–15 active product listings before applying." },
        { n: 4, title: "Scrape & List Products", body: "Identify a reference store (competitor or brand you'll model after). Use the internal scraping process to extract ~15 products with images, titles, and descriptions. List them on Etsy via CSV upload, Shopify sync, or manual entry. Save the CSV file for records.", warn: "Product listings must match Faire's category and not violate any IP rights." },
        { n: 5, title: "Prepare Legal Documents", body: "Have the following ready to upload: (1) EIN (Employer Identification Number) — get from IRS.gov. (2) Articles of Organization — state-issued LLC formation document. These may be requested during review.", warn: "EIN must match the business name used in the Faire application." },
        { n: 6, title: "Submit Faire Application", body: "Go to the Faire brand registration page (link in Quick Links). Fill in all brand details, upload logo, write brand story, set MOQ and pricing. Submit and record the application date.", warn: "Do not leave any required fields blank. Incomplete applications are auto-rejected." },
        { n: 7, title: "Follow Up & Monitor", body: "Faire typically responds within 1–4 weeks. Log all communication in the Follow-up Timeline. If Faire requests additional documents (common for new brands), upload and respond promptly. Change status to 'Pending Docs' when this happens.", warn: "Responding to doc requests within 48 hours significantly improves approval rates." },
        { n: 8, title: "Approval / Rejection", body: "If approved: Use 'Promote to Store' to move this application to the Stores section and connect credentials. If rejected: Document the reason, address issues, and reapply after 90 days. Update status accordingly." },
      ],
      quickLink: { label: "Open Faire Registration Page", url: "https://www.faire.com/brand-portal/signup" },
    },
    tutorial: {
      title: "Faire Seller Account — Video Tutorial",
      description: "Step-by-step walkthrough of the entire application process.",
    },
  },

  "faire-orders": {
    sop: {
      title: "Faire Order Processing — SOP",
      description: "Standard procedure for processing incoming Faire wholesale orders from receipt to fulfillment.",
      steps: [
        { n: 1, title: "Review New Order", body: "When a new order appears in the queue, review the retailer details, items ordered, quantities, and shipping address. Cross-check the order total against Faire's commission structure." },
        { n: 2, title: "Verify Inventory", body: "Check current stock levels for all items in the order. If any items are out of stock, contact the retailer immediately through Faire messenger to propose alternatives or partial fulfillment.", warn: "Do not accept an order if inventory cannot be fulfilled within the SLA window." },
        { n: 3, title: "Generate Packing Slip & Invoice", body: "Print or export the packing slip from Faire. Match quantities and SKUs against the order. Attach the invoice to the shipment records." },
        { n: 4, title: "Pack & Ship", body: "Pack items securely with branded packaging if available. Weigh the package and choose the optimal shipping method. Generate shipping label and upload tracking number to Faire.", warn: "Faire requires tracking upload within 3 business days or the order may be auto-cancelled." },
        { n: 5, title: "Mark as Shipped", body: "Update the order status to 'Shipped' in the system. The retailer will be auto-notified via Faire. Monitor for any delivery exceptions." },
        { n: 6, title: "Post-Delivery Follow-Up", body: "After delivery confirmation, check for any retailer feedback or return requests. Update the order status to 'Delivered'. Log any issues for quality review." },
      ],
    },
    tutorial: {
      title: "Faire Order Processing — Video Tutorial",
      description: "Complete walkthrough of processing a Faire order from receipt to delivery.",
    },
  },

  "faire-quotations": {
    sop: {
      title: "Quotation Management — SOP",
      description: "Standard procedure for creating and managing wholesale quotations for retailers.",
      steps: [
        { n: 1, title: "Receive Quote Request", body: "When a retailer requests a custom quote, log it in the system with the retailer name, requested items, quantities, and any special requirements (custom packaging, branding, etc.)." },
        { n: 2, title: "Calculate Pricing", body: "Use the pricing calculator to determine wholesale prices based on quantity tiers, shipping costs, and margin requirements. Apply any volume discounts or promotional rates.", warn: "Minimum margin must be maintained at 25% after Faire commission." },
        { n: 3, title: "Prepare Quotation Document", body: "Generate the quotation with itemized pricing, terms (NET 60/NET 30), MOQ requirements, and estimated shipping timeline. Include product images and specifications." },
        { n: 4, title: "Internal Approval", body: "For quotes above $5,000, get manager approval before sending. Document the approval in the system notes." },
        { n: 5, title: "Send to Retailer", body: "Send the quotation via Faire messenger or email. Set a follow-up reminder for 3 business days if no response." },
        { n: 6, title: "Track & Convert", body: "Monitor quote status (Pending → Accepted/Rejected/Expired). If accepted, convert to order. If rejected, log the reason for pricing optimization." },
      ],
    },
    tutorial: {
      title: "Quotation Management — Video Tutorial",
      description: "How to create, price, and manage wholesale quotations.",
    },
  },

  "faire-stores": {
    sop: {
      title: "Faire Store Management — SOP",
      description: "Standard procedure for managing active Faire seller store accounts.",
      steps: [
        { n: 1, title: "Store Setup & Branding", body: "Ensure store profile is complete: brand logo, banner, bio, return policy, shipping policy, and social media links. All product photos should follow Faire's image guidelines (white background, multiple angles)." },
        { n: 2, title: "Product Catalog Maintenance", body: "Regularly update product listings — prices, stock status, descriptions, and images. Archive discontinued items. Add new products with full metadata (tags, categories, variants).", warn: "Stale or out-of-stock listings hurt store visibility in Faire search." },
        { n: 3, title: "Pricing & Promotions", body: "Review pricing quarterly. Set up Faire promotions (first order free shipping, tiered discounts). Ensure wholesale margins are maintained after Faire's 15% commission." },
        { n: 4, title: "Retailer Communication", body: "Respond to retailer messages within 24 hours. Handle order inquiries, custom requests, and feedback professionally. Maintain a 4.5+ star rating." },
        { n: 5, title: "Analytics Review", body: "Weekly: Review store views, conversion rate, and top-selling products. Monthly: Analyze retailer retention, reorder rates, and geographic distribution." },
        { n: 6, title: "Compliance & Documentation", body: "Keep business documents updated (EIN, articles of org). Ensure tax settings are correct for all shipping states. Monitor Faire policy updates and adjust accordingly." },
      ],
    },
    tutorial: {
      title: "Faire Store Management — Video Tutorial",
      description: "Best practices for managing and growing your Faire store.",
    },
  },

  "faire-shipments": {
    sop: {
      title: "Shipment Processing — SOP",
      description: "Standard procedure for managing outbound shipments to Faire retailers.",
      steps: [
        { n: 1, title: "Prepare Shipment", body: "Gather all items for the order. Verify quantities match the packing slip. Inspect items for quality — no damaged or defective products should be shipped." },
        { n: 2, title: "Packaging Standards", body: "Use appropriate box size (avoid excessive void fill). Include branded tissue paper or thank-you card if available. Protect fragile items with bubble wrap. Seal box securely.", warn: "Oversized packaging increases shipping costs and damages retailer experience." },
        { n: 3, title: "Generate Shipping Label", body: "Use the preferred carrier (UPS/FedEx/USPS) based on package weight and destination. Compare rates using the shipping calculator. Generate and print the label." },
        { n: 4, title: "Upload Tracking", body: "Enter the tracking number in the system and Faire portal. The retailer will receive automatic delivery notifications." },
        { n: 5, title: "Schedule Pickup / Drop-off", body: "Schedule carrier pickup or drop off at the nearest collection point. Ensure the package is ready before the cutoff time for same-day processing." },
        { n: 6, title: "Monitor Delivery", body: "Track the shipment through to delivery. If delivery issues arise (delay, damage, lost), file a carrier claim immediately and notify the retailer." },
      ],
    },
    tutorial: {
      title: "Shipment Processing — Video Tutorial",
      description: "Complete shipping workflow from packaging to delivery confirmation.",
    },
  },

  "faire-inventory": {
    sop: {
      title: "Inventory Management — SOP",
      description: "Standard procedure for maintaining accurate inventory across all Faire products.",
      steps: [
        { n: 1, title: "Receive & Count Inbound Stock", body: "When new inventory arrives, count every item against the purchase order. Record any discrepancies (short shipments, damages). Update stock quantities in the system." },
        { n: 2, title: "Warehouse Organization", body: "Assign bin locations for new products. Use the naming convention: Zone-Aisle-Shelf-Bin (e.g., A-2-3-B). Label bins clearly and update location in the system.", warn: "Misplaced inventory causes fulfillment delays. Always update bin locations." },
        { n: 3, title: "Daily Stock Sync", body: "Run the daily sync to ensure Faire store quantities match actual on-hand inventory. Resolve any discrepancies before EOD." },
        { n: 4, title: "Low Stock Alerts", body: "Review low-stock alerts daily. For items below reorder point, create a purchase order. For fast-moving items, consider increasing safety stock levels." },
        { n: 5, title: "Monthly Cycle Count", body: "Select 20% of SKUs for physical count each week (full cycle every 5 weeks). Compare physical vs system counts. Investigate and correct variances above 2%." },
        { n: 6, title: "Reporting", body: "Generate weekly inventory summary: total SKUs, stock value, turnover rate, aging inventory (>90 days). Flag slow-moving items for clearance or discontinuation." },
      ],
    },
    tutorial: {
      title: "Inventory Management — Video Tutorial",
      description: "How to track, manage, and optimize inventory for Faire operations.",
    },
  },

  "faire-fulfillment": {
    sop: {
      title: "Order Fulfillment — SOP",
      description: "Standard procedure for the end-to-end fulfillment process.",
      steps: [
        { n: 1, title: "Order Queue Review", body: "Check the fulfillment queue at the start of each day. Prioritize orders by SLA deadline (Faire requires shipping within 3 business days). Flag any urgent or large orders." },
        { n: 2, title: "Pick Items", body: "Use the pick list to gather items from warehouse locations. Scan or check off each item as picked. Report any stock-outs immediately to the operations lead.", warn: "Never substitute items without retailer approval." },
        { n: 3, title: "Quality Check", body: "Inspect each picked item for defects, correct variant (size/color), and packaging integrity. Remove any items that don't meet quality standards." },
        { n: 4, title: "Pack & Label", body: "Pack items per the packaging standards SOP. Print and apply shipping label. Weigh the final package and verify against the estimated weight." },
        { n: 5, title: "Dispatch", body: "Place packed orders in the outbound staging area. Hand off to the carrier at scheduled pickup time. Confirm tracking is active." },
        { n: 6, title: "Update Status", body: "Mark the order as 'Shipped' in both the internal system and Faire. Attach proof of shipment if required. The fulfillment is now complete." },
      ],
    },
    tutorial: {
      title: "Order Fulfillment — Video Tutorial",
      description: "Step-by-step guide to picking, packing, and shipping orders.",
    },
  },

  "faire-pricing": {
    sop: {
      title: "Product Pricing — SOP",
      description: "Standard procedure for setting and updating wholesale product pricing.",
      steps: [
        { n: 1, title: "Cost Analysis", body: "Calculate the total cost per unit: raw materials + manufacturing + packaging + shipping + customs duties. Include overhead allocation for warehousing and handling." },
        { n: 2, title: "Set Wholesale Price", body: "Apply the standard markup (minimum 2.5x cost for Faire). Factor in Faire's 15% commission. Ensure the resulting retail price (2x wholesale) is competitive in the market.", warn: "Wholesale price must cover Faire commission + shipping + returns buffer." },
        { n: 3, title: "Volume Tiers", body: "Define quantity-based pricing tiers: Standard (1-11 units), Bulk (12-47 units at 5% off), Case (48+ units at 10% off). Update tiers in both the system and Faire portal." },
        { n: 4, title: "Competitor Benchmarking", body: "Monthly: Compare pricing against 3-5 competitor products on Faire. Adjust if significantly above or below market (>15% variance)." },
        { n: 5, title: "Quarterly Review", body: "Review all product margins quarterly. Identify products below 25% margin — either increase price, reduce cost, or discontinue. Update pricing across all channels simultaneously." },
      ],
    },
    tutorial: {
      title: "Product Pricing — Video Tutorial",
      description: "How to calculate, set, and optimize wholesale pricing.",
    },
  },

  "ets-pipeline": {
    sop: {
      title: "Client Pipeline Management — SOP",
      description: "Standard procedure for managing EazyToSell franchise client pipeline from lead to store launch.",
      steps: [
        { n: 1, title: "New Lead Intake", body: "When a new inquiry comes in (via website, referral, or WhatsApp), create a client record with name, city, phone, email, and lead source. Assign to 'New Lead' stage." },
        { n: 2, title: "Qualification Call", body: "Schedule a discovery call within 24 hours. Assess: store readiness, budget (minimum ₹2L for Lite), location quality, operator availability, and timeline. Fill in the qualification scores.", warn: "Score all 6 parameters (budget, location, operator, timeline, experience, engagement) — minimum total score of 6/12 to proceed." },
        { n: 3, title: "Proposal & Package Selection", body: "Based on qualification, recommend the appropriate package (Lite/Pro/Elite). Share the proposal document and scope of work. Answer all client questions about pricing and deliverables." },
        { n: 4, title: "Token Payment Collection", body: "Once the client agrees, collect the token payment (₹25,000-₹50,000 depending on package). Move to 'Token Paid' stage. Generate the payment receipt and share the onboarding checklist." },
        { n: 5, title: "Store Design & Setup", body: "Coordinate with the design team for store layout. Collect store measurements, photos, and landlord permissions. Share the store design for approval.", warn: "Never start procurement before store design is approved by the client." },
        { n: 6, title: "Inventory Selection & Ordering", body: "Help the client select products from the catalog within their budget. Place the China import order. Track the shipment and share updates weekly." },
        { n: 7, title: "Fulfillment & Delivery", body: "Coordinate customs clearance, local delivery, and store setup. Conduct a walkthrough with the client. Complete the readiness checklist before launch." },
        { n: 8, title: "Store Launch", body: "Assist with grand opening planning, social media setup, and initial customer outreach. Move to 'Launched' stage. Schedule the 30-day follow-up call." },
      ],
    },
    tutorial: {
      title: "Client Pipeline — Video Tutorial",
      description: "Complete walkthrough of the EazyToSell client journey from lead to launch.",
    },
  },

  "ets-orders": {
    sop: {
      title: "Import Order Management — SOP",
      description: "Standard procedure for managing China import orders for EazyToSell clients.",
      steps: [
        { n: 1, title: "Order Compilation", body: "Collect the final product selection from the client with quantities. Cross-reference with the catalog for supplier details, MOQs, and current EXW prices." },
        { n: 2, title: "Supplier Coordination", body: "Contact suppliers to confirm stock availability, production timelines, and current pricing. Negotiate bulk discounts if order exceeds standard MOQs.", warn: "Always get written confirmation of prices and delivery dates from suppliers." },
        { n: 3, title: "Price Calculation & Proforma", body: "Use the price calculator to compute landed costs: EXW → FOB → CIF → customs → IGST → landed → MRP. Generate a proforma invoice for client approval." },
        { n: 4, title: "Payment to Supplier", body: "After client payment confirmation, release payment to suppliers via the approved channel (TT/Alibaba Trade Assurance). Record the transaction with reference numbers." },
        { n: 5, title: "Production & QC", body: "Track production status weekly. Arrange pre-shipment quality inspection for orders above ₹5L. Document any quality issues with photos." },
        { n: 6, title: "Shipping & Customs", body: "Book freight (sea/air based on timeline). Prepare and submit customs documentation: Bill of Lading, Commercial Invoice, Packing List, Certificate of Origin. Track the shipment status.", warn: "Ensure HS codes match the declared goods — incorrect classification causes clearance delays." },
        { n: 7, title: "Delivery & Reconciliation", body: "Coordinate last-mile delivery to the client's store. Verify received quantities against the order. Resolve any shortages or damages with the supplier/insurance." },
      ],
    },
    tutorial: {
      title: "Import Order Management — Video Tutorial",
      description: "End-to-end guide for managing China import orders.",
    },
  },

  "ets-products": {
    sop: {
      title: "Product Catalog Management — SOP",
      description: "Standard procedure for managing the EazyToSell product catalog and pricing.",
      steps: [
        { n: 1, title: "Product Sourcing", body: "Identify products from 1688/Alibaba suppliers. Evaluate based on: price point, quality, demand in Indian market, margin potential (target 50%+), and supplier reliability." },
        { n: 2, title: "Product Photography & Listing", body: "Download or create product images (white background preferred). Write clear product names in English. Assign to the correct category and set EXW price in Yuan." },
        { n: 3, title: "Price Calculation", body: "Use the price calculator to compute full pricing chain: EXW → FOB (5% sourcing) → CIF (freight) → Landed (customs + IGST) → Store Landing (25% markup) → MRP. Verify margin is above 50%.", warn: "Products with margin below 45% should be flagged for review or excluded." },
        { n: 4, title: "Visibility & Hero SKUs", body: "Set product visibility (hidden products are excluded from client catalogs). Mark top-performing items as Hero SKUs for featured placement in proposals." },
        { n: 5, title: "Regular Price Updates", body: "When exchange rates or freight costs change, use the Price Calculator to recalculate all products. Update the price settings (exchange rate, freight per CBM) and review impacted margins." },
        { n: 6, title: "Category Management", body: "Maintain category structure with correct duty rates and IGST percentages. Add new categories when expanding into new product verticals." },
      ],
    },
    tutorial: {
      title: "Product Catalog — Video Tutorial",
      description: "How to source, price, and manage products in the EazyToSell catalog.",
    },
  },

  "ets-payments": {
    sop: {
      title: "Payment Tracking — SOP",
      description: "Standard procedure for tracking and managing client payments.",
      steps: [
        { n: 1, title: "Record Payment", body: "When a payment is received, create a payment record with: client name, amount, type (token/milestone/final), method (bank transfer/UPI/cash), date, and reference number." },
        { n: 2, title: "Verify Payment", body: "Cross-check the payment amount against the expected milestone. Verify the bank credit/UPI confirmation. Mark as 'Verified' once confirmed.", warn: "Never update the pipeline stage based on a payment claim without bank verification." },
        { n: 3, title: "Generate Receipt", body: "Issue a payment receipt to the client via WhatsApp or email. Include: receipt number, amount, date, description of milestone, and remaining balance." },
        { n: 4, title: "Update Client Record", body: "Update the client's total paid, pending dues, and move the pipeline stage forward if the payment unlocks the next phase." },
        { n: 5, title: "Pending Payment Follow-Up", body: "For overdue payments: send reminder at Day 3, escalate at Day 7, and flag as 'At Risk' at Day 14. Use the WhatsApp templates for professional follow-up messaging." },
      ],
    },
    tutorial: {
      title: "Payment Tracking — Video Tutorial",
      description: "How to record, verify, and track client payments.",
    },
  },

  "legalnations-clients": {
    sop: {
      title: "LLC Formation Process — SOP",
      description: "Standard procedure for forming a US LLC for international clients.",
      steps: [
        { n: 1, title: "Client Onboarding", body: "Collect client details: full name, passport/ID, address, business name options (3 alternatives), state preference (Wyoming/Delaware/Florida), and member structure (single/multi)." },
        { n: 2, title: "Name Availability Check", body: "Search the Secretary of State database for name availability. Check all 3 alternatives. Confirm the available name with the client before proceeding.", warn: "Name must not be 'deceptively similar' to existing registered entities in the state." },
        { n: 3, title: "File Articles of Organization", body: "Prepare and file the Articles of Organization with the state. Include registered agent details, member information, and operating agreement. Pay the state filing fee." },
        { n: 4, title: "EIN Application", body: "Once the LLC is formed, apply for an EIN (Employer Identification Number) with the IRS. Use Form SS-4. Track the application status.", warn: "EIN application requires a valid US mailing address. Use the registered agent address." },
        { n: 5, title: "Banking Setup", body: "Assist with US bank account application (Mercury/Relay/Wise). Prepare required documents: Articles of Org, EIN letter, Operating Agreement, passport copies." },
        { n: 6, title: "Payment Gateway", body: "Set up Stripe (or applicable payment processor). Connect to the bank account. Verify identity documents for the payment processor." },
        { n: 7, title: "BOI Filing", body: "File the Beneficial Ownership Information report with FinCEN. Include all members/beneficial owners. Track the filing confirmation.", warn: "BOI filing is mandatory within 90 days of formation. Missing this can result in penalties." },
        { n: 8, title: "Delivery & Handover", body: "Compile and share the complete LLC package: formation certificate, EIN letter, operating agreement, registered agent details, bank credentials, and compliance calendar." },
      ],
    },
    tutorial: {
      title: "LLC Formation — Video Tutorial",
      description: "Complete walkthrough of the US LLC formation process.",
    },
  },

  "legalnations-tax-filing": {
    sop: {
      title: "US Tax Filing — SOP",
      description: "Standard procedure for annual US tax filing for foreign-owned LLCs.",
      steps: [
        { n: 1, title: "Document Collection", body: "Request from client: bank statements (full year), business activity summary, income and expense records. Use the WhatsApp template for document requests." },
        { n: 2, title: "EIN Verification", body: "Verify the EIN number with IRS records. Confirm the entity type (single member vs multi member) matches our records and the filing requirement." },
        { n: 3, title: "Form 1120 Preparation", body: "Prepare IRS Form 1120 with: entity information, income/deductions, balance sheet. For zero-activity LLCs, file a zero-return with appropriate schedules." },
        { n: 4, title: "Form 5472 Preparation", body: "Prepare Form 5472 for each 25%+ foreign owner. Report all transactions between the LLC and its foreign owners/related parties.", warn: "Failure to file Form 5472 results in a $25,000 penalty per form." },
        { n: 5, title: "Review & QC", body: "Cross-check all forms for accuracy: EIN, entity name, addresses, amounts. Get a second review from a senior team member for filings above $50K revenue." },
        { n: 6, title: "Print & Package", body: "Print the filing package on legal paper. Prepare the cover letter and include all supporting schedules. Use certified mail via LetterStream." },
        { n: 7, title: "Mail to IRS", body: "Ship the package to the appropriate IRS service center via certified mail. Record the tracking number and certified mail receipt.", warn: "Filing deadline is April 15th. Extensions (Form 7004) must be filed before the deadline." },
        { n: 8, title: "Confirmation & Records", body: "Track mail delivery. Once received, update the filing status. After IRS processes (6-8 weeks), check tax standing. Store all records for 7 years." },
      ],
    },
    tutorial: {
      title: "US Tax Filing — Video Tutorial",
      description: "Step-by-step guide for preparing and filing US LLC tax returns.",
    },
  },

  "hrms-onboarding": {
    sop: {
      title: "Employee Onboarding — SOP",
      description: "Standard procedure for onboarding new team members.",
      steps: [
        { n: 1, title: "Pre-Arrival Setup", body: "Before Day 1: Create email account, provision system access (TeamSync, Slack, Google Workspace), order equipment (laptop, peripherals), and prepare the welcome kit." },
        { n: 2, title: "Day 1 Welcome", body: "Welcome meeting with HR. Complete documentation: offer letter signing, ID verification, bank details for payroll, emergency contacts. Issue employee ID (EMP-XXX)." },
        { n: 3, title: "IT & Systems Setup", body: "Set up workstation, install required software, configure VPN if remote. Walk through all internal tools: TeamSync, email, chat, task management." },
        { n: 4, title: "Team Introduction", body: "Introduce to direct manager, team members, and cross-functional contacts. Schedule 1:1 with each team member during the first week." },
        { n: 5, title: "Policy Walkthrough", body: "Review key policies: attendance, leave, code of conduct, remote work, expense reporting. Have the employee acknowledge each policy in the system." },
        { n: 6, title: "30-60-90 Day Goals", body: "Manager sets clear objectives for 30, 60, and 90 days. Schedule check-in meetings at each milestone. Document goals in the performance system." },
      ],
    },
    tutorial: {
      title: "Employee Onboarding — Video Tutorial",
      description: "Complete guide for onboarding new employees.",
    },
  },

  "hrms-payroll": {
    sop: {
      title: "Payroll Processing — SOP",
      description: "Standard procedure for monthly payroll processing.",
      steps: [
        { n: 1, title: "Attendance Finalization", body: "By the 25th of each month, finalize attendance records. Verify leave deductions, overtime, and late penalties. Get department head approvals." },
        { n: 2, title: "Variable Pay Calculation", body: "Calculate commissions, bonuses, and incentives based on approved performance data. Apply any salary adjustments (increments, deductions, arrears)." },
        { n: 3, title: "Tax Computation", body: "Calculate TDS based on declared investments (Section 80C, 80D, HRA). Apply the correct tax slab. Verify PF and ESI contributions.", warn: "Verify investment declarations before applying tax exemptions." },
        { n: 4, title: "Payslip Generation", body: "Generate payslips with: basic, HRA, allowances, deductions (PF, ESI, TDS, LOP), net pay. Review totals against the previous month for anomalies." },
        { n: 5, title: "Approval & Disbursement", body: "Get Finance head approval on the payroll summary. Initiate bank transfers by the 1st of the following month. Distribute payslips via email/portal." },
        { n: 6, title: "Statutory Compliance", body: "File PF/ESI returns by the 15th. Deposit TDS by the 7th. Maintain payroll registers and records for audit purposes." },
      ],
    },
    tutorial: {
      title: "Payroll Processing — Video Tutorial",
      description: "Monthly payroll processing walkthrough.",
    },
  },

  "hrms-leaves": {
    sop: {
      title: "Leave Management — SOP",
      description: "Standard procedure for handling employee leave requests.",
      steps: [
        { n: 1, title: "Leave Application", body: "Employee submits leave request through the portal with: leave type (casual/sick/earned/comp-off), dates, reason, and handover notes for their tasks." },
        { n: 2, title: "Manager Review", body: "Direct manager reviews: team coverage, project deadlines, leave balance. Approve or reject with comments within 24 hours.", warn: "Sick leave beyond 3 consecutive days requires a medical certificate." },
        { n: 3, title: "Balance Update", body: "On approval, the system deducts from the appropriate leave balance. Track remaining balances by type: CL (12/year), SL (12/year), EL (15/year)." },
        { n: 4, title: "Handover", body: "Employee completes the handover: delegates tasks, sets OOO on email/Slack, updates their status in TeamSync." },
        { n: 5, title: "Return & Reconciliation", body: "On return, employee updates status. If leave was extended, submit a modification request. Any unauthorized absence is flagged for HR review." },
      ],
    },
    tutorial: {
      title: "Leave Management — Video Tutorial",
      description: "How to apply, approve, and track employee leaves.",
    },
  },

  "hrms-attendance": {
    sop: {
      title: "Attendance Tracking — SOP",
      description: "Standard procedure for daily attendance tracking and reporting.",
      steps: [
        { n: 1, title: "Daily Check-In", body: "Employees check in via the attendance portal or biometric system by 10:00 AM. Late check-ins (after 10:15 AM) are marked and tracked." },
        { n: 2, title: "Check-Out Recording", body: "Record check-out time at end of day. Minimum working hours: 8 hours. Overtime is calculated for hours beyond 9 hours." },
        { n: 3, title: "Regularization Requests", body: "For missed punches or system errors, employees submit regularization requests within 3 days. Manager approval is required.", warn: "More than 3 regularization requests per month triggers an HR review." },
        { n: 4, title: "Weekly Summary", body: "Generate weekly attendance summaries by department. Flag employees with: excessive late arrivals, short hours, or irregular patterns." },
        { n: 5, title: "Monthly Report", body: "Compile monthly attendance report by the 25th. Include: present days, leaves, late arrivals, overtime, and LOP (loss of pay) days. Share with payroll for salary processing." },
      ],
    },
    tutorial: {
      title: "Attendance Tracking — Video Tutorial",
      description: "How to use the attendance tracking system.",
    },
  },

  "hrms-performance": {
    sop: {
      title: "Performance Review — SOP",
      description: "Standard procedure for conducting quarterly and annual performance reviews.",
      steps: [
        { n: 1, title: "Self-Assessment", body: "Employee completes a self-assessment form: achievements, challenges, goals met (with evidence), skills developed, and areas for improvement." },
        { n: 2, title: "Manager Assessment", body: "Manager rates the employee on: quality of work, productivity, teamwork, initiative, and communication. Provide specific examples for each rating." },
        { n: 3, title: "360° Feedback (Optional)", body: "For senior roles, collect feedback from peers, direct reports, and cross-functional collaborators. Compile anonymized results." },
        { n: 4, title: "Review Meeting", body: "Schedule a 1-hour meeting. Discuss both assessments openly. Identify 3 strengths to leverage and 2 areas to develop. Agree on action items." },
        { n: 5, title: "Goal Setting", body: "Set SMART goals for the next quarter/year. Align with team and company objectives. Document in the performance system." },
        { n: 6, title: "Documentation & Follow-Up", body: "Record the final review with ratings and comments. Schedule mid-cycle check-ins. Use review data for promotion/increment decisions." },
      ],
    },
    tutorial: {
      title: "Performance Review — Video Tutorial",
      description: "How to conduct effective performance reviews.",
    },
  },

  "ats-candidates": {
    sop: {
      title: "Candidate Screening — SOP",
      description: "Standard procedure for screening and evaluating job candidates.",
      steps: [
        { n: 1, title: "Resume Screening", body: "Review incoming applications against job requirements. Check: relevant experience, skills match, education, and career progression. Shortlist candidates scoring 70%+ match." },
        { n: 2, title: "Phone Screening", body: "Conduct a 15-minute phone screen to verify: availability, salary expectations, notice period, and basic communication skills. Record notes in the candidate profile.", warn: "Always confirm the candidate's current CTC and expected CTC during the screen." },
        { n: 3, title: "Schedule Technical Interview", body: "Coordinate interview timing between the candidate and hiring panel. Send calendar invite with: meeting link, interviewer names, and expected duration." },
        { n: 4, title: "Evaluation & Scoring", body: "Each interviewer submits their evaluation within 24 hours of the interview. Use the standardized scorecard: technical skills, problem solving, cultural fit, communication." },
        { n: 5, title: "Decision & Next Steps", body: "Review all evaluations. If unanimous yes: proceed to next round or offer. If mixed: discuss in hiring committee. If no: send a respectful rejection within 48 hours." },
      ],
    },
    tutorial: {
      title: "Candidate Screening — Video Tutorial",
      description: "How to efficiently screen and evaluate candidates.",
    },
  },

  "ats-interviews": {
    sop: {
      title: "Interview Management — SOP",
      description: "Standard procedure for scheduling and conducting interviews.",
      steps: [
        { n: 1, title: "Panel Selection", body: "Select 2-3 interviewers based on the role: hiring manager (mandatory), technical expert, and culture/HR interviewer. Ensure no scheduling conflicts." },
        { n: 2, title: "Schedule & Communicate", body: "Send the candidate: interview date/time, duration, format (video/in-person), interviewer names, and any preparation instructions. Allow 48 hours lead time.", warn: "Always confirm the candidate 24 hours before the interview." },
        { n: 3, title: "Conduct Interview", body: "Follow the structured interview format: introduction (5 min), technical questions (25 min), situational questions (15 min), candidate questions (10 min). Take notes throughout." },
        { n: 4, title: "Submit Feedback", body: "Each interviewer submits their scorecard within 24 hours. Rate: technical ability, problem solving, communication, cultural fit. Provide a clear Hire/No-hire recommendation." },
        { n: 5, title: "Debrief", body: "Hold a 15-minute debrief with all interviewers within 48 hours. Reach consensus on the candidate. Document the decision and rationale." },
      ],
    },
    tutorial: {
      title: "Interview Management — Video Tutorial",
      description: "How to schedule, conduct, and evaluate interviews.",
    },
  },

  "crm-leads": {
    sop: {
      title: "Lead Management — SOP",
      description: "Standard procedure for qualifying and converting sales leads.",
      steps: [
        { n: 1, title: "Lead Capture", body: "Record every new lead with: name, contact details, company, source (website/referral/ads/event), and initial interest area. Assign to the appropriate sales rep." },
        { n: 2, title: "Initial Outreach", body: "Contact the lead within 2 hours of capture. Introduce yourself, understand their needs, and schedule a discovery call if interested.", warn: "Response time is critical — leads contacted within 1 hour are 7x more likely to convert." },
        { n: 3, title: "Qualification (BANT)", body: "During the discovery call, qualify using BANT: Budget (can they afford it?), Authority (are they the decision maker?), Need (do they have a genuine need?), Timeline (when do they want to start?)." },
        { n: 4, title: "Score & Prioritize", body: "Score the lead on a 1-10 scale based on BANT criteria. Leads scoring 7+ are 'Hot', 4-6 are 'Warm', below 4 are 'Cold'. Focus efforts on hot leads first." },
        { n: 5, title: "Nurture or Convert", body: "For hot leads: move to deal/opportunity stage. For warm leads: add to nurture sequence (weekly content, monthly check-in). For cold leads: add to drip campaign." },
      ],
    },
    tutorial: {
      title: "Lead Management — Video Tutorial",
      description: "How to capture, qualify, and convert sales leads.",
    },
  },

  "crm-deals": {
    sop: {
      title: "Deal Closing — SOP",
      description: "Standard procedure for managing deals through the sales pipeline to close.",
      steps: [
        { n: 1, title: "Proposal Preparation", body: "Create a tailored proposal with: solution overview, pricing, timeline, deliverables, and terms. Use the approved proposal template. Get manager review for deals above ₹5L." },
        { n: 2, title: "Presentation & Demo", body: "Schedule a presentation with the decision maker and key stakeholders. Demo the product/service addressing their specific pain points. Record key objections and feedback." },
        { n: 3, title: "Negotiation", body: "Address objections systematically. Offer flexible payment terms or bundle discounts if needed. Document all agreed changes to the original proposal.", warn: "Never offer discounts above 15% without manager approval." },
        { n: 4, title: "Contract & Closure", body: "Send the final contract for review and signing. Follow up within 48 hours if unsigned. Collect the advance/first payment to confirm the deal." },
        { n: 5, title: "Handover to Delivery", body: "Once closed, create the project/service record. Brief the delivery team on: client expectations, agreed deliverables, timeline, and any special requirements." },
      ],
    },
    tutorial: {
      title: "Deal Closing — Video Tutorial",
      description: "How to manage deals from proposal to close.",
    },
  },

  "crm-pipeline": {
    sop: {
      title: "Sales Pipeline Management — SOP",
      description: "Standard procedure for managing and maintaining a healthy sales pipeline.",
      steps: [
        { n: 1, title: "Daily Pipeline Review", body: "Start each day by reviewing your active pipeline. Check for: deals needing follow-up, stale opportunities (no activity in 7+ days), and upcoming meetings/deadlines." },
        { n: 2, title: "Stage Movement", body: "Update deal stages as they progress: Lead → Qualified → Proposal → Negotiation → Closed Won/Lost. Add detailed notes for each stage transition." },
        { n: 3, title: "Activity Logging", body: "Log every client interaction: calls, emails, meetings, WhatsApp messages. Attach relevant documents. Set the next action and date.", warn: "Deals without a scheduled next action are considered stale after 5 days." },
        { n: 4, title: "Weekly Forecast", body: "Every Friday: update deal probability and expected close dates. Submit your weekly forecast with: committed deals, best-case deals, and pipeline value." },
        { n: 5, title: "Pipeline Hygiene", body: "Monthly: clean up dead deals (mark as Lost with reason). Remove duplicates. Ensure all deals have: accurate value, owner, stage, and next action." },
      ],
    },
    tutorial: {
      title: "Sales Pipeline — Video Tutorial",
      description: "How to manage and maintain a healthy sales pipeline.",
    },
  },

  "finance-transactions": {
    sop: {
      title: "Transaction Recording — SOP",
      description: "Standard procedure for recording financial transactions.",
      steps: [
        { n: 1, title: "Identify Transaction Type", body: "Classify the transaction: income, expense, transfer, or journal entry. Determine the correct ledger accounts (debit and credit) based on the chart of accounts." },
        { n: 2, title: "Verify Documentation", body: "Ensure supporting documents are attached: invoice, receipt, bill, bank statement, or approval email. Every transaction must have a source document.", warn: "Never record a transaction without supporting documentation." },
        { n: 3, title: "Record Entry", body: "Enter the transaction with: date, amount, accounts (debit/credit), description, reference number, and supporting document link. Verify the entry balances." },
        { n: 4, title: "Categorization & Tagging", body: "Tag with: department, vertical, project, and expense category. This enables accurate reporting and cost allocation." },
        { n: 5, title: "Review & Approval", body: "Transactions above ₹10,000 require manager approval. Daily: reconcile total entries against bank statements. Flag any discrepancies for investigation." },
      ],
    },
    tutorial: {
      title: "Transaction Recording — Video Tutorial",
      description: "How to record and categorize financial transactions.",
    },
  },

  "finance-payments": {
    sop: {
      title: "Payment Processing — SOP",
      description: "Standard procedure for processing vendor and operational payments.",
      steps: [
        { n: 1, title: "Payment Request Review", body: "Review payment requests with: vendor name, invoice number, amount, due date, and approval. Verify against the purchase order or contract terms." },
        { n: 2, title: "Budget Verification", body: "Check department budget allocation. Ensure the payment doesn't exceed the approved budget. If over budget, get CFO approval before proceeding.", warn: "Over-budget payments without approval will be flagged in the next audit." },
        { n: 3, title: "Payment Execution", body: "Process via the approved method: bank transfer (NEFT/RTGS for domestic, SWIFT for international), UPI, or check. Record the UTR/reference number." },
        { n: 4, title: "Confirmation & Recording", body: "Verify the payment was received (check with vendor or bank confirmation). Record the payment in the ledger with all reference details." },
        { n: 5, title: "Reconciliation", body: "Daily: Match recorded payments against bank debits. Weekly: Send payment confirmation to requesting departments. Monthly: Reconcile all accounts payable." },
      ],
    },
    tutorial: {
      title: "Payment Processing — Video Tutorial",
      description: "How to process and reconcile vendor payments.",
    },
  },

  "oms-orders": {
    sop: {
      title: "Order Management — SOP",
      description: "Standard procedure for processing and fulfilling product orders.",
      steps: [
        { n: 1, title: "Order Receipt & Validation", body: "When a new order is received, verify: customer details, product SKUs, quantities, delivery address, and payment status. Flag any incomplete information." },
        { n: 2, title: "Inventory Allocation", body: "Check available inventory for all ordered items. Allocate stock and reduce available quantities. If stock is insufficient, notify the customer with options (partial fulfillment, backorder, alternatives).", warn: "Never confirm an order if inventory is not available or on confirmed PO." },
        { n: 3, title: "Picking & Packing", body: "Generate the pick list. Pick items from assigned locations. Quality check each item. Pack securely with the appropriate box size and void fill." },
        { n: 4, title: "Shipping", body: "Select the carrier based on: delivery speed, destination, package dimensions, and cost. Generate the shipping label and tracking number. Hand off to the carrier." },
        { n: 5, title: "Status Updates", body: "Update order status at each stage: Confirmed → Processing → Packed → Shipped → Delivered. Send automated notifications to the customer." },
        { n: 6, title: "Post-Delivery", body: "Confirm delivery receipt. Handle any returns or complaints within SLA. Close the order once all items are delivered and confirmed." },
      ],
    },
    tutorial: {
      title: "Order Management — Video Tutorial",
      description: "End-to-end order processing workflow.",
    },
  },

  "oms-purchase-orders": {
    sop: {
      title: "Purchase Order Management — SOP",
      description: "Standard procedure for creating and managing purchase orders.",
      steps: [
        { n: 1, title: "Identify Requirement", body: "Based on low stock alerts or demand forecast, identify products that need replenishment. Check minimum order quantities and lead times for each supplier." },
        { n: 2, title: "Create PO", body: "Generate a purchase order with: supplier, items, quantities, negotiated prices, delivery date, and payment terms. Reference the supplier agreement for contracted rates." },
        { n: 3, title: "Approval Workflow", body: "Submit for approval. POs under ₹50K: auto-approved. ₹50K-₹5L: manager approval. Above ₹5L: director approval.", warn: "Do not communicate the PO to the supplier before internal approval." },
        { n: 4, title: "Send to Supplier", body: "Send the approved PO to the supplier via email. Get written confirmation of: accepted quantities, prices, and expected delivery date." },
        { n: 5, title: "Track & Receive", body: "Monitor the PO status. On receipt: verify quantities, inspect quality, and update the PO status. Log any discrepancies (short shipment, quality issues) for supplier follow-up." },
      ],
    },
    tutorial: {
      title: "Purchase Order — Video Tutorial",
      description: "How to create and manage purchase orders.",
    },
  },

  "social-posts": {
    sop: {
      title: "Content Creation & Posting — SOP",
      description: "Standard procedure for creating and publishing social media content.",
      steps: [
        { n: 1, title: "Content Planning", body: "Review the monthly content calendar. Each post should align with: brand pillars, campaign objectives, and audience engagement goals. Check the content mix (educational, promotional, engagement, testimonial)." },
        { n: 2, title: "Content Creation", body: "Draft the post copy following brand voice guidelines. Create or source visuals (images/videos/reels). Write hashtags (5-10 relevant ones). Include a clear call-to-action." },
        { n: 3, title: "Review & Approval", body: "Submit the post for review. Manager checks: brand compliance, copy accuracy, visual quality, and hashtag relevance. Revise if feedback is provided.", warn: "All posts mentioning pricing, offers, or partner brands require manager approval." },
        { n: 4, title: "Schedule or Publish", body: "Schedule the post for the optimal time slot (based on audience analytics). For time-sensitive content, publish immediately after final approval." },
        { n: 5, title: "Engagement & Response", body: "Monitor comments and DMs within 2 hours of posting. Respond to all comments within 24 hours. Escalate negative feedback to the team lead." },
      ],
    },
    tutorial: {
      title: "Content Creation — Video Tutorial",
      description: "How to create, approve, and publish social media content.",
    },
  },

  "social-campaigns": {
    sop: {
      title: "Campaign Management — SOP",
      description: "Standard procedure for planning and executing social media campaigns.",
      steps: [
        { n: 1, title: "Campaign Brief", body: "Define: objective (awareness/engagement/conversion), target audience, platforms, budget, timeline, and key messages. Get stakeholder sign-off on the brief." },
        { n: 2, title: "Content Calendar", body: "Create the campaign content calendar: post types, publish dates, platform-specific adaptations. Ensure a minimum of 3 posts per week during the campaign." },
        { n: 3, title: "Asset Creation", body: "Design all campaign assets: images, videos, stories, reels. Maintain visual consistency across all assets. Create platform-specific sizes (Instagram square, story, reel; LinkedIn landscape)." },
        { n: 4, title: "Launch & Monitor", body: "Publish per the calendar. Monitor performance daily: reach, engagement, clicks, conversions. A/B test different creatives if budget allows." },
        { n: 5, title: "Report & Analyze", body: "Post-campaign: compile a performance report with KPIs vs targets. Document learnings and recommendations for future campaigns." },
      ],
    },
    tutorial: {
      title: "Campaign Management — Video Tutorial",
      description: "Planning and executing social media campaigns.",
    },
  },

  "suprans-inbound": {
    sop: {
      title: "Lead Intake & Validation — SOP",
      description: "Standard procedure for processing inbound leads across all business verticals.",
      steps: [
        { n: 1, title: "Capture Lead", body: "Record every inbound inquiry with: name, phone, email, source (website/referral/Instagram/LinkedIn/Google Ads/walk-in/WhatsApp), inquiry details, and initial interest area." },
        { n: 2, title: "Validate Information", body: "Verify: phone number is reachable, email is valid, inquiry is genuine (not spam). Check for duplicate leads in the system.", warn: "Duplicate leads must be merged, not created as new entries." },
        { n: 3, title: "Initial Assessment", body: "Determine the appropriate vertical: company formation (LegalNations), e-commerce setup (EazyToSell/Faire), tour booking (GoyoTours), HR consulting (HRMS), or event management (EventHub)." },
        { n: 4, title: "Assign Priority", body: "Set priority based on: budget indication (high budget = high priority), timeline urgency, source quality (referrals highest), and business potential." },
        { n: 5, title: "Route to Enrichment", body: "Move validated leads to the Enrichment queue for AI-assisted vertical routing and detailed profiling. Include all notes from the initial assessment." },
      ],
    },
    tutorial: {
      title: "Lead Intake — Video Tutorial",
      description: "How to capture and validate inbound business leads.",
    },
  },

  "suprans-enrichment": {
    sop: {
      title: "Lead Enrichment — SOP",
      description: "Standard procedure for enriching and routing leads to the correct business vertical.",
      steps: [
        { n: 1, title: "Profile Research", body: "Research the lead's background: LinkedIn, company website, social media. Understand their business, team size, and specific needs." },
        { n: 2, title: "Vertical Matching", body: "Based on the enriched profile, confirm or update the vertical assignment. Use AI suggestions as a starting point but apply human judgment." },
        { n: 3, title: "Rep Assignment", body: "Select the best rep from the matched vertical based on: expertise, current pipeline capacity, and geographic alignment." },
        { n: 4, title: "Enrichment Notes", body: "Add detailed notes: budget range, specific requirements, competitive landscape, decision timeline, and any objections or concerns identified." },
        { n: 5, title: "Handoff", body: "Move to Assignments queue with: enriched profile, vertical recommendation, suggested rep, priority level, and follow-up date." },
      ],
    },
    tutorial: {
      title: "Lead Enrichment — Video Tutorial",
      description: "How to research, profile, and route leads.",
    },
  },

  "eventhub-events": {
    sop: {
      title: "Event Planning & Execution — SOP",
      description: "Standard procedure for planning and executing corporate events.",
      steps: [
        { n: 1, title: "Event Brief", body: "Define: event type, objectives, target attendance, budget, date options, venue requirements, and key stakeholders. Get approval on the event brief." },
        { n: 2, title: "Venue & Vendor Selection", body: "Source 3+ venue options. Get quotes from vendors (catering, AV, decoration, entertainment). Compare on: cost, capacity, location, and reviews." },
        { n: 3, title: "Budget Planning", body: "Create a detailed budget breakdown: venue, catering, AV, marketing, speakers, transport, contingency (10%). Get finance approval.", warn: "Total budget must not exceed approved amount without written authorization." },
        { n: 4, title: "Marketing & Registration", body: "Create event marketing materials (flyer, social posts, email invites). Set up registration page. Track RSVPs and manage the attendee list." },
        { n: 5, title: "Day-of Execution", body: "Arrive 2 hours early. Verify: venue setup, AV testing, catering, signage, registration desk. Brief all volunteers/staff on their roles." },
        { n: 6, title: "Post-Event", body: "Send thank-you emails within 24 hours. Collect attendee feedback. Compile the event report: attendance vs target, budget vs actual, key metrics, and learnings." },
      ],
    },
    tutorial: {
      title: "Event Planning — Video Tutorial",
      description: "Complete guide to planning and executing events.",
    },
  },

  "triphq-dashboard": {
    sop: {
      title: "Trip HQ Dashboard — SOP",
      description: "How to use the Trip HQ dashboard to monitor trip preparation and progress.",
      steps: [
        { n: 1, title: "Review Stats", body: "Check days until departure, contacts met, products scouted, budget spent, checklist progress, and content shots. All stats are real-time from your data." },
        { n: 2, title: "Upcoming Itinerary", body: "Review the next 3 days of your itinerary. Click 'View All' to see the full trip timeline." },
        { n: 3, title: "Quick Actions", body: "Use the quick action buttons to add expenses, contacts, products, or upload files without navigating away." },
        { n: 4, title: "Track Progress", body: "Monitor packing, checklist, transport booking, and contact meeting progress bars." },
      ],
    },
    tutorial: {
      title: "Trip HQ Dashboard — Video Tutorial",
      description: "Overview of the Trip HQ dashboard and how to use it effectively.",
    },
  },

  "triphq-itinerary": {
    sop: {
      title: "Trip Itinerary Management — SOP",
      description: "How to plan and manage your day-by-day trip itinerary.",
      steps: [
        { n: 1, title: "Add Days", body: "Click 'Add Day' to create a new itinerary day. Fill in the day number, date, city, morning plan, evening plan, hotel name, and notes." },
        { n: 2, title: "Expand Day Details", body: "Click on any day card to expand it and view the full morning/evening plans, hotel info, and notes." },
        { n: 3, title: "Edit or Delete", body: "Use the edit button to modify day details or the delete button to remove a day entirely." },
        { n: 4, title: "Attach Files", body: "Upload voice notes, photos, or documents per day from the Contacts or Documents page using entity tagging." },
      ],
    },
    tutorial: {
      title: "Trip Itinerary — Video Tutorial",
      description: "How to build and manage your trip itinerary.",
    },
  },

  "triphq-contacts": {
    sop: {
      title: "Trip Contacts Management — SOP",
      description: "How to manage supplier contacts, meeting status, and business card uploads.",
      steps: [
        { n: 1, title: "Add Contact", body: "Click 'Add Contact' to add a new supplier or meeting contact. Fill in name, company, role, email, phone, WeChat ID, and city." },
        { n: 2, title: "Track Meeting Status", body: "Update contact status: Upcoming (not yet met), Met (meeting completed), Followed Up (post-meeting action taken)." },
        { n: 3, title: "Upload Business Cards", body: "Use the upload button on each contact card to attach business card photos (front/back) or voice note recordings." },
        { n: 4, title: "Search & Filter", body: "Use the search bar and status filter pills to quickly find contacts." },
      ],
      quickLink: { label: "WeChat Web", url: "https://web.wechat.com" },
    },
    tutorial: {
      title: "Trip Contacts — Video Tutorial",
      description: "Managing contacts and supplier relationships during sourcing trips.",
    },
  },

  "triphq-catalogue": {
    sop: {
      title: "Catalogue Builder — SOP",
      description: "How to scout, photograph, and catalogue products during sourcing trips.",
      steps: [
        { n: 1, title: "Add Product", body: "Click 'Add Product' when you find an interesting item. Fill in name, category, sub-category, supplier name, CNY price, MOQ, and franchise fit score (1-5)." },
        { n: 2, title: "Upload Photos", body: "Use the upload button on each product card to attach product photos. Multiple photos per product are supported." },
        { n: 3, title: "Rate Franchise Fit", body: "Score products 1-5 on franchise fit. 5 = perfect fit for existing stores, 1 = interesting but not a match." },
        { n: 4, title: "Manage Status", body: "Move products through: Shortlisted (initial interest) → Confirmed (will order) → Rejected (passed)." },
        { n: 5, title: "Toggle Views", body: "Switch between grid view (visual browsing) and table view (data comparison) using the view toggle." },
      ],
    },
    tutorial: {
      title: "Catalogue Builder — Video Tutorial",
      description: "Building a product catalogue during sourcing trips.",
    },
  },

  "triphq-budget": {
    sop: {
      title: "Budget Tracker — SOP",
      description: "How to log expenses, attach receipts, and track trip spending.",
      steps: [
        { n: 1, title: "Log Expense", body: "Click 'Add Expense' for each purchase. Fill in date, city, category (transport/food/hotel/shopping/business/misc), amount, currency, description, and payment method." },
        { n: 2, title: "Upload Receipt", body: "Use the receipt upload icon in the table to attach a photo of the receipt for each expense." },
        { n: 3, title: "Track by Currency", body: "View spending totals broken down by currency (CNY, USD, INR, THB) in the stat cards." },
        { n: 4, title: "Filter by Category", body: "Use the category filter pills to view expenses by type." },
      ],
      quickLink: { label: "XE Currency Converter", url: "https://www.xe.com" },
    },
    tutorial: {
      title: "Budget Tracker — Video Tutorial",
      description: "Tracking expenses and managing trip budgets.",
    },
  },

  "triphq-checklist": {
    sop: {
      title: "Pre-Departure Checklist — SOP",
      description: "How to manage pre-departure tasks and document requirements.",
      steps: [
        { n: 1, title: "Review Tasks", body: "Check all pre-departure tasks. Items are categorized: documents, travel, tech, business, health, general." },
        { n: 2, title: "Check Off Items", body: "Click the checkbox to mark items as completed. The progress bar updates automatically." },
        { n: 3, title: "Upload Documents", body: "For document-related tasks (visa, insurance, TDAC), upload the relevant file using the upload button." },
        { n: 4, title: "Watch Deadlines", body: "Items past their deadline show an 'Overdue' badge. Address these first.", warn: "Visa applications and TDAC registration have firm deadlines." },
      ],
    },
    tutorial: {
      title: "Pre-Departure Checklist — Video Tutorial",
      description: "Completing all pre-departure preparations.",
    },
  },

  "triphq-packing": {
    sop: {
      title: "Packing List — SOP",
      description: "How to manage your packing list for the trip.",
      steps: [
        { n: 1, title: "Review Items", body: "Check all packing items organized by category: documents, tech, clothing, toiletries, health, business, general." },
        { n: 2, title: "Pack Items", body: "Click the checkbox as you pack each item. The progress bar shows your packing completion." },
        { n: 3, title: "Add Items", body: "Click 'Add Item' to add anything missing. Set the quantity and category." },
      ],
    },
    tutorial: {
      title: "Packing List — Video Tutorial",
      description: "Organizing and tracking your packing.",
    },
  },

  "triphq-transport": {
    sop: {
      title: "Transport Management — SOP",
      description: "How to plan and track all transport legs of the trip.",
      steps: [
        { n: 1, title: "Add Transport Leg", body: "Click 'Add Leg' for each segment. Fill in: from city, to city, mode (flight/train/bus/taxi/ferry), departure and arrival times." },
        { n: 2, title: "Book & Update Status", body: "Move legs through: Planned → Booked (after purchasing tickets) → Completed (after travel)." },
        { n: 3, title: "Upload Tickets", body: "Attach ticket PDFs or screenshots using the upload button on each leg card." },
        { n: 4, title: "Add Booking Reference", body: "Record booking references (PNR, confirmation numbers) for each leg." },
      ],
      quickLink: { label: "Trip.com", url: "https://www.trip.com" },
    },
    tutorial: {
      title: "Transport Management — Video Tutorial",
      description: "Planning and tracking trip transport.",
    },
  },

  "triphq-content": {
    sop: {
      title: "Content Planner — SOP",
      description: "How to plan and track content creation during the trip.",
      steps: [
        { n: 1, title: "Plan Shots", body: "Click 'Add Shot Idea' to plan content. Fill in title, description, city, equipment needed." },
        { n: 2, title: "Track Progress", body: "Update status: Planned → Shot (captured) → Editing (post-production) → Published." },
        { n: 3, title: "Upload Thumbnails", body: "After shooting, upload thumbnail images to each content card for visual reference." },
        { n: 4, title: "Add Video Links", body: "Once published, add the video link (YouTube, social media) to each content item." },
      ],
    },
    tutorial: {
      title: "Content Planner — Video Tutorial",
      description: "Planning and creating content during trips.",
    },
  },

  "triphq-deliverables": {
    sop: {
      title: "Post-Trip Deliverables — SOP",
      description: "How to manage and track post-trip action items and deliverables.",
      steps: [
        { n: 1, title: "Review Deliverables", body: "Check all post-trip deliverables with their due dates and current status." },
        { n: 2, title: "Update Progress", body: "Move items through: Pending → In Progress → Done as work completes." },
        { n: 3, title: "Attach Files", body: "Upload completed deliverable files (reports, catalogues, databases) using the upload button." },
        { n: 4, title: "Add Links", body: "For online deliverables (Google Sheets, shared drives), add the link URL." },
      ],
    },
    tutorial: {
      title: "Post-Trip Deliverables — Video Tutorial",
      description: "Completing and tracking post-trip deliverables.",
    },
  },

  "triphq-documents": {
    sop: {
      title: "Documents Hub — SOP",
      description: "How to manage the central document repository for the trip.",
      steps: [
        { n: 1, title: "Upload Files", body: "Click 'Upload File' to add standalone documents. Files uploaded from other pages (contacts, transport, etc.) also appear here." },
        { n: 2, title: "Search & Filter", body: "Use the search bar and doc type filter pills to find specific files. Filter by: business card, receipt, ticket, product photo, voice note, etc." },
        { n: 3, title: "Preview & Download", body: "Click images to preview them full-screen. Use the download button to save files locally. Audio files play inline." },
        { n: 4, title: "Manage Files", body: "Delete unwanted files using the delete button on each file card." },
      ],
    },
    tutorial: {
      title: "Documents Hub — Video Tutorial",
      description: "Managing trip documents and files.",
    },
  },

  "triphq-apps": {
    sop: {
      title: "External Apps — SOP",
      description: "How to manage and quick-launch external tools used during the trip.",
      steps: [
        { n: 1, title: "Browse Apps", body: "View all pre-configured external apps organized by category: transport, payment, communication, navigation, business." },
        { n: 2, title: "Quick Launch", body: "Click 'Open' on any app card to launch it in a new browser tab." },
        { n: 3, title: "Add New Apps", body: "Click 'Add App' to add any tool or website you need during the trip. Set the name, URL, category, and notes." },
      ],
    },
    tutorial: {
      title: "External Apps — Video Tutorial",
      description: "Managing external tools and apps for trips.",
    },
  },
  "vendor-dashboard": {
    sop: {
      title: "HQ Dropshipping Dashboard — SOP",
      description: "How to use the HQ Dropshipping dashboard to monitor fulfillment operations.",
      steps: [
        { n: 1, title: "Review KPIs", body: "Check new orders, processing count, shipped, delivered, total revenue, and active clients. All stats are real-time." },
        { n: 2, title: "Recent Orders", body: "Review the latest 10 orders in the Recent Orders table. Click any row to view full order details." },
        { n: 3, title: "Client Overview", body: "Check top clients by order volume in the Client Overview section." },
        { n: 4, title: "Quick Actions", body: "Use quick action buttons to navigate to Orders, Clients, Tracking, or Ledger." },
      ],
    },
    tutorial: {
      title: "HQ Dropshipping Dashboard — Video Tutorial",
      description: "Overview of the HQ Dropshipping dashboard.",
    },
  },

  "vendor-orders": {
    sop: {
      title: "Order Management — SOP",
      description: "How to manage incoming orders from USDrop Shopify clients.",
      steps: [
        { n: 1, title: "Review New Orders", body: "Filter by 'New' status to see unprocessed orders. Check customer address, items, and store." },
        { n: 2, title: "Quote Order", body: "Click into the order detail. Enter your cost quote for each line item. Submit the quote for approval.", warn: "Quotes must be submitted within 24 hours of order receipt." },
        { n: 3, title: "Process Order", body: "Once quote is accepted, mark the order as 'Processing'. Begin fulfillment preparation." },
        { n: 4, title: "Add Tracking", body: "Enter carrier, tracking number, and ship date. Mark as 'Shipped'." },
        { n: 5, title: "Confirm Delivery", body: "When tracking shows delivered, mark the order as 'Delivered'. This triggers ledger entry." },
      ],
    },
    tutorial: {
      title: "Order Management — Video Tutorial",
      description: "Complete guide to managing dropshipping orders.",
    },
  },

  "vendor-clients": {
    sop: {
      title: "Client Management — SOP",
      description: "How to manage USDrop client accounts and their order history.",
      steps: [
        { n: 1, title: "Browse Clients", body: "View all USDrop client businesses with their contact info, Shopify domains, and plan tiers." },
        { n: 2, title: "View Client Detail", body: "Click a client card to see their full profile: stores, order history, and ledger summary." },
        { n: 3, title: "Track Performance", body: "Monitor total orders, spending, and store connectivity per client." },
      ],
    },
    tutorial: {
      title: "Client Management — Video Tutorial",
      description: "Managing USDrop client relationships.",
    },
  },

  "vendor-stores": {
    sop: {
      title: "Store Management — SOP",
      description: "How to monitor connected Shopify stores and their sync status.",
      steps: [
        { n: 1, title: "Check Connectivity", body: "Review store connection status: Connected (syncing orders), Syncing (in progress), Disconnected (needs attention).", warn: "Disconnected stores will not receive new orders." },
        { n: 2, title: "View Store Orders", body: "Click any store row to see all orders from that specific store." },
        { n: 3, title: "Monitor Sync", body: "Check 'Last Sync' timestamp to ensure stores are syncing regularly." },
      ],
    },
    tutorial: {
      title: "Store Management — Video Tutorial",
      description: "Managing Shopify store connections.",
    },
  },

  "vendor-products": {
    sop: {
      title: "Product Catalogue — SOP",
      description: "How to browse and manage the product catalogue for fulfillment.",
      steps: [
        { n: 1, title: "Browse Products", body: "Switch between grid view (visual) and table view (data) to browse products." },
        { n: 2, title: "Check Stock", body: "Monitor stock status: In Stock (green), Low Stock (amber), Out of Stock (red).", warn: "Low stock products should be reordered immediately to avoid fulfillment delays." },
        { n: 3, title: "Review Pricing", body: "Check cost price vs selling price and margin percentages for each product." },
        { n: 4, title: "Filter & Search", body: "Use the search bar and category filters to find specific products." },
      ],
    },
    tutorial: {
      title: "Product Catalogue — Video Tutorial",
      description: "Browsing and managing the product catalogue.",
    },
  },

  "vendor-tracking": {
    sop: {
      title: "Shipment Tracking — SOP",
      description: "How to track all shipments and update delivery status.",
      steps: [
        { n: 1, title: "Monitor Shipments", body: "View all active shipments with their carrier, tracking number, and current status." },
        { n: 2, title: "Track Progress", body: "Expand any shipment row to see the full tracking timeline with locations and timestamps." },
        { n: 3, title: "Filter by Status", body: "Use status filters to focus on specific shipment stages: Label Created, In Transit, Out for Delivery, Delivered." },
        { n: 4, title: "Update Tracking", body: "Tracking updates are synced automatically from carrier APIs." },
      ],
    },
    tutorial: {
      title: "Shipment Tracking — Video Tutorial",
      description: "Tracking shipments and managing deliveries.",
    },
  },

  "vendor-ledger": {
    sop: {
      title: "Financial Ledger — SOP",
      description: "How to manage the financial ledger for all client transactions.",
      steps: [
        { n: 1, title: "Review Summary", body: "Check total revenue, payouts, outstanding balance, and profit margin in the stat cards." },
        { n: 2, title: "Filter Transactions", body: "Filter by client, payment status (Paid/Pending/Overdue), or search by description/invoice number." },
        { n: 3, title: "Track Balances", body: "The running balance column shows cumulative balance after each transaction." },
        { n: 4, title: "Follow Up on Overdue", body: "Filter by 'Overdue' status to identify payments that need follow-up.", warn: "Overdue payments beyond 30 days should be escalated." },
      ],
    },
    tutorial: {
      title: "Financial Ledger — Video Tutorial",
      description: "Managing financial records and transactions.",
    },
  },
};

export function getSopConfig(pageKey: string): { sop: SopConfig; tutorial: TutorialConfig } | null {
  return SOP_REGISTRY[pageKey] || null;
}

export function getAllSopKeys(): string[] {
  return Object.keys(SOP_REGISTRY);
}

export function getSopsByVertical(verticalPrefix: string): Array<{ key: string; sop: SopConfig; tutorial: TutorialConfig }> {
  return Object.entries(SOP_REGISTRY)
    .filter(([key]) => key.startsWith(verticalPrefix))
    .map(([key, value]) => ({ key, ...value }));
}
