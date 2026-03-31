import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, ShoppingCart, Tag, UserPlus, Edit2, Check, X } from "lucide-react";

const VENDOR_PRODUCTS = [
  { id: "V-SKU-001", name: "Aloe Vera Gel 200ml", category: "Skincare", price: 75, stock: 1200, status: "Listed" },
  { id: "V-SKU-002", name: "Rose Water Toner 150ml", category: "Skincare", price: 60, stock: 850, status: "Listed" },
  { id: "V-SKU-003", name: "Vitamin C Serum 30ml", category: "Skincare", price: 180, stock: 400, status: "Review" },
  { id: "V-SKU-004", name: "Neem Face Pack 100g", category: "Skincare", price: 45, stock: 2100, status: "Listed" },
  { id: "V-SKU-005", name: "Charcoal Soap 75g", category: "Bodycare", price: 35, stock: 3200, status: "Draft" },
];

const INCOMING_ORDERS = [
  { id: "ORD-IN-001", buyer: "EazyToSell", items: 15, units: 300, value: 22500, status: "Pending", date: "Mar 25" },
  { id: "ORD-IN-002", buyer: "EazyToSell", items: 8, units: 160, value: 12000, status: "Accepted", date: "Mar 22" },
  { id: "ORD-IN-003", buyer: "EazyToSell", items: 20, units: 500, value: 36000, status: "Shipped", date: "Mar 18" },
];

const KYC_STEPS = [
  { label: "Business Registration", done: true },
  { label: "GST Certificate Upload", done: true },
  { label: "Bank Account Verification", done: true },
  { label: "Product Quality Certification", done: false },
  { label: "Warehouse Address Confirmed", done: false },
];

const STATUS_COLORS: Record<string, string> = {
  "Listed": "border-green-300 text-green-700 bg-green-50",
  "Review": "border-amber-300 text-amber-700 bg-amber-50",
  "Draft": "border-gray-200 text-gray-500 bg-gray-50",
  "Pending": "border-blue-300 text-blue-700 bg-blue-50",
  "Accepted": "border-green-300 text-green-700 bg-green-50",
  "Shipped": "border-purple-300 text-purple-700 bg-purple-50",
};

const kycDone = KYC_STEPS.filter(k => k.done).length;

export default function EtsVendorPortal() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="vendor-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-indigo-200 mb-1">Vendor Portal</p>
          <h1 className="text-2xl font-bold" data-testid="text-vendor-title">Supplier Dashboard</h1>
          <p className="text-sm text-indigo-200 mt-1">Deodap / Basketo / WholesaleDock</p>
          <div className="flex items-center gap-6 mt-3 text-sm text-indigo-200">
            <span><strong className="text-white">{VENDOR_PRODUCTS.length}</strong> Products</span>
            <span><strong className="text-white">{INCOMING_ORDERS.filter(o => o.status === "Pending").length}</strong> Pending Orders</span>
            <span><strong className="text-white">{kycDone}/{KYC_STEPS.length}</strong> KYC Steps</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{VENDOR_PRODUCTS.filter(p => p.status === "Listed").length}</p>
            <p className="text-xs text-muted-foreground">Listed Products</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{INCOMING_ORDERS.length}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <UserPlus className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl font-bold">{kycDone}</span>
              <span className="text-lg text-muted-foreground">/ {KYC_STEPS.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">KYC Complete</p>
            <Progress value={(kycDone / KYC_STEPS.length) * 100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">My Product Listings</CardTitle>
              <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white h-7 text-xs" data-testid="button-add-product">+ Add Product</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {VENDOR_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                data-testid={`vendor-product-${product.id}`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.stock.toLocaleString()} in stock · ₹{product.price}/unit</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[product.status]}`}>{product.status}</Badge>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" data-testid={`edit-vendor-product-${product.id}`}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Incoming Orders</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {INCOMING_ORDERS.map((order) => (
                <div key={order.id} className="p-3 rounded-xl bg-muted/30" data-testid={`incoming-order-${order.id}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono">{order.id}</span>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[order.status]}`}>{order.status}</Badge>
                  </div>
                  <p className="text-sm font-medium">₹{order.value.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{order.items} SKUs · {order.units} units · {order.date}</p>
                  {order.status === "Pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="flex-1 h-7 text-xs bg-green-500 hover:bg-green-600 text-white gap-1" data-testid={`accept-order-${order.id}`}>
                        <Check className="w-3 h-3" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" data-testid={`reject-order-${order.id}`}>
                        <X className="w-3 h-3" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold">KYC Status</CardTitle>
                <Badge variant="outline" className={`text-[10px] ${kycDone === KYC_STEPS.length ? "border-green-300 text-green-700" : "border-amber-300 text-amber-700"}`}>
                  {kycDone === KYC_STEPS.length ? "Verified" : "Incomplete"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {KYC_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5" data-testid={`kyc-step-${idx}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-green-500" : "bg-gray-200"}`}>
                    {step.done && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-xs ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                </div>
              ))}
              {kycDone < KYC_STEPS.length && (
                <Button size="sm" className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs" data-testid="button-complete-kyc">
                  Complete Remaining KYC Steps
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function EtsVendorListings() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">My Product Listings</h1>
        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">+ Add Product</Button>
      </div>
      <div className="space-y-3">
        {VENDOR_PRODUCTS.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm" data-testid={`listing-card-${product.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.id} · {product.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold">₹{product.price}/unit</p>
                  <p className="text-xs text-muted-foreground">{product.stock.toLocaleString()} in stock</p>
                </div>
                <Badge variant="outline" className={STATUS_COLORS[product.status]}>{product.status}</Badge>
                <Button size="sm" variant="outline" className="gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsVendorOrders() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Incoming Orders</h1>
      <div className="space-y-3">
        {INCOMING_ORDERS.map((order) => (
          <Card key={order.id} className="border-0 shadow-sm" data-testid={`vendor-order-${order.id}`}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm text-muted-foreground">{order.id}</p>
                  <p className="text-lg font-bold">₹{order.value.toLocaleString("en-IN")}</p>
                  <p className="text-sm text-muted-foreground">{order.items} SKUs · {order.units} units · {order.date}</p>
                </div>
                <Badge variant="outline" className={STATUS_COLORS[order.status]}>{order.status}</Badge>
              </div>
              {order.status === "Pending" && (
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white gap-1"><Check className="w-4 h-4" /> Accept Order</Button>
                  <Button variant="outline" className="flex-1 gap-1"><X className="w-4 h-4" /> Decline</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsVendorStock() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Stock & Pricing</h1>
      <div className="space-y-3">
        {VENDOR_PRODUCTS.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm" data-testid={`stock-card-${product.id}`}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="font-bold">{product.stock.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Price/unit</p>
                  <p className="font-bold">₹{product.price}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1"><Edit2 className="w-3.5 h-3.5" /> Update</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsVendorKYC() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">KYC Status</h1>
        <p className="text-sm text-muted-foreground">Complete all steps to become a verified EazyToSell supplier</p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {KYC_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-xl ${step.done ? "bg-green-50 border border-green-100" : "bg-muted/30 border border-dashed"}`}
              data-testid={`kyc-detail-${idx}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-green-500" : "bg-gray-200"}`}>
                {step.done ? <Check className="w-5 h-5 text-white" /> : <span className="text-sm font-bold text-gray-500">{idx + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${step.done ? "text-green-800" : ""}`}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.done ? "Verified ✓" : "Required — please submit"}</p>
              </div>
              {!step.done && (
                <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white" data-testid={`upload-kyc-${idx}`}>
                  Upload
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
