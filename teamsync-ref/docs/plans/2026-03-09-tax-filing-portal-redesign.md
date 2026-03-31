# Tax Filing Portal — UX Redesign Specification

## Overview

Complete redesign of the LegalNations Tax Filing page from a monolithic 1037-line single-page view into a multi-view guided workspace. The redesign synthesizes insights from 4 UX personas (Ops Manager, UX Designer, New Employee, Client Success Lead) into one cohesive design.

## Design Principles

1. **Progressive Disclosure** — Show only what matters right now, make everything discoverable
2. **Inline Everything** — No "Edit Mode" toggle; every field editable on click
3. **Stage-Driven UI** — The 9 filing stages drive layout, filtering, gating, and SOP
4. **Client-Centric** — Default view surfaces client relationship health, not just filing data
5. **Guided Workflow** — Non-technical staff should never wonder "what do I do next?"

## Routes & File Structure

| Route | View | File |
|---|---|---|
| `/legalnations/tax-filing` | Command Center (dashboard + filing list) | `tax-filing-command.tsx` |
| `/legalnations/tax-filing/:id` | Filing Detail Workspace | `tax-filing-detail.tsx` |
| Slide-over (Sheet) | SOP Guide | `tax-filing-sop-sheet.tsx` |
| Shared constants | Types, stages, templates, resources | `tax-filing-shared.ts` |

## Screen 1: Command Center (`/tax-filing`)

### Layout Hierarchy
```
PageShell
  PageHeader title="Tax Filing 2025" actions=[SOP Guide btn, Add Filing btn]
  HeroBanner (brand gradient)
    metrics: Total Filings, Filed & Confirmed, In Progress, Revenue Collected
  StatGrid cols={4}
    StatCard: Needs Outreach (clients not contacted)
    StatCard: Awaiting Documents
    StatCard: Ready to Mail
    StatCard: Completed
  "What's Next" Card
    Smart prompt: "5 filings need documents. Start collecting →"
    Computed client-side from filing data, surfaces highest-priority action
  IndexToolbar
    Search (LLC name, entity name, EIN)
    Filter pills: All | Needs Outreach | Awaiting Docs | In Progress | Filed | Overdue
    Primary action: Add Filing
    Extra: Export CSV, Dense Mode toggle
  DataTable (default 7 columns)
    LLC Name + Client Name (clickable → detail page)
    Filing Stage (StatusBadge)
    Docs Progress (fraction: "3/5")
    Last Contacted (relative time, color-coded: green <3d, yellow 3-7d, red >7d)
    Amount (₹)
    Health (green/yellow/red dot)
    Actions (WhatsApp, Email, Call icon buttons)
  Dense Mode (toggled via toolbar button, adds columns):
    Form 1120 (inline checkbox)
    Form 5472 (inline checkbox)
    EIN Verified (inline checkbox)
    Mail Status (StatusBadge)
    LLC Type (badge)
```

### Batch Operations
- Checkbox column for multi-select
- When rows selected, batch action bar appears: "X selected" [Advance Stage] [Send Reminder] [Export Selected]
- Batch advance opens confirmation dialog with stage dropdown
- Batch reminder sends personalized WhatsApp/email to all selected

### Inline Table Editing
- Filing Stage column: click cell → inline Select dropdown → selection auto-saves
- Checkbox columns (1120, 5472, EIN): click toggles and auto-saves
- All other edits happen on the detail page

## Screen 2: Filing Detail Workspace (`/tax-filing/:id`)

### Layout Hierarchy
```
PageShell
  Header Bar
    Back button (→ /tax-filing)
    LLC Name (h1), Entity Name, Stage Badge, Type Badge
    Quick actions: WhatsApp, Email, Call (conditional on contact data)
    SOP Guide button
  Filing Progress (Stage Stepper)
    9-segment horizontal progress bar
    Completed = green, Current = primary/blue, Future = muted
    Below bar: one-line contextual SOP hint for current stage
    "Advance to Next Stage →" button (enabled when prerequisites met)
  Stage-Aware Checklist Card
    Dynamic sub-tasks based on current stage
    Example at "Document Collection":
      [ ] Bank statements received and uploaded
      [ ] PAN/Aadhar/DL copy uploaded
      [ ] EIN confirmation letter uploaded
      [ ] Client contact details verified
    Completing all items enables the Advance button
  Tabs
    Overview (default, or stage-aware auto-selection)
    Documents
    Communication
    Filing Details
    History
```

### Tab: Overview
```
Grid cols={3}
  Card: Client Information
    Entity Name (inline-editable)
    Contact (inline-editable)
    Email (inline-editable)
    Country (inline-editable)
    PAN/Aadhar/DL (inline-editable)
  Card: LLC Details
    LLC Name (inline-editable)
    LLC Type (read-only badge)
    Formation Date (inline-editable)
    EIN Number (inline-editable, with format validation XX-XXXXXXX)
    Amount Received (read-only)
  Card: Address & Banking
    Address (inline-editable, multiline)
    Address 2 (inline-editable)
    Personal Address (inline-editable, multiline)
    Bank Transactions (read-only)
```

### Tab: Documents
```
Document Completeness: "3/5 received" [Request Missing Docs]
Required Documents Checklist:
  PAN/Aadhar/DL Copy      [Missing] [Upload zone]
  Bank Statements          [Received] [filename.pdf] [View] [Replace]
  EIN Confirmation Letter  [Verified] [ein.pdf] [View]
  LLC Formation Documents  [Missing] [Upload zone]
  Filed Forms (1120+5472)  [Not applicable yet]
Additional Documents:
  Drag-and-drop zone with file type tagging
  Accepts: PDF, JPG, PNG (max 10MB)
```

### Tab: Communication
```
[+ Log Communication] button → FormDialog
Vertical Timeline:
  Mar 15 — WhatsApp sent (Tax filing reminder)
    "Hi Rahul, this is a reminder about..." — by Lakshay
  Mar 12 — Email received (Client replied)
    "Yes, I'll send the bank statements..." 
  Mar 10 — Phone call (Initial outreach)
    "Discussed pricing, client agreed" — by Lakshay
  Mar 1 — System (Season opened)
    "Tax filing season 2025 initiated"
Cross-sell Templates:
  WhatsApp template (personalized preview + Copy + Send buttons)
  Email template (personalized preview + Copy + Send buttons)
```

### Tab: Filing Details
```
Grid cols={2}
  Card: Filing Status
    Checkbox grid (toggles save immediately):
      Form 1120 Filled
      Form 5472 Filled
      EIN Verified in Form
      Filing Done
      Annual Report Filed
    Inline-editable fields:
      Reference Number
      NAICS Code
      Principal Activity
      Business Activity
      Filing Search URL
  Card: Mailing & Compliance
    Tax Standing (inline Select: Good Standing / Non-Compliant / Delinquent)
    Mail Status (inline Select: Not Sent / Preparing / Sent / Delivered)
    Mail Tracking Number (inline-editable)
    Fax Confirmation (inline-editable)
    State Annual Report Due (inline-editable)
    Tax Standing Last Checked (inline-editable)
```

### Tab: History
```
Vertical timeline of all changes:
  Stage transitions (with who and when)
  Field edits (what changed, old → new)
  Document uploads
  Communication events
```

## SOP System: Slide-Over Sheet

Triggered by "SOP Guide" button (BookOpen icon) in PageHeader — available from any view.

### Behavior
- Opens as a right-side Sheet (Shadcn Sheet component)
- Context-aware: when viewing a specific filing, auto-highlights current stage step
- 11 steps in an Accordion, mapping to the 9 filing stages + outreach + delivery steps
- Each step shows: step number, title, description, sub-task checklist, resource links
- "Mark Step Complete" button advances the filing stage (when on a detail page)
- Completed steps: green checkmark, collapsed
- Current step: expanded with full instructions
- Future steps: collapsed, muted
- Bottom section: IRS Resources (links to forms, LetterStream, NAICS lookup, filing addresses)

## Inline Editing Pattern

### Component: `InlineEditField`
- Renders as plain text by default
- On hover: subtle pencil icon appears (visibility toggle, no layout shift)
- On click (pencil or text): transforms to Input/Select/Textarea with auto-focus
- Save: Enter key or onBlur → fires PATCH mutation with single field
- Cancel: Escape key → reverts to display mode
- Optimistic update with rollback on error + toast notification
- Types: text, select (with options), checkbox (toggle-saves immediately), textarea, date

### For checkboxes (1120, 5472, EIN verified, etc.):
- Click toggles immediately, optimistic save, toast on success/error

### For Select fields (stage, tax standing, mail status):
- Click opens dropdown inline, selection auto-saves

## Stage Gating Rules

| Stage | Prerequisites to advance |
|---|---|
| Document Collection → EIN Verification | At least 1 document uploaded |
| EIN Verification → Form 1120 Prep | EIN number entered |
| Form 1120 Prep → Form 5472 Prep | filled_1120 = true |
| Form 5472 Prep → Review & QC | filled_5472 = true |
| Review & QC → Print & Package | verified_ein_in_form = true |
| Print & Package → Mail to IRS | (no strict gate) |
| Mail to IRS → Awaiting Confirmation | mail_tracking_number entered |
| Awaiting Confirmation → Filed & Confirmed | reference_number entered |

When prerequisites not met, Advance button is disabled with tooltip showing what's missing.

## Data & API Changes

### New Supabase Tables
- `ln_tax_filing_documents` (id, filing_id, document_type, file_name, file_url, file_size, status, uploaded_at, verified_at)
- `ln_tax_filing_communications` (id, filing_id, channel, direction, message_preview, sent_by, created_at)
- `ln_tax_filing_activity` (id, filing_id, action_type, field_name, old_value, new_value, performed_by, created_at)

### Modified Table: `ln_tax_filings`
- Add column: `last_contacted_at` (timestamp)
- Add column: `client_health` (text: good/at_risk/critical)
- Add column: `stage_updated_at` (timestamp)

### New API Endpoints
- `GET /api/legalnations/tax-filings/:id/documents`
- `POST /api/legalnations/tax-filings/:id/documents` (multipart upload)
- `DELETE /api/legalnations/tax-filings/:id/documents/:docId`
- `GET /api/legalnations/tax-filings/:id/communications`
- `POST /api/legalnations/tax-filings/:id/communications`
- `GET /api/legalnations/tax-filings/:id/activity`
- `POST /api/legalnations/tax-filings/:id/request-documents` (sends template + logs)
- `PATCH /api/legalnations/tax-filings/:id/advance-stage` (server-enforced prerequisites)
- `POST /api/legalnations/tax-filings/bulk-actions` (batch stage advance, batch reminders)
- `GET /api/legalnations/tax-filings/export.csv`

## Implementation Phases

### Phase 1 (MVP)
- Split tax-filing.tsx into 4 files
- Command Center with StatCards, filter pills, DataTable (7 columns)
- Filing Detail page with inline editing, stage stepper, stage-aware checklist
- "What's Next" smart prompt
- SOP Sheet slide-over

### Phase 2
- Document upload with required document slots
- Communication timeline
- Activity/history logging
- Stage gating with prerequisites

### Phase 3
- Batch operations (multi-select, bulk actions)
- Dense mode toggle
- Export CSV
- Client health indicators
- Client-grouped view toggle
