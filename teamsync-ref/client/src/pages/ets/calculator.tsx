import { useState, useMemo, useCallback } from "react";
import { Calculator, ArrowRight, Save, Zap, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  calculateEtsPrices,
  defaultPriceSettings,
  ETS_PRODUCT_CATEGORIES,
  ETS_CATEGORY_DUTY_RATES,
  ETS_MRP_BANDS,
  type EtsProductCategory,
  type EtsPriceInputs,
  type EtsPriceResult,
} from "@/lib/mock-data-ets";
import dashboardIcon from "/3d-icons/dashboard.webp";
import { PageShell } from "@/components/layout";

interface SavedTemplate {
  id: string;
  name: string;
  inputs: InputState;
}

interface InputState {
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLengthCm: number;
  cartonWidthCm: number;
  cartonHeightCm: number;
  category: EtsProductCategory;
  markupPercent: number;
}

const defaultInputState: InputState = {
  exwPriceYuan: 10,
  unitsPerCarton: 24,
  cartonLengthCm: 50,
  cartonWidthCm: 40,
  cartonHeightCm: 35,
  category: "toys",
  markupPercent: 25,
};

const initialTemplates: SavedTemplate[] = [
  {
    id: "tpl-1",
    name: "Toy Standard",
    inputs: { exwPriceYuan: 10, unitsPerCarton: 24, cartonLengthCm: 50, cartonWidthCm: 40, cartonHeightCm: 35, category: "toys", markupPercent: 25 },
  },
  {
    id: "tpl-2",
    name: "Kitchen Premium",
    inputs: { exwPriceYuan: 18, unitsPerCarton: 20, cartonLengthCm: 50, cartonWidthCm: 40, cartonHeightCm: 45, category: "kitchenware", markupPercent: 30 },
  },
  {
    id: "tpl-3",
    name: "Stationery Value",
    inputs: { exwPriceYuan: 3, unitsPerCarton: 100, cartonLengthCm: 40, cartonWidthCm: 30, cartonHeightCm: 25, category: "stationery", markupPercent: 20 },
  },
];

const formatInr = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const formatYuan = (v: number) => `¥${v.toFixed(2)}`;

const categoryLabels: Record<EtsProductCategory, string> = {
  toys: "Toys",
  kitchenware: "Kitchenware",
  stationery: "Stationery",
  decor: "Decor",
  bags: "Bags",
  household: "Household",
  gifts: "Gifts",
};

function getMarginColor(percent: number, target: number): string {
  if (percent >= target) return "text-emerald-600 dark:text-emerald-400";
  if (percent >= target - 10) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getMarginBg(percent: number, target: number): string {
  if (percent >= target) return "bg-emerald-50 dark:bg-emerald-950";
  if (percent >= target - 10) return "bg-amber-50 dark:bg-amber-950";
  return "bg-red-50 dark:bg-red-950";
}

function getMarginBorderColor(percent: number, target: number): string {
  if (percent >= target) return "border-emerald-200 dark:border-emerald-800";
  if (percent >= target - 10) return "border-amber-200 dark:border-amber-800";
  return "border-red-200 dark:border-red-800";
}

function MarginIcon({ percent, target }: { percent: number; target: number }) {
  if (percent >= target) return <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />;
  if (percent >= target - 10) return <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />;
  return <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />;
}

function MarginLabel({ percent, target }: { percent: number; target: number }) {
  if (percent >= target) return "Above target";
  if (percent >= target - 10) return "Close to target";
  return "Below target";
}

interface PriceChainStepProps {
  label: string;
  value: string;
  detail?: string;
  isHighlight?: boolean;
}

function PriceChainStep({ label, value, detail, isHighlight }: PriceChainStepProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 ${
        isHighlight ? "border-primary/30 bg-primary/5" : "border-border bg-background"
      }`}
      data-testid={`price-step-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
      </div>
      <span className={`text-sm font-semibold tabular-nums ${isHighlight ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

export default function EtsCalculator() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<InputState>(defaultInputState);
  const [templates, setTemplates] = useState<SavedTemplate[]>(initialTemplates);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const { data: settingsData, isLoading: settingsLoading } = useQuery<{ settings: any[] }>({
    queryKey: ['/api/ets/settings'],
  });

  const { data: categoriesData } = useQuery<{ categories: any[] }>({
    queryKey: ['/api/ets/categories'],
  });

  const settings = useMemo(() => {
    const map: Record<string, number> = {};
    defaultPriceSettings.forEach((s) => { map[s.key] = s.value; });
    if (settingsData?.settings) {
      settingsData.settings.forEach((s: any) => {
        map[s.key] = parseFloat(s.value) || 0;
      });
    }
    return map;
  }, [settingsData]);

  const categoryDutyRates = useMemo(() => {
    const rates = { ...ETS_CATEGORY_DUTY_RATES };
    if (categoriesData?.categories) {
      categoriesData.categories.forEach((cat: any) => {
        if (cat.slug && rates[cat.slug as EtsProductCategory]) {
          rates[cat.slug as EtsProductCategory] = {
            duty: parseFloat(cat.customs_duty_percent) || 0,
            igst: parseFloat(cat.igst_percent) || 0,
          };
        }
      });
    }
    return rates;
  }, [categoriesData]);

  const dutyRates = useMemo(() => categoryDutyRates[inputs.category], [inputs.category, categoryDutyRates]);

  const priceInputs: EtsPriceInputs = useMemo(() => ({
    exwPriceYuan: inputs.exwPriceYuan,
    unitsPerCarton: inputs.unitsPerCarton,
    cartonLengthCm: inputs.cartonLengthCm,
    cartonWidthCm: inputs.cartonWidthCm,
    cartonHeightCm: inputs.cartonHeightCm,
    categoryDutyPercent: dutyRates.duty,
    categoryIgstPercent: dutyRates.igst,
    exchangeRate: settings.exchange_rate,
    sourcingCommission: settings.sourcing_commission,
    freightPerCbm: settings.freight_per_cbm,
    insurancePercent: settings.insurance_percent,
    swSurchargePercent: settings.sw_surcharge_percent,
    ourMarkupPercent: inputs.markupPercent,
    targetStoreMargin: settings.target_store_margin,
  }), [inputs, dutyRates, settings]);

  const result: EtsPriceResult = useMemo(() => calculateEtsPrices(priceInputs), [priceInputs]);

  const updateInput = useCallback(<K extends keyof InputState>(key: K, value: InputState[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNumericInput = useCallback((key: keyof InputState, raw: string) => {
    const val = parseFloat(raw);
    if (!isNaN(val) && val >= 0) {
      updateInput(key, val);
    } else if (raw === "") {
      updateInput(key, 0);
    }
  }, [updateInput]);

  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    const newTemplate: SavedTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName.trim(),
      inputs: { ...inputs },
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setTemplateName("");
    setSaveDialogOpen(false);
    toast({ title: "Template saved", description: `"${newTemplate.name}" has been saved.` });
  }, [templateName, inputs, toast]);

  const loadTemplate = useCallback((tpl: SavedTemplate) => {
    setInputs({ ...tpl.inputs });
    toast({ title: "Template loaded", description: `"${tpl.name}" applied.` });
  }, [toast]);

  const targetMargin = settings.target_store_margin;

  if (settingsLoading) {
    return (
      <PageShell>
        <Skeleton className="mb-5 h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[500px] rounded-lg" />
          <Skeleton className="h-[500px] rounded-lg" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTransition>
<Fade direction="up" delay={0.05}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-1">Quick Templates:</span>
            {templates.map((tpl) => (
              <Button
                key={tpl.id}
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(tpl)}
                data-testid={`button-template-${tpl.id}`}
              >
                <Zap className="size-3.5 mr-1" />
                {tpl.name}
              </Button>
            ))}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-save-template">
                  <Save className="size-3.5 mr-1" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save as Template</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. Decor Premium"
                      data-testid="input-template-name"
                    />
                  </div>
                  <Button onClick={handleSaveTemplate} disabled={!templateName.trim()} data-testid="button-confirm-save-template">
                    Save Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Fade>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Fade direction="left" delay={0.1}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">Input Parameters</CardTitle>
                <Calculator className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="exw-price">EXW Price (¥)</Label>
                    <Input
                      id="exw-price"
                      type="number"
                      min={0}
                      step={0.5}
                      value={inputs.exwPriceYuan || ""}
                      onChange={(e) => handleNumericInput("exwPriceYuan", e.target.value)}
                      data-testid="input-exw-price"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="units-per-carton">Units / Carton</Label>
                    <Input
                      id="units-per-carton"
                      type="number"
                      min={1}
                      step={1}
                      value={inputs.unitsPerCarton || ""}
                      onChange={(e) => handleNumericInput("unitsPerCarton", e.target.value)}
                      data-testid="input-units-per-carton"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Carton Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Length</span>
                      <Input
                        type="number"
                        min={1}
                        value={inputs.cartonLengthCm || ""}
                        onChange={(e) => handleNumericInput("cartonLengthCm", e.target.value)}
                        data-testid="input-carton-length"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Width</span>
                      <Input
                        type="number"
                        min={1}
                        value={inputs.cartonWidthCm || ""}
                        onChange={(e) => handleNumericInput("cartonWidthCm", e.target.value)}
                        data-testid="input-carton-width"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Height</span>
                      <Input
                        type="number"
                        min={1}
                        value={inputs.cartonHeightCm || ""}
                        onChange={(e) => handleNumericInput("cartonHeightCm", e.target.value)}
                        data-testid="input-carton-height"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <Select
                    value={inputs.category}
                    onValueChange={(v) => updateInput("category", v as EtsProductCategory)}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ETS_PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat]} (Duty {categoryDutyRates[cat].duty}% / IGST {categoryDutyRates[cat].igst}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label>Our Markup</Label>
                    <span className="text-sm font-semibold tabular-nums" data-testid="text-markup-value">{inputs.markupPercent}%</span>
                  </div>
                  <Slider
                    value={[inputs.markupPercent]}
                    onValueChange={([v]) => updateInput("markupPercent", v)}
                    min={0}
                    max={100}
                    step={1}
                    data-testid="slider-markup"
                  />
                  <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Settings Applied</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="text-right tabular-nums">{settings.exchange_rate} ₹/¥</span>
                    <span className="text-muted-foreground">Sourcing Commission</span>
                    <span className="text-right tabular-nums">{settings.sourcing_commission}%</span>
                    <span className="text-muted-foreground">Freight / CBM</span>
                    <span className="text-right tabular-nums">₹{settings.freight_per_cbm?.toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="text-right tabular-nums">{settings.insurance_percent}%</span>
                    <span className="text-muted-foreground">SW Surcharge</span>
                    <span className="text-right tabular-nums">{settings.sw_surcharge_percent}%</span>
                    <span className="text-muted-foreground">Target Margin</span>
                    <span className="text-right tabular-nums">{settings.target_store_margin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Fade>

          <Fade direction="right" delay={0.15}>
            <div className="flex flex-col gap-4">
              <Card className={`border ${getMarginBorderColor(result.storeMarginPercent, targetMargin)}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
                  <CardTitle className="text-base font-semibold">Margin Summary</CardTitle>
                  <MarginIcon percent={result.storeMarginPercent} target={targetMargin} />
                </CardHeader>
                <CardContent>
                  <div className={`rounded-md p-4 ${getMarginBg(result.storeMarginPercent, targetMargin)}`}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-sm font-medium">Store Margin</span>
                      <span className={`text-2xl font-bold tabular-nums ${getMarginColor(result.storeMarginPercent, targetMargin)}`} data-testid="text-margin-percent">
                        {result.storeMarginPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Margin per unit</span>
                      <span className="font-medium tabular-nums" data-testid="text-margin-rs">{formatInr(result.storeMarginRs)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm mt-1">
                      <span className="text-muted-foreground">Target</span>
                      <span className="tabular-nums">{targetMargin}%</span>
                    </div>
                    <p className={`text-xs mt-2 font-medium ${getMarginColor(result.storeMarginPercent, targetMargin)}`}>
                      <MarginLabel percent={result.storeMarginPercent} target={targetMargin} />
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
                  <CardTitle className="text-base font-semibold">MRP Band</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {ETS_MRP_BANDS.map((band) => {
                      const isSelected = band === result.suggestedMrp;
                      return (
                        <Badge
                          key={band}
                          variant={isSelected ? "default" : "secondary"}
                          className={isSelected ? "text-sm" : "text-xs no-default-hover-elevate no-default-active-elevate"}
                          data-testid={`badge-mrp-band-${band}`}
                        >
                          {isSelected ? `₹${band}` : `₹${band}`}
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Suggested MRP: <span className="font-semibold text-foreground" data-testid="text-suggested-mrp">₹{result.suggestedMrp}</span>
                    {" "}(store landing: {formatInr(result.storeLandingPrice)})
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
                  <CardTitle className="text-base font-semibold">Price Chain Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Stagger staggerInterval={0.03} className="flex flex-col gap-2">
                    <StaggerItem>
                      <PriceChainStep label="EXW Price" value={formatYuan(inputs.exwPriceYuan)} />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="FOB Price"
                        value={`${formatYuan(result.fobPriceYuan)} / ${formatInr(result.fobPriceInr)}`}
                        detail={`+${settings.sourcing_commission}% sourcing commission`}
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="Freight"
                        value={formatInr(result.freightPerUnit)}
                        detail={`CBM/unit: ${result.cbmPerUnit.toFixed(4)} @ ₹${settings.freight_per_cbm?.toLocaleString("en-IN")}/CBM`}
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="CIF Price"
                        value={formatInr(result.cifPriceInr)}
                        detail={`FOB + Freight + Insurance (${settings.insurance_percent}%)`}
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="Customs Duty"
                        value={formatInr(result.customsDuty)}
                        detail={`${dutyRates.duty}% on CIF`}
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="SW Surcharge"
                        value={formatInr(result.swSurcharge)}
                        detail={`${settings.sw_surcharge_percent}% on duty`}
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="IGST"
                        value={formatInr(result.igst)}
                        detail={`${dutyRates.igst}% on assessable value`}
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="Total Landed Cost"
                        value={formatInr(result.totalLandedCost)}
                        isHighlight
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ChevronRight className="size-4 text-muted-foreground rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <PriceChainStep
                        label="Store Landing Price"
                        value={formatInr(result.storeLandingPrice)}
                        detail={`+${inputs.markupPercent}% our markup`}
                        isHighlight
                      />
                    </StaggerItem>
                    <StaggerItem>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="size-4 text-primary rotate-90" />
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div
                        className="flex items-center justify-between gap-4 rounded-md border-2 border-primary bg-primary/10 px-4 py-4"
                        data-testid="price-step-suggested-mrp"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold">Suggested MRP</span>
                          <span className="text-xs text-muted-foreground">Nearest MRP band with {targetMargin}%+ margin</span>
                        </div>
                        <span className="text-xl font-bold text-primary tabular-nums">₹{result.suggestedMrp}</span>
                      </div>
                    </StaggerItem>
                  </Stagger>
                </CardContent>
              </Card>
            </div>
          </Fade>
        </div>
      </PageTransition>
    </PageShell>
  );
}
