import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, ShoppingBag, Users, FileText, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { faireQuotations } from "@/lib/mock-data-faire-ops";
import { sharedResources } from "@/lib/mock-data-shared";
import { useVertical } from "@/lib/vertical-store";

const STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-100 text-blue-700",
  QUOTE_RECEIVED: "bg-amber-100 text-amber-700",
  CHALLENGED: "bg-red-100 text-red-700",
  SENT_ELSEWHERE: "bg-gray-100 text-gray-600",
  approved: "bg-green-100 text-green-700",
  drafting: "bg-slate-100 text-slate-600",
  applied: "bg-blue-100 text-blue-700",
  pending_docs: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(q));
}

export function SearchPanel() {
  const [, setLocation] = useLocation();
  const { currentVertical } = useVertical();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const isFaire = currentVertical.id === "faire";

  const { data: ordersData } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    enabled: open && isFaire,
  });

  const { data: retailersData } = useQuery<{ retailers: any[] }>({
    queryKey: ["/api/faire/retailers"],
    enabled: open && isFaire,
  });

  const { data: applicationsData } = useQuery<{ applications: any[] }>({
    queryKey: ["/api/faire/applications"],
    enabled: open && isFaire,
  });

  const orders = Array.isArray(ordersData?.orders) ? ordersData.orders : [];
  const retailers = Array.isArray(retailersData?.retailers) ? retailersData.retailers : [];
  const applications = Array.isArray(applicationsData?.applications) ? applicationsData.applications : [];

  const filteredOrders = useMemo(() => {
    if (!isFaire) return [];
    return orders
      .filter((o) => matchesQuery(query, o.id, o.retailer_name, o.store_name, o.retailer_id))
      .slice(0, 5);
  }, [orders, query, isFaire]);

  const filteredRetailers = useMemo(() => {
    if (!isFaire) return [];
    return retailers
      .filter((r) => matchesQuery(query, r.name, r.company_name, r.city, r.state))
      .slice(0, 5);
  }, [retailers, query, isFaire]);

  const filteredApplications = useMemo(() => {
    if (!isFaire) return [];
    return applications
      .filter((a) => matchesQuery(query, a.brand_name, a.email_id, a.category, a.status))
      .slice(0, 5);
  }, [applications, query, isFaire]);

  const filteredQuotations = useMemo(() => {
    if (!isFaire) return [];
    return faireQuotations
      .filter((q) => matchesQuery(query, q.id, q.order_id, q.status))
      .slice(0, 5);
  }, [query, isFaire]);

  const filteredResources = useMemo(() => {
    return sharedResources
      .filter((r) => r.verticalId === currentVertical.id && matchesQuery(query, r.title, r.category, r.description))
      .slice(0, 5);
  }, [query, currentVertical.id]);

  const hasResults =
    filteredOrders.length > 0 ||
    filteredRetailers.length > 0 ||
    filteredApplications.length > 0 ||
    filteredQuotations.length > 0 ||
    filteredResources.length > 0;

  function navigate(url: string) {
    setOpen(false);
    setQuery("");
    setLocation(url);
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        data-testid="button-search"
        title="Search (⌘K)"
      >
        <Search className="size-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
        <CommandInput
          placeholder="Search orders, retailers, applications…"
          value={query}
          onValueChange={setQuery}
          data-testid="input-search-global"
        />
        <CommandList>
          {!hasResults && query.length > 0 && (
            <CommandEmpty>No results found for &ldquo;{query}&rdquo;</CommandEmpty>
          )}
          {!query && (
            <CommandEmpty className="py-6 text-sm text-muted-foreground text-center">
              Start typing to search across {currentVertical.name}…
            </CommandEmpty>
          )}

          {filteredOrders.length > 0 && (
            <CommandGroup heading="Orders">
              {filteredOrders.map((o: any) => (
                <CommandItem
                  key={o.id}
                  value={`order-${o.id}`}
                  onSelect={() => navigate("/faire/orders")}
                  data-testid={`search-result-order-${o.id}`}
                >
                  <ShoppingBag className="mr-2 h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">{o.id}</span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {o.retailer_name || o.retailer_id || "Unknown retailer"} · {o.store_name || o.store_id || ""}
                    </span>
                  </div>
                  {o.state && (
                    <Badge variant="outline" className="ml-2 shrink-0 text-[10px] capitalize">
                      {o.state.replace(/_/g, " ")}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredRetailers.length > 0 && (
            <CommandGroup heading="Retailers">
              {filteredRetailers.map((r: any) => (
                <CommandItem
                  key={r.id}
                  value={`retailer-${r.id}`}
                  onSelect={() => navigate("/faire/retailers")}
                  data-testid={`search-result-retailer-${r.id}`}
                >
                  <Users className="mr-2 h-4 w-4 text-violet-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">{r.name || r.company_name}</span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {[r.city, r.state_code || r.state].filter(Boolean).join(", ")} · {r.total_orders ?? 0} orders
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredApplications.length > 0 && (
            <CommandGroup heading="Applications">
              {filteredApplications.map((a: any) => (
                <CommandItem
                  key={a.id}
                  value={`application-${a.id}`}
                  onSelect={() => navigate(`/faire/applications/${a.id}`)}
                  data-testid={`search-result-application-${a.id}`}
                >
                  <FileText className="mr-2 h-4 w-4 text-teal-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">{a.brand_name}</span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {a.category || "—"} · {a.email_id || ""}
                    </span>
                  </div>
                  {a.status && (
                    <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {a.status.replace(/_/g, " ")}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredQuotations.length > 0 && (
            <CommandGroup heading="Quotations">
              {filteredQuotations.map((q) => (
                <CommandItem
                  key={q.id}
                  value={`quotation-${q.id}`}
                  onSelect={() => navigate(`/faire/quotations/${q.id}`)}
                  data-testid={`search-result-quotation-${q.id}`}
                >
                  <MessageSquare className="mr-2 h-4 w-4 text-pink-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">{q.id}</span>
                    <span className="text-xs text-muted-foreground truncate block">
                      Order: {q.order_id}
                    </span>
                  </div>
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[q.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {q.status.replace(/_/g, " ")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredResources.length > 0 && (
            <CommandGroup heading="Resources">
              {filteredResources.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`resource-${r.id}`}
                  onSelect={() => {
                    setOpen(false);
                    setQuery("");
                    if (r.url && r.url !== "#") window.open(r.url, "_blank");
                  }}
                  data-testid={`search-result-resource-${r.id}`}
                >
                  <BookOpen className="mr-2 h-4 w-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">{r.title}</span>
                    <span className="text-xs text-muted-foreground truncate block">{r.category}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
