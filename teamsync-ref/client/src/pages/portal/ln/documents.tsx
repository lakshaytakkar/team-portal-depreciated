import { useState, useRef, useCallback } from "react";
import {
  FileText, Download, Upload, Search, Building2, CreditCard,
  Shield, User, Filter, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LN_DOCUMENTS, CLIENT_PROFILE, type LnDocument } from "@/lib/mock-data-dashboard-ln";

const CATEGORIES = [
  { id: "all", label: "All", icon: FileText },
  { id: "formation", label: "Formation", icon: Building2 },
  { id: "tax", label: "Tax", icon: CreditCard },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "identity", label: "Identity", icon: User },
  { id: "banking", label: "Banking", icon: CreditCard },
];

const categoryColors: Record<string, string> = {
  formation: "bg-blue-100 text-blue-600",
  tax: "bg-green-100 text-green-600",
  compliance: "bg-purple-100 text-purple-600",
  identity: "bg-amber-100 text-amber-600",
  banking: "bg-teal-100 text-teal-600",
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  verified: { label: "Verified", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "pending-review": { label: "Pending Review", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  "action-required": { label: "Action Required", icon: AlertTriangle, cls: "bg-red-50 text-red-700 border-red-200" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LnDocuments() {
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      toast({ title: "Document Uploaded", description: `${files[0].name} has been submitted for review.` });
    }
  }, [toast]);

  const filtered = LN_DOCUMENTS.filter(d => {
    if (category !== "all" && d.category !== category) return false;
    if (companyFilter !== "all" && d.companyId !== companyFilter) return false;
    if (search.trim() && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const actionRequired = filtered.filter(d => d.status === "action-required");
  const rest = filtered.filter(d => d.status !== "action-required");
  const sorted = [...actionRequired, ...rest];

  const verifiedCount = LN_DOCUMENTS.filter(d => d.status === "verified").length;
  const pendingCount = LN_DOCUMENTS.filter(d => d.status === "pending-review").length;
  const actionCount = LN_DOCUMENTS.filter(d => d.status === "action-required").length;

  function handleUpload() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({ title: "Document Uploaded", description: `${files[0].name} has been submitted for review.` });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="p-6 space-y-6" data-testid="ln-documents-page">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.jpg,.png" data-testid="input-file-upload" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Document Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and access all your formation documents</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleUpload} data-testid="button-upload-doc">
          <Upload className="size-4" /> Upload Document
        </Button>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUpload}
        data-testid="dropzone-upload"
      >
        <Upload className={cn("size-8 mx-auto mb-2", isDragging ? "text-blue-500" : "text-muted-foreground")} />
        <p className="text-sm font-medium">{isDragging ? "Drop files here" : "Drag & drop files here, or click to browse"}</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG, PNG up to 10 MB</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-t-2 border-t-emerald-500">
          <p className="text-xs font-medium text-muted-foreground mb-1">Verified</p>
          <p className="text-2xl font-bold text-emerald-700" data-testid="text-verified-count">{verifiedCount}</p>
        </Card>
        <Card className="p-4 border-t-2 border-t-amber-500">
          <p className="text-xs font-medium text-muted-foreground mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-amber-700" data-testid="text-pending-count">{pendingCount}</p>
        </Card>
        <Card className="p-4 border-t-2 border-t-red-500">
          <p className="text-xs font-medium text-muted-foreground mb-1">Action Required</p>
          <p className="text-2xl font-bold text-red-700" data-testid="text-action-count">{actionCount}</p>
        </Card>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="h-9" data-testid="tabs-category">
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs" data-testid={`tab-${cat.id}`}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
            {CLIENT_PROFILE.companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {sorted.map(doc => {
          const st = statusConfig[doc.status];
          const catColor = categoryColors[doc.category] || "bg-gray-100 text-gray-600";
          const catDef = CATEGORIES.find(c => c.id === doc.category);
          const CatIcon = catDef?.icon || FileText;
          return (
            <Card
              key={doc.id}
              className={cn(
                "flex items-center gap-4 p-4 hover:shadow-sm transition-shadow",
                doc.status === "action-required" && "border-red-200 bg-red-50/30"
              )}
              data-testid={`doc-row-${doc.id}`}
            >
              <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", catColor)}>
                <CatIcon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{doc.companyName}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{doc.size}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{fmt(doc.uploadedAt)}</span>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px] shrink-0", st.cls)} data-testid={`badge-status-${doc.id}`}>{st.label}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize shrink-0">{doc.category}</Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" data-testid={`download-${doc.id}`}>
                <Download className="size-4" />
              </Button>
            </Card>
          );
        })}

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <FileText className="size-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No documents found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
