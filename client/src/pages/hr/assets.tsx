import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Link } from "wouter";
import { 
  Search, 
  Plus, 
  Package,
  Laptop,
  Smartphone,
  Wrench,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@shared/schema";
import { AddAssetDialog } from "@/components/dialogs/AddAssetDialog";

export default function Assets() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ['/api/hr/assets'],
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      (asset.serialNumber?.toLowerCase().includes(search.toLowerCase())) ||
      (asset.brand?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = assets.filter(a => a.status === "available").length;
  const assignedCount = assets.filter(a => a.status === "assigned").length;
  const repairCount = assets.filter(a => a.status === "repair").length;
  const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "laptop": return <Laptop className="h-4 w-4" />;
      case "mobile": return <Smartphone className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available": return <Badge className="bg-green-100 text-green-700">Available</Badge>;
      case "assigned": return <Badge className="bg-blue-100 text-blue-700">Assigned</Badge>;
      case "repair": return <Badge className="bg-yellow-100 text-yellow-700">In Repair</Badge>;
      case "retired": return <Badge className="bg-gray-100 text-gray-700">Retired</Badge>;
      case "lost": return <Badge className="bg-red-100 text-red-700">Lost</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Assets</h1>
          <p className="text-muted-foreground">Manage company assets and assignments</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-asset">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-assets">{assets.length}</div>
            <p className="text-xs text-muted-foreground">Total value: ₹{totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-available-count">{availableCount}</div>
            <p className="text-xs text-muted-foreground">ready to assign</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-assigned-count">{assignedCount}</div>
            <p className="text-xs text-muted-foreground">currently in use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Repair</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-repair-count">{repairCount}</div>
            <p className="text-xs text-muted-foreground">under maintenance</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, serial number, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-assets"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="laptop">Laptop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="office_equipment">Office Equipment</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="repair">In Repair</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Serial No.</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Purchase Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id} data-testid={`row-asset-${asset.id}`}>
                <TableCell>
                  <Link href={`/hr/assets/${asset.id}`}>
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.brand && asset.model && (
                          <p className="text-sm text-muted-foreground">{asset.brand} {asset.model}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{asset.category.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>
                  {asset.serialNumber || <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell>
                  {asset.location || <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {asset.purchasePrice && (
                      <p>₹{asset.purchasePrice.toLocaleString()}</p>
                    )}
                    {asset.purchaseDate && (
                      <p className="text-muted-foreground">
                        {format(new Date(asset.purchaseDate), 'MMM yyyy')}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(asset.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-asset-menu-${asset.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/hr/assets/${asset.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      {asset.status === "available" && (
                        <DropdownMenuItem>Assign to Employee</DropdownMenuItem>
                      )}
                      {asset.status === "assigned" && (
                        <DropdownMenuItem>Mark as Returned</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Add Maintenance Record</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {search || categoryFilter !== "all" || statusFilter !== "all" 
                    ? "No assets match your filters" 
                    : "No assets yet. Add your first asset!"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AddAssetDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
