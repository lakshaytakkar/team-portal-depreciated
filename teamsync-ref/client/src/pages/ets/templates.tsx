import { useState, useMemo } from "react";
import { MessageSquare, Copy, Filter, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { FormDialog } from "@/components/ds/form-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  type EtsWhatsAppTemplate,
} from "@/lib/mock-data-ets";
import dashboardIcon from "/3d-icons/documents.webp";
import { PageShell } from "@/components/layout";

type TemplateCategory = EtsWhatsAppTemplate["category"];

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  welcome: "Welcome",
  "follow-up": "Follow-up",
  proposal: "Proposal",
  update: "Update",
};

const categoryBadgeStyles: Record<TemplateCategory, string> = {
  welcome: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0",
  "follow-up": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0",
  proposal: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0",
  update: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-0",
};

function highlightVariables(text: string) {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, idx) => {
    if (/^\{[^}]+\}$/.test(part)) {
      return (
        <span key={idx} className="bg-primary/15 text-primary font-medium rounded px-1">
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function EtsTemplates() {
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();

  const { data: templatesData, isLoading } = useQuery<{ templates: any[] }>({
    queryKey: ['/api/ets/templates'],
  });

  const templates = templatesData?.templates || [];

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateCategory>("follow-up");
  const [newContent, setNewContent] = useState("");

  const filtered = useMemo(() => {
    return templates.filter((t: any) => {
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [templates, filterCategory, searchQuery]);

  const handleCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(content).then(() => {
      showSuccess("Copied to clipboard", `"${title}" template copied`);
    });
  };

  const handleAddTemplate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const variables: string[] = [];
    const varRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = varRegex.exec(newContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    setNewTitle("");
    setNewContent("");
    setNewCategory("follow-up");
    setAddDialogOpen(false);
    showSuccess("Template added", `"${newTitle.trim()}" created successfully`);
  };

  if (isLoading) {
    return (
      <PageShell>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
<Fade direction="up" distance={8} duration={0.3}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-templates"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-category">
              <Filter className="size-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="update">Update</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setAddDialogOpen(true)} data-testid="button-add-template">
            <Plus className="size-4" />
            Add Template
          </Button>
        </div>
      </Fade>

      <Stagger staggerInterval={0.04} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template: any) => {
          const isExpanded = expandedId === template.id;
          return (
            <StaggerItem key={template.id}>
              <Card
                className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setExpandedId(isExpanded ? null : template.id)}
                data-testid={`card-template-${template.id}`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className={`text-xs ${categoryBadgeStyles[template.category as TemplateCategory] || ""}`}>
                        {CATEGORY_LABELS[template.category as TemplateCategory] || template.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-heading" data-testid={`text-template-title-${template.id}`}>
                      {template.title}
                    </CardTitle>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(template.content, template.title);
                    }}
                    data-testid={`button-copy-template-${template.id}`}
                  >
                    <Copy className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isExpanded ? (
                    <div className="text-sm whitespace-pre-wrap leading-relaxed" data-testid={`text-template-content-${template.id}`}>
                      {highlightVariables(template.content)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-template-preview-${template.id}`}>
                      {template.content.replace(/[*_~]/g, "").substring(0, 120)}...
                    </p>
                  )}
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                      {template.variables.map((v: string) => (
                        <Badge key={v} variant="outline" className="text-xs">
                          {`{${v}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No templates found matching your criteria</p>
        </div>
      )}

      <FormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add WhatsApp Template"
        onSubmit={handleAddTemplate}
        submitLabel="Add Template"
      >
        <div className="space-y-2">
          <Label htmlFor="template-title">Title</Label>
          <Input
            id="template-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Follow-up After Meeting"
            data-testid="input-template-title"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TemplateCategory)}>
            <SelectTrigger data-testid="select-template-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="update">Update</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-content">Content</Label>
          <Textarea
            id="template-content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Type your template... Use {variableName} for dynamic placeholders"
            className="min-h-[160px]"
            data-testid="input-template-content"
          />
          <p className="text-xs text-muted-foreground">
            Use {"{variableName}"} syntax for dynamic placeholders
          </p>
        </div>
      </FormDialog>
    </PageShell>
  );
}
