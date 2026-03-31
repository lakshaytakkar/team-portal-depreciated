import { useState } from "react";
import { Search, Mail, Phone, MoreHorizontal, Plus, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { crmContacts, crmCompanies, ALL_VERTICALS_IN_CRM } from "@/lib/mock-data-crm";
import { CRM_COLOR } from "@/lib/crm-config";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

const sizeConfig: Record<string, string> = {
  "1-10": "bg-slate-50 text-slate-600",
  "11-50": "bg-sky-50 text-sky-700",
  "51-200": "bg-blue-50 text-blue-700",
  "201-500": "bg-amber-50 text-amber-700",
  "500+": "bg-violet-50 text-violet-700",
};

export default function CrmContacts() {
  const isLoading = useSimulatedLoading(600);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);

  const filteredContacts = crmContacts.filter(c => {
    if (verticalFilter !== "all" && c.vertical !== verticalFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredCompanies = crmCompanies.filter(co => {
    if (verticalFilter !== "all" && co.vertical !== verticalFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!co.name.toLowerCase().includes(q) && !co.industry.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getCompanyContacts = (companyName: string) =>
    crmContacts.filter(c => c.company === companyName);

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48 animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  const verticalOptions = [
    { value: "all", label: "All Verticals" },
    ...ALL_VERTICALS_IN_CRM.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Contacts"
          actions={
            <div /> // Placeholder to maintain flex layout if needed, or just remove
          }
        />
      </Fade>

      <Fade>
        <Tabs defaultValue="people" className="space-y-5">
          <TabsList className="rounded-xl">
            <TabsTrigger value="people" className="rounded-lg" data-testid="tab-people">
              People{" "}
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {crmContacts.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="companies"
              className="rounded-lg"
              data-testid="tab-companies"
            >
              Companies{" "}
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {crmCompanies.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <IndexToolbar
            search={search}
            onSearch={setSearch}
            placeholder="Search..."
            color={CRM_COLOR}
            filters={verticalOptions}
            activeFilter={verticalFilter}
            onFilter={setVerticalFilter}
            primaryAction={{
              label: "Add Contact",
              onClick: () => {},
            }}
          />

          <TabsContent value="people">
            <DataTableContainer>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <DataTH>Contact</DataTH>
                    <DataTH>Phone</DataTH>
                    <DataTH>Role & Company</DataTH>
                    <DataTH>Vertical</DataTH>
                    <DataTH>Source</DataTH>
                    <DataTH>Assigned To</DataTH>
                    <DataTH>Last Activity</DataTH>
                    <DataTH className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContacts.map((c) => {
                    const vert = getVertical(c.vertical);
                    return (
                      <DataTR
                        key={c.id}
                        data-testid={`contact-row-${c.id}`}
                      >
                        <DataTD>
                          <PersonCell name={c.name} subtitle={c.email} />
                        </DataTD>
                        <DataTD className="whitespace-nowrap text-muted-foreground">
                          {c.phone}
                        </DataTD>
                        <DataTD>
                          <p className="text-sm">{c.designation}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.company}
                          </p>
                        </DataTD>
                        <DataTD>
                          {vert && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                              style={{ backgroundColor: vert.color }}
                            >
                              {vert.name}
                            </span>
                          )}
                        </DataTD>
                        <DataTD>
                          <span className="text-xs capitalize text-muted-foreground">
                            {c.source.replace("-", " ")}
                          </span>
                        </DataTD>
                        <DataTD>
                          <PersonCell name={c.assignedTo} size="sm" />
                        </DataTD>
                        <DataTD className="text-muted-foreground">
                          {c.lastActivity}
                        </DataTD>
                        <DataTD>
                          <div className="flex items-center gap-1">
                            <a
                              href={`mailto:${c.email}`}
                              data-testid={`btn-email-${c.id}`}
                            >
                              <Button variant="ghost" size="icon" className="size-7">
                                <Mail className="size-3.5" />
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              data-testid={`btn-call-${c.id}`}
                            >
                              <Phone className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              data-testid={`btn-more-${c.id}`}
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </div>
                        </DataTD>
                      </DataTR>
                    );
                  })}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-12 text-center text-sm text-muted-foreground"
                      >
                        No contacts match the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DataTableContainer>
          </TabsContent>

          <TabsContent value="companies">
            <DataTableContainer>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <DataTH>Company</DataTH>
                    <DataTH>Industry</DataTH>
                    <DataTH>Size</DataTH>
                    <DataTH>Vertical</DataTH>
                    <DataTH>Contacts</DataTH>
                    <DataTH>Deals</DataTH>
                    <DataTH>Assigned To</DataTH>
                    <DataTH>Added</DataTH>
                    <DataTH className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCompanies.map((co) => {
                    const vert = getVertical(co.vertical);
                    const linkedContacts = getCompanyContacts(co.name);
                    const isExpanded = expandedCompany === co.id;
                    return (
                      <>
                        <DataTR
                          key={co.id}
                          onClick={() =>
                            setExpandedCompany(isExpanded ? null : co.id)
                          }
                          data-testid={`company-row-${co.id}`}
                        >
                          <DataTD>
                            <div className="flex items-center gap-2.5">
                              {isExpanded ? (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="size-4 text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{co.name}</p>
                                <a
                                  href={`https://${co.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {co.website}{" "}
                                  <ExternalLink className="size-3" />
                                </a>
                              </div>
                            </div>
                          </DataTD>
                          <DataTD className="text-muted-foreground">
                            {co.industry}
                          </DataTD>
                          <DataTD>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                sizeConfig[co.size] ?? ""
                              }`}
                            >
                              {co.size} emp.
                            </span>
                          </DataTD>
                          <DataTD>
                            {vert && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                                style={{ backgroundColor: vert.color }}
                              >
                                {vert.name}
                              </span>
                            )}
                          </DataTD>
                          <DataTD className="font-medium">
                            {linkedContacts.length}
                          </DataTD>
                          <DataTD className="font-medium">
                            {co.dealCount}
                          </DataTD>
                          <DataTD>
                            <PersonCell name={co.assignedTo} size="sm" />
                          </DataTD>
                          <DataTD className="text-muted-foreground">
                            {co.addedDate}
                          </DataTD>
                          <DataTD>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`btn-more-co-${co.id}`}
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DataTD>
                        </DataTR>
                        {isExpanded && linkedContacts.length > 0 && (
                          <tr key={`${co.id}-expanded`}>
                            <td colSpan={9} className="bg-muted/30 px-8 py-3">
                              <p className="text-xs text-muted-foreground font-medium mb-2">
                                Linked Contacts
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {linkedContacts.map((lc) => (
                                  <div
                                    key={lc.id}
                                    className="flex items-center gap-2 bg-background rounded-lg px-3 py-1.5 border"
                                  >
                                    <PersonCell name={lc.name} subtitle={lc.designation} size="sm" />
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                  {filteredCompanies.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-12 text-center text-sm text-muted-foreground"
                      >
                        No companies match the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DataTableContainer>
          </TabsContent>
        </Tabs>
      </Fade>
    </PageShell>
  );
}
