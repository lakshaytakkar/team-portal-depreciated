import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Shield, ShieldCheck, User, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import type { User as UserType } from "@shared/schema";

const ROLES = ["sales_executive", "superadmin"];

export default function UserManagementPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; isActive?: boolean } }) => apiRequest("PATCH", `/api/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({ title: "User updated" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleIcon = (role: string) => {
    switch (role) {
      case "superadmin": return <ShieldCheck className="h-4 w-4 text-amber-500" />;
      default: return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case "superadmin": return "default" as const;
      default: return "secondary" as const;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">User Management</h1>
        <p className="text-muted-foreground">{users.length} total users</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><User className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-users">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><UserCheck className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-active-users">{users.filter(u => u.isActive !== false).length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-admin-users">{users.filter(u => u.role === "superadmin").length}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input data-testid="input-search-users" placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{user.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium" data-testid={`text-user-name-${user.id}`}>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {roleIcon(user.role || "sales_executive")}
                      <Badge variant={roleBadge(user.role || "sales_executive")}>{(user.role || "sales_executive").replace(/_/g, " ")}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive !== false ? "default" : "destructive"}>
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" data-testid={`button-edit-user-${user.id}`} onClick={() => { setEditingUser(user); setEditRole(user.role || "sales_executive"); setEditIsActive(user.isActive !== false); }}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(o) => { if (!o) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User: {editingUser?.name}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger data-testid="select-user-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editIsActive ? "active" : "inactive"} onValueChange={v => setEditIsActive(v === "active")}>
                <SelectTrigger data-testid="select-user-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel">Cancel</Button>
            <Button onClick={() => editingUser && updateMutation.mutate({ id: editingUser.id, data: { role: editRole, isActive: editIsActive } })} data-testid="button-save-user">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
