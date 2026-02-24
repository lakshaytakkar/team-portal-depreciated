import { Switch, Route, useLocation } from "wouter";
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
import EventsDashboard from "@/pages/events/events-dashboard";
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
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

import Login from "@/pages/login";
import PublicHome from "@/pages/public/home";
import PublicServices from "@/pages/public/services";
import PublicServiceDetail from "@/pages/public/service-detail";
import PublicAbout from "@/pages/public/about";
import PublicContact from "@/pages/public/contact";
import TravelPage from "@/pages/public/travel";
import TravelDetailPage from "@/pages/public/travel-detail";
import PublicEventsPage from "@/pages/public/events";
import PublicEventDetailPage from "@/pages/public/event-detail";
import PublicBookingPage from "@/pages/bookings/public-booking";

function TeamPortalRouter() {
  const { currentUser, setCurrentUser } = useStore();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser() as any;
        setCurrentUser(user);
      } catch (error) {
        if (!location.startsWith('/team/login')) {
          setLocation('/team/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F34147]"></div>
      </div>
    );
  }

  if (location === '/team/login') {
    if (currentUser) {
      setLocation('/team');
      return null;
    }
    return <Login />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <AppShell>
      <Switch>
        {/* Team Portal Dashboard */}
        <Route path="/team" component={Dashboard} />
        <Route path="/team/dashboard" component={Dashboard} />
        <Route path="/team/profile" component={Profile} />
        <Route path="/team/chat" component={Chat} />
        <Route path="/team/members" component={TeamMembersPage} />
        <Route path="/team/leads" component={Leads} />
        <Route path="/team/leads/:id" component={LeadDetail} />
        <Route path="/team/pipeline" component={Pipeline} />
        <Route path="/team/tasks" component={Tasks} />
        <Route path="/team/follow-ups" component={FollowUps} />
        <Route path="/team/performance" component={Performance} />
        
        {/* Resources & Knowledge */}
        <Route path="/team/resources/templates" component={Templates} />
        <Route path="/team/knowledge/services" component={Services} />
        <Route path="/team/training/lms" component={LMS} />
        <Route path="/team/training/recordings" component={Recordings} />

        {/* Events Management */}
        <Route path="/team/events" component={EventsPage} />
        <Route path="/team/events/:id" component={EventDetailPage} />
        <Route path="/team/events/:id/checkin" component={EventCheckinPage} />
        <Route path="/team/venues" component={VenueComparisonPage} />

        {/* HR Portal */}
        <Route path="/team/hr/employees" component={HREmployeesPage} />
        <Route path="/team/hr/employees/:id" component={HREmployeeDetailPage} />
        <Route path="/team/hr/employees/:id/attendance" component={HREmployeeAttendancePage} />
        <Route path="/team/hr/assets" component={HRAssetsPage} />
        <Route path="/team/hr/assets/:id" component={HRAssetDetailPage} />
        <Route path="/team/hr/attendance" component={HRAttendancePage} />
        <Route path="/team/hr/leave-requests" component={HRLeaveRequestsPage} />
        <Route path="/team/hr/my-leave-requests" component={MyLeaveRequestsPage} />
        <Route path="/team/hr/jobs" component={JobOpeningsPage} />
        <Route path="/team/hr/portals" component={JobPortalsPage} />
        <Route path="/team/hr/candidates" component={CandidatesPage} />
        <Route path="/team/hr/candidates/:id" component={CandidateDetailPage} />
        <Route path="/team/hr/interviews" component={InterviewsPage} />
        <Route path="/team/hr/templates" component={HrTemplatesPage} />

        {/* Admin Routes */}
        <Route path="/team/admin" component={AdminDashboard} />
        <Route path="/team/admin/leads" component={AdminLeads} />
        <Route path="/team/admin/team" component={TeamManagement} />
        <Route path="/team/admin/assignments" component={Assignments} />
        <Route path="/team/admin/reports" component={Reports} />
        <Route path="/team/admin/settings" component={Settings} />
        <Route path="/team/admin/templates" component={ManageTemplates} />
        <Route path="/team/admin/services" component={ManageServices} />
        <Route path="/team/admin/training" component={ManageTraining} />
        <Route path="/team/admin/website" component={WebsiteManager} />

        {/* Payment Links */}
        <Route path="/team/payment-links" component={PaymentLinksPage} />

        {/* Scheduling & Bookings */}
        <Route path="/team/bookings" component={MyBookingsPage} />
        <Route path="/team/bookings/types" component={BookingTypesPage} />
        <Route path="/team/bookings/availability" component={AvailabilityPage} />
        <Route path="/team/admin/bookings" component={AllBookingsPage} />

        {/* Faire Wholesale Management */}
        <Route path="/team/faire/orders" component={FaireOrdersPage} />
        <Route path="/team/faire/products" component={FaireProductsPage} />
        <Route path="/team/faire/stores" component={FaireStoresPage} />
        <Route path="/team/faire/suppliers" component={FaireSuppliersPage} />
        <Route path="/team/faire/inventory" component={FaireProductsPage} />
        <Route path="/team/faire/shipments" component={FaireOrdersPage} />
        <Route path="/team/faire/variants" component={FaireProductsPage} />

        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function Router() {
  const [location] = useLocation();

  // Team portal routes (protected)
  if (location.startsWith('/team')) {
    return <TeamPortalRouter />;
  }

  // Public booking page (standalone, no header/footer)
  if (location.startsWith('/book/')) {
    return (
      <Switch>
        <Route path="/book/:slug" component={PublicBookingPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Public routes
  return (
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/services" component={PublicServices} />
      <Route path="/services/:id" component={PublicServiceDetail} />
      <Route path="/travel" component={TravelPage} />
      <Route path="/travel/:slug" component={TravelDetailPage} />
      <Route path="/events" component={PublicEventsPage} />
      <Route path="/events/:id" component={PublicEventDetailPage} />
      <Route path="/about" component={PublicAbout} />
      <Route path="/contact" component={PublicContact} />
      <Route path="/privacy" component={PublicHome} />
      <Route path="/terms" component={PublicHome} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="suprans-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
