import { useState } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Check, Copy, Store, Palette, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BRAND_COLORS, ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";

const SAMPLE_STORE_NAME = "Rajesh Kumar's EazyToSell";

function ColorSwatch({ color }: { color: typeof BRAND_COLORS[0] }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  function copy() {
    navigator.clipboard.writeText(color.hex).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: `${color.hex} copied to clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border overflow-hidden bg-card hover:shadow-md transition-shadow" data-testid={`color-swatch-${color.name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div
        className="h-24 w-full"
        style={{ backgroundColor: color.hex }}
      />
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{color.name}</p>
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={copy}
            data-testid={`button-copy-${color.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            {color.hex}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{color.usage}</p>
      </div>
    </div>
  );
}

function SignageMockup({ variant }: { variant: "fascia" | "interior" | "price-tag" }) {
  if (variant === "fascia") {
    return (
      <div
        className="rounded-xl overflow-hidden border"
        style={{ background: "#1C1C1E" }}
        data-testid="signage-fascia"
      >
        <div className="px-8 py-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: ETS_PORTAL_COLOR }}
            >
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl tracking-tight">EazyToSell</p>
              <p className="text-orange-400 text-xs font-medium tracking-widest uppercase">Retail Partner</p>
            </div>
          </div>
          <div className="mt-2 border-t border-white/10 pt-2 w-full text-center">
            <p className="text-white/60 text-xs">{SAMPLE_STORE_NAME}</p>
          </div>
        </div>
        <div className="px-4 pb-3 text-center">
          <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">Fascia Signboard Mockup</Badge>
        </div>
      </div>
    );
  }

  if (variant === "interior") {
    return (
      <div
        className="rounded-xl overflow-hidden border"
        style={{ background: "#FFF8F3" }}
        data-testid="signage-interior"
      >
        <div className="px-6 py-8 flex flex-col items-center gap-3">
          <div
            className="text-4xl font-black tracking-tighter"
            style={{ color: ETS_PORTAL_COLOR }}
          >
            EASY TO<br />
            <span className="text-gray-900">SELL</span>
          </div>
          <p className="text-sm text-gray-500 text-center max-w-[160px]">Quality products. Affordable prices. Right here.</p>
          <div className="h-1 w-16 rounded-full mt-1" style={{ backgroundColor: ETS_PORTAL_COLOR }} />
        </div>
        <div className="px-4 pb-3 text-center">
          <Badge className="text-xs" variant="secondary">Brand Wall Graphic Mockup</Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ background: "white" }}
      data-testid="signage-price-tag"
    >
      <div className="px-6 py-6 flex flex-col items-center gap-2">
        <div className="w-full border-2 rounded-lg p-3 space-y-1" style={{ borderColor: ETS_PORTAL_COLOR }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">EazyToSell</p>
            <div className="h-4 w-4 rounded" style={{ backgroundColor: ETS_PORTAL_COLOR }} />
          </div>
          <p className="text-sm font-semibold text-gray-800">Wireless Earbuds</p>
          <p className="text-xs text-gray-500">SKU: ETS-0042</p>
          <div className="pt-1">
            <p className="text-2xl font-black" style={{ color: ETS_PORTAL_COLOR }}>\u20B9320</p>
            <p className="text-xs text-gray-400">MRP incl. of all taxes</p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 text-center">
        <Badge className="text-xs" variant="secondary">Price Tag Mockup</Badge>
      </div>
    </div>
  );
}

function PlaceholderStorePhoto({ index }: { index: number }) {
  const captions = [
    "Entrance & Feature Wall — Well-lit with brand signage",
    "Gondola Aisles — Neatly merchandised with category signage",
    "Checkout Area — Organized counter with POS and impulse rack",
  ];

  const gradients = [
    "from-orange-100 to-amber-50",
    "from-sky-100 to-blue-50",
    "from-emerald-100 to-green-50",
  ];

  return (
    <div className="rounded-xl border overflow-hidden bg-card" data-testid={`store-photo-${index}`}>
      <div className={`aspect-video bg-gradient-to-br ${gradients[index]} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
          <ImageIcon className="h-10 w-10" />
          <p className="text-xs font-medium text-center px-4">Reference Photo {index + 1}</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">{captions[index]}</p>
      </div>
    </div>
  );
}

export default function EtsBrandKit() {
  const inSidebar = useEtsSidebar();

  return (
    <div className={inSidebar ? "p-5 space-y-6" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-brand-kit">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-brand-kit-title">Brand Kit</h1>
        <p className="text-muted-foreground">Official EazyToSell brand guidelines for your store — colors, signage, and visual references.</p>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
            <CardTitle>Store Color Palette</CardTitle>
          </div>
          <CardDescription>Use these colors consistently for signage, fixtures, and digital assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {BRAND_COLORS.map((color) => (
              <ColorSwatch key={color.name} color={color} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
            <CardTitle>Signage Mockups</CardTitle>
          </div>
          <CardDescription>Sample designs for key store signage. Your store name will replace the placeholder.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <SignageMockup variant="fascia" />
            <SignageMockup variant="interior" />
            <SignageMockup variant="price-tag" />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Store Name Placeholder:</span>{" "}
            "{SAMPLE_STORE_NAME}" — Final signage will be customized with your business name and approved by your account manager.
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
            <CardTitle>Reference Store Photos</CardTitle>
          </div>
          <CardDescription>Visual references of finished EazyToSell stores. Placeholder images — actual photos will be shared by your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <PlaceholderStorePhoto key={i} index={i} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-muted/40">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Brand Usage Guidelines</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Always use the official Brand Orange (#F97316) for primary CTAs and accents.</li>
            <li>Do not alter the EazyToSell logo proportions or colors.</li>
            <li>Ensure minimum clear space equal to the height of the logo mark around all logos.</li>
            <li>Print materials must use CMYK equivalents — contact your account manager for print-ready files.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
