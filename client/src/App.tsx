import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import LeadDetail from "@/pages/lead-detail";
import Pipeline from "@/pages/pipeline";
import Tasks from "@/pages/tasks";
import FollowUps from "@/pages/follow-ups";
import Performance from "@/pages/performance";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLeads from "@/pages/admin/leads";
import TeamManagement from "@/pages/admin/team";
import Assignments from "@/pages/admin/assignments";
import Reports from "@/pages/admin/reports";
import Settings from "@/pages/admin/settings";
import ManageTemplates from "@/pages/admin/manage-templates";
import ManageServices from "@/pages/admin/manage-services";
import ManageTraining from "@/pages/admin/manage-training";
import WebsiteManager from "@/pages/admin/website-manager";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import Templates from "@/pages/resources/templates";
import Services from "@/pages/knowledge/services";
import LMS from "@/pages/training/lms";
import Recordings from "@/pages/training/recordings";
import EventsPage from "@/pages/events";
import EventDetailPage from "@/pages/events/event-detail";
import EventCheckinPage from "@/pages/events/checkin";
import VenueComparisonPage from "@/pages/events/venues";
import TeamMembersPage from "@/pages/team-members";
import HREmployeesPage from "@/pages/hr/employees";
import HREmployeeDetailPage from "@/pages/hr/employee-detail";
import HRAssetsPage from "@/pages/hr/assets";
import HRAssetDetailPage from "@/pages/hr/asset-detail";
import HRAttendancePage from "@/pages/hr/attendance";
import HREmployeeAttendancePage from "@/pages/hr/employee-attendance";
import HRLeaveRequestsPage from "@/pages/hr/leave-requests";
import MyLeaveRequestsPage from "@/pages/hr/my-leave-requests";
import JobOpeningsPage from "@/pages/hr/job-openings";
import JobPortalsPage from "@/pages/hr/job-portals";
import CandidatesPage from "@/pages/hr/candidates";
import CandidateDetailPage from "@/pages/hr/candidate-detail";
import HrTemplatesPage from "@/pages/hr/hr-templates";
import InterviewsPage from "@/pages/hr/interviews";
import FaireOrdersPage from "@/pages/faire/orders";
import FaireProductsPage from "@/pages/faire/products";
import FaireStoresPage from "@/pages/faire/stores";
import FaireSuppliersPage from "@/pages/faire/suppliers";
import PaymentLinksPage from "@/pages/payment-links";
import BookingTypesPage from "@/pages/bookings/booking-types";
import AvailabilityPage from "@/pages/bookings/availability";
import MyBookingsPage from "@/pages/bookings/my-bookings";
import AllBookingsPage from "@/pages/bookings/all-bookings";
import CalendarPage from "@/pages/bookings/calendar";
import PublicBookingPage from "@/pages/bookings/public-booking";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const DEFAULT_USER = {
  id: "cef223ad-1909-4c9b-bdee-239aa5e99387",
  name: "Admin",
  email: "admin@suprans.in",
  role: "superadmin",
  phone: "+919350818272" as string | null,
  avatar: null as string | null,
  createdAt: new Date(),
};

function PortalRouter() {
  const { setCurrentUser } = useStore();

  useEffect(() => {
    setCurrentUser(DEFAULT_USER);
  }, []);

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/chat" component={Chat} />
        <Route path="/members" component={TeamMembersPage} />
        <Route path="/leads" component={Leads} />
        <Route path="/leads/:id" component={LeadDetail} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/follow-ups" component={FollowUps} />
        <Route path="/performance" component={Performance} />

        {/* Resources & Knowledge */}
        <Route path="/resources/templates" component={Templates} />
        <Route path="/knowledge/services" component={Services} />
        <Route path="/training/lms" component={LMS} />
        <Route path="/training/recordings" component={Recordings} />

        {/* Events Management */}
        <Route path="/events" component={EventsPage} />
        <Route path="/events/:id" component={EventDetailPage} />
        <Route path="/events/:id/checkin" component={EventCheckinPage} />
        <Route path="/venues" component={VenueComparisonPage} />

        {/* HR Portal */}
        <Route path="/hr/employees" component={HREmployeesPage} />
        <Route path="/hr/employees/:id" component={HREmployeeDetailPage} />
        <Route path="/hr/employees/:id/attendance" component={HREmployeeAttendancePage} />
        <Route path="/hr/assets" component={HRAssetsPage} />
        <Route path="/hr/assets/:id" component={HRAssetDetailPage} />
        <Route path="/hr/attendance" component={HRAttendancePage} />
        <Route path="/hr/leave-requests" component={HRLeaveRequestsPage} />
        <Route path="/hr/my-leave-requests" component={MyLeaveRequestsPage} />
        <Route path="/hr/jobs" component={JobOpeningsPage} />
        <Route path="/hr/portals" component={JobPortalsPage} />
        <Route path="/hr/candidates" component={CandidatesPage} />
        <Route path="/hr/candidates/:id" component={CandidateDetailPage} />
        <Route path="/hr/interviews" component={InterviewsPage} />
        <Route path="/hr/templates" component={HrTemplatesPage} />

        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/team" component={TeamManagement} />
        <Route path="/admin/assignments" component={Assignments} />
        <Route path="/admin/reports" component={Reports} />
        <Route path="/admin/settings" component={Settings} />
        <Route path="/admin/templates" component={ManageTemplates} />
        <Route path="/admin/services" component={ManageServices} />
        <Route path="/admin/training" component={ManageTraining} />
        <Route path="/admin/website" component={WebsiteManager} />

        {/* Payment Links */}
        <Route path="/payment-links" component={PaymentLinksPage} />

        {/* Scheduling & Bookings */}
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/bookings" component={MyBookingsPage} />
        <Route path="/bookings/types" component={BookingTypesPage} />
        <Route path="/bookings/availability" component={AvailabilityPage} />
        <Route path="/admin/bookings" component={AllBookingsPage} />

        {/* Faire Wholesale Management */}
        <Route path="/faire/orders" component={FaireOrdersPage} />
        <Route path="/faire/products" component={FaireProductsPage} />
        <Route path="/faire/stores" component={FaireStoresPage} />
        <Route path="/faire/suppliers" component={FaireSuppliersPage} />
        <Route path="/faire/inventory" component={FaireProductsPage} />
        <Route path="/faire/shipments" component={FaireOrdersPage} />
        <Route path="/faire/variants" component={FaireProductsPage} />

        {/* Public booking (standalone) */}
        <Route path="/book/:slug" component={PublicBookingPage} />

        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="suprans-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <PortalRouter />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
