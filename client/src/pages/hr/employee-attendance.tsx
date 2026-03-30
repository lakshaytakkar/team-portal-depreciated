import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, addMonths, subMonths } from "date-fns";
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Home,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { HrEmployee, Attendance } from "@shared/schema";

const statusColors: Record<string, string> = {
  present: "bg-green-500",
  absent: "bg-red-500",
  half_day: "bg-yellow-500",
  late: "bg-orange-500",
  wfh: "bg-blue-500",
  holiday: "bg-purple-500",
  weekend: "bg-gray-300",
};

const statusLabels: Record<string, string> = {
  present: "Present",
  absent: "Absent",
  half_day: "Half Day",
  late: "Late",
  wfh: "WFH",
  holiday: "Holiday",
  weekend: "Weekend",
};

export default function EmployeeAttendanceCalendar() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: employee, isLoading: loadingEmployee } = useQuery<HrEmployee>({
    queryKey: ['/api/hr/employees', id],
    enabled: !!id,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useQuery<Attendance[]>({
    queryKey: ['/api/hr/employees', id, 'attendance', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const res = await fetch(
        `/api/hr/employees/${id}/attendance?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`
      );
      if (!res.ok) throw new Error('Failed to fetch attendance');
      return res.json();
    },
    enabled: !!id,
  });

  const attendanceMap = new Map<string, Attendance>();
  attendanceRecords.forEach(record => {
    const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
    attendanceMap.set(dateKey, record);
  });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const wfhCount = attendanceRecords.filter(r => r.status === "wfh").length;
  const lateCount = attendanceRecords.filter(r => r.status === "late").length;

  const isLoading = loadingEmployee || loadingAttendance;

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/hr/employees/${id}`}>
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">
              {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <p className="text-muted-foreground">Attendance Calendar</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Work from Home</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{wfhCount}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const record = attendanceMap.get(dateKey);
              const status = record?.status;
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              
              return (
                <div
                  key={dateKey}
                  className={`
                    aspect-square p-1 border rounded-lg flex flex-col items-center justify-center gap-1
                    ${isToday(day) ? 'border-primary border-2' : 'border-muted'}
                    ${isWeekend && !status ? 'bg-muted/30' : ''}
                  `}
                  title={status ? statusLabels[status] : undefined}
                >
                  <span className={`text-sm ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {status && (
                    <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground">Legend:</span>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm">{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
