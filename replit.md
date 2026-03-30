# Team Portal - Suprans Business CRM

## Overview
A comprehensive team portal and CRM system for Suprans Business Consulting. The application includes:
- **Sales CRM**: Lead management, pipeline tracking, activities, and performance analytics
- **HR Portal**: Employee management, attendance, leave requests, recruitment, and candidate tracking
- **Events Management**: Event planning, attendees, vendors, and venue comparisons
- **Faire Wholesale**: Wholesale order management, product catalog, suppliers, and store management
- **LLC Clients**: LLC formation tracking, document management, bank applications, and client timeline
- **Public Website**: Company information, services, travel packages, and contact forms
- **Scheduling System**: In-house booking/scheduling (like Calendly) with booking types, availability, public booking pages, and team analytics
- **AI Chat Assistant**: GPT-4o powered chat drawer (header Sparkles icon) with database querying tools, streaming responses, conversation history, and CRM record management

## User Credentials
All users have password: **Suprans@123**

- **Superadmin**: admin@suprans.in / Suprans@123 (primary admin, member of all 18 teams)

### Team Members (42 total users, all with password "Suprans@123")
- abhinandan@suprans.in, accounts@suprans.in, aditya@suprans.in, akansha@suprans.in
- alerts@suprans.in, babita@suprans.in, bharti@suprans.in, bhartij@suprans.in
- collab@suprans.in, cs@suprans.in, ds@suprans.in, events@suprans.in
- franchise@suprans.in, garima@suprans.in, gaurav@suprans.in, harsh@suprans.in
- himanshu@suprans.in, hr@suprans.in, import@suprans.in, info@suprans.in
- kartik@suprans.in, krish@suprans.in, lakshay@suprans.in, llc@suprans.in
- love@suprans.in, naveen@suprans.in, neetu@suprans.in, nitin@suprans.in
- parthiv@suprans.in, payal@suprans.in, prachi@suprans.in, rudraksh@suprans.in
- sahil@suprans.in, sales@suprans.in, sanjay@suprans.in, simran@suprans.in
- sumit@suprans.in, sunny@suprans.in, travel@suprans.in, vikash@suprans.in
- yashkumar@suprans.in

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with passport.js

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── dialogs/      # Modal dialogs for various actions
│   │   ├── layout/       # App shell, sidebar, header
│   │   ├── modals/       # Search and sign-out modals
│   │   ├── public/       # Public website components
│   │   └── ui/           # Shadcn UI components
│   ├── pages/
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── events/       # Event management pages
│   │   ├── hr/           # HR portal pages
│   │   ├── knowledge/    # Knowledge base
│   │   ├── public/       # Public website pages
│   │   ├── resources/    # Templates and resources
│   │   └── training/     # LMS and recordings
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   ├── store.ts      # Zustand state management
│   │   └── queryClient.ts
│   └── assets/images/    # Static images
server/
├── ai-chat.ts            # AI Chat Assistant (GPT-4o streaming, tools, conversation CRUD)
├── auth.ts               # Authentication logic
├── db.ts                 # Database connection
├── routes.ts             # API endpoints
├── storage.ts            # Database storage layer
└── seed scripts          # Database seeding
shared/
└── schema.ts             # Drizzle schema definitions
```

## Database Tables
45+ tables including:
- Core: users, leads, activities, tasks, services, templates, employees
- Travel: travel_packages, travel_bookings
- Events: events, event_attendees, event_hotels, event_flights, event_vendors, event_vendor_items
- HR: hr_employees, candidates, job_openings, interviews, attendance, leave_requests
- Faire: faire_stores, faire_suppliers, faire_products, faire_product_variants, faire_orders, faire_order_items, faire_shipments
- LLC: llc_banks, llc_document_types, llc_clients, llc_client_documents, llc_client_timeline
- Scheduling: booking_types, availability_schedules, availability_overrides, bookings, booking_reminders
- AI: ai_conversations, ai_messages

## Routes
- `/` - Public homepage
- `/services` - Public services page
- `/travel` - Travel packages
- `/about` - About page
- `/contact` - Contact page
- `/team` - Team portal dashboard (requires login)
- `/team/login` - Login page
- `/team/leads` - Lead management
- `/team/pipeline` - Sales pipeline
- `/team/tasks` - Task management
- `/team/hr/*` - HR portal pages
- `/team/events/*` - Event management pages
- `/team/faire/orders` - Faire order management
- `/team/faire/products` - Faire product catalog
- `/team/faire/stores` - Faire store management
- `/team/faire/suppliers` - Faire supplier management
- `/team/bookings` - My bookings
- `/team/bookings/types` - Booking types management
- `/team/bookings/availability` - Availability settings
- `/team/admin/bookings` - All team bookings (manager view)
- `/book/:slug` - Public booking page
- `/team/admin/*` - Admin pages (superadmin only)

## API Endpoints
### Scheduling & Bookings
- `GET/POST /api/booking-types` - List/create booking types
- `GET/PATCH/DELETE /api/booking-types/:id` - Get/update/delete booking type
- `GET/PUT /api/availability` - Get/set availability schedule
- `GET/POST/DELETE /api/availability/overrides` - Manage date overrides
- `GET/POST /api/bookings` - List/create bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/public/booking/:slug` - Public booking type info
- `GET /api/public/booking/:slug/slots` - Available time slots
- `POST /api/public/booking/:slug/book` - Create public booking
### Faire Wholesale
- `GET/POST /api/faire/stores` - List/create stores
- `GET/PATCH/DELETE /api/faire/stores/:id` - Get/update/delete store
- `GET/POST /api/faire/suppliers` - List/create suppliers
- `GET/PATCH/DELETE /api/faire/suppliers/:id` - Get/update/delete supplier
- `GET/POST /api/faire/products` - List/create products
- `GET/PATCH/DELETE /api/faire/products/:id` - Get/update/delete product
- `GET/PATCH /api/faire/orders` - List/update orders
- `GET/POST /api/faire/shipments` - List/create shipments

### LLC Clients
- `GET /api/llc/banks` - List available banks
- `GET/POST /api/llc/clients` - List/create clients
- `GET/PATCH/DELETE /api/llc/clients/:id` - Get/update/delete client
- `GET/POST /api/llc/clients/:clientId/documents` - List/create documents
- `GET /api/llc/clients/:clientId/timeline` - Get client timeline

## RBAC System (Role-Based Access Control)
- **Team Membership**: Users are assigned to teams via `team_members` table with roles (manager/executive)
- **Team Switching**: Sidebar top shows team switcher, filtering data to the selected team
- **Role-Based Views**:
  - Executive: sees only items assigned to them within the team
  - Manager: sees all items within the team
  - SuperAdmin: full access to all data across all teams, plus System section (Settings, User Management, Audit Logs, Billing) in sidebar navigation
  - Superadmin can simulate SuperAdmin/Manager/Executive roles via 3-button toggle in header; member of all teams
- **Data Scoping**: `leads` and `tasks` tables have `teamId` column; API routes accept `teamId` and `effectiveRole` query params
- **Store**: `client/src/lib/store.ts` holds UI state only (currentUser, currentTeamId, simulatedRole, myTeamMemberships) with `getEffectiveRole()` and `getRoleInTeam()` helper methods
- **All pages use React Query**: No mock data in store; leads, tasks, users fetched from API with team/role filtering
- **Admin Team Management**: `/team/admin/team` page for superadmin to assign users to teams and set roles

## Design System
- **Branding**: "TeamSync" text logo in sidebar header (Team in black, Sync in blue #2563EB)
- **Primary Color**: Blue (#2563EB / HSL 217 91% 60%) - used across CSS variables, sidebar accents, buttons, charts
- **Destructive Color**: Red kept for destructive actions (logout, delete) using semantic --destructive token
- **Font**: Inter Tight (Google Fonts), loaded via CSS @import
- **Color Tokens**: All pages use semantic Tailwind tokens (text-foreground, text-muted-foreground, bg-card, bg-muted, border) - no hardcoded hex colors
- **Dark/Light Mode**: ThemeProvider component at `client/src/components/theme-provider.tsx`, toggle in header
- **Dock**: 52px fixed left panel with AI-generated PNG icons per team (stored in `client/public/icons/`)
- **Sidebar**: 210px width, light bg, active items use blue accent bar + blue icon color
- **Header**: h-20, bg-card, search bar with Cmd+K shortcut, notification popover, theme toggle, profile dropdown
- **Shadows**: `shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none` for cards
- **Typography**: Page headings use `text-xl font-semibold tracking-tight`, descriptions use `text-sm text-muted-foreground`
- **Spacing**: Content area uses `px-6 py-6 space-y-6`
- **Status Colors**: Green (#effefa/#40c4aa), Red for negative indicators, Yellow (#fff8e6/#d39c3d) with dark mode variants
- **Selection Highlights**: Blue tints (#EFF6FF bg, #DBEAFE borders) for selected items

## Recent Changes
- March 2026: Upgraded Follow-ups page with Overdue/Today/This Week/Upcoming groups, Mark as Contacted (logs activity + clears follow-up), Snooze (+1 day), View Lead buttons, phone number display, assigned exec display for managers
- March 2026: Upgraded Performance page with real data charts (no mock data), Total Leads/Leads Won/Win Rate/Total Revenue stats, Leads by Stage bar chart, New Leads Trend (last 6 months), Recent Activity feed, Manager leaderboard table (sortable by leads/won/rate/value), Team Activity weekly chart
- January 2026: Imported from GitHub repository (replit-agent branch)
- January 24, 2026: Added Faire Wholesale management (stores, suppliers, products, orders)
- January 24, 2026: Added LLC Clients module (banks, clients, documents, timeline)
- February 2026: Added Website Content Management System (CMS)
  - Dynamic website content stored in `website_content` table (section/key/JSON value)
  - Admin page at `/team/admin/website` (Website Manager) for editing all public website content
  - Sections: Homepage hero/stats/FAQs/videos, About page, Contact info, Footer links, Site banner
  - Public pages fetch content dynamically with static fallbacks
  - API: GET /api/public/website-content, PATCH /api/website-content (superadmin only)
- February 12, 2026: RBAC System Refactor
  - Added `teamId` to leads and tasks schema
  - Refactored store to remove mock data, use React Query for all data fetching
  - Updated all backend routes with team-scoped filtering
  - Updated all frontend pages (leads, pipeline, tasks, dashboard, follow-ups, performance, admin pages)
  - Updated all dialog components to use API mutations
  - Sidebar syncs team memberships to store for role determination
- February 12, 2026: Design System Overhaul
  - Inter Tight font, semantic color tokens across all pages
  - Dark/light theme support with ThemeProvider
  - Redesigned sidebar (272px, light bg, primary active items)
  - Redesigned header (h-20, search, notifications, theme toggle)
  - All pages converted from hardcoded hex colors to semantic tokens
  - Consistent typography and spacing patterns
- February 24, 2026: Added Scheduling & Booking System
  - 5 new tables: booking_types, availability_schedules, availability_overrides, bookings, booking_reminders
  - Booking Types: Create meeting types with custom duration, slug, price, buffer time, approval settings
  - Availability: Weekly schedule management with day-specific hours and date override support
  - Public Booking: `/book/:slug` page for customers to pick date/time and book meetings
  - My Bookings: View upcoming/past bookings with status management (confirm/complete/cancel/no-show)
  - All Team Bookings: Manager view with per-rep analytics and team-wide booking stats
  - WhatsApp sharing and .ics calendar download for bookings
  - API: Full CRUD for booking types, availability, bookings with slot calculation
  - Sidebar nav added to Travel-Sales and Sales teams
- Database tables expanded to 51+ tables
- API routes with Zod validation and CRUD operations

## Development
Run `npm run dev` to start the development server on port 5000.
