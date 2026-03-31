import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Upload, FileText, Image, File, Trash2, Eye, Download,
  CheckCircle2, AlertCircle, Clock, FolderOpen, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ds/status-badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ClientDocument {
  id: string;
  client_id: string;
  document_name: string;
  document_type: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  direction: string | null;
  uploaded_at: string | null;
  status: string | null;
  category: string | null;
}

const CATEGORIES = [
  { value: "identity", label: "Identity Documents", icon: "🪪" },
  { value: "formation", label: "LLC Formation", icon: "🏢" },
  { value: "banking", label: "Banking", icon: "🏦" },
  { value: "tax_filing", label: "Tax Filing", icon: "📋" },
  { value: "compliance", label: "Compliance", icon: "✅" },
  { value: "other", label: "Other", icon: "📄" },
] as const;

const REQUIRED_DOCUMENTS: Record<string, { name: string; type: string }[]> = {
  identity: [
    { name: "PAN Card", type: "pan_card" },
    { name: "Aadhar Card", type: "aadhar_card" },
    { name: "Passport", type: "passport" },
    { name: "Driver's License", type: "drivers_license" },
  ],
  formation: [
    { name: "Articles of Organization", type: "articles_org" },
    { name: "Operating Agreement", type: "operating_agreement" },
    { name: "EIN Confirmation Letter", type: "ein_letter" },
    { name: "BOI Filing Receipt", type: "boi_filing" },
  ],
  banking: [
    { name: "Bank Statements", type: "bank_statements" },
    { name: "Account Opening Docs", type: "account_docs" },
  ],
  tax_filing: [
    { name: "Form 1120 (Filed)", type: "form_1120" },
    { name: "Form 5472 (Filed)", type: "form_5472" },
    { name: "IRS Correspondence", type: "irs_correspondence" },
    { name: "Tax Filing Receipt", type: "tax_receipt" },
  ],
  compliance: [
    { name: "Annual Report", type: "annual_report" },
    { name: "State Filing Receipt", type: "state_filing" },
    { name: "Registered Agent Docs", type: "registered_agent" },
  ],
};

const statusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  uploaded: "warning",
  verified: "success",
  rejected: "error",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string | null) {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return Image;
  if (["pdf", "doc", "docx"].includes(ext || "")) return FileText;
  return File;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface DocumentManagerProps {
  clientId: string;
  defaultCategory?: string;
  showCategoryFilter?: boolean;
  compact?: boolean;
}

export function DocumentManager({
  clientId,
  defaultCategory,
  showCategoryFilter = true,
  compact = false,
}: DocumentManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory || "all");
  const [uploadCategory, setUploadCategory] = useState<string>(defaultCategory || "identity");
  const [uploadDocType, setUploadDocType] = useState<string>("");
  const [uploadDocName, setUploadDocName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery<ClientDocument[]>({
    queryKey: ["/api/legalnations/clients", clientId, "documents", activeCategory],
    queryFn: async () => {
      const url = activeCategory === "all"
        ? `/api/legalnations/clients/${clientId}/documents`
        : `/api/legalnations/clients/${clientId}/documents?category=${activeCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);
      formData.append("document_name", uploadDocName || file.name);
      formData.append("document_type", uploadDocType || "other");

      const res = await fetch(`/api/legalnations/clients/${clientId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId, "documents"] });
      toast({ title: "Document uploaded", description: "File saved to Supabase Storage" });
      setUploadDocName("");
      setUploadDocType("");
      setUploading(false);
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await fetch(`/api/legalnations/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId, "documents"] });
      toast({ title: "Document deleted" });
    },
    onError: () => {
      toast({ title: "Delete failed", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ docId, status }: { docId: string; status: string }) => {
      const res = await fetch(`/api/legalnations/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/clients", clientId, "documents"] });
    },
  });

  const viewDocument = useCallback(async (docId: string) => {
    try {
      const res = await fetch(`/api/legalnations/documents/${docId}/url`);
      if (!res.ok) throw new Error("Failed to get URL");
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch {
      toast({ title: "Failed to open document", variant: "destructive" });
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
  }, [uploadMutation]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadMutation]);

  const groupedDocs = documents.reduce((acc: Record<string, ClientDocument[]>, doc) => {
    const cat = doc.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  const uploadedTypes = new Set(documents.map((d) => d.document_type));

  const currentRequiredDocs = activeCategory === "all"
    ? Object.entries(REQUIRED_DOCUMENTS).flatMap(([cat, docs]) =>
        docs.map((d) => ({ ...d, category: cat }))
      )
    : (REQUIRED_DOCUMENTS[activeCategory] || []).map((d) => ({ ...d, category: activeCategory }));

  const totalRequired = currentRequiredDocs.length;
  const totalUploaded = currentRequiredDocs.filter((d) => uploadedTypes.has(d.type)).length;

  return (
    <div className="space-y-4" data-testid="document-manager">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FolderOpen className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold text-base">Documents</h3>
            <p className="text-xs text-muted-foreground">
              {documents.length} file{documents.length !== 1 ? "s" : ""} uploaded
              {totalRequired > 0 && ` · ${totalUploaded}/${totalRequired} required docs`}
            </p>
          </div>
        </div>
        {showCategoryFilter && (
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="filter-doc-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!compact && currentRequiredDocs.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              Required Documents Checklist ({totalUploaded}/{totalRequired})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {currentRequiredDocs.map((reqDoc) => {
                const isUploaded = uploadedTypes.has(reqDoc.type);
                return (
                  <div
                    key={reqDoc.type}
                    className={`flex items-center gap-2 text-xs p-2 rounded-md ${
                      isUploaded ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"
                    }`}
                    data-testid={`req-doc-${reqDoc.type}`}
                  >
                    {isUploaded ? (
                      <CheckCircle2 className="size-3.5 text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate">{reqDoc.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs mb-1 block">Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-upload-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Document Type</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-upload-doctype">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">Other</SelectItem>
                  {(REQUIRED_DOCUMENTS[uploadCategory] || []).map((d) => (
                    <SelectItem key={d.type} value={d.type}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Document Name</Label>
              <Input
                value={uploadDocName}
                onChange={(e) => setUploadDocName(e.target.value)}
                placeholder="Optional name..."
                className="h-8 text-xs"
                data-testid="input-upload-docname"
              />
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.csv"
              onChange={handleFileSelect}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Images, Word, Excel — max 10 MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="size-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {(activeCategory === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.value === activeCategory)).map((cat) => {
                const catDocs = groupedDocs[cat.value];
                if (!catDocs || catDocs.length === 0) return null;
                return (
                  <div key={cat.value}>
                    <div className="px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{catDocs.length}</Badge>
                    </div>
                    {catDocs.map((doc) => {
                      const FileIcon = getFileIcon(doc.file_name);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                          data-testid={`doc-row-${doc.id}`}
                        >
                          <div className="size-8 rounded bg-muted flex items-center justify-center shrink-0">
                            <FileIcon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.file_name} · {formatFileSize(doc.file_size)} · {formatDate(doc.uploaded_at)}
                            </p>
                          </div>
                          <StatusBadge
                            status={doc.status || "uploaded"}
                            variant={statusVariant[doc.status || "uploaded"] || "neutral"}
                          />
                          <div className="flex items-center gap-1">
                            <Select
                              value={doc.status || "uploaded"}
                              onValueChange={(v) => statusMutation.mutate({ docId: doc.id, status: v })}
                            >
                              <SelectTrigger className="h-7 w-[100px] text-[10px]" data-testid={`status-select-${doc.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="uploaded">Uploaded</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => viewDocument(doc.id)}
                              data-testid={`btn-view-${doc.id}`}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Delete this document permanently?")) {
                                  deleteMutation.mutate(doc.id);
                                }
                              }}
                              data-testid={`btn-delete-${doc.id}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
