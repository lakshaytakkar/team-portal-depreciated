import { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  Sparkles,
  Shield,
  FileText,
  Code2,
  Paintbrush,
  MessageCircle,
  TestTube,
  Cog,
  Database,
  CheckCircle2,
  Circle,
  Filter,
} from "lucide-react";
import { StatsCard } from "@/components/ds/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { claudeSkills, type ClaudeSkill } from "@/lib/mock-data-dev";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  development: Code2,
  testing: TestTube,
  security: Shield,
  document: FileText,
  design: Paintbrush,
  communication: MessageCircle,
  automation: Cog,
  data: Database,
};

const CATEGORY_COLORS: Record<string, string> = {
  development: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  testing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  security: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  document: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  design: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  communication: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  automation: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  data: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

const RELEVANCE_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const SOURCE_COLORS: Record<string, string> = {
  official: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  community: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

const categoryOptions = ["development", "testing", "security", "document", "design", "communication", "automation", "data"] as const;

export default function SkillsPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();

  const [skills] = useState<ClaudeSkill[]>(claudeSkills);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [relevanceFilter, setRelevanceFilter] = useState("all");
  const [installedFilter, setInstalledFilter] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState<ClaudeSkill | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSkills = useMemo(() => {
    let result = [...skills];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.useCase.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.author.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((s) => s.category === categoryFilter);
    }

    if (sourceFilter !== "all") {
      result = result.filter((s) => s.source === sourceFilter);
    }

    if (relevanceFilter !== "all") {
      result = result.filter((s) => s.relevance === relevanceFilter);
    }

    if (installedFilter === "installed") {
      result = result.filter((s) => s.isInstalled);
    } else if (installedFilter === "not-installed") {
      result = result.filter((s) => !s.isInstalled);
    }

    return result;
  }, [skills, searchQuery, categoryFilter, sourceFilter, relevanceFilter, installedFilter]);

  const totalSkills = skills.length;
  const installedCount = skills.filter((s) => s.isInstalled).length;
  const officialCount = skills.filter((s) => s.source === "official").length;
  const communityCount = skills.filter((s) => s.source === "community").length;
  const criticalCount = skills.filter((s) => s.relevance === "critical").length;

  const handleCopyInstall = async (skill: ClaudeSkill) => {
    const text = skill.installCmd || `git clone ${skill.repoUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(skill.id);
      toast({ title: "Copied to clipboard", description: `Install command for "${skill.name}" copied.` });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          <Fade direction="down">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                  Claude Skills Reference
                </h1>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-subtitle">
                  Curated skills library — official Anthropic + community skills for developer workflows
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://github.com/travisvn/awesome-claude-skills", "_blank")}
                data-testid="link-awesome-list"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Awesome List
              </Button>
            </div>
          </Fade>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Fade direction="up">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard title="Total Skills" value={totalSkills} icon={<Sparkles className="h-5 w-5" />} data-testid="stat-total" />
                <StatsCard title="Installed" value={installedCount} icon={<CheckCircle2 className="h-5 w-5" />} data-testid="stat-installed" />
                <StatsCard title="Official" value={officialCount} icon={<Shield className="h-5 w-5" />} data-testid="stat-official" />
                <StatsCard title="Community" value={communityCount} icon={<Code2 className="h-5 w-5" />} data-testid="stat-community" />
                <StatsCard title="Critical" value={criticalCount} icon={<Sparkles className="h-5 w-5" />} data-testid="stat-critical" />
              </div>
            </Fade>
          )}

          <Fade direction="up">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills, tags, authors..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-category">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-source">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>

              <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-relevance">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={installedFilter} onValueChange={setInstalledFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-installed">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                  <SelectItem value="not-installed">Not Installed</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-auto" data-testid="text-result-count">
                {filteredSkills.length} of {totalSkills} skills
              </span>
            </div>
          </Fade>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Stagger staggerDelay={0.04}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => {
                  const CatIcon = CATEGORY_ICONS[skill.category] || Code2;
                  return (
                    <StaggerItem key={skill.id}>
                      <Card
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md border",
                          skill.isInstalled && "border-emerald-300 dark:border-emerald-800"
                        )}
                        onClick={() => setSelectedSkill(skill)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedSkill(skill); }}
                        data-testid={`card-skill-${skill.id}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={cn("p-1.5 rounded-md", CATEGORY_COLORS[skill.category])}>
                                <CatIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm text-foreground truncate" data-testid={`text-skill-name-${skill.id}`}>
                                  {skill.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">{skill.author}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {skill.isInstalled ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/40" />
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {skill.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", SOURCE_COLORS[skill.source])}>
                              {skill.source}
                            </Badge>
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", RELEVANCE_COLORS[skill.relevance])}>
                              {skill.relevance}
                            </Badge>
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", CATEGORY_COLORS[skill.category])}>
                              {skill.category}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {skill.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  );
                })}
              </div>
            </Stagger>
          )}

          {!loading && filteredSkills.length === 0 && (
            <Fade direction="up">
              <div className="text-center py-16 text-muted-foreground" data-testid="text-empty-state">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No skills match your filters.</p>
                <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
              </div>
            </Fade>
          )}

          <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
            <DialogContent className="max-w-lg">
              {selectedSkill && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", CATEGORY_COLORS[selectedSkill.category])}>
                        {(() => {
                          const Icon = CATEGORY_ICONS[selectedSkill.category] || Code2;
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <DialogTitle className="text-lg" data-testid="text-detail-name">
                          {selectedSkill.name}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {selectedSkill.author} · {selectedSkill.source === "official" ? "Official Anthropic Skill" : "Community Skill"}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 mt-2">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</h4>
                      <p className="text-sm text-foreground leading-relaxed" data-testid="text-detail-description">
                        {selectedSkill.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Use Case for TeamSync</h4>
                      <p className="text-sm text-foreground leading-relaxed" data-testid="text-detail-usecase">
                        {selectedSkill.useCase}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className={cn("text-xs", SOURCE_COLORS[selectedSkill.source])}>
                        {selectedSkill.source}
                      </Badge>
                      <Badge variant="secondary" className={cn("text-xs", RELEVANCE_COLORS[selectedSkill.relevance])}>
                        {selectedSkill.relevance} relevance
                      </Badge>
                      <Badge variant="secondary" className={cn("text-xs", selectedSkill.isInstalled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                        {selectedSkill.isInstalled ? "Installed" : "Not Installed"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSkill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCopyInstall(selectedSkill)}
                        data-testid="button-copy-install"
                      >
                        {copiedId === selectedSkill.id ? (
                          <Check className="h-4 w-4 mr-1.5" />
                        ) : (
                          <Terminal className="h-4 w-4 mr-1.5" />
                        )}
                        {copiedId === selectedSkill.id ? "Copied!" : "Copy Install Cmd"}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(selectedSkill.repoUrl, "_blank")}
                        data-testid="button-open-repo"
                      >
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        View Repository
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </PageShell>
  );
}