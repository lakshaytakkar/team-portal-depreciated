import { useState, useMemo } from "react";
import {
  MessageSquare,
  Star,
  Bot,
  Copy,
  Check,
  Plus,
  Heart,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { FormDialog } from "@/components/ds/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { devPrompts, type DevPrompt } from "@/lib/mock-data-dev";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const categoryOptions = ["agent", "frontend", "backend", "database", "debug", "audit", "testing", "ux", "seo", "security", "performance", "devops"] as const;
const modelOptions = ["claude", "gpt", "replit-agent"] as const;
const scopeOptions = ["narrow", "broad"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  agent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  frontend: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  backend: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  database: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  debug: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  audit: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  testing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  ux: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  seo: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  security: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  performance: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  devops: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
};

const SCOPE_COLORS: Record<string, string> = {
  narrow: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  broad: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

const MODEL_COLORS: Record<string, string> = {
  claude: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  gpt: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "replit-agent": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

const modelLabel: Record<string, string> = {
  claude: "Claude",
  gpt: "GPT",
  "replit-agent": "Replit Agent",
};

export default function PromptsPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();

  const [prompts, setPrompts] = useState<DevPrompt[]>(devPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState<DevPrompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>("agent");
  const [newScope, setNewScope] = useState<string>("narrow");
  const [newModel, setNewModel] = useState<string>("claude");
  const [newTags, setNewTags] = useState("");

  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (modelFilter !== "all") {
      result = result.filter((p) => p.model === modelFilter);
    }

    if (scopeFilter !== "all") {
      result = result.filter((p) => p.scope === scopeFilter);
    }

    if (favoriteFilter === "favorites") {
      result = result.filter((p) => p.isFavorite);
    }

    return result;
  }, [prompts, searchQuery, categoryFilter, modelFilter, scopeFilter, favoriteFilter]);

  const totalPrompts = prompts.length;
  const totalFavorites = prompts.filter((p) => p.isFavorite).length;
  const narrowCount = prompts.filter((p) => p.scope === "narrow").length;
  const broadCount = prompts.filter((p) => p.scope === "broad").length;
  const uniqueCategories = Array.from(new Set(prompts.map((p) => p.category))).length;

  const handleCopy = async (prompt: DevPrompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      toast({ title: "Copied to clipboard", description: `"${prompt.title}" prompt copied.` });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const toggleFavorite = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleAddPrompt = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPrompt: DevPrompt = {
      id: `PRM-${String(prompts.length + 1).padStart(3, "0")}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory as DevPrompt["category"],
      scope: newScope as DevPrompt["scope"],
      model: newModel as DevPrompt["model"],
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      lastUsed: new Date().toISOString().split("T")[0],
      createdDate: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    setPrompts((prev) => [newPrompt, ...prev]);
    setDialogOpen(false);
    setNewTitle("");
    setNewContent("");
    setNewCategory("agent");
    setNewScope("narrow");
    setNewModel("claude");
    setNewTags("");
    toast({ title: "Prompt added", description: `"${newPrompt.title}" has been saved.` });
  };

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Prompts"
                value={totalPrompts}
                change={`${filteredPrompts.length} shown`}
                changeType="neutral"
                icon={<MessageSquare className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Favorites"
                value={totalFavorites}
                change={`${Math.round((totalFavorites / totalPrompts) * 100)}% of total`}
                changeType="positive"
                icon={<Star className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Narrow Focus"
                value={narrowCount}
                change={`${broadCount} broad prompts`}
                changeType="neutral"
                icon={<Bot className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Categories"
                value={uniqueCategories}
                change={`${filteredPrompts.length} matching filters`}
                changeType="neutral"
                icon={<Filter className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        <Fade direction="up" delay={0.15} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-72 pl-8"
                data-testid="input-prompts-search"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm" data-testid="filter-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm" data-testid="filter-model">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {modelOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {modelLabel[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm" data-testid="filter-scope">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  {scopeOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm" data-testid="filter-favorite">
                  <SelectValue placeholder="Favorites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prompts</SelectItem>
                  <SelectItem value="favorites">Favorites Only</SelectItem>
                </SelectContent>
              </Select>

              <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-add-prompt">
                <Plus className="mr-1.5 size-3.5" /> Add Prompt
              </Button>
            </div>
          </div>

          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16" data-testid="empty-state">
              <MessageSquare className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No prompts found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <Stagger staggerDelay={0.04}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map((prompt) => {
                  const isCopied = copiedId === prompt.id;
                  return (
                    <StaggerItem key={prompt.id}>
                      <Card
                        className="border bg-card hover:shadow-md transition-shadow cursor-pointer group h-full"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPrompt(prompt)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPrompt(prompt); } }}
                        data-testid={`card-prompt-${prompt.id}`}
                      >
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3
                              className="text-sm font-semibold leading-snug line-clamp-2 flex-1"
                              data-testid={`text-title-${prompt.id}`}
                            >
                              {prompt.title}
                            </h3>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                                aria-label={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                data-testid={`button-favorite-${prompt.id}`}
                              >
                                <Heart
                                  className={cn(
                                    "size-3.5",
                                    prompt.isFavorite
                                      ? "fill-red-500 text-red-500"
                                      : "text-muted-foreground"
                                  )}
                                />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                onClick={(e) => { e.stopPropagation(); void handleCopy(prompt); }}
                                aria-label="Copy prompt"
                                data-testid={`button-copy-${prompt.id}`}
                              >
                                {isCopied ? (
                                  <Check className="size-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3.5 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                            {prompt.content}
                          </p>

                          <div className="flex items-center flex-wrap gap-1.5 mb-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 border-0 ${CATEGORY_COLORS[prompt.category] || ""}`}
                            >
                              {prompt.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 border-0 ${SCOPE_COLORS[prompt.scope] || ""}`}
                            >
                              {prompt.scope}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 border-0 ${MODEL_COLORS[prompt.model] || ""}`}
                            >
                              {modelLabel[prompt.model]}
                            </Badge>
                          </div>

                          <div className="flex items-center flex-wrap gap-1 mb-3">
                            {prompt.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                                data-testid={`badge-tag-${tag}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {prompt.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{prompt.tags.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto pt-2 border-t">
                            <Clock className="size-3" />
                            <span>Last used {prompt.lastUsed}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  );
                })}
              </div>
            </Stagger>
          )}

          {filteredPrompts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4" data-testid="text-prompts-count">
              Showing {filteredPrompts.length} of {totalPrompts} prompts
            </p>
          )}
        </Fade>

        <Dialog open={!!selectedPrompt} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
          {selectedPrompt && (
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-base font-semibold leading-snug pr-2">
                    {selectedPrompt.title}
                  </DialogTitle>
                </div>
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 border-0 ${CATEGORY_COLORS[selectedPrompt.category] || ""}`}
                  >
                    {selectedPrompt.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 border-0 ${SCOPE_COLORS[selectedPrompt.scope] || ""}`}
                  >
                    {selectedPrompt.scope}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 border-0 ${MODEL_COLORS[selectedPrompt.model] || ""}`}
                  >
                    {modelLabel[selectedPrompt.model]}
                  </Badge>
                  {selectedPrompt.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DialogHeader>

              <div className="rounded-lg border bg-muted/30 p-4 mt-2">
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {selectedPrompt.content}
                </pre>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Created: {selectedPrompt.createdDate}</span>
                  <span>Last used: {selectedPrompt.lastUsed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(selectedPrompt.id)}
                    data-testid="button-detail-favorite"
                  >
                    <Heart
                      className={cn(
                        "size-4 mr-1.5",
                        selectedPrompt.isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      )}
                    />
                    {selectedPrompt.isFavorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(selectedPrompt)}
                    data-testid="button-detail-copy"
                  >
                    {copiedId === selectedPrompt.id ? (
                      <Check className="mr-1.5 size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="mr-1.5 size-3.5" />
                    )}
                    {copiedId === selectedPrompt.id ? "Copied" : "Copy Prompt"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add Prompt"
          onSubmit={handleAddPrompt}
          submitLabel="Save Prompt"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt-title">Title</Label>
            <Input
              id="prompt-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Full-stack page scaffold"
              data-testid="input-prompt-title"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt-content">Prompt Content</Label>
            <Textarea
              id="prompt-content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write the full prompt text here..."
              rows={6}
              data-testid="input-prompt-content"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger data-testid="select-prompt-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Scope</Label>
              <Select value={newScope} onValueChange={setNewScope}>
                <SelectTrigger data-testid="select-prompt-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Model</Label>
              <Select value={newModel} onValueChange={setNewModel}>
                <SelectTrigger data-testid="select-prompt-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {modelLabel[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt-tags">Tags (comma-separated)</Label>
            <Input
              id="prompt-tags"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. scaffold, page, pattern"
              data-testid="input-prompt-tags"
            />
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}
