import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  LayoutGrid, 
  List, 
  Plus, 
  ExternalLink, 
  Download,
  Star, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileCode,
  File,
  Copy,
  Check,
  ClipboardList,
  Shield,
  Lightbulb,
  Workflow,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade } from "@/components/ui/animated";
import { 
  PageHeader, 
  PageShell,
  IndexToolbar,
  FilterPill,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { sharedResources, type SharedResource } from "@/lib/mock-data-shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ResourcePreviewModal } from "@/components/resources/resource-preview-modal";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  url: z.string().optional(),
  tags: z.string().optional(),
  isPinned: z.boolean().default(false),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

const getFileIcon = (type: string, category?: string) => {
  if (type === "knowledge") {
    switch (category) {
      case "Process": return ClipboardList;
      case "SOP": return Shield;
      case "Playbook": return FileText;
      case "Workflow": return Workflow;
      case "Learning": return Lightbulb;
      default: return FileText;
    }
  }
  switch (type.toLowerCase()) {
    case "pdf": return FileText;
    case "excel": return FileSpreadsheet;
    case "ppt": return Presentation;
    case "doc": return FileText;
    case "link": return LinkIcon;
    case "image": return ImageIcon;
    case "template": return FileCode;
    default: return File;
  }
};

const getIconColors = (type: string, category?: string) => {
  if (type === "knowledge") {
    switch (category) {
      case "Process": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "SOP": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Playbook": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case "Workflow": return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "Learning": return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400";
      default: return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    }
  }
  switch (type.toLowerCase()) {
    case "pdf": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "excel": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    case "ppt": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
    case "doc": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case "link": return "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400";
    case "image": return "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400";
    case "template": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    default: return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
  }

};

const isKnowledgeType = (type: string) => type === "knowledge";

export default function UniversalResources() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(600);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedResource, setSelectedResource] = useState<SharedResource | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const verticalResources = useMemo(() => {
    if (!vertical) return [];
    return sharedResources.filter(r => r.verticalId === vertical.id);
  }, [vertical]);

  const categories = useMemo(() => {
    const cats = new Set(verticalResources.map(r => r.category));
    return ["All", ...Array.from(cats)];
  }, [verticalResources]);

  const filteredResources = useMemo(() => {
    return verticalResources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [verticalResources, searchQuery, categoryFilter]);

  const pinnedResources = useMemo(() => {
    return verticalResources.filter(r => r.isPinned);
  }, [verticalResources]);

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      type: "",
      url: "",
      tags: "",
      isPinned: false,
    },
  });

  const onAddSubmit = (values: ResourceFormValues) => {
    console.log("Adding resource:", values);
    toast({
      title: "Resource added",
      description: `${values.title} has been added to the library.`,
    });
    setAddOpen(false);
    form.reset();
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied",
      description: "Resource link has been copied to clipboard.",
    });
  };

  if (!vertical) return null;

  return (
    <PageShell className="overflow-y-auto h-full">
      <PageHeader
        title="Resources"
        subtitle="Manage and access shared assets and documents."
        actions={
          <Button 
            onClick={() => setAddOpen(true)} 
            className="gap-2 text-white"
            style={{ backgroundColor: vertical.color }}
            data-testid="btn-add-resource"
          >
            <Plus className="size-4" />
            Add Resource
          </Button>
        }
      />

      <IndexToolbar
        search={searchQuery}
        onSearch={setSearchQuery}
        color={vertical.color}
        placeholder="Search resources..."
        filters={categories.map(cat => ({ value: cat, label: cat }))}
        activeFilter={categoryFilter}
        onFilter={setCategoryFilter}
        extra={
          <div className="flex items-center bg-muted p-1 rounded-lg border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className={cn("size-8", viewMode === "grid" && "bg-card shadow-sm")}
              onClick={() => setViewMode("grid")}
              data-testid="btn-grid-view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className={cn("size-8", viewMode === "list" && "bg-card shadow-sm")}
              onClick={() => setViewMode("list")}
              data-testid="btn-list-view"
            >
              <List className="size-4" />
            </Button>
          </div>
        }
      />

      {pinnedResources.length > 0 && categoryFilter === "All" && !searchQuery && (
        <Fade className="bg-muted/50 rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="size-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Pinned Resources</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {pinnedResources.map(res => {
              const Icon = getFileIcon(res.type, res.category);
              return (
                <div 
                  key={res.id}
                  className="flex items-center gap-3 bg-card p-3 rounded-lg border shadow-sm hover-elevate cursor-pointer group min-w-[200px]"
                  onClick={() => {
                    if (isKnowledgeType(res.type)) {
                      toggleExpand(res.id);
                    } else {
                      setSelectedResource(res);
                      setPreviewOpen(true);
                    }
                  }}
                >
                  <div className={cn("p-2 rounded-lg", getIconColors(res.type, res.category))}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{res.title}</div>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-xs text-primary font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(res.url, '_blank');
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Fade>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse h-48 bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.filter(r => !isKnowledgeType(r.type)).map(res => {
                const Icon = getFileIcon(res.type, res.category);
                return (
                  <Card 
                    key={res.id} 
                    className="hover-elevate transition-all cursor-pointer group overflow-hidden rounded-xl border bg-card p-5"
                    onClick={() => {
                      setSelectedResource(res);
                      setPreviewOpen(true);
                    }}
                    data-testid={`card-resource-${res.id}`}
                  >
                    {res.isPinned && (
                      <div className="absolute top-3 right-3">
                        <Star className="size-4 text-amber-500 fill-amber-500" />
                      </div>
                    )}
                    <div className={cn("size-12 rounded-lg flex items-center justify-center mb-4", getIconColors(res.type, res.category))}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-sm font-semibold mb-1 truncate pr-6">{res.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {res.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {res.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] font-medium px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {res.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{res.tags.length - 3} more</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium">{res.addedBy}</span>
                        <span className="text-[11px] text-muted-foreground">{res.addedDate}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 no-default-hover-elevate"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(res.url, '_blank');
                        }}
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <DataTableContainer>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <DataTH>Name</DataTH>
                    <DataTH>Category</DataTH>
                    <DataTH>Type</DataTH>
                    <DataTH>Added By</DataTH>
                    <DataTH>Date</DataTH>
                    <DataTH align="right"></DataTH>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredResources.filter(r => !isKnowledgeType(r.type)).map(r => {
                    const Icon = getFileIcon(r.type, r.category);
                    return (
                      <DataTR key={r.id} onClick={() => {
                        setSelectedResource(r);
                        setPreviewOpen(true);
                      }}>
                        <DataTD>
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", getIconColors(r.type, r.category))}>
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <div className="font-medium">{r.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
                            </div>
                          </div>
                        </DataTD>
                        <DataTD>{r.category}</DataTD>
                        <DataTD>
                          <Badge variant="outline" className="capitalize text-[10px] font-medium">
                            {r.type}
                          </Badge>
                        </DataTD>
                        <DataTD>{r.addedBy}</DataTD>
                        <DataTD>{r.addedDate}</DataTD>
                        <DataTD align="right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </DataTD>
                      </DataTR>
                    );
                  })}
                </tbody>
              </table>
            </DataTableContainer>
          )}

          {(() => {
            const knowledgeItems = filteredResources.filter(r => isKnowledgeType(r.type));
            if (knowledgeItems.length === 0) return null;
            const knowledgeCategories = Array.from(new Set(knowledgeItems.map(r => r.category)));
            return (
              <div className="flex flex-col gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2">Processes, SOPs & Knowledge</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {knowledgeCategories.map(cat => {
                  const catItems = knowledgeItems.filter(r => r.category === cat);
                  const CatIcon = getFileIcon("knowledge", cat);
                  return (
                    <div key={cat} data-testid={`section-knowledge-${cat}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("flex size-7 items-center justify-center rounded-md", getIconColors("knowledge", cat))}>
                          <CatIcon className="size-4" />
                        </div>
                        <h2 className="text-base font-semibold font-heading">{cat}</h2>
                        <Badge variant="secondary" className="text-xs">{catItems.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {catItems.map(resource => {
                          const isExpanded = expandedIds.has(resource.id);
                          return (
                            <div
                              key={resource.id}
                              className="rounded-lg border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                              data-testid={`card-knowledge-${resource.id}`}
                            >
                              <button
                                className="flex w-full items-start gap-3 p-4 text-left"
                                onClick={() => toggleExpand(resource.id)}
                                data-testid={`button-expand-${resource.id}`}
                              >
                                <div className="mt-0.5 shrink-0 text-muted-foreground">
                                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-semibold">{resource.title}</h3>
                                    {resource.isPinned && <Star className="size-3 text-amber-500 fill-amber-500" />}
                                    <Badge variant="outline" className="text-[10px]">{resource.category}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="text-[11px] text-muted-foreground">{resource.addedBy} · {resource.addedDate}</span>
                                    {resource.tags.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {resource.tags.map(tag => (
                                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                              {isExpanded && resource.content && (
                                <div className="border-t px-4 py-4 pl-11" data-testid={`content-knowledge-${resource.id}`}>
                                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                                    {resource.content}
                                  </pre>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {filteredResources.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                <File className="size-6" />
              </div>
              <h3 className="font-semibold">No resources found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </>
      )}

      {/* Resource Preview Modal */}
      <ResourcePreviewModal
        resource={selectedResource}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onNext={() => {
          const idx = filteredResources.findIndex(r => r.id === selectedResource?.id);
          if (idx >= 0 && idx < filteredResources.length - 1) {
            setSelectedResource(filteredResources[idx + 1]);
          }
        }}
        onPrev={() => {
          const idx = filteredResources.findIndex(r => r.id === selectedResource?.id);
          if (idx > 0) {
            setSelectedResource(filteredResources[idx - 1]);
          }
        }}
        hasNext={(() => {
          const idx = filteredResources.findIndex(r => r.id === selectedResource?.id);
          return idx >= 0 && idx < filteredResources.length - 1;
        })()}
        hasPrev={(() => {
          const idx = filteredResources.findIndex(r => r.id === selectedResource?.id);
          return idx > 0;
        })()}
      />

      {/* Add Resource Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>Create a new shared resource for the team.</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter resource title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What is this resource about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Document">Document</SelectItem>
                          <SelectItem value="Template">Template</SelectItem>
                          <SelectItem value="Brochure">Brochure</SelectItem>
                          <SelectItem value="Spreadsheet">Spreadsheet</SelectItem>
                          <SelectItem value="Script">Script</SelectItem>
                          <SelectItem value="Link">Link</SelectItem>
                          <SelectItem value="Presentation">Presentation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">Word Doc</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="ppt">PowerPoint</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="policy, onboarding, help" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPinned"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Pin to top</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Make this resource easier to find for everyone.
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" style={{ backgroundColor: vertical.color }}>
                  Create Resource
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
