import { useState, useMemo } from "react";
import { FileText, Copy, Printer, Check, X, Clock, DollarSign, Package, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  type EtsPackageTier,
  type EtsProposalTemplate,
} from "@/lib/mock-data-ets";
import dashboardIcon from "/3d-icons/documents.webp";
import { PageShell } from "@/components/layout";

const formatInr = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const CATEGORY_KEYS = ["toys", "kitchenware", "stationery", "decor", "bags", "household", "gifts"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  toys: "Toys",
  kitchenware: "Kitchenware",
  stationery: "Stationery",
  decor: "Decor",
  bags: "Bags",
  household: "Household",
  gifts: "Gifts",
};

const TIER_LABELS: Record<EtsPackageTier, string> = {
  lite: "Lite",
  pro: "Pro",
  elite: "Elite",
};

const tierVariant: Record<EtsPackageTier, "success" | "info" | "warning"> = {
  lite: "success",
  pro: "info",
  elite: "warning",
};

const tierBadgeStyles: Record<EtsPackageTier, string> = {
  lite: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0",
  pro: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0",
  elite: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0",
};

function scaleInvestment(template: EtsProposalTemplate, storeSize: number, categoryMix: Record<string, number>): { breakdown: typeof template.investmentBreakdown; total: number } {
  const sizeRatio = storeSize / template.storeSize;

  const breakdown = template.investmentBreakdown.map((item) => {
    let scaleFactor = sizeRatio;
    if (item.category === "interior") {
      scaleFactor = sizeRatio;
    } else if (item.category === "inventory") {
      scaleFactor = sizeRatio;
    } else if (item.category === "services") {
      scaleFactor = Math.max(1, sizeRatio * 0.8);
    } else if (item.category === "technology") {
      scaleFactor = 1;
    }
    return { ...item, amount: Math.round(item.amount * scaleFactor / 1000) * 1000 };
  });

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  return { breakdown, total };
}

export default function EtsProposals() {
  const { showSuccess } = useToast();

  const { data: proposalsData, isLoading } = useQuery<{ templates: any[] }>({
    queryKey: ['/api/ets/proposal-templates'],
  });

  const apiTemplates = proposalsData?.templates || [];

  const allTemplates = apiTemplates;

  const [storeSize, setStoreSize] = useState(1000);
  const [packageTier, setPackageTier] = useState<EtsPackageTier>("pro");
  const [city, setCity] = useState("Delhi");
  const [categoryMix, setCategoryMix] = useState<Record<string, number>>({
    toys: 25,
    kitchenware: 20,
    stationery: 15,
    decor: 15,
    bags: 10,
    household: 10,
    gifts: 5,
  });

  const template = useMemo(() => {
    return allTemplates.find((t: any) => t.packageTier === packageTier) || allTemplates[1] || allTemplates[0];
  }, [packageTier, allTemplates]);

  const scaled = useMemo(() => {
    if (!template) return null;
    return scaleInvestment(template, storeSize, categoryMix);
  }, [template, storeSize, categoryMix]);

  const totalMix = useMemo(() => {
    return Object.values(categoryMix).reduce((sum, val) => sum + val, 0);
  }, [categoryMix]);

  const handleCategoryChange = (key: string, newValue: number) => {
    setCategoryMix((prev) => ({ ...prev, [key]: newValue }));
  };

  const paymentSchedule = useMemo(() => {
    if (!template || !scaled) return [];
    return template.paymentSchedule.map((ps: any) => ({
      ...ps,
      amount: Math.round((scaled.total * ps.percent) / 100 / 1000) * 1000,
    }));
  }, [template, scaled]);

  const breakdownByCategory = useMemo(() => {
    const groups: Record<string, number> = {};
    if (!scaled) return groups;
    scaled.breakdown.forEach((item) => {
      groups[item.category] = (groups[item.category] || 0) + item.amount;
    });
    return groups;
  }, [scaled]);

  const generateWhatsAppCopy = () => {
    const lines = [
      `*${TIER_LABELS[packageTier]} Package - ${storeSize} sq ft Store*`,
      `Location: ${city}`,
      "",
      `*Investment Summary:*`,
    ];

    if (breakdownByCategory.interior) lines.push(`Interior & Branding: ${formatInr(breakdownByCategory.interior)}`);
    if (breakdownByCategory.inventory) lines.push(`Product Inventory: ${formatInr(breakdownByCategory.inventory)}`);
    if (breakdownByCategory.services) lines.push(`Services & Support: ${formatInr(breakdownByCategory.services)}`);
    if (breakdownByCategory.technology) lines.push(`Technology: ${formatInr(breakdownByCategory.technology)}`);

    lines.push("", `*Total: ${formatInr(scaled.total)}*`, "");
    lines.push("*Payment Plan:*");
    paymentSchedule.forEach((ps: any) => {
      lines.push(`${ps.milestone} (${ps.percent}%): ${formatInr(ps.amount)}`);
    });

    lines.push("", "*Category Mix:*");
    CATEGORY_KEYS.forEach((key) => {
      if (categoryMix[key] > 0) {
        lines.push(`${CATEGORY_LABELS[key]}: ${categoryMix[key]}%`);
      }
    });

    lines.push("", `*Timeline:* ${template.timeline.length} phases over ${template.timeline[template.timeline.length - 1]?.week || "6-8 weeks"}`);
    lines.push("", "Contact us to get started!");

    return lines.join("\n");
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppCopy();
    navigator.clipboard.writeText(text).then(() => {
      showSuccess("Copied to clipboard", "WhatsApp-ready proposal text copied");
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !template || !scaled) {
    return (
      <PageShell>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Fade direction="left" distance={10} duration={0.3}>
          <Card data-testid="card-proposal-inputs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="store-size">Store Size (sq ft)</Label>
                <Input
                  id="store-size"
                  type="number"
                  value={storeSize}
                  onChange={(e) => setStoreSize(Math.max(200, Number(e.target.value) || 0))}
                  data-testid="input-store-size"
                />
              </div>

              <div className="space-y-2">
                <Label>Package Tier</Label>
                <Select value={packageTier} onValueChange={(v) => setPackageTier(v as EtsPackageTier)}>
                  <SelectTrigger data-testid="select-package-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lite">Lite</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City / Location</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Category Mix</Label>
                  <span className={`text-xs font-medium ${totalMix === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} data-testid="text-category-total">
                    {totalMix}%
                  </span>
                </div>
                {CATEGORY_KEYS.map((key) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[key]}</span>
                      <span className="text-xs font-medium w-8 text-right">{categoryMix[key]}%</span>
                    </div>
                    <Slider
                      value={[categoryMix[key]]}
                      onValueChange={([val]) => handleCategoryChange(key, val)}
                      min={0}
                      max={60}
                      step={5}
                      data-testid={`slider-category-${key}`}
                    />
                  </div>
                ))}
                {totalMix !== 100 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Total must equal 100% (currently {totalMix}%)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Fade>

        <div className="lg:col-span-2 space-y-6">
          <Stagger staggerInterval={0.06} className="space-y-6">
            <StaggerItem>
              <Card data-testid="card-investment-breakdown">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-heading">Investment Breakdown</CardTitle>
                    <Badge variant="secondary" className={tierBadgeStyles[packageTier]}>
                      {TIER_LABELS[packageTier]}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Investment</p>
                    <p className="text-lg font-bold font-heading" data-testid="text-total-investment">{formatInr(scaled.total)}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium text-muted-foreground">Item</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scaled.breakdown.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-b-0">
                            <td className="p-3" data-testid={`text-breakdown-item-${idx}`}>{item.item}</td>
                            <td className="p-3">
                              <Badge variant="secondary" className="text-xs border-0 capitalize">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-medium" data-testid={`text-breakdown-amount-${idx}`}>{formatInr(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/50 font-semibold">
                          <td className="p-3" colSpan={2}>Total</td>
                          <td className="p-3 text-right">{formatInr(scaled.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card data-testid="card-timeline">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-heading">Launch Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-0">
                    {template.timeline.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-3 pb-4 last:pb-0" data-testid={`timeline-step-${idx}`}>
                        <div className="flex flex-col items-center">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {idx + 1}
                          </div>
                          {idx < template.timeline.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className="text-sm font-medium">{step.activity}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            {step.week}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card data-testid="card-inclusions">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-heading">Inclusions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {template.inclusions.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" data-testid={`text-inclusion-${idx}`}>
                          <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card data-testid="card-exclusions">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-heading">Exclusions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {template.exclusions.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" data-testid={`text-exclusion-${idx}`}>
                          <X className="size-4 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </StaggerItem>

            <StaggerItem>
              <Card data-testid="card-payment-schedule">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-heading">Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paymentSchedule.map((ps: any, idx: number) => (
                      <div key={idx} className="rounded-md border p-3 text-center" data-testid={`card-payment-milestone-${idx}`}>
                        <p className="text-xs text-muted-foreground mb-1">{ps.milestone}</p>
                        <p className="text-sm font-semibold">{formatInr(ps.amount)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ps.percent}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <div className="flex items-center gap-3 flex-wrap">
                <Button onClick={handleCopyWhatsApp} data-testid="button-copy-whatsapp">
                  <Copy className="size-4" />
                  Copy as WhatsApp
                </Button>
                <Button variant="outline" onClick={handlePrint} data-testid="button-print">
                  <Printer className="size-4" />
                  Print / PDF
                </Button>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </PageShell>
  );
}
