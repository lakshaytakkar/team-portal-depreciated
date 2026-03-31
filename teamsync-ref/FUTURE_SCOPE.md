# TeamSync Sales CRM — Future Scope

> This document tracks planned, in-progress, and research-stage features for the Sales CRM department. Update statuses as work progresses.

---

## Currently Live (v1.0)

- Cross-vertical Lead Management (table + kanban view)
- Prospect Nurturing with nurture score
- 7-Stage Deal Pipeline Kanban
- Contacts (People + Companies)
- Deals Table with value and probability
- Activities Timeline (calls, emails, WhatsApp, meetings, tasks)
- Team Performance Leaderboard + Audit Trail
- Message Template Library (Email / WhatsApp / SMS / LinkedIn)
- CRM Dashboard with pipeline funnel + top deals + leaderboard
- Vertical filter on every page (cross-vertical by default)

---

## Planned Features

### 1. Individual Vertical Sales Panes `[Planned]`

Each of the 11 business verticals will get an embedded CRM view within their own department navigation (e.g. `/hr/crm/leads` filtered to LegalNations only, `/sales/crm/pipeline` filtered to USDrop AI only).

**Architecture approach:**
- Add a `"CRM"` nav category to each vertical's `navCategories` in `verticals-config.ts`
- CRM pages accept an optional `verticalId` prop/URL param that pre-applies the vertical filter and locks it (no switching)
- Shared components — the same `leads.tsx`, `pipeline.tsx`, etc. used in `/crm/*` but with a `lockedVertical` mode
- Dashboard widget showing mini CRM summary on each vertical's own dashboard

### 2. Email Integration `[Planned]`

- Connect Gmail and Outlook via OAuth
- Auto-log all sent/received emails to the linked contact/deal in CRM
- Two-way sync: emails sent from CRM appear in Gmail/Outlook sent folder
- Email threading view on contact/deal detail pages
- Smart parsing: detect quoted replies, strip signatures

### 3. WhatsApp Business API `[Planned]`

- Direct integration with WhatsApp Business API (Meta)
- Send approved message templates directly from CRM with one click
- Delivery receipts and read receipts shown on activity timeline
- Reply threading: incoming customer replies captured and linked to deal
- Opt-out / GDPR compliance tracking

### 4. AI Lead Scoring `[Research]`

- ML model assigns a 0–100 score to each lead based on:
  - Engagement signals (email opens, website visits, form fills)
  - Firmographic fit (company size, industry, vertical match)
  - Behavioral signals (response time, reply rate)
- Score displayed as a progress bar on lead cards
- Auto-prioritization: high-score leads surface at top of queue
- Score explanation: tooltip shows which factors contributed most

### 5. Deal Probability AI `[Research]`

- Auto-updating win probability based on real activity patterns (not manual input)
- Factors: days in stage, activity frequency, response rate, deal size vs historical wins
- Probability drift alerts: "This deal hasn't moved in 14 days — risk of stalling"
- Historical accuracy tracking per rep

### 6. Revenue Forecasting `[Planned]`

- Monthly and quarterly revenue forecast with confidence intervals
- Three scenarios: Conservative (won + 30% of negotiation), Base (won + 60% of negotiation + 20% of proposal), Optimistic
- Forecast vs target progress bar per vertical and per rep
- Trend line chart showing forecast evolution over time
- Export forecast to CSV / PDF

### 7. Automation Workflows `[Planned]`

Visual workflow builder (similar to Zapier) for sales automation:
- **Triggers**: Lead created / Stage changed / Activity logged / Deal stalled / X days since last contact
- **Actions**: Send email template / Assign rep / Move stage / Create task / Send WhatsApp / Notify Slack
- **Conditions**: Vertical is / Value greater than / Source is / Tag includes
- Pre-built automation templates: "New Lead Auto-Assign", "Stale Deal Nudge", "Won Deal Celebration"

### 8. Calendar Sync `[Planned]`

- Google Calendar and Outlook Calendar OAuth integration
- Schedule meetings from within CRM — calendar picker shows rep's availability
- Meeting links auto-generated (Google Meet / Teams)
- Meeting outcomes logged back to deal activity timeline
- Daily agenda view: upcoming meetings for the day

### 9. Document Management `[Planned]`

- Upload and attach proposals, NDAs, contracts to deals
- Version history for documents
- E-signature integration (DocuSign / native basic signing)
- Document status tracking: Draft → Sent → Viewed → Signed
- Template proposals: fill-in-the-blank proposal templates using deal data

### 10. Mobile App `[Planned]`

- PWA already in place (installable on iOS/Android from browser)
- Native app via Capacitor (wrapping existing React codebase)
- Mobile-optimized layouts: swipe to move deals between stages, tap to log activity
- Push notifications for: new lead assigned, deal stage change, overdue activity
- Offline support: view contacts and deals without internet, sync when reconnected

### 11. Per-Vertical Sales Reporting `[Planned]`

- Embedded pipeline analytics within each vertical's own Reports section
- Vertical-specific KPIs: e.g. GoyoTours tracks "tour packages pitched", LegalNations tracks "compliance consultations converted"
- Comparison view: performance of a vertical's sales vs same period last year
- Rep performance within vertical (not cross-vertical)

### 12. Customer / Client Portal `[Research]`

- External-facing web portal for clients to:
  - View status of their proposal/deal (read-only)
  - Download shared documents
  - Approve proposals digitally
  - Submit new requirements (creates a new lead in CRM)
- Branded per vertical (LegalNations portal has LegalNations branding)
- Access controlled via magic link (no password required)

### 13. API Integrations & Data Import `[Planned]`

- **Zapier connector**: trigger Zaps when leads are created, deals close, etc.
- **HubSpot import**: CSV export from HubSpot maps cleanly to CRM contacts/deals
- **Salesforce migration tool**: field mapping wizard for one-time migration
- **Webhook outbound**: POST deal/lead events to any external URL
- **REST API**: documented public API for custom integrations

### 14. Real-time Collaboration `[Research]`

- Live comments on deal detail pages (like Google Docs comments)
- @mention team members on deals, contacts, activities
- Deal followers: subscribe to updates on a specific deal
- In-app notifications: bell icon shows all @mentions and deal updates
- Activity presence: see who else is viewing a deal ("Priya is also viewing")
- Conflict detection: alert if two reps are editing the same contact simultaneously

---

## Notes for Contributors

- When implementing a new feature, move its status from `[Planned]` → `[In Progress]` and add the assignee name and target date
- When shipping, move to a "Released" section above with the version/date
- All CRM pages follow the design standard: `PageTransition`, `Stagger`/`Fade` animations, `useSimulatedLoading`, vertical filter pills, `data-testid` on all interactive elements
- Brand color: `#0369A1` (CRM azure blue)
