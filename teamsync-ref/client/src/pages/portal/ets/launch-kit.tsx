import { useQuery } from "@tanstack/react-query";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Link } from "wouter";
import {
  Package, ShoppingCart, ChevronRight, Truck,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

function LaunchKitSkeleton() {
  return (
    <div className="p-5 space-y-5">
      <Skeleton className="h-10 w-48" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function EtsPortalLaunchKit() {
  const inSidebar = useEtsSidebar();
  const clientId = portalEtsClient.id;

  const { data: kitData, isLoading } = useQuery<{ kitItems: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'kit-items'],
  });

  if (isLoading) return <LaunchKitSkeleton />;

  const kitItems = kitData?.kitItems || [];
  const totalItems = kitItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalValue = kitItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const confirmedItems = kitItems.filter((item: any) => item.confirmed).length;

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"} data-testid="ets-portal-launch-kit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-launch-kit-title">Launch Kit</h1>
          <p className="text-muted-foreground">Your selected inventory for store opening.</p>
        </div>
        <Link href="/portal-ets/catalog">
          <Button style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white" data-testid="button-browse-catalog">
            <ShoppingCart className="h-4 w-4 mr-2" /> Browse Catalog
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-xl border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
              <span className="text-sm font-medium text-muted-foreground">Total Items</span>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="text-total-items">{totalItems}</p>
            <p className="text-xs text-muted-foreground mt-1">{kitItems.length} products selected</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
              <span className="text-sm font-medium text-muted-foreground">Estimated Value</span>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="text-total-value">
              {"\u20B9"}{totalValue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">At wholesale pricing</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
              <span className="text-sm font-medium text-muted-foreground">Confirmed</span>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="text-confirmed">{confirmedItems}/{kitItems.length}</p>
            <Progress value={kitItems.length > 0 ? (confirmedItems / kitItems.length) * 100 : 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <CardTitle>Kit Items</CardTitle>
          <CardDescription>Products in your launch inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          {kitItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-title">No Items Selected</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Browse the product catalog to select items for your store opening inventory.
              </p>
              <Link href="/portal-ets/catalog">
                <Button style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white" data-testid="button-start-shopping">
                  Start Shopping <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kitItems.map((item: any) => (
                  <TableRow key={item.id} data-testid={`row-kit-${item.id}`}>
                    <TableCell className="font-medium">{item.name || `Product ${item.id}`}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{item.category || "General"}</Badge>
                    </TableCell>
                    <TableCell>{item.quantity || 0}</TableCell>
                    <TableCell>{"\u20B9"}{(item.price || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="font-medium">{"\u20B9"}{((item.price || 0) * (item.quantity || 0)).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      {item.confirmed ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          <AlertCircle className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
