import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEtsRole } from "@/lib/use-ets-role";
import {
  Users, UserPlus, Eye, EyeOff, Info, Key, Pencil, UserX,
} from "lucide-react";
import {
  getStaffMembers, addStaffMember, updateStaffMember,
  type EtsStaffMember,
} from "@/lib/mock-data-ets-store";

function PinField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      {label && <Label className="text-xs font-medium">{label}</Label>}
      <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          placeholder="4-digit PIN"
          value={value}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            onChange(v);
          }}
          className="pl-9 pr-9 font-mono tracking-widest"
          data-testid="input-pin"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
          data-testid="button-toggle-pin"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

interface StaffFormData {
  name: string;
  phone: string;
  role: "owner" | "cashier";
  pin: string;
}

const EMPTY_FORM: StaffFormData = { name: "", phone: "", role: "cashier", pin: "" };

export default function EtsTeamSettings() {
  const { subRole, setSubRole, isCashier } = useEtsRole();
  const [staff, setStaff] = useState<EtsStaffMember[]>(() => getStaffMembers());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const toggleCashierMode = () => {
    setSubRole(isCashier ? "owner" : "cashier");
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (member: EtsStaffMember) => {
    setEditingId(member.id);
    setFormData({ name: member.name, phone: member.phone, role: member.role, pin: member.pin });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) { setFormError("Name is required."); return; }
    if (!formData.phone.trim()) { setFormError("Phone is required."); return; }
    if (formData.pin.length !== 4) { setFormError("PIN must be exactly 4 digits."); return; }

    if (editingId) {
      updateStaffMember(editingId, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        pin: formData.pin,
      });
      setStaff(getStaffMembers());
    } else {
      addStaffMember({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        pin: formData.pin,
        active: true,
      });
      setStaff(getStaffMembers());
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;
    updateStaffMember(id, { active: !member.active });
    setStaff(getStaffMembers());
  };

  const toggleRole = (id: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;
    updateStaffMember(id, { role: member.role === "cashier" ? "owner" : "cashier" });
    setStaff(getStaffMembers());
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="team-settings-page">
      <div>
        <h1 className="text-xl font-bold">Team Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your store staff and access roles</p>
      </div>

      <Card className="border-orange-200 bg-orange-50/40 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-800">Cashier Mode</p>
              <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                When a staff member logs in with the cashier role, they can only access POS Billing and Stock Receive.
                Reports, settings, payments, and financial data are hidden from cashiers.
                Each cashier has a 4-digit PIN for identifying who processed a sale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" /> Preview Role (Dev Mode)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50/50" data-testid="cashier-mode-toggle">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCashier ? "bg-amber-100" : "bg-orange-100"}`}>
                {isCashier ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-orange-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{isCashier ? "Currently in Cashier Mode" : "Currently in Owner Mode"}</p>
                <p className="text-xs text-muted-foreground">
                  {isCashier
                    ? "You see only POS Billing & Stock Receive (as staff would)"
                    : "You see all store features as the owner"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="cashier-switch" className="text-xs font-medium text-muted-foreground">
                Cashier view
              </Label>
              <Switch
                id="cashier-switch"
                checked={isCashier}
                onCheckedChange={toggleCashierMode}
                data-testid="switch-cashier-mode"
              />
            </div>
          </div>
          {isCashier && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Cashier view is active. Switch back to owner mode to see all features.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" /> Staff Members
            </CardTitle>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1 h-7 text-xs" onClick={openAdd} data-testid="button-add-staff">
              <UserPlus className="w-3.5 h-3.5" /> Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-4 rounded-xl border ${!member.active ? "opacity-60 bg-muted/20" : "bg-white"}`}
              data-testid={`staff-member-${member.id}`}
            >
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0">
                {member.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.phone}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Key className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">••••</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-[10px] cursor-pointer select-none ${member.role === "cashier" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-orange-300 text-orange-700 bg-orange-50"}`}
                  onClick={() => toggleRole(member.id)}
                  data-testid={`toggle-role-${member.id}`}
                >
                  {member.role === "cashier" ? "Cashier" : "Co-owner"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-orange-600"
                  onClick={() => openEdit(member)}
                  data-testid={`button-edit-${member.id}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${member.active ? "text-muted-foreground hover:text-red-500" : "text-green-500 hover:text-green-700"}`}
                  onClick={() => toggleActive(member.id)}
                  data-testid={`toggle-active-${member.id}`}
                  title={member.active ? "Deactivate staff" : "Activate staff"}
                >
                  <UserX className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div className="p-4 rounded-xl border border-dashed text-center">
              <p className="text-xs text-muted-foreground">No staff members yet. Add your first cashier.</p>
            </div>
          )}

          <div className="p-4 rounded-xl border border-dashed text-center">
            <p className="text-xs text-muted-foreground">Click the role badge to toggle between Cashier and Co-owner · Click <Pencil className="inline w-3 h-3" /> to edit PIN</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Access Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { feature: "POS Billing", owner: true, cashier: true },
              { feature: "Stock Receive", owner: true, cashier: true },
              { feature: "Held Bills", owner: true, cashier: true },
              { feature: "Inventory", owner: true, cashier: false },
              { feature: "Daily Report", owner: true, cashier: false },
              { feature: "Payments", owner: true, cashier: false },
              { feature: "Store Settings", owner: true, cashier: false },
              { feature: "Returns", owner: true, cashier: false },
              { feature: "Cash Register", owner: true, cashier: false },
            ].map((item) => (
              <div key={item.feature} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30" data-testid={`access-row-${item.feature.toLowerCase().replace(/\s+/g, "-")}`}>
                <span className="text-xs font-medium">{item.feature}</span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Owner ✓</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.cashier ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"}`}>
                    {item.cashier ? "Cashier ✓" : "Cashier ✗"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-testid="staff-dialog">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Full Name</Label>
              <Input
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                data-testid="input-staff-name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Phone Number</Label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                data-testid="input-staff-phone"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Role</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.role === "cashier" ? "default" : "outline"}
                  size="sm"
                  className={formData.role === "cashier" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  onClick={() => setFormData(f => ({ ...f, role: "cashier" }))}
                  data-testid="button-role-cashier"
                >
                  Cashier
                </Button>
                <Button
                  type="button"
                  variant={formData.role === "owner" ? "default" : "outline"}
                  size="sm"
                  className={formData.role === "owner" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  onClick={() => setFormData(f => ({ ...f, role: "owner" }))}
                  data-testid="button-role-owner"
                >
                  Co-owner
                </Button>
              </div>
            </div>
            <PinField
              label="4-Digit PIN"
              value={formData.pin}
              onChange={pin => setFormData(f => ({ ...f, pin }))}
            />
            {formError && (
              <p className="text-xs text-red-500" data-testid="text-form-error">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave} data-testid="button-save-staff">
              {editingId ? "Save Changes" : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
