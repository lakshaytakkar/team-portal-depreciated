import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, CheckCircle2, XCircle, Clock, UserX, Calendar, RefreshCw, Users, BarChart3 } from "lucide-react";

interface BookingRecord {
  id: string;
  bookingTypeId: string;
  hostUserId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startTime: string;
  endTime: string;
  status: string;
  internalNotes?: string;
  cancellationReason?: string;
  createdAt: string;
}

interface BookingType { id: string; title: string; color: string; userId: string; }
interface UserInfo { id: string; name: string; email: string; }

function statusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">Confirmed</Badge>;
    case "completed": return <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">Completed</Badge>;
    case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
    case "no_show": return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">No Show</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function AllBookingsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostFilter, setHostFilter] = useState("all");

  const { data: allBookings = [], isLoading, refetch } = useQuery<BookingRecord[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: types = [] } = useQuery<BookingType[]>({
    queryKey: ["/api/booking-types"],
  });

  const { data: users = [] } = useQuery<UserInfo[]>({
    queryKey: ["/api/users"],
  });

  const typesMap = Object.fromEntries(types.map(t => [t.id, t]));
  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

  const hostUsers = [...new Set(allBookings.map(b => b.hostUserId))].map(id => usersMap[id]).filter(Boolean);

  const filtered = allBookings.filter(b => {
    const matchesSearch = !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesHost = hostFilter === "all" || b.hostUserId === hostFilter;
    return matchesSearch && matchesStatus && matchesHost;
  });

  const now = new Date();
  const stats = {
    total: allBookings.length,
    upcoming: allBookings.filter(b => new Date(b.startTime) >= now && b.status === "confirmed").length,
    completed: allBookings.filter(b => b.status === "completed").length,
    noShow: allBookings.filter(b => b.status === "no_show").length,
    cancelled: allBookings.filter(b => b.status === "cancelled").length,
    completionRate: allBookings.length > 0 ? Math.round((allBookings.filter(b => b.status === "completed").length / allBookings.filter(b => ["completed", "no_show", "cancelled"].includes(b.status)).length) * 100) || 0 : 0,
  };

  const repStats = hostUsers.map(u => {
    const repBookings = allBookings.filter(b => b.hostUserId === u.id);
    return {
      ...u,
      total: repBookings.length,
      completed: repBookings.filter(b => b.status === "completed").length,
      noShow: repBookings.filter(b => b.status === "no_show").length,
      upcoming: repBookings.filter(b => new Date(b.startTime) >= now && b.status === "confirmed").length,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">All Team Bookings</h1>
          <p className="text-sm text-muted-foreground">Overview of all bookings across team members</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Calendar, color: "text-foreground" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600" },
          { label: "No Shows", value: stats.noShow, icon: UserX, color: "text-yellow-600" },
          { label: "Completion %", value: `${stats.completionRate}%`, icon: BarChart3, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
                </div>
                <Icon className={`h-4 w-4 ${color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {repStats.length > 0 && (
        <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
          <CardContent className="pt-5 pb-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Per Rep Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {repStats.map(rep => (
                <div key={rep.id} className="flex items-center gap-3 p-3 rounded-lg border" data-testid={`rep-stat-${rep.id}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {rep.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rep.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{rep.total} total</span>
                      <span className="text-green-600">{rep.completed} done</span>
                      <span className="text-blue-600">{rep.upcoming} upcoming</span>
                      {rep.noShow > 0 && <span className="text-yellow-600">{rep.noShow} no-show</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="input-search" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36" data-testid="select-status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hostFilter} onValueChange={setHostFilter}>
          <SelectTrigger className="w-44" data-testid="select-host-filter"><SelectValue placeholder="All Reps" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reps</SelectItem>
            {hostUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rep</TableHead>
              <TableHead>Meeting</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
            ) : filtered.map(b => {
              const bt = typesMap[b.bookingTypeId];
              const host = usersMap[b.hostUserId];
              const start = new Date(b.startTime);
              return (
                <TableRow key={b.id} data-testid={`row-booking-${b.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{b.customerName}</p>
                      <p className="text-xs text-muted-foreground">{b.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{host?.name || "Unknown"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {bt && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bt.color }} />}
                      <span className="text-sm">{bt?.title || "Meeting"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                      <p className="text-xs text-muted-foreground">{start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(b.status)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}