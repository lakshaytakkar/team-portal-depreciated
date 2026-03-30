import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  Edit, 
  Save, 
  X,
  FileText,
  Package,
  Loader2,
  Plus,
  Trash2,
  Upload,
  CreditCard,
  User,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { HrEmployee, EmployeeDocument, AssetAssignment, Asset } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<HrEmployee>>({});

  const { data: employee, isLoading } = useQuery<HrEmployee>({
    queryKey: ['/api/hr/employees', id],
  });

  const { data: documents = [] } = useQuery<EmployeeDocument[]>({
    queryKey: ['/api/hr/employees', id, 'documents'],
    enabled: !!id,
  });

  const { data: assignedAssets = [] } = useQuery<AssetAssignment[]>({
    queryKey: ['/api/hr/employees', id, 'assets'],
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HrEmployee>) => {
      return apiRequest('PATCH', `/api/hr/employees/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/employees', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/employees'] });
      toast({ title: "Employee updated successfully" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update employee", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const startEdit = () => {
    if (employee) {
      setEditData({
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
        officeUnit: employee.officeUnit,
        status: employee.status,
        isSalesTeam: employee.isSalesTeam,
      });
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setEditData({});
    setIsEditing(false);
  };

  const saveEdit = () => {
    updateMutation.mutate(editData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Employee not found</p>
        <Link href="/hr/employees">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </Link>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Manager": return "default";
      case "Executive": return "secondary";
      case "Intern": return "outline";
      default: return "secondary";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "on_leave": return <Badge className="bg-yellow-100 text-yellow-700">On Leave</Badge>;
      case "terminated": return <Badge className="bg-red-100 text-red-700">Terminated</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/employees">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Employee Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={employee.profilePicture || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isEditing ? (
                <div className="w-full space-y-4">
                  <Input
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Name"
                    data-testid="input-edit-name"
                  />
                  <Input
                    value={editData.phone || ""}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Phone"
                    data-testid="input-edit-phone"
                  />
                  <Input
                    value={editData.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Email"
                    type="email"
                    data-testid="input-edit-email"
                  />
                  <Select
                    value={editData.role}
                    onValueChange={(value) => setEditData({ ...editData, role: value })}
                  >
                    <SelectTrigger data-testid="select-edit-role">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={editData.officeUnit}
                    onValueChange={(value) => setEditData({ ...editData, officeUnit: value })}
                  >
                    <SelectTrigger data-testid="select-edit-office">
                      <SelectValue placeholder="Office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gurugram Office">Gurugram Office</SelectItem>
                      <SelectItem value="Rewari Office">Rewari Office</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger data-testid="select-edit-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={saveEdit} disabled={updateMutation.isPending} className="flex-1" data-testid="button-save">
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} data-testid="button-cancel">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{employee.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getRoleBadgeVariant(employee.role)}>{employee.role}</Badge>
                    {getStatusBadge(employee.status)}
                    {employee.isSalesTeam && (
                      <Badge variant="outline">Sales Team</Badge>
                    )}
                  </div>

                  <div className="w-full mt-6 space-y-3 text-left">
                    {employee.phone && (
                      <a href={`tel:${employee.phone}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.phone}</span>
                      </a>
                    )}
                    {employee.email && (
                      <a href={`mailto:${employee.email}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.email}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-3 p-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.officeUnit}</span>
                    </div>
                    {employee.dateOfJoining && (
                      <div className="flex items-center gap-3 p-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined {format(new Date(employee.dateOfJoining), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <Button onClick={startEdit} variant="outline" className="mt-4 w-full" data-testid="button-edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2" data-testid="tab-personal">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-2" data-testid="tab-bank">
                <CreditCard className="h-4 w-4" />
                Bank
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2" data-testid="tab-documents">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2" data-testid="tab-assets">
                <Package className="h-4 w-4" />
                Assets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Father's Name</p>
                      <p className="font-medium">{employee.fatherName || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Relation</p>
                      <p className="font-medium">{employee.relation || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'MMM dd, yyyy') : '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Employment Type</p>
                      <Badge variant="outline">{employee.employmentType || 'FTE'}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">PAN Card</p>
                      <p className="font-medium font-mono">{employee.panCard || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Aadhar Address</p>
                      <p className="font-medium">{employee.aadharAddress || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">PF Enabled</p>
                      <Badge variant={employee.pfEnabled ? 'default' : 'secondary'}>{employee.pfEnabled ? 'Yes' : 'No'}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ESIC Enabled</p>
                      <Badge variant={employee.esicEnabled ? 'default' : 'secondary'}>{employee.esicEnabled ? 'Yes' : 'No'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    <span>Bank Details</span>
                    {employee.bankVerificationStatus && (
                      <Badge variant={employee.bankVerificationStatus === 'verified' ? 'default' : employee.bankVerificationStatus === 'failed' ? 'destructive' : 'secondary'}>
                        {employee.bankVerificationStatus}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.bankName || employee.accountNumber ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 border rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Bank Name</p>
                            <p className="font-medium">{employee.bankName || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">IFSC Code</p>
                            <p className="font-medium font-mono">{employee.ifscCode || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium font-mono text-lg">{employee.accountNumber || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No bank details added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <Button size="sm" variant="outline" data-testid="button-upload-document">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{doc.type}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No documents uploaded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg">Assigned Assets</CardTitle>
                  <Button size="sm" variant="outline" data-testid="button-assign-asset">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Asset
                  </Button>
                </CardHeader>
                <CardContent>
                  {assignedAssets.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Condition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedAssets.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell>{assignment.assetId}</TableCell>
                            <TableCell>{format(new Date(assignment.assignedDate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignment.condition}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No assets assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
