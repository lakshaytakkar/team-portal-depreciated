import { type ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Download,
  Check,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export interface UsageStat {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

export interface BillingCardProps {
  planName: string;
  price: string;
  billingCycle?: string;
  usageStats?: UsageStat[];
  onUpgrade?: () => void;
  onManage?: () => void;
  className?: string;
}

export function BillingCard({
  planName,
  price,
  billingCycle = "per month",
  usageStats = [],
  onUpgrade,
  onManage,
  className,
}: BillingCardProps) {
  return (
    <Card className={cn(className)} data-testid="billing-card">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardDescription data-testid="billing-card-cycle">{billingCycle}</CardDescription>
          <CardTitle className="text-lg" data-testid="billing-card-plan">{planName}</CardTitle>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" data-testid="billing-card-price">{price}</p>
          <p className="text-xs text-muted-foreground">{billingCycle}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageStats.map((stat) => {
          const pct = stat.limit > 0 ? Math.round((stat.used / stat.limit) * 100) : 0;
          return (
            <div key={stat.label} data-testid={`billing-usage-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-medium">
                  {stat.used}{stat.unit ? ` ${stat.unit}` : ""} / {stat.limit}{stat.unit ? ` ${stat.unit}` : ""}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-row flex-wrap gap-2">
        {onManage && (
          <Button variant="outline" onClick={onManage} data-testid="billing-manage-button">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage
          </Button>
        )}
        {onUpgrade && (
          <Button onClick={onUpgrade} data-testid="billing-upgrade-button">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  description?: string;
  billingCycle?: string;
  features: PricingFeature[];
  ctaLabel?: string;
  popular?: boolean;
  onSelect?: () => void;
}

export interface PricingTableProps {
  tiers: PricingTier[];
  className?: string;
}

export function PricingTable({ tiers, className }: PricingTableProps) {
  if (tiers.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="pricing-table-empty">
        No pricing plans available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        tiers.length === 1 && "grid-cols-1 max-w-sm mx-auto",
        tiers.length === 2 && "grid-cols-1 sm:grid-cols-2",
        tiers.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      data-testid="pricing-table"
    >
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          className={cn(
            "flex flex-col",
            tier.popular && "border-primary",
          )}
          data-testid={`pricing-tier-${tier.id}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg" data-testid={`pricing-tier-name-${tier.id}`}>{tier.name}</CardTitle>
              {tier.popular && (
                <Badge variant="default" data-testid={`pricing-tier-popular-${tier.id}`}>Popular</Badge>
              )}
            </div>
            {tier.description && (
              <CardDescription data-testid={`pricing-tier-desc-${tier.id}`}>{tier.description}</CardDescription>
            )}
            <div className="pt-2">
              <span className="text-3xl font-bold" data-testid={`pricing-tier-price-${tier.id}`}>{tier.price}</span>
              {tier.billingCycle && (
                <span className="text-sm text-muted-foreground ml-1">/{tier.billingCycle}</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              {tier.features.map((feature) => (
                <li
                  key={feature.text}
                  className={cn(
                    "flex items-start gap-2 text-sm",
                    !feature.included && "text-muted-foreground line-through",
                  )}
                  data-testid={`pricing-feature-${tier.id}-${feature.text.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      feature.included ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={tier.popular ? "default" : "outline"}
              onClick={tier.onSelect}
              data-testid={`pricing-tier-cta-${tier.id}`}
            >
              {tier.ctaLabel ?? "Get Started"}
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export interface LineItem {
  id: string;
  label: string;
  quantity?: number;
  unitPrice?: string;
  total: string;
}

export interface CheckoutFormProps {
  lineItems: LineItem[];
  subtotal: string;
  tax?: string;
  discount?: string;
  total: string;
  formContent?: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  className?: string;
}

export function CheckoutForm({
  lineItems,
  subtotal,
  tax,
  discount,
  total,
  formContent,
  onSubmit,
  submitLabel = "Pay Now",
  className,
}: CheckoutFormProps) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)} data-testid="checkout-form">
      <Card data-testid="checkout-payment-section">
        <CardHeader>
          <CardTitle className="text-lg">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          {formContent ?? (
            <div className="py-8 text-center text-sm text-muted-foreground" data-testid="checkout-form-placeholder">
              Payment form fields go here
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="checkout-summary-section">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 text-sm"
              data-testid={`checkout-line-item-${item.id}`}
            >
              <div className="min-w-0">
                <span className="truncate">{item.label}</span>
                {item.quantity && item.quantity > 1 && (
                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                )}
              </div>
              <span className="font-medium shrink-0" data-testid={`checkout-line-total-${item.id}`}>{item.total}</span>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span data-testid="checkout-subtotal">{subtotal}</span>
          </div>

          {discount && (
            <div className="flex items-center justify-between gap-2 text-sm text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span data-testid="checkout-discount">-{discount}</span>
            </div>
          )}

          {tax && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span data-testid="checkout-tax">{tax}</span>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-2 font-semibold">
            <span>Total</span>
            <span data-testid="checkout-total">{total}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onSubmit} data-testid="checkout-submit-button">
            <CreditCard className="h-4 w-4 mr-2" />
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  description?: string;
  onDownload?: () => void;
  onClick?: () => void;
}

export interface InvoiceListProps {
  invoices: InvoiceRow[];
  emptyMessage?: string;
  className?: string;
}

const invoiceStatusVariant: Record<InvoiceRow["status"], "default" | "secondary" | "destructive" | "outline"> = {
  paid: "secondary",
  pending: "outline",
  overdue: "destructive",
};

const invoiceStatusLabel: Record<InvoiceRow["status"], string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

export function InvoiceList({ invoices, emptyMessage = "No invoices", className }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground" data-testid="invoice-list-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("divide-y", className)} data-testid="invoice-list">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className={cn(
            "flex items-center justify-between gap-3 py-3 px-1",
            inv.onClick && "cursor-pointer hover-elevate",
          )}
          onClick={inv.onClick}
          data-testid={`invoice-row-${inv.id}`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium" data-testid={`invoice-number-${inv.id}`}>
                {inv.invoiceNumber}
              </span>
              <Badge
                variant={invoiceStatusVariant[inv.status]}
                className="text-[10px]"
                data-testid={`invoice-status-${inv.id}`}
              >
                {invoiceStatusLabel[inv.status]}
              </Badge>
            </div>
            {inv.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{inv.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="text-right">
              <p className="text-sm font-medium" data-testid={`invoice-amount-${inv.id}`}>{inv.amount}</p>
              <p className="text-xs text-muted-foreground" data-testid={`invoice-date-${inv.id}`}>{inv.date}</p>
            </div>
            {inv.onDownload && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  inv.onDownload?.();
                }}
                data-testid={`invoice-download-${inv.id}`}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
