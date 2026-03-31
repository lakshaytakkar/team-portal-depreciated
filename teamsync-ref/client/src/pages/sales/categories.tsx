import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { categories as initialCategories, subcategories as initialSubcategories } from "@/lib/mock-data-sales";
import type { Category, Subcategory } from "@/lib/mock-data-sales";
import { SALES_COLOR } from "@/lib/sales-config";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import {
  Cpu, Sparkles, Dumbbell, Home, Watch, Camera, Heart, Shirt, PawPrint, Plane, Package,
  Plus, Pencil, Trash2, TrendingUp, X, Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const iconMap: Record<string, LucideIcon> = {
  Cpu, Sparkles, Dumbbell, Home, Watch, Camera, Heart, Shirt, PawPrint, Plane,
};

const iconOptions = ["Cpu", "Sparkles", "Dumbbell", "Home", "Watch", "Camera", "Heart", "Shirt", "PawPrint", "Plane"];

export default function CategoriesPage() {
  const loading = useSimulatedLoading();
  const [cats, setCats] = useState<Category[]>(initialCategories);
  const [subs, setSubs] = useState<Subcategory[]>(initialSubcategories);
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCategories[0]?.id ?? "");

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", icon: "Cpu" });

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [subForm, setSubForm] = useState({ name: "", keywordsStr: "" });

  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "subcategory"; id: string } | null>(null);

  const selectedCat = cats.find((c) => c.id === selectedCatId);
  const filteredSubs = subs.filter((s) => s.categoryId === selectedCatId);

  function openAddCategory() {
    setEditingCat(null);
    setCatForm({ name: "", slug: "", icon: "Cpu" });
    setCatDialogOpen(true);
  }

  function openEditCategory(cat: Category) {
    setEditingCat(cat);
    setCatForm({ name: cat.name, slug: cat.slug, icon: cat.icon });
    setCatDialogOpen(true);
  }

  function saveCategory() {
    if (!catForm.name.trim()) return;
    if (editingCat) {
      setCats((prev) =>
        prev.map((c) =>
          c.id === editingCat.id
            ? { ...c, name: catForm.name, slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, "-"), icon: catForm.icon }
            : c
        )
      );
    } else {
      const newCat: Category = {
        id: `CAT-${String(cats.length + 1).padStart(3, "0")}`,
        name: catForm.name,
        slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, "-"),
        productCount: 0,
        status: "active",
        icon: catForm.icon,
      };
      setCats((prev) => [...prev, newCat]);
      setSelectedCatId(newCat.id);
    }
    setCatDialogOpen(false);
  }

  function toggleTrending(catId: string) {
    setCats((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, trending: !c.trending } : c))
    );
  }

  function openAddSubcategory() {
    setEditingSub(null);
    setSubForm({ name: "", keywordsStr: "" });
    setSubDialogOpen(true);
  }

  function openEditSubcategory(sub: Subcategory) {
    setEditingSub(sub);
    setSubForm({ name: sub.name, keywordsStr: sub.keywords.join(", ") });
    setSubDialogOpen(true);
  }

  function saveSubcategory() {
    if (!subForm.name.trim()) return;
    const keywords = subForm.keywordsStr
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (editingSub) {
      setSubs((prev) =>
        prev.map((s) =>
          s.id === editingSub.id ? { ...s, name: subForm.name, keywords } : s
        )
      );
    } else {
      const newSub: Subcategory = {
        id: `SUB-${String(subs.length + 1).padStart(3, "0")}`,
        name: subForm.name,
        categoryId: selectedCatId,
        keywords,
        productCount: 0,
      };
      setSubs((prev) => [...prev, newSub]);
    }
    setSubDialogOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") {
      setCats((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSubs((prev) => prev.filter((s) => s.categoryId !== deleteTarget.id));
      if (selectedCatId === deleteTarget.id) {
        const remaining = cats.filter((c) => c.id !== deleteTarget.id);
        setSelectedCatId(remaining[0]?.id ?? "");
      }
    } else {
      setSubs((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <PageShell>
        <PageTransition>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </PageTransition>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories and subcategories"
        actions={
          <Button onClick={openAddCategory} data-testid="button-add-category">
            <Plus className="size-4 mr-1.5" />
            Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" data-testid="section-category-panels">
        <div className="lg:col-span-4 space-y-2" data-testid="panel-categories">
          {cats.map((cat) => {
            const Icon = iconMap[cat.icon] || Package;
            const isSelected = cat.id === selectedCatId;
            return (
              <Card
                key={cat.id}
                className={`p-4 cursor-pointer transition-colors ${isSelected ? "ring-2" : ""}`}
                style={isSelected ? { borderColor: SALES_COLOR, ["--tw-ring-color" as string]: SALES_COLOR } : undefined}
                onClick={() => setSelectedCatId(cat.id)}
                data-testid={`card-category-${cat.id}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${SALES_COLOR}15`, color: SALES_COLOR }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate">{cat.name}</span>
                        {cat.trending && (
                          <Badge variant="secondary" className="text-xs gap-1" data-testid={`badge-trending-${cat.id}`}>
                            <TrendingUp className="size-3" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); toggleTrending(cat.id); }}
                      data-testid={`button-toggle-trending-${cat.id}`}
                    >
                      <TrendingUp className={`size-4 ${cat.trending ? "text-amber-500" : ""}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                      data-testid={`button-edit-category-${cat.id}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "category", id: cat.id }); }}
                      data-testid={`button-delete-category-${cat.id}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-8" data-testid="panel-subcategories">
          <Card className="p-0 overflow-visible">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4 flex-wrap">
              <div>
                <h3 className="text-base font-semibold" data-testid="text-subcategory-heading">
                  {selectedCat ? `${selectedCat.name} Subcategories` : "Select a Category"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredSubs.length} {filteredSubs.length === 1 ? "subcategory" : "subcategories"}
                </p>
              </div>
              {selectedCat && (
                <Button size="sm" onClick={openAddSubcategory} data-testid="button-add-subcategory">
                  <Plus className="size-4 mr-1" />
                  Add Subcategory
                </Button>
              )}
            </div>

            {filteredSubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground" data-testid="text-empty-subcategories">
                <Tag className="size-10 mb-3 opacity-40" />
                <p className="text-sm">No subcategories yet</p>
                {selectedCat && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={openAddSubcategory} data-testid="button-add-subcategory-empty">
                    <Plus className="size-4 mr-1" />
                    Add first subcategory
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredSubs.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover-elevate"
                    data-testid={`row-subcategory-${sub.id}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{sub.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {sub.keywords.map((kw) => (
                          <Badge key={kw} variant="outline" className="text-xs" data-testid={`badge-keyword-${kw}`}>
                            {kw}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sub.productCount} {sub.productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditSubcategory(sub)}
                        data-testid={`button-edit-subcategory-${sub.id}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget({ type: "subcategory", id: sub.id })}
                        data-testid={`button-delete-subcategory-${sub.id}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent data-testid="dialog-category">
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="Category name"
                data-testid="input-category-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder="category-slug"
                data-testid="input-category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {iconOptions.map((iconName) => {
                  const Ic = iconMap[iconName];
                  return (
                    <Button
                      key={iconName}
                      size="icon"
                      variant={catForm.icon === iconName ? "default" : "outline"}
                      onClick={() => setCatForm({ ...catForm, icon: iconName })}
                      data-testid={`button-icon-${iconName}`}
                    >
                      <Ic className="size-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)} data-testid="button-cancel-category">
              Cancel
            </Button>
            <Button onClick={saveCategory} data-testid="button-save-category">
              {editingCat ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent data-testid="dialog-subcategory">
          <DialogHeader>
            <DialogTitle>{editingSub ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                placeholder="Subcategory name"
                data-testid="input-subcategory-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords (comma-separated)</Label>
              <Input
                value={subForm.keywordsStr}
                onChange={(e) => setSubForm({ ...subForm, keywordsStr: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                data-testid="input-subcategory-keywords"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialogOpen(false)} data-testid="button-cancel-subcategory">
              Cancel
            </Button>
            <Button onClick={saveSubcategory} data-testid="button-save-subcategory">
              {editingSub ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "category"
                ? "This will permanently delete this category and all its subcategories. This action cannot be undone."
                : "This will permanently delete this subcategory. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
