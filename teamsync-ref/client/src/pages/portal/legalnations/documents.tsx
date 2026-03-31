import { useState } from "react";
import {
  FileText, Download, Shield, CreditCard, Building2,
  User, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ds/status-badge";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/animated";
import { portalDocuments, portalCompanies } from "@/lib/mock-data-portal-legalnations";

const categoryConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  formation: { label: "Formation", icon: Building2, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  tax: { label: "Tax", icon: CreditCard, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  compliance: { label: "Compliance", icon: Shield, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  identity: { label: "Identity", icon: User, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  banking: { label: "Banking", icon: CreditCard, color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
};

const statusVariant: Record<string, "success" | "warning" | "error"> = {
  verified: "success",
  "pending-review": "warning",
  "action-required": "error",
};

const statusLabel: Record<string, string> = {
  verified: "Verified",
  "pending-review": "Pending Review",
  "action-required": "Action Required",
};

export default function PortalDocuments() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = portalDocuments.filter(d => {
    if (companyFilter !== "all" && d.companyId !== companyFilter) return false;
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (search.trim() && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = new Map<string, typeof portalDocuments>();
  filtered.forEach(d => {
    if (!grouped.has(d.companyName)) grouped.set(d.companyName, []);
    grouped.get(d.companyName)!.push(d);
  });

  const verifiedCount = portalDocuments.filter(d => d.status === "verified").length;
  const pendingCount = portalDocuments.filter(d => d.status === "pending-review").length;
  const actionCount = portalDocuments.filter(d => d.status === "action-required").length;

  return (
    <PageTransition className="px-4 sm:px-8 py-6 lg:px-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">Access and download your formation documents and compliance files</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Verified</p>
            <StatusBadge status={String(verifiedCount)} variant="success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Pending Review</p>
            <StatusBadge status={String(pendingCount)} variant="warning" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Action Required</p>
            <StatusBadge status={String(actionCount)} variant="error" />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-docs" />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-48 h-9" data-testid="select-company-filter">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {portalCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-9" data-testid="select-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {Array.from(grouped.entries()).map(([companyName, docs]) => (
        <div key={companyName} className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{companyName}</h2>
          <div className="space-y-2">
            {docs.map(doc => {
              const cat = categoryConfig[doc.category];
              const CatIcon = cat.icon;
              return (
                <Card key={doc.id} className="flex items-center gap-4 p-4 hover:shadow-sm transition-shadow" data-testid={`doc-${doc.id}`}>
                  <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", cat.color)}>
                    <CatIcon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={statusLabel[doc.status]} variant={statusVariant[doc.status]} />
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">{cat.label}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" data-testid={`download-${doc.id}`}>
                    <Download className="size-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FileText className="size-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No documents found matching your filters</p>
        </div>
      )}
    </PageTransition>
  );
}
