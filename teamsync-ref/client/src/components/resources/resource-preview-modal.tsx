import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  FileText,
  FileCode,
  FileIcon,
  Presentation,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SharedResource } from "@/lib/mock-data-shared";

interface ResourcePreviewModalProps {
  resource: SharedResource | null;
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const spreadsheetData: Record<string, { headers: string[]; rows: string[][] }> = {
  "RES-HR-005": {
    headers: ["Role", "Level", "Location", "Base (INR)", "Bonus %", "Equity (ESOP)", "Total CTC"],
    rows: [
      ["Software Engineer", "L1", "Mumbai", "₹8,00,000", "10%", "500 units", "₹9,30,000"],
      ["Software Engineer", "L2", "Mumbai", "₹12,00,000", "12%", "1,000 units", "₹14,44,000"],
      ["Sr. Engineer", "L3", "Bangalore", "₹18,00,000", "15%", "2,000 units", "₹22,70,000"],
      ["Engineering Manager", "L4", "Bangalore", "₹28,00,000", "18%", "5,000 units", "₹37,04,000"],
      ["Director", "L5", "Mumbai", "₹42,00,000", "20%", "10,000 units", "₹55,40,000"],
      ["Product Manager", "L2", "Remote", "₹14,00,000", "12%", "1,200 units", "₹16,88,000"],
      ["Designer", "L2", "Mumbai", "₹10,00,000", "10%", "800 units", "₹11,80,000"],
      ["Operations Lead", "L3", "Delhi", "₹15,00,000", "15%", "1,500 units", "₹19,25,000"],
    ],
  },
  "RES-SALES-003": {
    headers: ["Feature", "USDrop AI", "AutoDS", "Zendrop", "Oberlo", "Advantage"],
    rows: [
      ["AI Product Research", "✅ Built-in", "❌ No", "❌ No", "❌ No", "Unique"],
      ["1-Click Import", "✅ Yes", "✅ Yes", "✅ Yes", "✅ Yes", "Parity"],
      ["Auto Fulfillment", "✅ Yes", "✅ Yes", "✅ Yes", "❌ No", "Advantage"],
      ["Supplier Vetting", "✅ AI-scored", "⚠️ Basic", "✅ Yes", "❌ No", "Unique"],
      ["Analytics Dashboard", "✅ Advanced", "✅ Basic", "⚠️ Basic", "⚠️ Basic", "Advantage"],
      ["US Warehousing", "✅ 5 hubs", "❌ No", "✅ 2 hubs", "❌ No", "Advantage"],
      ["Price per Month", "$49-199", "$39-199", "$49-249", "Free-29", "Competitive"],
      ["Shopify Integration", "✅ Native", "✅ Native", "✅ Native", "✅ Native", "Parity"],
    ],
  },
  "RES-SALES-005": {
    headers: ["Plan", "Monthly", "Annual", "Stores", "Products", "Orders/mo", "Support"],
    rows: [
      ["Starter", "$49", "$39/mo", "1", "50", "500", "Email"],
      ["Growth", "$99", "$79/mo", "3", "200", "2,000", "Email + Chat"],
      ["Pro", "$149", "$119/mo", "5", "Unlimited", "10,000", "Priority"],
      ["Enterprise", "$199", "$159/mo", "10", "Unlimited", "Unlimited", "Dedicated"],
      ["Free Trial", "$0", "—", "1", "10", "50", "Docs only"],
    ],
  },
  "RES-ADMIN-004": {
    headers: ["Vendor", "Category", "Contract", "Payment Terms", "Rating", "Contact"],
    rows: [
      ["CloudFlex India", "IT Services", "Active - Mar 2027", "Net 30", "⭐ 4.8", "vendor@cloudflex.in"],
      ["Zenith Catering", "F&B", "Active - Dec 2026", "COD", "⭐ 4.5", "ops@zenith.co"],
      ["DataGuard Pro", "Security", "Active - Jun 2026", "Net 15", "⭐ 4.9", "support@dataguard.io"],
      ["PrintHub Express", "Printing", "Active - Sep 2026", "Net 30", "⭐ 4.2", "orders@printhub.in"],
      ["TravelEase Corp", "Travel", "Active - Jan 2027", "Prepaid", "⭐ 4.6", "biz@travelease.com"],
      ["OfficeMax India", "Supplies", "Active - Aug 2026", "Net 45", "⭐ 4.3", "sales@officemax.in"],
    ],
  },
  "RES-HUB-002": {
    headers: ["Vendor", "Type", "City", "Rate/Event", "Past Events", "Rating", "Available"],
    rows: [
      ["SoundWave AV", "Audio/Visual", "Mumbai", "₹45,000", "12", "⭐ 4.8", "✅ Yes"],
      ["Green Plate Co.", "Catering", "Delhi", "₹350/head", "8", "⭐ 4.5", "✅ Yes"],
      ["SnapShot Studios", "Photography", "Bangalore", "₹25,000", "15", "⭐ 4.9", "✅ Yes"],
      ["Decor Dreams", "Decoration", "Mumbai", "₹35,000", "6", "⭐ 4.2", "⚠️ Waitlist"],
      ["Shield Security", "Security", "Pan India", "₹18,000", "20", "⭐ 4.7", "✅ Yes"],
      ["Stage Kraft", "Stage Setup", "Delhi", "₹55,000", "4", "⭐ 4.4", "✅ Yes"],
    ],
  },
  "RES-HUB-004": {
    headers: ["Category", "Budget (₹)", "Actual (₹)", "Variance", "% of Total", "Notes"],
    rows: [
      ["Venue Rental", "2,00,000", "1,85,000", "+15,000", "28%", "Negotiated bulk discount"],
      ["Catering (150 pax)", "1,50,000", "1,62,000", "-12,000", "24%", "Added dessert station"],
      ["AV & Tech", "75,000", "72,000", "+3,000", "11%", "Own projector used"],
      ["Marketing & Promo", "50,000", "48,500", "+1,500", "7%", "Social media ads"],
      ["Transportation", "30,000", "32,500", "-2,500", "5%", "Extra shuttle needed"],
      ["Contingency (10%)", "60,000", "25,000", "+35,000", "4%", "Unused"],
      ["Total", "6,65,000", "6,25,000", "+40,000", "100%", "Under budget ✅"],
    ],
  },
  "RES-EVENTS-004": {
    headers: ["Day", "Time", "Activity", "Location", "Duration", "Notes"],
    rows: [
      ["Day 1", "09:00", "Arrive Beijing Capital Airport", "PEK Terminal 3", "—", "Visa on arrival desk"],
      ["Day 1", "14:00", "Forbidden City & Tiananmen", "Dongcheng", "3 hrs", "Guide included"],
      ["Day 1", "19:00", "Welcome Dinner - Peking Duck", "Quanjude Restaurant", "2 hrs", "Pre-booked"],
      ["Day 2", "08:00", "Great Wall - Mutianyu Section", "Huairou District", "Full day", "Cable car included"],
      ["Day 3", "10:00", "Temple of Heaven & Tea Ceremony", "Chongwen", "3 hrs", "Souvenir stop"],
      ["Day 3", "15:00", "Silk Market & Shopping", "Chaoyang", "2 hrs", "Bargaining tips"],
      ["Day 3", "20:00", "Kung Fu Show", "Red Theatre", "1.5 hrs", "VIP seats"],
    ],
  },
  "RES-FAIRE-006": {
    headers: ["Product", "COGS ($)", "Target Margin", "Wholesale ($)", "Faire Fee (15%)", "Net Revenue ($)", "MSRP ($)"],
    rows: [
      ["Ceramic Mug Set", "$8.50", "55%", "$18.89", "$2.83", "$16.06", "$37.99"],
      ["Linen Napkins (4pk)", "$6.20", "60%", "$15.50", "$2.33", "$13.17", "$31.99"],
      ["Soy Candle 8oz", "$4.80", "65%", "$13.71", "$2.06", "$11.66", "$27.99"],
      ["Bamboo Utensil Set", "$5.50", "58%", "$13.10", "$1.96", "$11.13", "$25.99"],
      ["Cotton Tote Bag", "$3.20", "62%", "$8.42", "$1.26", "$7.16", "$16.99"],
      ["Glass Vase", "$7.00", "55%", "$15.56", "$2.33", "$13.22", "$32.99"],
    ],
  },
};

const pdfContent: Record<string, { title: string; sections: { heading: string; content: string }[] }> = {
  "RES-HR-001": {
    title: "Employee Handbook 2026",
    sections: [
      { heading: "1. Welcome & Company Overview", content: "Welcome to the team! This handbook covers all policies, benefits, and expectations. Our mission is to build exceptional business tools that empower teams worldwide.\n\nCulture Pillars: Ownership, Transparency, Continuous Learning, Customer Obsession." },
      { heading: "2. Employment Policies", content: "Work Hours: Flexible 9-hour day with core hours 10 AM – 4 PM IST.\nRemote Work: 3 days remote, 2 days in-office (hybrid model).\nProbation: 6 months for all new hires.\nNotice Period: 2 months for confirmed employees.\nNon-compete: 12 months post-departure within direct competitors." },
      { heading: "3. Leave Policy", content: "Paid Time Off: 24 days/year (earned monthly at 2 days/month)\nSick Leave: 12 days/year (medical certificate for 3+ consecutive days)\nMaternity: 26 weeks paid leave\nPaternity: 15 days paid leave\nBereavement: 5 days for immediate family\nPublic Holidays: 12 gazetted holidays per year" },
      { heading: "4. Benefits & Perks", content: "Health Insurance: ₹5L family floater (spouse + 2 children)\nLife Insurance: 3x annual CTC\nMeal Allowance: ₹3,000/month\nLearning Budget: ₹50,000/year for courses and certifications\nWFH Setup: One-time ₹25,000 allowance\nWellness: ₹5,000/quarter for gym, yoga, therapy" },
      { heading: "5. Code of Conduct", content: "All employees must uphold ethical standards, respect data privacy, avoid conflicts of interest, and maintain professional conduct. Violations should be reported to HR or through the anonymous whistleblower portal.\n\nZero Tolerance: Harassment, discrimination, data theft, fraud." },
    ],
  },
  "RES-HR-003": {
    title: "HR Policy Manual v3.0",
    sections: [
      { heading: "1. Attendance & Timekeeping", content: "All employees must check in via the TeamSync portal by 10:30 AM.\nGrace period: 15 minutes (up to 3 times/month).\nExcessive tardiness (>5/month) triggers performance counseling.\nManagers receive weekly attendance reports every Monday." },
      { heading: "2. Performance Management", content: "Cycle: Bi-annual reviews (April & October)\nFramework: OKR-based (3-5 objectives per employee)\nSelf-review: Due 1 week before manager review\nCalibration: Cross-functional panel for L3+ promotions\nPIP: 90-day plan for below-expectations ratings" },
      { heading: "3. Disciplinary Procedures", content: "Level 1: Verbal warning (documented in HR file)\nLevel 2: Written warning (signed acknowledgment)\nLevel 3: Final warning + PIP\nLevel 4: Termination\nAll levels require HR oversight and employee response opportunity." },
      { heading: "4. Data Privacy & Security", content: "Employees must not share confidential data outside the organization.\nAll devices must have disk encryption enabled.\nTwo-factor authentication is mandatory for all company systems.\nBreach reporting: Immediately notify IT security team." },
    ],
  },
  "RES-SALES-001": {
    title: "USDrop AI Product Brochure",
    sections: [
      { heading: "The Problem", content: "90% of new dropshipping stores fail in the first 6 months. The #1 reason? Poor product selection and unreliable suppliers. Store owners spend hours manually researching products, negotiating with suppliers, and tracking shipments — only to face quality issues and delays." },
      { heading: "Our Solution", content: "USDrop AI automates the entire dropshipping workflow with AI-powered product research, one-click import to Shopify, automated supplier vetting with quality scores, and real-time inventory sync across US warehouses.\n\n✓ Find winning products 10x faster\n✓ Ship from US warehouses in 2-5 days\n✓ AI quality scoring eliminates bad suppliers" },
      { heading: "Key Features", content: "🔍 AI Product Discovery — Analyze trends from 50M+ products\n📦 5 US Fulfillment Centers — 2-5 day domestic shipping\n🤖 Smart Supplier Matching — Quality score, reliability score, price score\n📊 Performance Analytics — Real-time sales, returns, and margin tracking\n🔗 Native Shopify Integration — One-click product import and sync" },
      { heading: "Pricing", content: "Starter: $49/mo (1 store, 50 products)\nGrowth: $99/mo (3 stores, 200 products)\nPro: $149/mo (5 stores, unlimited products)\nEnterprise: $199/mo (10 stores, dedicated support)\n\n14-day free trial. No credit card required." },
      { heading: "Success Stories", content: "\"We went from $2K to $18K/month in 3 months using USDrop AI's product research.\" — Karan G., Growth Plan\n\n\"Shipping times dropped from 15 days to 3 days. Customer complaints went to zero.\" — Raj M., Pro Plan" },
    ],
  },
  "RES-EVENTS-001": {
    title: "China Tour Brochure 2026",
    sections: [
      { heading: "Beijing Classic (5 Days)", content: "Day 1: Arrival + Tiananmen Square + Forbidden City\nDay 2: Great Wall (Mutianyu) + Ming Tombs\nDay 3: Temple of Heaven + Summer Palace\nDay 4: Hutong Tour + Silk Market + Peking Duck Dinner\nDay 5: Departure\n\nPackage: ₹89,999/person (twin sharing)" },
      { heading: "Shanghai Modern (4 Days)", content: "Day 1: The Bund + Yu Garden + Nanjing Road\nDay 2: Shanghai Tower + French Concession\nDay 3: Zhujiajiao Water Town day trip\nDay 4: Shopping + Departure\n\nPackage: ₹74,999/person (twin sharing)" },
      { heading: "Chengdu & Pandas (3 Days)", content: "Day 1: Chengdu Research Base of Giant Panda Breeding\nDay 2: Leshan Giant Buddha + Sichuan Hot Pot\nDay 3: Jinli Ancient Street + Departure\n\nPackage: ₹59,999/person (twin sharing)" },
      { heading: "What's Included", content: "✓ Return flights (Delhi/Mumbai/Bangalore)\n✓ 4-star hotel accommodation\n✓ Daily breakfast + 1 lunch/dinner\n✓ English-speaking guide\n✓ All entry tickets\n✓ Airport transfers\n✓ Travel insurance" },
    ],
  },
  "RES-HUB-003": {
    title: "AV & Tech Setup Guide",
    sections: [
      { heading: "Audio Setup", content: "Small venue (< 50 pax): 2x powered speakers + 1 wireless mic\nMedium venue (50-200): 4x speakers + mixer + 2 wireless mics + lapel\nLarge venue (200+): PA system + stage monitors + soundboard operator\n\nAlways do a sound check 2 hours before event start." },
      { heading: "Video & Display", content: "Screen size: Minimum 100\" for 50+ pax venues\nProjector: 5000+ lumens for daytime events, 3000+ for evening\nAlternative: LED walls for premium events (12ft x 8ft minimum)\nBackup: Always carry a spare HDMI cable and USB-C adapter" },
      { heading: "Streaming (Hybrid Events)", content: "Camera: HD webcam or DSLR with capture card\nEncoder: OBS Studio or StreamYard\nBandwidth: Minimum 10 Mbps upload (test beforehand)\nPlatform: YouTube Live or Zoom Webinar\nAudio: Separate feed from mixer (not room mic)" },
      { heading: "Power & Safety", content: "Always identify power outlets during site visit\nBring 2x power strips with surge protection\nTape all cables to floor with gaffer tape\nKeep backup UPS for critical equipment\nFire extinguisher must be accessible near tech booth" },
    ],
  },
  "RES-ADMIN-002": {
    title: "Brand Guidelines v3",
    sections: [
      { heading: "Logo Usage", content: "Primary logo: Full color on white/light backgrounds\nReversed logo: White on dark/colored backgrounds\nMinimum size: 80px wide (digital), 25mm (print)\nClear space: 1x logo height on all sides\nDo NOT: Rotate, distort, add effects, or change colors" },
      { heading: "Color Palette", content: "Primary Blue: #3B82F6 (rgb 59, 130, 246)\nDark Blue: #1E40AF\nAccent Green: #10B981\nWarm Gray: #6B7280\nBackground: #F9FAFB (light), #111827 (dark)\nError Red: #EF4444\nWarning Amber: #F59E0B" },
      { heading: "Typography", content: "Headings: Inter Bold / Semi-bold\nBody: Inter Regular (16px base, 1.5 line height)\nCode: JetBrains Mono\nDisplay (marketing): Inter Bold at 48-72px\nDo NOT use more than 3 font weights on a single page." },
      { heading: "Tone of Voice", content: "Professional but approachable\nConfident, not arrogant\nHelpful and action-oriented\nAvoid jargon when speaking to clients\nUse active voice and short sentences" },
    ],
  },
  "RES-FAIRE-002": {
    title: "Faire API v2 Documentation",
    sections: [
      { heading: "Authentication", content: "All API requests require Bearer token in Authorization header.\nTokens expire after 24 hours — refresh via POST /oauth/token.\nRate limit: 100 requests/minute per brand.\nBase URL: https://api.faire.com/v2/" },
      { heading: "Product Sync", content: "POST /products — Create new product listing\nPATCH /products/{id} — Update product details\nGET /products — List all products (paginated, 50/page)\nDELETE /products/{id} — Archive product\n\nRequired fields: name, wholesale_price, msrp, images[], description" },
      { heading: "Order Management", content: "GET /orders — List orders (filter by state: NEW, PROCESSING, SHIPPED)\nGET /orders/{id} — Order details with line items\nPATCH /orders/{id}/ship — Mark as shipped (tracking_number required)\nPOST /orders/{id}/cancel — Cancel order (reason required)" },
      { heading: "Webhooks", content: "Configure webhooks at Settings > API > Webhooks\nEvents: order.created, order.updated, payout.completed\nPayload: JSON with event_type, created_at, data object\nRetry: 3 attempts with exponential backoff (5s, 30s, 300s)" },
    ],
  },
};

const docContent: Record<string, { title: string; content: string }> = {
  "RES-HR-002": {
    title: "Offer Letter Template",
    content: `[COMPANY LETTERHEAD]

Date: {{date}}

Dear {{candidate_name}},

We are pleased to extend an offer of employment for the position of
{{designation}} in our {{department}} department, reporting to {{manager_name}}.

COMPENSATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Salary:     {{annual_ctc}} per annum
Variable Pay:    {{bonus_percentage}}% of base (performance-linked)
Stock Options:   {{esop_units}} units (4-year vesting, 1-year cliff)

EMPLOYMENT TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Start Date:      {{start_date}}
Work Location:   {{office_location}} (Hybrid — 3 days in office)
Probation:       6 months
Notice Period:   2 months (post confirmation)

BENEFITS INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Health Insurance — ₹5L family floater
• Life Insurance — 3x annual CTC
• Meal Allowance — ₹3,000/month
• Learning Budget — ₹50,000/year
• WFH Setup — ₹25,000 one-time

Please confirm your acceptance by signing and returning this letter
by {{deadline_date}}.

We look forward to having you on the team!

Warm regards,
{{hr_name}}
Head of People Operations`,
  },
  "RES-HR-006": {
    title: "Exit Interview Form",
    content: `EXIT INTERVIEW QUESTIONNAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Employee: ________________________  Date: __________
Department: _____________________  Tenure: _________

1. PRIMARY REASON FOR LEAVING
   □ Better opportunity    □ Compensation
   □ Work-life balance     □ Career growth
   □ Management issues     □ Relocation
   □ Personal reasons      □ Other: __________

2. SATISFACTION RATINGS (1-5 scale)
   Role & Responsibilities:     ☆☆☆☆☆
   Manager & Leadership:        ☆☆☆☆☆
   Team & Culture:              ☆☆☆☆☆
   Compensation & Benefits:     ☆☆☆☆☆
   Learning & Growth:           ☆☆☆☆☆
   Work-Life Balance:           ☆☆☆☆☆

3. Would you recommend this company to others? □ Yes □ No

4. What could we have done differently?
   _______________________________________________

5. Any suggestions for improvement?
   _______________________________________________

Interviewer: ________________  Signature: __________`,
  },
  "RES-EVENTS-002": {
    title: "China Visa Application Guide",
    content: `CHINA TOURIST VISA (L-VISA) APPLICATION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED DOCUMENTS
1. Passport (6+ months validity, 2 blank pages)
2. Completed visa application form (Form V.2013)
3. Recent passport photo (48mm × 33mm, white background)
4. Round-trip flight booking confirmation
5. Hotel reservation for full stay
6. Invitation letter or tour itinerary
7. Bank statement (last 3 months, min ₹1L balance)
8. Cover letter stating purpose of visit

PROCESSING TIMES
Standard:  4 working days — ₹4,500
Express:   2 working days — ₹7,500
Urgent:    1 working day  — ₹10,000

EMBASSY LOCATIONS
Delhi:    50-D Shantipath, Chanakyapuri
Mumbai:   9th Floor, Crescenzo, BKC
Kolkata:  EC-72, Sector I, Salt Lake City

COMMON REJECTION REASONS
• Insufficient bank balance
• Missing hotel bookings
• Incorrect photo specifications
• Expired passport
• Incomplete application form

TIP: Apply at least 3 weeks before departure date.`,
  },
  "RES-EVENTS-003": {
    title: "Hotel Booking SOP",
    content: `HOTEL BLOCK BOOKING — STANDARD OPERATING PROCEDURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: REQUIREMENTS GATHERING
• Group size and room type breakdown
• Check-in/check-out dates
• Meal plan requirements (B/B, HB, FB)
• Budget per room per night

STEP 2: SHORTLISTING (use Preferred Partners)
• Tier 1: Marriott, IHG, Hilton (premium groups)
• Tier 2: OYO Townhouse, Lemon Tree (budget groups)
• Minimum: Request quotes from 3 properties

STEP 3: NEGOTIATION CHECKLIST
□ Room rate (aim for 20-30% below rack rate)
□ Complimentary room ratio (1 free per 15 paid)
□ Early check-in / late check-out
□ Welcome drinks and fruit basket
□ Dedicated check-in counter for group
□ Free WiFi and parking

STEP 4: CONFIRMATION
• Advance: 25% at booking, 75% at check-in
• Cancellation: Free up to 14 days prior
• Get written confirmation with rate breakdown`,
  },
  "RES-FAIRE-004": {
    title: "Product Listing SOP",
    content: `FAIRE PRODUCT LISTING — STANDARD OPERATING PROCEDURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMAGE REQUIREMENTS
• Minimum 5 images per product
• Primary: White background, 500x500px minimum
• Lifestyle: Product in use / styled setting
• Detail: Close-up of materials/texture
• Scale: Product next to common object for size
• Format: JPG or PNG, max 10MB each
• NO watermarks, logos, or text overlays

TITLE FORMAT (35-50 characters)
[Material] + [Product Type] + [Key Feature]
Example: "Hand-Poured Soy Candle — Lavender & Cedar"

PRICING FORMULA
Wholesale = COGS ÷ (1 - Target Margin%)
MSRP = Wholesale × 2.0 to 2.5
Example: COGS $5 @ 60% margin → Wholesale $12.50 → MSRP $25-31

CASE PACK & MOQ
• Set minimum case pack (typically 6 or 12 units)
• MOQ should match case pack size
• Offer tiered pricing for larger orders

CATEGORIES & TAGS
• Select most specific category available
• Add 5-10 relevant search tags
• Include material, style, room, and occasion tags`,
  },
  "RES-FAIRE-005": {
    title: "Order Fulfillment SOP",
    content: `FAIRE ORDER FULFILLMENT — STANDARD OPERATING PROCEDURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: ORDER REVIEW (within 2 hours)
□ Verify all items are in stock
□ Check shipping address accuracy
□ Confirm order total matches inventory
□ Flag any issues to account manager

STEP 2: PICK & PACK
□ Print packing slip from Faire dashboard
□ Pick items from designated shelf locations
□ Inspect each item for damage/defects
□ Wrap fragile items with bubble wrap
□ Include packing slip and thank-you card
□ Seal and weigh package

STEP 3: SHIPPING
□ Generate label via Faire Shipping
□ Select carrier based on weight/destination
□ Apply label to package
□ Scan tracking barcode to Faire system
□ Schedule carrier pickup or drop-off

STEP 4: POST-SHIPMENT
□ Verify tracking updates within 24 hours
□ Monitor for delivery exceptions
□ Follow up on non-delivered after 7 days
□ Process any returns per return policy`,
  },
  "RES-FAIRE-007": {
    title: "Faire Direct Campaign Playbook",
    content: `FAIRE DIRECT — COMMISSION-FREE SALES CAMPAIGN GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT IS FAIRE DIRECT?
Orders placed through your Faire Direct link have
0% commission (vs. standard 15%). This means more
margin on every sale you drive directly.

SETTING UP YOUR LINK
1. Go to Faire Dashboard → Marketing → Faire Direct
2. Copy your unique brand link
3. Create UTM-tagged versions for each campaign

EMAIL TEMPLATE — EXISTING RETAILERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: Reorder with free shipping — exclusive link inside

Hi {{retailer_name}},

Thank you for carrying our products! Ready to restock?

Use this exclusive link for commission-free ordering:
{{faire_direct_link}}

✓ Same Faire buyer protection
✓ Net 60 payment terms
✓ Free shipping on orders $200+

Best,
{{brand_name}} Team

TRACKING SUCCESS
• Tag each link with source (email, social, DM)
• Track conversion rate per campaign
• Target: 25%+ of total orders via Direct`,
  },
  "RES-ADMIN-003": {
    title: "Operations Playbook",
    content: `OPERATIONS PLAYBOOK — STANDARD PROCEDURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CLIENT ONBOARDING FLOW
   Day 0: Contract signed → Welcome email
   Day 1: Kickoff call + requirement gathering
   Day 3: Account setup + access provisioning
   Day 7: Training session (1 hour)
   Day 14: First check-in call
   Day 30: 30-day review + feedback survey

2. ESCALATION PROTOCOL
   Level 1: Team lead — resolve within 4 hours
   Level 2: Department head — resolve within 24 hours
   Level 3: VP Operations — resolve within 48 hours
   Critical: CEO notification for revenue-impacting issues

3. VENDOR MANAGEMENT
   • Quarterly performance reviews
   • Annual contract renegotiation
   • Backup vendor for each critical category
   • SLA monitoring with automated alerts

4. REPORTING CADENCE
   Daily: Task completion + blockers (Slack)
   Weekly: Team standup + metrics review
   Monthly: Department OKR check-in
   Quarterly: Board-level performance report`,
  },
  "RES-DEV-001": {
    title: "System Architecture Diagram",
    content: `TEAMSYNC SYSTEM ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRONTEND (React 18 + TypeScript + Vite)
├── Pages (17 verticals × ~10 pages each = 177 pages)
├── Design System (Tailwind + Shadcn UI)
├── State: TanStack Query + Context API
└── Routing: Wouter (lightweight)

BACKEND (Express.js + TypeScript)
├── REST API (/api/core/* + /api/ai/*)
├── Supabase Client (PostgreSQL + Storage + Realtime)
├── OpenAI Integration (GPT-4o streaming)
└── Server-Side Rendering: Vite SSR middleware

DATABASE (Supabase — PostgreSQL 15)
├── Core Tables: verticals, users, tasks, channels, etc.
├── AI Tables: ai_conversations, ai_messages
├── Faire Schema: 8 tables for wholesale operations
└── RLS: Row-Level Security policies per vertical

INFRASTRUCTURE
├── Hosting: Replit (Node.js 20)
├── CDN: Vite dev server (HMR in dev)
├── Storage: Supabase Storage (file uploads)
└── Realtime: Supabase Realtime (chat, notifications)`,
  },
  "RES-DEV-005": {
    title: "Deployment Runbook",
    content: `DEPLOYMENT RUNBOOK — PRODUCTION RELEASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRE-DEPLOY CHECKLIST
□ All tests passing
□ No TypeScript errors (tsc --noEmit)
□ Database migrations applied
□ Environment variables confirmed
□ Changelog updated
□ Team notified in #deployments channel

DEPLOY PROCESS (Replit)
1. Commit all changes to main branch
2. Open Replit Dashboard → Deployments
3. Click "Deploy" → Select latest commit
4. Monitor build logs for errors
5. Verify health check endpoint (/api/health)
6. Smoke test critical flows

ROLLBACK PROCEDURE
If issues detected post-deploy:
1. Go to Deployments → History
2. Select last known good deployment
3. Click "Redeploy"
4. Verify rollback success
5. Create incident report

POST-DEPLOY VERIFICATION
□ Homepage loads correctly
□ Login/auth flow works
□ API endpoints respond (spot check 3-5)
□ AI chat streaming works
□ File uploads functional
□ Real-time chat messages appear`,
  },
  "RES-DEV-006": {
    title: "Security Checklist",
    content: `SECURITY REVIEW CHECKLIST — NEW FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUT VALIDATION
□ All user inputs sanitized server-side
□ SQL injection prevention (parameterized queries)
□ XSS prevention (output encoding)
□ File upload: type, size, and name validation
□ Rate limiting on form submissions

AUTHENTICATION & AUTHORIZATION
□ All protected routes require valid session
□ Role-based access control enforced
□ Session timeout configured (24h max)
□ Password requirements: 8+ chars, mixed case, number
□ 2FA enabled for admin accounts

DATA PROTECTION
□ Sensitive data encrypted at rest
□ HTTPS enforced on all endpoints
□ PII not logged or exposed in errors
□ Database backups automated daily
□ Data retention policy documented

DEPENDENCY SECURITY
□ npm audit shows no critical vulnerabilities
□ Dependencies updated to latest stable
□ No known CVEs in production dependencies
□ Lock file committed (package-lock.json)

OWASP TOP 10 (2021)
□ A01: Broken Access Control — verified
□ A02: Cryptographic Failures — reviewed
□ A03: Injection — prevented
□ A07: Auth Failures — tested
□ A09: Logging — implemented`,
  },
  "RES-HUB-005": {
    title: "Attendee Communication Scripts",
    content: `ATTENDEE COMMUNICATION TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMAIL 1: REGISTRATION CONFIRMATION
Subject: You're in! 🎉 {{event_name}} — {{event_date}}

Hi {{name}},

Your registration for {{event_name}} is confirmed!

📅 Date: {{event_date}}
⏰ Time: {{event_time}}
📍 Venue: {{venue_name}}, {{city}}
🎫 Registration ID: {{reg_id}}

Save this email for check-in at the venue.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMAIL 2: REMINDER (3 days before)
Subject: See you in 3 days! 📍 {{event_name}}

Quick reminders:
• Bring a valid photo ID
• Doors open at {{doors_open}}
• Parking available at {{parking_info}}
• Dress code: {{dress_code}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHATSAPP: DAY-OF UPDATE
Hi {{name}}! 👋 Quick update for today's event:
✅ Venue: {{venue}} (Google Maps link)
✅ Check-in starts: {{checkin_time}}
✅ Your table: {{table_number}}
See you soon!`,
  },
  "RES-FAIRE-008": {
    title: "Inventory Management SOP",
    content: `FAIRE INVENTORY MANAGEMENT — SOP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAILY TASKS
□ Check low-stock alerts (< 10 units)
□ Review backorder queue
□ Process incoming shipments
□ Update inventory counts post-fulfillment

REORDER POINT CALCULATION
Reorder Point = (Daily Sales × Lead Time) + Safety Stock
Safety Stock = Max Daily Sales × Max Lead Time - Avg Daily × Avg Lead

EXAMPLE:
Product: Ceramic Mug Set
Avg daily sales: 5 units
Lead time: 14 days
Max daily: 8, Max lead: 21 days
Safety Stock = (8 × 21) - (5 × 14) = 98 units
Reorder Point = (5 × 14) + 98 = 168 units

API SYNC FREQUENCY
• Inventory levels: Every 15 minutes
• Price updates: Every 6 hours
• Product details: On change (webhook)
• Order sync: Real-time (webhook)

END-OF-SEASON CLEARANCE
1. Identify slow movers (< 2 units/month)
2. Apply 20-40% wholesale discount
3. Create "Sale" collection on Faire
4. Email top retailers about clearance
5. Remove listings after 60 days if unsold`,
  },
};

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case "pdf": return <FileText className="h-4 w-4" />;
    case "excel": return <FileSpreadsheet className="h-4 w-4" />;
    case "ppt": return <Presentation className="h-4 w-4" />;
    case "doc": return <FileCode className="h-4 w-4" />;
    case "link": return <LinkIcon className="h-4 w-4" />;
    case "image": return <ImageIcon className="h-4 w-4" />;
    case "template": return <FileIcon className="h-4 w-4" />;
    default: return <FileIcon className="h-4 w-4" />;
  }
}

function getFileColor(type: string) {
  switch (type.toLowerCase()) {
    case "pdf": return { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-500 dark:text-red-400", header: "bg-red-600" };
    case "excel": return { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", header: "bg-emerald-600" };
    case "ppt": return { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400", header: "bg-orange-600" };
    case "doc": return { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", header: "bg-blue-600" };
    case "link": return { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400", header: "bg-violet-600" };
    case "image": return { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-600 dark:text-teal-400", header: "bg-teal-600" };
    default: return { bg: "bg-slate-50 dark:bg-slate-950/30", text: "text-slate-600 dark:text-slate-400", header: "bg-slate-600" };
  }
}

function SpreadsheetPreview({ resourceId }: { resourceId: string }) {
  const data = spreadsheetData[resourceId];
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <FileSpreadsheet className="size-12 opacity-40" />
        <p className="text-sm">Spreadsheet preview not available</p>
        <p className="text-xs opacity-60">Download the file to view contents</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-emerald-600 text-white">
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-emerald-500 w-10">#</th>
            {data.headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider border-r border-emerald-500 last:border-r-0 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className={cn("border-b border-gray-100 dark:border-gray-800 transition-colors", ri % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-900/50", "hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20")}>
              <td className="px-4 py-2.5 text-[11px] text-gray-400 border-r border-gray-100 dark:border-gray-800">{ri + 1}</td>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800 last:border-r-0 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PDFPreview({ resourceId }: { resourceId: string }) {
  const data = pdfContent[resourceId];
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <FileText className="size-12 opacity-40" />
        <p className="text-sm">PDF preview not available</p>
        <p className="text-xs opacity-60">Download the file to view contents</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{data.title}</h1>
          <p className="text-sm text-gray-400">TeamSync Resources</p>
        </div>
        <div className="space-y-8">
          {data.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-950 text-red-500 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                {section.heading}
              </h2>
              <div className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line pl-8">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocPreview({ resourceId }: { resourceId: string }) {
  const data = docContent[resourceId];
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <FileCode className="size-12 opacity-40" />
        <p className="text-sm">Document preview not available</p>
        <p className="text-xs opacity-60">Download the file to view contents</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-6 pb-4 border-b-2 border-blue-100 dark:border-blue-900">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{data.title}</h1>
          <p className="text-xs text-gray-400 mt-1">TeamSync Document</p>
        </div>
        <pre className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
          {data.content}
        </pre>
      </div>
    </div>
  );
}

function PresentationPreview({ resource }: { resource: SharedResource }) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
          <Presentation className="h-10 w-10 text-orange-500" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{resource.title}</p>
          <p className="text-gray-500 text-sm mt-1">{resource.fileSize} — {resource.description.slice(0, 80)}...</p>
        </div>
        {resource.url && resource.url !== "#" && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors cursor-pointer"
            data-testid="button-open-presentation"
          >
            <ExternalLink className="h-4 w-4" />
            Open Presentation
          </a>
        )}
      </div>
    </div>
  );
}

function LinkPreview({ resource }: { resource: SharedResource }) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
          <LinkIcon className="h-10 w-10 text-violet-500" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{resource.title}</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{resource.description}</p>
          <p className="text-violet-600 dark:text-violet-400 text-xs mt-3 truncate">{resource.url}</p>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors cursor-pointer"
          data-testid="button-open-link"
        >
          <ExternalLink className="h-4 w-4" />
          Open Link
        </a>
      </div>
    </div>
  );
}

function ImagePreview({ resource }: { resource: SharedResource }) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
          <ImageIcon className="h-10 w-10 text-teal-500" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{resource.title}</p>
          <p className="text-gray-500 text-sm mt-1">{resource.fileSize} — {resource.description.slice(0, 80)}...</p>
        </div>
      </div>
    </div>
  );
}

export function ResourcePreviewModal({
  resource,
  open,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: ResourcePreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowRight" && hasNext && onNext) { onNext(); return; }
    if (e.key === "ArrowLeft" && hasPrev && onPrev) { onPrev(); return; }
  }, [onClose, hasNext, hasPrev, onNext, onPrev]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open || !resource) return null;

  const colors = getFileColor(resource.type);

  const handleDownload = () => {
    if (resource.url && resource.url !== "#") {
      window.open(resource.url, "_blank");
    }
  };

  const renderPreview = () => {
    switch (resource.type.toLowerCase()) {
      case "excel":
        return <SpreadsheetPreview resourceId={resource.id} />;
      case "pdf":
        return <PDFPreview resourceId={resource.id} />;
      case "doc":
        return <DocPreview resourceId={resource.id} />;
      case "ppt":
        return <PresentationPreview resource={resource} />;
      case "link":
        return <LinkPreview resource={resource} />;
      case "image":
        return <ImagePreview resource={resource} />;
      default:
        return <DocPreview resourceId={resource.id} />;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${resource.title}`}
      onClick={onClose}
      data-testid="modal-resource-preview"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={cn(
          "relative flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-200",
          isFullscreen
            ? "w-screen h-screen rounded-none"
            : "w-[90vw] max-w-5xl h-[85vh]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", colors.bg, colors.text)}>
              {getFileIcon(resource.type)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" data-testid="text-preview-filename">{resource.title}</h2>
              <p className="text-[11px] text-gray-400 truncate">{resource.category} — {resource.fileSize || "Web link"} — v{resource.version} — Added {resource.addedDate} by {resource.addedBy}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-4">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Previous file"
                title="Previous file"
                data-testid="button-preview-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Next file"
                title="Next file"
                data-testid="button-preview-next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              data-testid="button-preview-fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
              aria-label="Download"
              title="Download"
              data-testid="button-preview-download"
            >
              <Download className="h-4 w-4" />
            </button>
            {resource.url && resource.url !== "#" && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors cursor-pointer"
                aria-label="Open in new tab"
                title="Open in new tab"
                data-testid="button-preview-external"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              aria-label="Close preview"
              title="Close"
              data-testid="button-preview-close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
          {renderPreview()}
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 shrink-0 ml-4">
            {resource.type.toUpperCase()} — {resource.category}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
