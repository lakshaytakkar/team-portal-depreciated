import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Pencil, Trash2, Tag, ImageIcon } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DetailModal, InfoRow, PageShell } from "@/components/layout";
import { FAIRE_COLOR } from "@/lib/faire-config";
import { useToast } from "@/hooks/use-toast";
import { DualCurrency } from "@/lib/faire-currency";


type ProductLifecycleState = "PUBLISHED" | "DRAFT" | "UNPUBLISHED" | "DELETED";
type ProductSaleState = "FOR_SALE" | "SALES_PAUSED";

const lifecycleBadge: Record<ProductLifecycleState, { bg: string; color: string; label: string }> = {
  PUBLISHED: { bg: "#ECFDF5", color: "#059669", label: "Published" },
  DRAFT: { bg: "#EFF6FF", color: "#2563EB", label: "Draft" },
  UNPUBLISHED: { bg: "#F9FAFB", color: "#6B7280", label: "Unpublished" },
  DELETED: { bg: "#FEF2F2", color: "#DC2626", label: "Deleted" },
};

const saleBadge: Record<ProductSaleState, { bg: string; color: string; label: string }> = {
  FOR_SALE: { bg: "#ECFDF5", color: "#059669", label: "For Sale" },
  SALES_PAUSED: { bg: "#FFF7ED", color: "#EA580C", label: "Sales Paused" },
};

export default function FaireProductDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/faire/products/:id");
  const { toast } = useToast();

  const { data: productsData, isLoading } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products"],
    queryFn: async () => {
      const res = await fetch("/api/faire/products", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: storesData } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const products = productsData?.products ?? [];
  const stores = storesData?.stores ?? [];

  const product = products.find(p => p.id === params?.id) ?? products[0];
  const store = product ? stores.find(s => s.id === product._storeId) : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [editWholesale, setEditWholesale] = useState("");
  const [editRetail, setEditRetail] = useState("");
  const [editQty, setEditQty] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (isLoading || !product) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const selectedVariant = (product.variants ?? []).find((v: any) => v.id === selectedVariantId);
  const reviews = product.reviews ?? [];
  const category = product.taxonomy_type?.name ?? "Uncategorized";
  const lc = lifecycleBadge[product.lifecycle_state as ProductLifecycleState] ?? lifecycleBadge.DRAFT;
  const sl = saleBadge[product.sale_state as ProductSaleState] ?? saleBadge.FOR_SALE;
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null;

  return (
    <PageShell>
      <Fade>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/faire/products")} data-testid="btn-back">
              <ArrowLeft size={16} className="mr-1" /> Products
            </Button>
            <h1 className="text-2xl font-bold font-heading">{product.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: lc.bg, color: lc.color }}>{lc.label}</span>
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: sl.bg, color: sl.color }}>{sl.label}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} data-testid="btn-edit-product"><Pencil size={13} className="mr-1.5" /> Edit</Button>
            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => setDeleteOpen(true)} data-testid="btn-delete-product"><Trash2 size={13} className="mr-1.5" /> Delete</Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          <CardContent className="space-y-1 pt-5">
            <InfoRow label="Store" value={store?.name ?? "Unknown Store"} />
            <InfoRow label="Category" value={category} />
            <InfoRow label="Made In" value={product.made_in_country ?? "N/A"} />
            <InfoRow label="MOQ" value={product.minimum_order_quantity ?? 1} />
            <InfoRow label="Units/Case" value={product.units_per_case ?? 1} />
            {product.preorderable && <InfoRow label="Pre-orderable" value="Yes" />}
            {(product.tags ?? []).length > 0 && (
              <InfoRow label="Tags">
                <div className="flex flex-wrap gap-1">
                  {(product.tags ?? []).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag size={9} className="mr-1" /> {tag}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            )}
          </CardContent>
        </Card>
      </Fade>

      <Fade>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{product.description}</p></CardContent>
        </Card>
      </Fade>

      {(product.images ?? []).length > 0 && (
        <Fade>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm">Product Images</CardTitle>
              <span className="text-xs text-muted-foreground">{product.images.length} image{product.images.length !== 1 ? "s" : ""}</span>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="relative w-full overflow-hidden rounded-md border bg-muted/30" style={{ maxHeight: 400 }}>
                  <img
                    src={product.images[selectedImageIdx]?.url}
                    alt={product.name}
                    className="mx-auto object-contain"
                    style={{ maxHeight: 400 }}
                    data-testid="img-product-hero"
                  />
                  {(product.images[selectedImageIdx]?.tags ?? []).length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      {product.images[selectedImageIdx].tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {product.images
                      .sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0))
                      .map((img: any, idx: number) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${idx === selectedImageIdx ? "border-primary" : "border-transparent"}`}
                          data-testid={`btn-image-thumb-${idx}`}
                        >
                          <img src={img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Fade>
      )}

      {(product.images ?? []).length === 0 && (
        <Fade>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ImageIcon size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No product images available</p>
            </CardContent>
          </Card>
        </Fade>
      )}

      {avgRating !== null && (
        <Fade>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(avgRating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />)}
              <span className="text-sm font-semibold ml-1">{avgRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
          </div>
        </Fade>
      )}

      <Fade>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Variants</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Options</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Wholesale</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Retail</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Inventory</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">State</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(product.variants ?? []).map((variant: any) => {
                  const isLow = variant.available_quantity > 0 && variant.available_quantity < 5;
                  const isOut = variant.available_quantity === 0;
                  const vlc = lifecycleBadge[(variant.lifecycle_state as ProductLifecycleState)] ?? lifecycleBadge.DRAFT;
                  return (
                    <tr key={variant.id} className={`border-b ${isOut ? "bg-red-50/40 dark:bg-red-950/10" : isLow ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`} data-testid={`variant-row-${variant.id}`}>
                      <td className="p-3 text-xs">{variant.sku}</td>
                      <td className="p-3">
                        {(variant.options ?? []).map((o: any) => (
                          <Badge key={o.name} variant="outline" className="text-xs mr-1">{o.name}: {o.value}</Badge>
                        ))}
                      </td>
                      <td className="p-3 text-xs font-medium"><DualCurrency cents={variant.wholesale_price_cents} /></td>
                      <td className="p-3 text-xs"><DualCurrency cents={variant.retail_price_cents} /></td>
                      <td className="p-3">
                        <span className={`text-xs font-semibold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : ""}`}>{variant.available_quantity}</span>
                        {variant.backordered_until && <p className="text-xs text-muted-foreground">Until {new Date(variant.backordered_until).toLocaleDateString()}</p>}
                      </td>
                      <td className="p-3"><span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: vlc.bg, color: vlc.color }}>{vlc.label}</span></td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedVariantId(variant.id); setEditWholesale((variant.wholesale_price_cents / 100).toFixed(2)); setEditRetail((variant.retail_price_cents / 100).toFixed(2)); setPriceOpen(true); }} data-testid={`btn-edit-price-${variant.id}`}>Edit Price</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedVariantId(variant.id); setEditQty(String(variant.available_quantity)); setStockOpen(true); }} data-testid={`btn-update-stock-${variant.id}`}>Stock</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      {reviews.length > 0 && (
        <Fade>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Product Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="rounded-lg border p-3" data-testid={`review-${review.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold">{review.retailer_name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />)}
                      <span className="text-xs text-muted-foreground ml-1">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      )}

      <DetailModal
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        title={`Edit Price — ${selectedVariant?.sku ?? ""}`}
        subtitle="Update wholesale and retail pricing for this variant"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setPriceOpen(false)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Price Updated", description: `Wholesale: $${editWholesale} · Retail: $${editRetail}` }); setPriceOpen(false); }} data-testid="btn-save-price">Save Price</Button>
          </div>
        }
      >
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5"><Label>Wholesale Price ($)</Label><Input type="number" value={editWholesale} onChange={e => setEditWholesale(e.target.value)} data-testid="input-wholesale" /></div>
          <div className="space-y-1.5"><Label>Retail Price ($)</Label><Input type="number" value={editRetail} onChange={e => setEditRetail(e.target.value)} data-testid="input-retail" /></div>
        </div>
      </DetailModal>

      <DetailModal
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        title={`Update Stock — ${selectedVariant?.sku ?? ""}`}
        subtitle="Set the new available inventory quantity for this variant"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setStockOpen(false)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Stock Updated", description: `New quantity: ${editQty}` }); setStockOpen(false); }} data-testid="btn-save-stock">Save</Button>
          </div>
        }
      >
        <div className="px-6 py-5">
          <div className="space-y-1.5"><Label>New Available Quantity</Label><Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} data-testid="input-qty" /></div>
        </div>
      </DetailModal>

      <DetailModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Product"
        subtitle="Update product details, lifecycle state, and sale settings"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button style={{ background: FAIRE_COLOR }} className="text-white hover:opacity-90" onClick={() => { toast({ title: "Product Updated" }); setEditOpen(false); }} data-testid="btn-save-product">Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5"><Label>Product Name</Label><Input defaultValue={product.name} data-testid="input-product-name" /></div>
          <div className="space-y-1.5"><Label>Description</Label><textarea className="w-full h-20 border rounded-lg px-3 py-2 text-sm resize-none bg-background" defaultValue={product.description} data-testid="input-description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Lifecycle State</Label>
              <select className="w-full h-9 border rounded-lg px-3 text-sm bg-background" defaultValue={product.lifecycle_state} data-testid="select-lifecycle">
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="UNPUBLISHED">Unpublished</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label>Sale State</Label>
              <select className="w-full h-9 border rounded-lg px-3 text-sm bg-background" defaultValue={product.sale_state} data-testid="select-sale-state">
                <option value="FOR_SALE">For Sale</option>
                <option value="SALES_PAUSED">Sales Paused</option>
              </select>
            </div>
          </div>
        </div>
      </DetailModal>

      <DetailModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Product?"
        subtitle={`This will permanently remove "${product.name}" from your Faire store`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Product Deleted" }); setDeleteOpen(false); setLocation("/faire/products"); }} data-testid="btn-confirm-delete">Delete Product</Button>
          </div>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">This action cannot be undone. All product data, variants, and pricing will be permanently removed from your Faire store.</p>
        </div>
      </DetailModal>
    </PageShell>
  );
}
