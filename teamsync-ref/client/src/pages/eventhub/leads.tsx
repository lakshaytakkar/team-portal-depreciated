import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/animated";
import { verticals } from "@/lib/verticals-config";
import { eventInquiries } from "@/lib/mock-data-eventhub";
import { cn } from "@/lib/utils";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  StatGrid,
  StatCard,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";

const EVENT_TYPES = [
  { value: "All", label: "All" },
  { value: "Corporate", label: "Corporate" },
  { value: "Wedding", label: "Wedding" },
  { value: "Social", label: "Social" },
  { value: "Conference", label: "Conference" },
  { value: "Exhibition", label: "Exhibition" },
];

export default function EventInquiries() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const vertical = verticals.find((v) => v.id === "eventhub")!;

  const filtered = eventInquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.eventType.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || inquiry.eventType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusVariant = (status: string): "info" | "warning" | "success" | "error" | "neutral" => {
    switch (status) {
      case "New":
        return "info";
      case "Contacted":
        return "warning";
      case "Proposal Sent":
        return "info";
      case "Qualified":
        return "success";
      case "Converted":
        return "success";
      case "Lost":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Event Inquiries"
        subtitle="Incoming requests for event planning and management"
        actions={
          <Button
            className="gap-2"
            style={{ backgroundColor: vertical.color, color: "#fff" }}
            data-testid="button-add-inquiry"
          >
            <Plus className="h-4 w-4" />
            New Inquiry
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          label="Total Inquiries"
          value={eventInquiries.length}
          icon={MessageSquare}
          iconBg="rgba(59, 130, 246, 0.1)"
          iconColor="rgb(59, 130, 246)"
        />
        <StatCard
          label="New Today"
          value="4"
          icon={Plus}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="rgb(245, 158, 11)"
        />
        <StatCard
          label="Qualified"
          value="12"
          icon={ArrowRight}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="rgb(16, 185, 129)"
        />
        <StatCard
          label="Pipeline Value"
          value="₹85.5L"
          icon={MessageSquare}
          iconBg="rgba(139, 92, 246, 0.1)"
          iconColor="rgb(139, 92, 246)"
        />
      </StatGrid>

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={EVENT_TYPES}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        color={vertical.color}
        placeholder="Search inquiries..."
      />

      <DataTableContainer>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <DataTH>Client</DataTH>
              <DataTH>Event Type</DataTH>
              <DataTH>Guests</DataTH>
              <DataTH>Date</DataTH>
              <DataTH>Budget</DataTH>
              <DataTH>Status</DataTH>
              <DataTH align="right">Actions</DataTH>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((inquiry) => (
              <DataTR key={inquiry.id}>
                <DataTD>
                  <PersonCell name={inquiry.clientName} subtitle={inquiry.id} size="sm" />
                </DataTD>
                <DataTD>{inquiry.eventType}</DataTD>
                <DataTD>{inquiry.expectedGuests}</DataTD>
                <DataTD>{inquiry.tentativeDate}</DataTD>
                <DataTD>{inquiry.budgetRange}</DataTD>
                <DataTD>
                  <StatusBadge status={inquiry.status} variant={getStatusVariant(inquiry.status)} />
                </DataTD>
                <DataTD align="right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/hub/leads/${inquiry.id}`)}
                    data-testid={`button-followup-${inquiry.id}`}
                  >
                    Follow Up
                  </Button>
                </DataTD>
              </DataTR>
            ))}
          </tbody>
        </table>
      </DataTableContainer>
    </PageShell>
  );
}
