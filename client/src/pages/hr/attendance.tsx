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
import { format, addDays, subDays } from "date-fns";
import { Link } from "wouter";
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Clock,
  Home,
  Loader2,
  Check,
  Save
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { HrEmployee, Attendance } from "@shared/schema";

const attendanceStatuses = [
  { value: "present", label: "Present", color: "bg-green-100 text-green-800" },
  { value: "absent", label: "Absent", color: "bg-red-100 text-red-800" },
  { value: "half_day", label: "Half Day", color: "bg-yellow-100 text-yellow-800" },
  { value: "late", label: "Late", color: "bg-orange-100 text-orange-800" },
  { value: "wfh", label: "WFH", color: "bg-blue-100 text-blue-800" },
  { value: "holiday", label: "Holiday", color: "bg-purple-100 text-purple-800" },
  { value: "weekend", label: "Weekend", color: "bg-gray-100 text-gray-600" },
];

export default function HRAttendance() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [officeFilter, setOfficeFilter] = useState("all");
  const [attendanceChanges, setAttendanceChanges] = useState<Record<string, string>>({});

  const { data: employees = [], isLoading: loadingEmployees } = useQuery<HrEmployee[]>({
    queryKey: ['/api/hr/employees'],
  });

  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useQuery<Attendance[]>({
    queryKey: ['/api/hr/attendance', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(`/api/hr/attendance?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (records: { employeeId: string; status: string; date: string }[]) => {
      return apiRequest('POST', '/api/hr/attendance/bulk', { records });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/attendance'] });
      setAttendanceChanges({});
      toast({ title: "Attendance saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save attendance", description: error.message, variant: "destructive" });
    },
  });

  const activeEmployees = employees.filter(e => e.status === "active");
  const filteredEmployees = activeEmployees.filter(emp => 
    officeFilter === "all" || emp.officeUnit === officeFilter
  );

  const attendanceMap = new Map<string, Attendance>();
  attendanceRecords.forEach(record => {
    attendanceMap.set(record.employeeId, record);
  });

  const getEmployeeStatus = (employeeId: string) => {
    if (attendanceChanges[employeeId]) return attendanceChanges[employeeId];
    const record = attendanceMap.get(employeeId);
    return record?.status || "";
  };

  const handleStatusChange = (employeeId: string, status: string) => {
    setAttendanceChanges(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  const handleSaveAll = () => {
    const records = Object.entries(attendanceChanges).map(([employeeId, status]) => ({
      employeeId,
      status,
      date: selectedDate.toISOString(),
    }));
    
    if (records.length === 0) {
      toast({ title: "No changes to save", variant: "destructive" });
      return;
    }
    
    saveMutation.mutate(records);
  };

  const handleMarkAllPresent = () => {
    const changes: Record<string, string> = {};
    filteredEmployees.forEach(emp => {
      if (!attendanceMap.has(emp.id)) {
        changes[emp.id] = "present";
      }
    });
    setAttendanceChanges(prev => ({ ...prev, ...changes }));
  };

  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const wfhCount = attendanceRecords.filter(r => r.status === "wfh").length;
  const lateCount = attendanceRecords.filter(r => r.status === "late").length;

  const isLoading = loadingEmployees || loadingAttendance;

  const getStatusBadge = (status: string) => {
    const statusConfig = attendanceStatuses.find(s => s.value === status);
    if (!statusConfig) return null;
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track and manage daily employee attendance</p>
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(attendanceChanges).length > 0 && (
            <Button onClick={handleSaveAll} disabled={saveMutation.isPending} data-testid="button-save-attendance">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes ({Object.keys(attendanceChanges).length})
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedDate(d => subDays(d, 1))}
            data-testid="button-prev-day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 min-w-[180px] justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedDate(d => addDays(d, 1))}
            data-testid="button-next-day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Input 
          type="date" 
          value={format(selectedDate, 'yyyy-MM-dd')} 
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-auto"
          data-testid="input-date-picker"
        />

        <Select value={officeFilter} onValueChange={setOfficeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-office-filter">
            <SelectValue placeholder="Filter by office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            <SelectItem value="Gurugram Office">Gurugram Office</SelectItem>
            <SelectItem value="Rewari Office">Rewari Office</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleMarkAllPresent} data-testid="button-mark-all-present">
          <Check className="h-4 w-4 mr-2" />
          Mark All Present
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">employees marked present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">employees absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Work from Home</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{wfhCount}</div>
            <p className="text-xs text-muted-foreground">employees WFH</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground">employees late today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Employee</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Mark Attendance</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const currentStatus = getEmployeeStatus(employee.id);
                  const existingRecord = attendanceMap.get(employee.id);
                  const hasChange = attendanceChanges[employee.id] !== undefined;
                  
                  return (
                    <TableRow key={employee.id} className={hasChange ? "bg-yellow-50" : ""}>
                      <TableCell>
                        <Link href={`/hr/employees/${employee.id}`}>
                          <div className="flex items-center gap-3 hover:underline cursor-pointer">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-muted-foreground">{employee.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.officeUnit}</Badge>
                      </TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        {currentStatus ? getStatusBadge(currentStatus) : (
                          <span className="text-muted-foreground text-sm">Not marked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={attendanceChanges[employee.id] || ""} 
                          onValueChange={(value) => handleStatusChange(employee.id, value)}
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-status-${employee.id}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {attendanceStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="time"
                          className="w-[100px]"
                          defaultValue={existingRecord?.checkInTime || ""}
                          data-testid={`input-checkin-${employee.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="time"
                          className="w-[100px]"
                          defaultValue={existingRecord?.checkOutTime || ""}
                          data-testid={`input-checkout-${employee.id}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
