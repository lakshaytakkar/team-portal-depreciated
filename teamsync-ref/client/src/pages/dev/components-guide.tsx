import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ds/status-badge";
import { getPersonAvatar, getThingAvatar } from "@/lib/avatars";
import { TeamSyncLogo } from "@/components/brand/teamsync-logo";
import { TeamSyncMascot } from "@/components/brand/teamsync-mascot";
import { Spinner, PageSpinner, InlineSpinner } from "@/components/ui/spinner";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { CardSkeleton, StatsCardSkeleton } from "@/components/ui/card-skeleton";

import { showSuccess, showError, showInfo, showWarning } from "@/hooks/use-toast";
import {
  Plus,
  Download,
  Trash2,
  Edit,
  ArrowRight,
  User,
  Mail,
  Phone,
  MousePointer2,
  Hand,
  Move,
  Crosshair,
  Type,
  ZoomIn,
  GripHorizontal,
} from "lucide-react";

function SectionTitle({ children }: { children: string }) {
  return <p className="text-lg font-semibold font-heading text-[#151E3A] mb-4">{children}</p>;
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-[#5A6380]">{title}</p>
      {children}
    </div>
  );
}

function ButtonsTab() {
  const variants = [
    { label: "Primary", variant: "default" as const },
    { label: "Secondary", variant: "secondary" as const },
    { label: "Outline", variant: "outline" as const },
    { label: "Ghost", variant: "ghost" as const },
    { label: "Destructive", variant: "destructive" as const },
  ];

  const sizes = [
    { label: "Large", size: "lg" as const },
    { label: "Default", size: "default" as const },
    { label: "Small", size: "sm" as const },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Button Variants</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-5 gap-4 mb-3">
            {["Default", "Hover", "Focused", "Disabled", ""].map((h, i) => (
              <p key={i} className="text-xs font-medium text-[#5A6380] text-center">{h}</p>
            ))}
          </div>
          <div className="flex flex-col gap-6">
            {variants.map((v) => (
              <div key={v.label}>
                <p className="text-xs font-medium text-[#36394A] mb-3">{v.label}</p>
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex justify-center">
                    <Button variant={v.variant} data-testid={`btn-${v.label.toLowerCase()}-default`}>
                      <Plus className="size-4 mr-1.5" /> Button
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant={v.variant} data-testid={`btn-${v.label.toLowerCase()}-hover`}>
                      <Plus className="size-4 mr-1.5" /> Hover
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant={v.variant} className="ring-2 ring-primary/30 ring-offset-2" data-testid={`btn-${v.label.toLowerCase()}-focused`}>
                      <Plus className="size-4 mr-1.5" /> Focused
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant={v.variant} disabled data-testid={`btn-${v.label.toLowerCase()}-disabled`}>
                      <Plus className="size-4 mr-1.5" /> Disabled
                    </Button>
                  </div>
                  <div />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Button Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex items-end gap-6">
            {sizes.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-3">
                <Button size={s.size} data-testid={`btn-size-${s.label.toLowerCase()}`}>
                  <Plus className="size-4 mr-1.5" /> {s.label}
                </Button>
                <p className="text-xs text-[#5A6380]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Icon-Only Buttons</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex items-center gap-4">
            {[
              { icon: Plus, label: "Add" },
              { icon: Edit, label: "Edit" },
              { icon: Trash2, label: "Delete" },
              { icon: Download, label: "Download" },
              { icon: ArrowRight, label: "Next" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <Button variant="outline" size="icon" data-testid={`btn-icon-${item.label.toLowerCase()}`}>
                  <item.icon className="size-4" />
                </Button>
                <span className="text-[10px] text-[#5A6380]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormsTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Text Input</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Default">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="you@example.com" className="pl-9" data-testid="input-form-default" />
                </div>
              </div>
            </SubSection>
            <SubSection title="Filled">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value="john@example.com" readOnly className="pl-9" data-testid="input-form-filled" />
                </div>
              </div>
            </SubSection>
            <SubSection title="Disabled">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input placeholder="you@example.com" disabled className="pl-9" data-testid="input-form-disabled" />
                </div>
              </div>
            </SubSection>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-8">
            <SubSection title="Error">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
                  <Input
                    placeholder="you@example.com"
                    className="pl-9 border-destructive focus-visible:ring-destructive"
                    data-testid="input-form-error"
                  />
                </div>
                <p className="text-xs text-destructive">Please enter a valid email address.</p>
              </div>
            </SubSection>
            <SubSection title="With Icon (Phone)">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="+91 98765 43210" className="pl-9" data-testid="input-form-phone" />
                </div>
              </div>
            </SubSection>
            <SubSection title="With Icon (User)">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Enter full name" className="pl-9" data-testid="input-form-user" />
                </div>
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Dropdown / Select</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Default">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select data-testid="select-form-default">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>
            <SubSection title="Filled">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select defaultValue="engineering">
                  <SelectTrigger data-testid="select-form-filled">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>
            <SubSection title="Disabled">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Department</Label>
                <Select disabled>
                  <SelectTrigger data-testid="select-form-disabled">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Checkbox, Radio & Toggle</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Checkbox">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="cb1" data-testid="checkbox-default" />
                  <Label htmlFor="cb1" className="text-sm">Unchecked</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cb2" defaultChecked data-testid="checkbox-checked" />
                  <Label htmlFor="cb2" className="text-sm">Checked</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="cb3" disabled data-testid="checkbox-disabled" />
                  <Label htmlFor="cb3" className="text-sm text-muted-foreground">Disabled</Label>
                </div>
              </div>
            </SubSection>
            <SubSection title="Toggle / Switch">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Switch id="sw1" data-testid="switch-off" />
                  <Label htmlFor="sw1" className="text-sm">Off</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="sw2" defaultChecked data-testid="switch-on" />
                  <Label htmlFor="sw2" className="text-sm">On</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="sw3" disabled data-testid="switch-disabled" />
                  <Label htmlFor="sw3" className="text-sm text-muted-foreground">Disabled</Label>
                </div>
              </div>
            </SubSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Table Cell Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#F8FAFB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Avatar with Text</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Title + Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Badge</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Button</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Plain Text</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" data-testid="table-cell-row-primary">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">RP</div>
                      <div>
                        <p className="text-sm font-medium text-[#151E3A]">Rahul Patel</p>
                        <p className="text-xs text-[#5A6380]">Engineering</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#151E3A]">Senior Developer</p>
                    <p className="text-xs text-[#5A6380]">Full Stack</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="Active" /></td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" data-testid="btn-view-primary">View</Button></td>
                  <td className="px-4 py-3 text-[#36394A]">₹12,50,000</td>
                </tr>
                <tr className="border-b" data-testid="table-cell-row-default">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">AS</div>
                      <div>
                        <p className="text-sm font-medium text-[#151E3A]">Anita Sharma</p>
                        <p className="text-xs text-[#5A6380]">Design</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#151E3A]">Lead Designer</p>
                    <p className="text-xs text-[#5A6380]">UI/UX</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="On Leave" /></td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" data-testid="btn-view-default">View</Button></td>
                  <td className="px-4 py-3 text-[#36394A]">₹10,80,000</td>
                </tr>
                <tr data-testid="table-cell-row-inactive">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-red-50 text-xs font-semibold text-red-700">VK</div>
                      <div>
                        <p className="text-sm font-medium text-[#151E3A]">Vikram Kumar</p>
                        <p className="text-xs text-[#5A6380]">Marketing</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#151E3A]">Marketing Head</p>
                    <p className="text-xs text-[#5A6380]">Digital</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status="Inactive" /></td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm" data-testid="btn-view-inactive">View</Button></td>
                  <td className="px-4 py-3 text-[#36394A]">₹11,20,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Table Header Styles</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#F8FAFB]" data-testid="table-header-example">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">
                    <div className="flex items-center gap-1.5">
                      <Checkbox className="size-4" data-testid="checkbox-header" />
                      <span>Name</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A6380]">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#5A6380]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm text-[#36394A]">
                  <td className="px-4 py-3" colSpan={5}>
                    <span className="text-xs text-muted-foreground">Table rows go here...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogosCursorsTab() {
  const cursors = [
    { name: "Default", css: "cursor-default", icon: MousePointer2 },
    { name: "Pointer", css: "cursor-pointer", icon: Hand },
    { name: "Move", css: "cursor-move", icon: Move },
    { name: "Crosshair", css: "cursor-crosshair", icon: Crosshair },
    { name: "Text", css: "cursor-text", icon: Type },
    { name: "Zoom In", css: "cursor-zoom-in", icon: ZoomIn },
    { name: "Grab", css: "cursor-grab", icon: GripHorizontal },
    { name: "Not Allowed", css: "cursor-not-allowed", icon: null },
    { name: "Col Resize", css: "cursor-col-resize", icon: null },
    { name: "Row Resize", css: "cursor-row-resize", icon: null },
    { name: "EW Resize", css: "cursor-ew-resize", icon: null },
    { name: "NS Resize", css: "cursor-ns-resize", icon: null },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Brand Logo</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-primary">
              <TeamSyncLogo size="lg" />
              <p className="text-xs text-[#5A6380]">Primary Logo</p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-xl bg-[#151E3A] p-8 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-dark">
              <TeamSyncLogo size="lg" darkText={false} />
              <p className="text-xs text-[#7A8299]">Dark Background</p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-icon">
              <TeamSyncMascot size={48} />
              <p className="text-xs text-[#5A6380]">Icon Only</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Mascot</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-6 rounded-xl bg-white p-10 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="mascot-large">
              <TeamSyncMascot size={200} />
              <div className="text-center">
                <p className="text-base font-semibold font-heading text-[#151E3A]">TeamSync Mascot</p>
                <p className="text-xs text-[#5A6380] mt-1">200 × 200px — Hero / Marketing</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-white p-10 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="mascot-sizes">
              <div className="flex items-end gap-8">
                <div className="flex flex-col items-center gap-2">
                  <TeamSyncMascot size={96} />
                  <p className="text-[10px] text-[#5A6380]">96px</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamSyncMascot size={72} />
                  <p className="text-[10px] text-[#5A6380]">72px</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamSyncMascot size={48} />
                  <p className="text-[10px] text-[#5A6380]">48px</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamSyncMascot size={36} />
                  <p className="text-[10px] text-[#5A6380]">36px</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamSyncMascot size={24} />
                  <p className="text-[10px] text-[#5A6380]">24px</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold font-heading text-[#151E3A]">Size Scale</p>
                <p className="text-xs text-[#5A6380] mt-1">24px compact to 96px feature</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-size-xl">
              <TeamSyncLogo size="xl" />
              <p className="text-[10px] text-[#5A6380]">XL — Marketing</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-size-lg">
              <TeamSyncLogo size="lg" />
              <p className="text-[10px] text-[#5A6380]">LG — Page Header</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-size-md">
              <TeamSyncLogo size="md" />
              <p className="text-[10px] text-[#5A6380]">MD — Sidebar</p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-[0px_1px_2px_rgba(21,30,58,0.06)]" data-testid="logo-size-sm">
              <TeamSyncLogo size="sm" />
              <p className="text-[10px] text-[#5A6380]">SM — Compact</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Cursors</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-4 gap-4">
            {cursors.map((c) => (
              <div
                key={c.name}
                className={`flex flex-col items-center justify-center gap-3 rounded-lg bg-white p-6 border border-border/60 ${c.css}`}
                data-testid={`cursor-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {c.icon ? (
                  <c.icon className="size-6 text-[#36394A]" />
                ) : (
                  <div className="flex size-6 items-center justify-center text-lg text-[#36394A]">
                    ↔
                  </div>
                )}
                <p className="text-xs font-medium text-[#36394A]">{c.name}</p>
                <p className="text-[10px] text-[#7A8299]">{c.css}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgesTab() {
  const badgeColors = [
    {
      label: "Neutral",
      fill: { bg: "#F2F3F8", text: "#151E3A", border: "#C5CCE3" },
      statuses: ["Draft", "Archived", "Contract"],
    },
    {
      label: "Primary",
      fill: { bg: "#EBF1FF", text: "#1A3FAA", border: "#ADC5FD" },
      statuses: ["Interview", "Screening", "Notice Period"],
    },
    {
      label: "Green",
      fill: { bg: "#E2F7E7", text: "#0C5C27", border: "#A8E6B8" },
      statuses: ["Active", "Present", "Approved"],
    },
    {
      label: "Yellow",
      fill: { bg: "#FEF3CD", text: "#7A5600", border: "#FADA7A" },
      statuses: ["Pending", "On Leave", "Half Day"],
    },
    {
      label: "Red",
      fill: { bg: "#FDE1E1", text: "#A30D05", border: "#F5A3A3" },
      statuses: ["Inactive", "Absent", "Rejected"],
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Badge Variants by Color</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex flex-col gap-8">
            {badgeColors.map((group) => (
              <div key={group.label} data-testid={`badge-group-${group.label.toLowerCase()}`}>
                <p className="text-sm font-medium text-[#36394A] mb-4">{group.label}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {group.statuses.map((status) => (
                    <StatusBadge key={status} status={status} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Badge Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex flex-col gap-6">
            <SubSection title="Large (default)">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: "#F2F3F8", color: "#151E3A" }}>
                  Large
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: "#EBF1FF", color: "#1A3FAA" }}>
                  Large
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: "#E2F7E7", color: "#0C5C27" }}>
                  Large
                </span>
              </div>
            </SubSection>
            <SubSection title="Medium">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#F2F3F8", color: "#151E3A" }}>
                  Medium
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#EBF1FF", color: "#1A3FAA" }}>
                  Medium
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#E2F7E7", color: "#0C5C27" }}>
                  Medium
                </span>
              </div>
            </SubSection>
            <SubSection title="Small">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight" style={{ backgroundColor: "#F2F3F8", color: "#151E3A" }}>
                  Small
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight" style={{ backgroundColor: "#EBF1FF", color: "#1A3FAA" }}>
                  Small
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight" style={{ backgroundColor: "#E2F7E7", color: "#0C5C27" }}>
                  Small
                </span>
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Badge Styles</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-2 gap-8">
            <SubSection title="Fill">
              <div className="flex items-center gap-3">
                {badgeColors.map((g) => (
                  <span key={g.label} className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: g.fill.bg, color: g.fill.text }}>
                    {g.label}
                  </span>
                ))}
              </div>
            </SubSection>
            <SubSection title="Outlined">
              <div className="flex items-center gap-3">
                {badgeColors.map((g) => (
                  <span key={g.label} className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium" style={{ borderColor: g.fill.border, color: g.fill.text, backgroundColor: "transparent" }}>
                    {g.label}
                  </span>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Badge Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Default">
              <div className="flex items-center gap-3">
                <StatusBadge status="Active" />
                <StatusBadge status="Pending" />
                <StatusBadge status="Rejected" />
              </div>
            </SubSection>
            <SubSection title="With Dot">
              <div className="flex items-center gap-3">
                {[
                  { label: "Online", dotColor: "#22C55E" },
                  { label: "Away", dotColor: "#EAB308" },
                  { label: "Offline", dotColor: "#94A3B8" },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F3F8] px-3 py-1 text-sm font-medium text-[#151E3A]">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: item.dotColor }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </SubSection>
            <SubSection title="With Close Icon">
              <div className="flex items-center gap-3">
                {["Engineering", "Design", "Marketing"].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1 rounded-full bg-[#EBF1FF] px-3 py-1 text-sm font-medium text-[#1A3FAA]">
                    {label}
                    <button className="ml-0.5 rounded-full p-0.5 hover:bg-[#1A3FAA]/10">
                      <svg className="size-3" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarTab() {
  const sizes = [
    { label: "3XL", size: 72, text: "text-2xl" },
    { label: "2XL", size: 64, text: "text-xl" },
    { label: "XL", size: 56, text: "text-lg" },
    { label: "LG", size: 48, text: "text-base" },
    { label: "MD", size: 40, text: "text-sm" },
    { label: "SM", size: 32, text: "text-xs" },
    { label: "XS", size: 24, text: "text-[10px]" },
  ];

  const statusIndicators = [
    { label: "Online", color: "#22C55E" },
    { label: "Offline", color: "#94A3B8" },
    { label: "Busy", color: "#EF4444" },
    { label: "Away", color: "#EAB308" },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Avatar Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex items-end gap-6">
            {sizes.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-3" data-testid={`avatar-size-${s.label.toLowerCase()}`}>
                <img
                  src={getPersonAvatar("Rahul Patel", s.size)}
                  alt="RP"
                  className="rounded-full"
                  style={{ width: s.size, height: s.size }}
                />
                <p className="text-xs text-[#5A6380]">{s.label} ({s.size}px)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Avatar Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-8">
            <SubSection title="Micah (People)">
              <div className="flex items-center gap-4">
                {["Rahul Patel", "Ananya Sharma", "Vikram Kumar", "Priya Mehta"].map((name) => (
                  <img key={name} src={getPersonAvatar(name, 40)} alt={name} className="size-10 rounded-full" />
                ))}
              </div>
            </SubSection>
            <SubSection title="Glass (Things)">
              <div className="flex items-center gap-4">
                {["Engineering", "Marketing", "Finance"].map((name) => (
                  <img key={name} src={getThingAvatar(name, 40)} alt={name} className="size-10 rounded-lg" />
                ))}
              </div>
            </SubSection>
            <SubSection title="With Status">
              <div className="flex items-center gap-4">
                {statusIndicators.map((si, i) => (
                  <div key={si.label} className="relative" data-testid={`avatar-status-${si.label.toLowerCase()}`}>
                    <img src={getPersonAvatar(["Rahul Patel", "Ananya Sharma", "Vikram Kumar", "Priya Mehta"][i], 40)} alt={si.label} className="size-10 rounded-full" />
                    <span
                      className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: si.color }}
                    />
                  </div>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Avatar Group (Stacked)</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex flex-col gap-6">
            <SubSection title="Overlapping Stack">
              <div className="flex -space-x-2">
                {["Rahul Patel", "Ananya Sharma", "Vikram Kumar", "Priya Mehta", "Neha Kapoor"].map((name, i) => (
                  <img
                    key={name}
                    src={getPersonAvatar(name, 36)}
                    alt={name}
                    className="size-9 rounded-full border-2 border-white"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
                <div className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-[#F2F3F8] text-[10px] font-medium text-[#5A6380]">
                  +3
                </div>
              </div>
            </SubSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Spinner Sizes</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex items-end gap-8">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-3" data-testid={`spinner-size-${size}`}>
                <Spinner size={size} />
                <p className="text-xs text-[#5A6380]">{size}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Page Spinner</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="rounded-lg border bg-background" style={{ height: 160 }}>
            <PageSpinner label="Loading data..." />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Inline Spinner</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex items-center gap-6">
            <Button disabled data-testid="btn-inline-spinner">
              <InlineSpinner className="mr-2" /> Saving...
            </Button>
            <span className="text-sm text-[#36394A]">Processing <InlineSpinner className="ml-1" /></span>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Stats Card Skeleton</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-4 gap-4" data-testid="stats-skeleton-grid">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Card Skeleton</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-3 gap-4" data-testid="card-skeleton-grid">
            <CardSkeleton />
            <CardSkeleton lines={4} />
            <CardSkeleton lines={2} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Table Skeleton</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8" data-testid="table-skeleton-demo">
          <TableSkeleton rows={4} columns={5} />
        </div>
      </div>
    </div>
  );
}

function ToastsTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>Toast Types</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <p className="text-sm text-[#5A6380] mb-6">Click each button to trigger a toast notification. Toasts appear in the bottom-right corner and auto-dismiss after 3 seconds.</p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => showSuccess("Success", "Employee record saved successfully.")}
              data-testid="btn-toast-success"
            >
              Success Toast
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => showError("Error", "Failed to save record. Please try again.")}
              data-testid="btn-toast-error"
            >
              Error Toast
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => showInfo("Info", "Your session will expire in 5 minutes.")}
              data-testid="btn-toast-info"
            >
              Info Toast
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => showWarning("Warning", "Unsaved changes will be lost.")}
              data-testid="btn-toast-warning"
            >
              Warning Toast
            </Button>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Toast Styles</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex items-start gap-3 rounded-lg border bg-emerald-50 border-emerald-200 p-3" data-testid="toast-preview-success">
              <div className="shrink-0 mt-0.5 text-emerald-700">✓</div>
              <div>
                <p className="text-sm font-medium text-emerald-800">Success</p>
                <p className="text-xs text-emerald-700 mt-0.5">Green background, check icon</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-red-50 border-red-200 p-3" data-testid="toast-preview-error">
              <div className="shrink-0 mt-0.5 text-red-700">✕</div>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-700 mt-0.5">Red background, alert icon</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-blue-50 border-blue-200 p-3" data-testid="toast-preview-info">
              <div className="shrink-0 mt-0.5 text-blue-700">ℹ</div>
              <div>
                <p className="text-sm font-medium text-blue-800">Info</p>
                <p className="text-xs text-blue-700 mt-0.5">Blue background, info icon</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-amber-50 border-amber-200 p-3" data-testid="toast-preview-warning">
              <div className="shrink-0 mt-0.5 text-amber-700">⚠</div>
              <div>
                <p className="text-sm font-medium text-amber-800">Warning</p>
                <p className="text-xs text-amber-700 mt-0.5">Amber background, warning icon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerTab() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SectionTitle>3D Icons</SectionTitle>
        <div className="rounded-2xl bg-[#F8F9FC] p-8">
          <div className="grid grid-cols-4 gap-6">
            {[
              { name: "Dashboard", src: "/3d-icons/dashboard.webp" },
              { name: "Employees", src: "/3d-icons/employees.webp" },
              { name: "Candidates", src: "/3d-icons/candidates.webp" },
              { name: "Departments", src: "/3d-icons/departments.webp" },
              { name: "Job Postings", src: "/3d-icons/job-postings.webp" },
              { name: "Leave", src: "/3d-icons/leave.webp" },
              { name: "Attendance", src: "/3d-icons/attendance.webp" },
              { name: "Documents", src: "/3d-icons/documents.webp" },
            ].map((icon) => (
              <div key={icon.name} className="flex flex-col items-center gap-3 rounded-lg bg-white p-4 border" data-testid={`icon-3d-${icon.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <img src={icon.src} alt={icon.name} className="size-12 object-contain drop-shadow-lg" />
                <p className="text-xs font-medium text-[#36394A]">{icon.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComponentsGuideContent() {
  return (
    <Tabs defaultValue="buttons" data-testid="tabs-components">
      <TabsList data-testid="tabs-list-components">
        <TabsTrigger value="buttons" data-testid="tab-buttons">Buttons</TabsTrigger>
        <TabsTrigger value="forms" data-testid="tab-forms">Forms</TabsTrigger>
        <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
        <TabsTrigger value="loading" data-testid="tab-loading">Loading</TabsTrigger>
        <TabsTrigger value="toasts" data-testid="tab-toasts">Toasts</TabsTrigger>
        <TabsTrigger value="banner" data-testid="tab-banner">Banner</TabsTrigger>
        <TabsTrigger value="badges" data-testid="tab-badges">Badges</TabsTrigger>
        <TabsTrigger value="avatar" data-testid="tab-avatar">Avatar</TabsTrigger>
        <TabsTrigger value="logos" data-testid="tab-logos">Logos & Cursors</TabsTrigger>
      </TabsList>
      <div className="mt-8">
        <TabsContent value="buttons"><ButtonsTab /></TabsContent>
        <TabsContent value="forms"><FormsTab /></TabsContent>
        <TabsContent value="components"><ComponentsTab /></TabsContent>
        <TabsContent value="loading"><LoadingTab /></TabsContent>
        <TabsContent value="toasts"><ToastsTab /></TabsContent>
        <TabsContent value="banner"><BannerTab /></TabsContent>
        <TabsContent value="badges"><BadgesTab /></TabsContent>
        <TabsContent value="avatar"><AvatarTab /></TabsContent>
        <TabsContent value="logos"><LogosCursorsTab /></TabsContent>
      </div>
    </Tabs>
  );
}

export default function ComponentsGuide() {
  return (
    <PageShell data-testid="page-components-guide">
        <PageTransition>
          <ComponentsGuideContent />
        </PageTransition>
    </PageShell>
  );
}
