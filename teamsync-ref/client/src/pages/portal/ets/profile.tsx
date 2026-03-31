import { useState } from "react";
import {
  User, Mail, Phone, MapPin, Store, Building2, Shield, CreditCard,
  Edit2, Save, X, Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { PARTNER_PROFILE, type PartnerProfile } from "@/lib/mock-data-dashboard-ets";
import { STORE_SETTINGS } from "@/lib/mock-data-pos-ets";

const PACKAGE_COLORS: Record<string, { bg: string; text: string }> = {
  Lite: { bg: "bg-blue-100", text: "text-blue-700" },
  Pro: { bg: "bg-orange-100", text: "text-orange-700" },
  Elite: { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function EtsPortalProfile() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile>({ ...PARTNER_PROFILE });
  const [draft, setDraft] = useState<PartnerProfile>({ ...PARTNER_PROFILE });

  const initials = profile.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pkgColors = PACKAGE_COLORS[profile.packageTier] || PACKAGE_COLORS.Pro;

  function startEdit() {
    setDraft({ ...profile });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft({ ...profile });
    setEditing(false);
  }

  function saveEdit() {
    Object.assign(PARTNER_PROFILE, draft);
    if (draft.storeName !== profile.storeName) {
      STORE_SETTINGS.storeName = draft.storeName;
    }
    setProfile({ ...draft });
    setEditing(false);
    toast({ title: "Profile Saved", description: "Your profile has been updated successfully." });
  }

  function update(field: keyof PartnerProfile, value: string) {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-profile">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-profile-title">My Profile</h1>
          <p className="text-muted-foreground text-sm">Your account information and store details.</p>
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
            <Button
              onClick={saveEdit}
              style={{ backgroundColor: ETS_PORTAL_COLOR }}
              className="text-white gap-2"
              data-testid="button-save-profile"
            >
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-xl border bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback
                className="text-2xl font-bold text-white"
                style={{ backgroundColor: ETS_PORTAL_COLOR }}
                data-testid="text-avatar-initials"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mb-1" data-testid="text-profile-name">{profile.name}</h2>
            <div className="flex flex-col items-center gap-2 mt-1">
              <Badge
                className={`${pkgColors.bg} ${pkgColors.text} border-0 font-semibold`}
                data-testid="badge-package-tier"
              >
                {profile.packageTier} Partner
              </Badge>
              <p className="text-sm text-muted-foreground">
                Partner ID: <span className="font-medium" data-testid="text-partner-id">ETS-{String(profile.id).padStart(4, "0")}</span>
              </p>
            </div>

            <div className="mt-5 w-full rounded-xl border border-green-200 bg-green-50/50 p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-green-800">Relationship Manager</p>
              </div>
              <p className="text-sm font-semibold text-green-900" data-testid="text-rm-name">{profile.rmName}</p>
              <p className="text-xs text-green-700 mt-0.5" data-testid="text-rm-phone">{profile.rmPhone}</p>
              <a
                href={`https://wa.me/${profile.rmWhatsApp}?text=${encodeURIComponent(`Hi, I need help with my store ${profile.storeName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block"
              >
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs gap-1" data-testid="button-whatsapp-rm-profile">
                  WhatsApp Manager
                </Button>
              </a>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Read-only · Assigned by EazyToSell</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-5">
          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  {editing ? (
                    <Input
                      value={draft.name}
                      onChange={e => update("name", e.target.value)}
                      data-testid="input-profile-name"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-name">{profile.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  {editing ? (
                    <Input
                      value={draft.phone}
                      onChange={e => update("phone", e.target.value)}
                      data-testid="input-profile-phone"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-phone">{profile.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  {editing ? (
                    <Input
                      type="email"
                      value={draft.email}
                      onChange={e => update("email", e.target.value)}
                      data-testid="input-profile-email"
                    />
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
                <Store className="w-4 h-4 text-orange-500" /> Store Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Store Name</Label>
                  {editing ? (
                    <Input
                      value={draft.storeName}
                      onChange={e => update("storeName", e.target.value)}
                      data-testid="input-profile-store-name"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-store-name">{profile.storeName}</p>
                  )}
                  {editing && (
                    <p className="text-xs text-muted-foreground">Changes here will also update your POS receipts.</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Store Address</Label>
                  {editing ? (
                    <Input
                      value={draft.storeAddress}
                      onChange={e => update("storeAddress", e.target.value)}
                      data-testid="input-profile-address"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-address">{profile.storeAddress}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">City</Label>
                  {editing ? (
                    <Input
                      value={draft.city}
                      onChange={e => update("city", e.target.value)}
                      data-testid="input-profile-city"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-city">{profile.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">State</Label>
                  {editing ? (
                    <Input
                      value={draft.state}
                      onChange={e => update("state", e.target.value)}
                      data-testid="input-profile-state"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-state">{profile.state}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Area / Locality</Label>
                  {editing ? (
                    <Input
                      value={draft.area}
                      onChange={e => update("area", e.target.value)}
                      data-testid="input-profile-area"
                    />
                  ) : (
                    <p className="text-sm font-medium" data-testid="text-detail-area">{profile.area}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">GSTIN</Label>
                  {editing ? (
                    <Input
                      value={draft.gstin}
                      onChange={e => update("gstin", e.target.value)}
                      placeholder="15-digit GSTIN"
                      data-testid="input-profile-gstin"
                    />
                  ) : (
                    <p className="text-sm font-medium font-mono" data-testid="text-detail-gstin">{profile.gstin || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">PAN</Label>
                  {editing ? (
                    <Input
                      value={draft.pan}
                      onChange={e => update("pan", e.target.value)}
                      placeholder="10-character PAN"
                      data-testid="input-profile-pan"
                    />
                  ) : (
                    <p className="text-sm font-medium font-mono" data-testid="text-detail-pan">{profile.pan || "Not set"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> Program Details
                <Badge variant="outline" className="text-[10px] font-normal ml-1">Read-only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Package Tier</p>
                  <Badge className={`${pkgColors.bg} ${pkgColors.text} border-0 font-semibold text-sm`} data-testid="text-package-tier">
                    {profile.packageTier}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Assigned by EazyToSell. Contact your RM to upgrade.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Partner ID</p>
                  <p className="text-sm font-semibold font-mono" data-testid="text-partner-id-details">ETS-{String(profile.id).padStart(4, "0")}</p>
                  <p className="text-xs text-muted-foreground mt-2">Use this ID for all communications with support.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
