import { useState } from "react";
import {
  User, Mail, Phone, Edit2, Save, X, Building2, Shield, Lock, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CLIENT_PROFILE, RM_CONTACT } from "@/lib/mock-data-dashboard-ln";

const PACKAGE_COLORS: Record<string, { bg: string; text: string }> = {
  Basic: { bg: "bg-gray-100", text: "text-gray-700" },
  Standard: { bg: "bg-blue-100", text: "text-blue-700" },
  Premium: { bg: "bg-violet-100", text: "text-violet-700" },
};

const statusLabels: Record<string, { label: string; cls: string }> = {
  forming: { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  dissolved: { label: "Dissolved", cls: "bg-gray-50 text-gray-500 border-gray-200" },
};

export default function LnProfile() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: CLIENT_PROFILE.name,
    email: CLIENT_PROFILE.email,
    phone: CLIENT_PROFILE.phone,
  });
  const [draft, setDraft] = useState({ ...profile });

  const initials = profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  function startEdit() { setDraft({ ...profile }); setEditing(true); }
  function cancelEdit() { setDraft({ ...profile }); setEditing(false); }
  function saveEdit() {
    setProfile({ ...draft });
    setEditing(false);
    toast({ title: "Profile Saved", description: "Your profile has been updated successfully." });
  }

  return (
    <div className="p-6 space-y-6" data-testid="ln-profile-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">My Profile</h1>
          <p className="text-muted-foreground text-sm">Your account information and company details.</p>
        </div>
        {!editing ? (
          <Button onClick={startEdit} variant="outline" className="gap-2" data-testid="button-edit-profile">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={cancelEdit} variant="outline" className="gap-2" data-testid="button-cancel-edit">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 text-white gap-2" data-testid="button-save-profile">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-xl border bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-2xl font-bold text-white bg-blue-600" data-testid="text-avatar">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mb-1" data-testid="text-profile-name">{profile.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Client ID: <span className="font-medium" data-testid="text-client-id">{CLIENT_PROFILE.id}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              Member since {new Date(CLIENT_PROFILE.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>

            <div className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-800">Assigned Specialist</p>
              </div>
              <p className="text-sm font-semibold text-blue-900" data-testid="text-specialist-name">{RM_CONTACT.name}</p>
              <p className="text-xs text-blue-700 mt-0.5" data-testid="text-specialist-role">{RM_CONTACT.role}</p>
              <p className="text-xs text-blue-600 mt-0.5">{RM_CONTACT.email}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Read-only · Assigned by LegalNations</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-5">
          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  {editing ? (
                    <Input value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))} data-testid="input-profile-name" />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-name">{profile.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  {editing ? (
                    <Input value={draft.phone} onChange={e => setDraft(prev => ({ ...prev, phone: e.target.value }))} data-testid="input-profile-phone" />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-phone">{profile.phone}</p>
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  {editing ? (
                    <Input type="email" value={draft.email} onChange={e => setDraft(prev => ({ ...prev, email: e.target.value }))} data-testid="input-profile-email" />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-email">{profile.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> My Companies
                <Badge variant="outline" className="text-[10px] font-normal ml-1">Read-only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {CLIENT_PROFILE.companies.map(company => {
                const pkg = PACKAGE_COLORS[company.packageTier] || PACKAGE_COLORS.Standard;
                const st = statusLabels[company.status] || statusLabels.forming;
                return (
                  <div key={company.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border" data-testid={`profile-company-${company.id}`}>
                    <div className={cn(
                      "size-10 rounded-lg flex items-center justify-center",
                      company.status === "completed" || company.status === "active" ? "bg-emerald-100" : "bg-blue-100"
                    )}>
                      <Building2 className={cn("size-5", company.status === "completed" || company.status === "active" ? "text-emerald-600" : "text-blue-600")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.entityType} · {company.state}</p>
                    </div>
                    <Badge className={cn("text-[10px] border-0", pkg.bg, pkg.text)}>{company.packageTier}</Badge>
                    <Badge variant="outline" className={cn("text-[10px]", st.cls)}>{st.label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> Account Details
                <Badge variant="outline" className="text-[10px] font-normal ml-1">Read-only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Client ID</p>
                  <p className="text-sm font-semibold font-mono" data-testid="text-account-client-id">{CLIENT_PROFILE.id}</p>
                  <p className="text-xs text-muted-foreground mt-2">Use this ID for all support communications.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Member Since</p>
                  <p className="text-sm font-semibold" data-testid="text-account-joined">
                    {new Date(CLIENT_PROFILE.joinedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Account creation date.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
