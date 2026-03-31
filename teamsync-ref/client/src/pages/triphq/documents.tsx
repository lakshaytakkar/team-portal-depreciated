import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Plus, Trash2, Upload, Download, Image, File, Music, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRIPHQ_COLOR } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, StatGrid, StatCard, FilterPill } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const DOC_TYPES = ["all", "business-card", "receipt", "ticket", "product-photo", "voice-note", "agreement", "photo", "checklist-doc", "content-thumbnail", "deliverable", "other"];

function formatFileSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType?.startsWith("image/")) return Image;
  if (fileType?.startsWith("audio/")) return Music;
  return File;
}

export default function TripHQDocuments() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: docs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/documents/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] }); toast({ title: "Document removed" }); },
  });

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "other");
    fd.append("entity_type", "standalone");
    fd.append("entity_id", "");
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "File uploaded" });
  };

  const filtered = docs.filter((d: any) => {
    if (typeFilter !== "all" && d.docType !== typeFilter) return false;
    if (search && !d.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const images = docs.filter((d: any) => d.fileType?.startsWith("image/")).length;
  const audioFiles = docs.filter((d: any) => d.fileType?.startsWith("audio/")).length;
  const totalSize = docs.reduce((s: number, d: any) => s + (d.fileSize || 0), 0);

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}</div></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Documents Hub" subtitle={`${docs.length} files · ${formatFileSize(totalSize)}`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <label className="cursor-pointer">
            <input type="file" className="hidden" multiple onChange={(e) => { Array.from(e.target.files || []).forEach(handleUpload); }} data-testid="upload-standalone" />
            <Button asChild style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-upload"><span><Upload className="h-4 w-4 mr-2" />Upload File</span></Button>
          </label>
        </div>
      } />

      <StatGrid>
        <StatCard label="Total Files" value={docs.length} icon={FileText} iconBg="rgba(8,145,178,0.1)" iconColor={TRIPHQ_COLOR} />
        <StatCard label="Images" value={images} icon={Image} iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
        <StatCard label="Audio" value={audioFiles} icon={Music} iconBg="rgba(139,92,246,0.1)" iconColor="#8B5CF6" />
        <StatCard label="Total Size" value={formatFileSize(totalSize)} icon={Download} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
      </StatGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-xs" data-testid="input-search-docs" />
        </div>
        {DOC_TYPES.slice(0, 8).map((type) => (
          <FilterPill key={type} label={type === "all" ? "All" : type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} active={typeFilter === type} onClick={() => setTypeFilter(type)} count={type === "all" ? docs.length : docs.filter((d: any) => d.docType === type).length} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc: any) => {
          const isImage = doc.fileType?.startsWith("image/");
          const isAudio = doc.fileType?.startsWith("audio/");
          const FileIcon = getFileIcon(doc.fileType);
          return (
            <div key={doc.id} className="border rounded-xl overflow-hidden bg-card hover:shadow-sm transition-shadow" data-testid={`doc-${doc.id}`}>
              <div className="h-36 bg-muted flex items-center justify-center relative">
                {isImage ? (
                  <img src={doc.fileUrl} alt={doc.fileName} className="w-full h-full object-cover" />
                ) : isAudio ? (
                  <div className="flex flex-col items-center gap-2 p-4 w-full">
                    <Music className="h-8 w-8 text-muted-foreground/40" />
                    <audio controls className="w-full h-8" src={doc.fileUrl} data-testid={`audio-${doc.id}`} />
                  </div>
                ) : (
                  <FileIcon className="h-12 w-12 text-muted-foreground/30" />
                )}
                {isImage && (
                  <button onClick={() => setPreviewUrl(doc.fileUrl)} className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                    <Eye className="h-6 w-6 text-white" />
                  </button>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate">{doc.fileName}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{doc.docType?.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Other"}</Badge>
                      <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    {doc.city && <span className="text-xs text-muted-foreground block mt-1">{doc.city}</span>}
                    {doc.contactName && <span className="text-xs text-muted-foreground block">{doc.contactName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <a href={doc.fileUrl} download={doc.fileName} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-7 text-xs" data-testid={`download-${doc.id}`}><Download className="h-3 w-3 mr-1" />Download</Button>
                  </a>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={() => deleteMutation.mutate(doc.id)} data-testid={`delete-${doc.id}`}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)} data-testid="image-preview">
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-documents"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-documents"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
