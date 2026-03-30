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
  Phone, 
  Mail,
  Building,
  Users,
  UserCheck,
  Clock,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { HrEmployee } from "@shared/schema";
import { AddEmployeeDialog } from "@/components/dialogs/AddEmployeeDialog";

export default function HREmployees() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: employees = [], isLoading } = useQuery<HrEmployee[]>({
    queryKey: ['/api/hr/employees'],
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email?.toLowerCase().includes(search.toLowerCase())) ||
      (emp.phone?.includes(search));
    
    const matchesOffice = officeFilter === "all" || emp.officeUnit === officeFilter;
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    
    return matchesSearch && matchesOffice && matchesRole;
  });

  const gurugramCount = employees.filter(e => e.officeUnit === "Gurugram Office").length;
  const rewariCount = employees.filter(e => e.officeUnit === "Rewari Office").length;
  const salesTeamCount = employees.filter(e => e.isSalesTeam).length;
  const activeCount = employees.filter(e => e.status === "active").length;

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
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-employees">{employees.length}</div>
            <p className="text-xs text-muted-foreground">{activeCount} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gurugram Office</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-gurugram-count">{gurugramCount}</div>
            <p className="text-xs text-muted-foreground">team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewari Office</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rewari-count">{rewariCount}</div>
            <p className="text-xs text-muted-foreground">team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Team</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-sales-count">{salesTeamCount}</div>
            <p className="text-xs text-muted-foreground">sales executives</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-employees"
          />
        </div>
        <Select value={officeFilter} onValueChange={setOfficeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-office-filter">
            <SelectValue placeholder="All Offices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            <SelectItem value="Gurugram Office">Gurugram Office</SelectItem>
            <SelectItem value="Rewari Office">Rewari Office</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-role-filter">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
            <SelectItem value="Intern">Intern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                <TableCell>
                  <Link href={`/hr/employees/${employee.id}`}>
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.profilePicture || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        {employee.isSalesTeam && (
                          <Badge variant="outline" className="text-xs">Sales Team</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {employee.phone && (
                      <a href={`tel:${employee.phone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </a>
                    )}
                    {employee.email && (
                      <a href={`mailto:${employee.email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(employee.role)}>{employee.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    {employee.officeUnit}
                  </div>
                </TableCell>
                <TableCell>
                  {employee.dateOfJoining ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(employee.dateOfJoining), 'MMM dd, yyyy')}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(employee.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-employee-menu-${employee.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/hr/employees/${employee.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      {employee.phone && (
                        <DropdownMenuItem asChild>
                          <a href={`tel:${employee.phone}`}>Call</a>
                        </DropdownMenuItem>
                      )}
                      {employee.email && (
                        <DropdownMenuItem asChild>
                          <a href={`mailto:${employee.email}`}>Send Email</a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {search || officeFilter !== "all" || roleFilter !== "all" 
                    ? "No employees match your filters" 
                    : "No employees yet. Add your first employee!"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AddEmployeeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
