import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Laptop, 
  Smartphone, 
  Car, 
  Armchair,
  Edit2,
  Save,
  X,
  UserPlus,
  RotateCcw,
  Wrench,
  Plus,
  Calendar,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Asset, HrEmployee, AssetAssignment, AssetMaintenance } from "@shared/schema";

type AssetWithAssignee = Asset & { assignee?: HrEmployee | null };
type AssignmentWithEmployee = AssetAssignment & { employee?: HrEmployee | null };

export default function AssetDetail() {
  const { toast } = useToast();
  const [, params] = useRoute("/hr/assets/:id");
  const assetId = params?.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Asset>>({});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [returnCondition, setReturnCondition] = useState("good");
  const [returnNotes, setReturnNotes] = useState("");
  const [maintenanceData, setMaintenanceData] = useState({
    type: "repair",
    description: "",
    vendor: "",
    cost: 0,
    scheduledDate: "",
    notes: ""
  });

  const { data: asset, isLoading } = useQuery<AssetWithAssignee>({
    queryKey: ['/api/hr/assets', assetId],
    enabled: !!assetId,
  });

  const { data: assignments = [] } = useQuery<AssignmentWithEmployee[]>({
    queryKey: ['/api/hr/assets', assetId, 'assignments'],
    enabled: !!assetId,
  });

  const { data: maintenance = [] } = useQuery<AssetMaintenance[]>({
    queryKey: ['/api/hr/assets', assetId, 'maintenance'],
    enabled: !!assetId,
  });

  const { data: employees = [] } = useQuery<HrEmployee[]>({
    queryKey: ['/api/hr/employees'],
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Asset>) => 
      apiRequest('PATCH', `/api/hr/assets/${assetId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/assets', assetId] });
      setIsEditing(false);
      toast({ title: "Asset updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update asset", variant: "destructive" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (employeeId: string) => 
      apiRequest('POST', `/api/hr/assets/${assetId}/assign`, { employeeId, assignedDate: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/assets', assetId] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/assets', assetId, 'assignments'] });
      setAssignDialogOpen(false);
      setSelectedEmployeeId("");
      toast({ title: "Asset assigned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to assign asset", variant: "destructive" });
    },
  });

  const returnMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', `/api/hr/assets/${assetId}/return`, { condition: returnCondition, notes: returnNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/assets', assetId] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/assets', assetId, 'assignments'] });
      setReturnDialogOpen(false);
      setReturnCondition("good");
      setReturnNotes("");
      toast({ title: "Asset returned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to return asset", variant: "destructive" });
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: (data: typeof maintenanceData) => 
      apiRequest('POST', `/api/hr/assets/${assetId}/maintenance`, {
        ...data,
        scheduledDate: data.scheduledDate || null,
        status: 'pending'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/assets', assetId, 'maintenance'] });
      setMaintenanceDialogOpen(false);
      setMaintenanceData({ type: "repair", description: "", vendor: "", cost: 0, scheduledDate: "", notes: "" });
      toast({ title: "Maintenance record added" });
    },
    onError: () => {
      toast({ title: "Failed to add maintenance record", variant: "destructive" });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "laptop": return <Laptop className="h-5 w-5" />;
      case "mobile": return <Smartphone className="h-5 w-5" />;
      case "vehicle": return <Car className="h-5 w-5" />;
      case "furniture": return <Armchair className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
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

  const getMaintenanceStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "in_progress": return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "cancelled": return <Badge className="bg-gray-100 text-gray-700">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStartEdit = () => {
    if (asset) {
      setEditData({
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber,
        brand: asset.brand,
        model: asset.model,
        location: asset.location,
        notes: asset.notes,
        purchasePrice: asset.purchasePrice,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium">Asset not found</h2>
          <Link href="/hr/assets">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hr/assets">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{asset.name}</h1>
              <p className="text-sm text-muted-foreground">{asset.brand} {asset.model}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(asset.status)}
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleStartEdit} data-testid="button-edit-asset">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Asset Details</CardTitle>
              {isEditing && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    data-testid="button-cancel-edit"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-asset"
                  >
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  {isEditing ? (
                    <Input 
                      value={editData.name || ""} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      data-testid="input-asset-name"
                    />
                  ) : (
                    <p className="font-medium">{asset.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  {isEditing ? (
                    <Select value={editData.category} onValueChange={(v) => setEditData({...editData, category: v})}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="office_equipment">Office Equipment</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium capitalize">{asset.category.replace('_', ' ')}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Serial Number</Label>
                  {isEditing ? (
                    <Input 
                      value={editData.serialNumber || ""} 
                      onChange={(e) => setEditData({...editData, serialNumber: e.target.value})}
                      data-testid="input-serial-number"
                    />
                  ) : (
                    <p className="font-medium">{asset.serialNumber || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Brand</Label>
                  {isEditing ? (
                    <Input 
                      value={editData.brand || ""} 
                      onChange={(e) => setEditData({...editData, brand: e.target.value})}
                      data-testid="input-brand"
                    />
                  ) : (
                    <p className="font-medium">{asset.brand || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Model</Label>
                  {isEditing ? (
                    <Input 
                      value={editData.model || ""} 
                      onChange={(e) => setEditData({...editData, model: e.target.value})}
                      data-testid="input-model"
                    />
                  ) : (
                    <p className="font-medium">{asset.model || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  {isEditing ? (
                    <Select value={editData.location || ""} onValueChange={(v) => setEditData({...editData, location: v})}>
                      <SelectTrigger data-testid="select-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gurugram Office">Gurugram Office</SelectItem>
                        <SelectItem value="Rewari Office">Rewari Office</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{asset.location || "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Purchase Date</Label>
                  <p className="font-medium">{asset.purchaseDate ? format(new Date(asset.purchaseDate), 'MMM d, yyyy') : "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Purchase Price</Label>
                  {isEditing ? (
                    <Input 
                      type="number"
                      value={editData.purchasePrice || ""} 
                      onChange={(e) => setEditData({...editData, purchasePrice: parseInt(e.target.value) || 0})}
                      data-testid="input-purchase-price"
                    />
                  ) : (
                    <p className="font-medium">{asset.purchasePrice ? `₹${asset.purchasePrice.toLocaleString()}` : "-"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Warranty Expiry</Label>
                  <p className="font-medium">{asset.warrantyExpiry ? format(new Date(asset.warrantyExpiry), 'MMM d, yyyy') : "-"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  {isEditing ? (
                    <Textarea 
                      value={editData.notes || ""} 
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      className="mt-1"
                      data-testid="textarea-notes"
                    />
                  ) : (
                    <p className="font-medium">{asset.notes || "-"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.status === 'assigned' && asset.assignee ? (
                <div className="space-y-3">
                  <Link href={`/hr/employees/${asset.assignee.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted hover-elevate cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {asset.assignee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{asset.assignee.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.assignee.role}</p>
                      </div>
                    </div>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setReturnDialogOpen(true)}
                    data-testid="button-return-asset"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">This asset is not currently assigned to anyone.</p>
                  <Button 
                    className="w-full" 
                    onClick={() => setAssignDialogOpen(true)}
                    disabled={asset.status === 'repair' || asset.status === 'retired'}
                    data-testid="button-assign-asset"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Employee
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setMaintenanceDialogOpen(true)}
                data-testid="button-add-maintenance"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Add Maintenance Record
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history" data-testid="tab-assignment-history">Assignment History</TabsTrigger>
          <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance Records</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assignment history found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Returned Date</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          {assignment.employee ? (
                            <Link href={`/hr/employees/${assignment.employee.id}`}>
                              <span className="text-primary hover:underline cursor-pointer">
                                {assignment.employee.name}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(assignment.assignedDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {assignment.returnedDate 
                            ? format(new Date(assignment.returnedDate), 'MMM d, yyyy')
                            : <Badge variant="outline">Current</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{assignment.condition}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {assignment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {maintenance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No maintenance records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="capitalize">{record.type}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                        <TableCell>{record.vendor || "-"}</TableCell>
                        <TableCell>{record.cost ? `₹${record.cost.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>
                          {record.scheduledDate 
                            ? format(new Date(record.scheduledDate), 'MMM d, yyyy')
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {record.completedDate 
                            ? format(new Date(record.completedDate), 'MMM d, yyyy')
                            : "-"
                          }
                        </TableCell>
                        <TableCell>{getMaintenanceStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset to Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger data-testid="select-employee">
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active').map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.officeUnit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} data-testid="button-cancel-assign">
              Cancel
            </Button>
            <Button 
              onClick={() => assignMutation.mutate(selectedEmployeeId)}
              disabled={!selectedEmployeeId || assignMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Condition on Return</Label>
              <Select value={returnCondition} onValueChange={setReturnCondition}>
                <SelectTrigger data-testid="select-return-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Any notes about the condition..."
                data-testid="textarea-return-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)} data-testid="button-cancel-return">
              Cancel
            </Button>
            <Button 
              onClick={() => returnMutation.mutate()}
              disabled={returnMutation.isPending}
              data-testid="button-confirm-return"
            >
              {returnMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Type</Label>
              <Select 
                value={maintenanceData.type} 
                onValueChange={(v) => setMaintenanceData({...maintenanceData, type: v})}
              >
                <SelectTrigger data-testid="select-maintenance-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={maintenanceData.description}
                onChange={(e) => setMaintenanceData({...maintenanceData, description: e.target.value})}
                placeholder="Describe the maintenance work..."
                data-testid="textarea-maintenance-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vendor</Label>
                <Input 
                  value={maintenanceData.vendor}
                  onChange={(e) => setMaintenanceData({...maintenanceData, vendor: e.target.value})}
                  placeholder="Vendor name"
                  data-testid="input-maintenance-vendor"
                />
              </div>
              <div>
                <Label>Cost (₹)</Label>
                <Input 
                  type="number"
                  value={maintenanceData.cost || ""}
                  onChange={(e) => setMaintenanceData({...maintenanceData, cost: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  data-testid="input-maintenance-cost"
                />
              </div>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input 
                type="date"
                value={maintenanceData.scheduledDate}
                onChange={(e) => setMaintenanceData({...maintenanceData, scheduledDate: e.target.value})}
                data-testid="input-maintenance-date"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={maintenanceData.notes}
                onChange={(e) => setMaintenanceData({...maintenanceData, notes: e.target.value})}
                placeholder="Additional notes..."
                data-testid="textarea-maintenance-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceDialogOpen(false)} data-testid="button-cancel-maintenance">
              Cancel
            </Button>
            <Button 
              onClick={() => maintenanceMutation.mutate(maintenanceData)}
              disabled={!maintenanceData.description || maintenanceMutation.isPending}
              data-testid="button-confirm-maintenance"
            >
              {maintenanceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
