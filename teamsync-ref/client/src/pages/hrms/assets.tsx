import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Package, Plus, QrCode, Printer, UserPlus, X } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { Label } from "@/components/ui/label";
import {
  assets as allAssets,
  assetAssignments,
  getCurrentAssignment,
  ASSET_CATEGORIES,
  type Asset,
  type AssetAssignment,
  type AssetCategory,
} from "@/lib/mock-data-assets";
import { employees } from "@/lib/mock-data-hrms";
import { HRMS_COLOR } from "@/lib/hrms-config";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  PrimaryAction,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ds/status-badge";
import { Textarea } from "@/components/ui/textarea";
import QRCode from "qrcode";

const PAGE_SIZE = 15;

type TabValue = "all" | "assigned" | "unassigned";

export default function HrmsAssets() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tab, setTab] = useState<TabValue>("all");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAsset, setAssignAsset] = useState<Asset | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrAssetName, setQrAssetName] = useState("");

  const [localAssets, setLocalAssets] = useState<Asset[]>(allAssets);
  const [localAssignments, setLocalAssignments] = useState<AssetAssignment[]>(assetAssignments);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<string>("");
  const [formSerial, setFormSerial] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formManufacturer, setFormManufacturer] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formPurchaseDate, setFormPurchaseDate] = useState("");
  const [formWarranty, setFormWarranty] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCondition, setFormCondition] = useState("new");
  const [formNotes, setFormNotes] = useState("");

  const [assignEmployee, setAssignEmployee] = useState("");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignNotes, setAssignNotes] = useState("");

  const filtered = localAssets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchTab =
      tab === "all" ||
      (tab === "assigned" && a.status === "assigned") ||
      (tab === "unassigned" && a.status === "available");
    return matchSearch && matchCategory && matchTab;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter, tab]);

  const generateQR = useCallback(async (assetId: string, assetName: string) => {
    const url = `${window.location.origin}/hrms/assets/${assetId}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2 });
    setQrDataUrl(dataUrl);
    setQrAssetName(assetName);
    setQrOpen(true);
  }, []);

  const handleCreateAsset = async () => {
    if (!formName || !formCategory || !formSerial) return;
    const newCode = `AST-${String(localAssets.length + 1).padStart(3, "0")}`;
    const newAsset: Asset = {
      id: newCode,
      assetCode: newCode,
      name: formName,
      category: formCategory as AssetCategory,
      serialNumber: formSerial,
      model: formModel,
      manufacturer: formManufacturer,
      purchaseDate: formPurchaseDate || new Date().toISOString().split("T")[0],
      purchasePrice: parseFloat(formPrice) || 0,
      condition: formCondition as Asset["condition"],
      status: "available",
      imageUrl: "",
      warrantyExpiry: formWarranty || "",
      location: formLocation || "IT Storage Room",
      notes: formNotes,
    };
    setLocalAssets((prev) => [...prev, newAsset]);
    setAddOpen(false);
    resetForm();
    await generateQR(newCode, formName);
  };

  const resetForm = () => {
    setFormName(""); setFormCategory(""); setFormSerial(""); setFormModel("");
    setFormManufacturer(""); setFormPrice(""); setFormPurchaseDate("");
    setFormWarranty(""); setFormLocation(""); setFormCondition("new"); setFormNotes("");
  };

  const handleAssign = () => {
    if (!assignAsset || !assignEmployee) return;
    const emp = employees.find((e) => e.id === assignEmployee);
    if (!emp) return;
    const newAssignment: AssetAssignment = {
      id: `ASGN-${String(localAssignments.length + 1).padStart(3, "0")}`,
      assetId: assignAsset.id,
      employeeId: emp.id,
      employeeName: emp.name,
      assignedDate: assignDate,
      returnDate: null,
      notes: assignNotes,
    };
    setLocalAssignments((prev) => [...prev, newAssignment]);
    setLocalAssets((prev) =>
      prev.map((a) => (a.id === assignAsset.id ? { ...a, status: "assigned" as const } : a))
    );
    setAssignOpen(false);
    setAssignAsset(null);
    setAssignEmployee("");
    setAssignNotes("");
  };

  const handleUnassign = (assetId: string) => {
    setLocalAssignments((prev) =>
      prev.map((a) =>
        a.assetId === assetId && a.returnDate === null
          ? { ...a, returnDate: new Date().toISOString().split("T")[0] }
          : a
      )
    );
    setLocalAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status: "available" as const } : a))
    );
  };

  const getLocalCurrentAssignment = (assetId: string) =>
    localAssignments.find((a) => a.assetId === assetId && a.returnDate === null);

  const printQR = () => {
    const w = window.open("", "_blank", "width=400,height=500");
    if (!w) return;
    w.document.write(`
      <html><head><title>QR Code – ${qrAssetName}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0}
      img{width:200px;height:200px}h2{margin:16px 0 4px;font-size:16px}p{color:#666;font-size:12px;margin:0}</style></head>
      <body><img src="${qrDataUrl}" /><h2>${qrAssetName}</h2><p>Scan to view asset details</p>
      <script>setTimeout(()=>window.print(),300)</script></body></html>
    `);
    w.document.close();
  };

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "All Assets", value: "all", count: localAssets.length },
    { label: "Assigned", value: "assigned", count: localAssets.filter((a) => a.status === "assigned").length },
    { label: "Unassigned", value: "unassigned", count: localAssets.filter((a) => a.status === "available").length },
  ];

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Assets"
          subtitle={`${localAssets.length} total assets · ${localAssets.filter((a) => a.status === "assigned").length} assigned · ${localAssets.filter((a) => a.status === "available").length} available`}
          actions={
            <PrimaryAction
              color={HRMS_COLOR}
              icon={Plus}
              onClick={() => setAddOpen(true)}
              testId="add-asset-btn"
            >
              Add Asset
            </PrimaryAction>
          }
        />
      </Fade>

      <Fade>
        <div className="flex gap-1 border-b mb-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.value
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${t.value}`}
            >
              {t.label}
              <span className="ml-1.5 text-xs text-muted-foreground">({t.count})</span>
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by name, serial, or code..."
          color={HRMS_COLOR}
          extra={
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40" data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ASSET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <DataTH>Asset</DataTH>
                <DataTH>Assigned To</DataTH>
                <DataTH>Category</DataTH>
                <DataTH>Serial Number</DataTH>
                <DataTH align="right">Buy Price</DataTH>
                <DataTH>Condition</DataTH>
                <DataTH>Status</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paged.map((asset) => {
                const assignment = getLocalCurrentAssignment(asset.id);
                return (
                  <DataTR
                    key={asset.id}
                    onClick={() => setLocation(`/hrms/assets/${asset.id}`)}
                    data-testid={`asset-row-${asset.id}`}
                  >
                    <DataTD>
                      <div className="flex items-center gap-3">
                        <img
                          src={asset.imageUrl || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop`}
                          alt={asset.name}
                          className="h-10 w-10 rounded-lg object-cover border bg-muted flex-shrink-0"
                          data-testid={`asset-thumb-${asset.id}`}
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[200px]">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">{asset.assetCode}</div>
                        </div>
                      </div>
                    </DataTD>
                    <DataTD>
                      {assignment ? (
                        <PersonCell name={assignment.employeeName} size="sm" />
                      ) : asset.status === "available" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignAsset(asset);
                            setAssignOpen(true);
                          }}
                          className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium"
                          data-testid={`assign-btn-${asset.id}`}
                        >
                          <UserPlus className="size-3.5" /> Assign
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </DataTD>
                    <DataTD className="text-muted-foreground">{asset.category}</DataTD>
                    <DataTD>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{asset.serialNumber}</code>
                    </DataTD>
                    <DataTD align="right" className="font-medium">
                      ${asset.purchasePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </DataTD>
                    <DataTD><StatusBadge status={asset.condition} /></DataTD>
                    <DataTD><StatusBadge status={asset.status} /></DataTD>
                  </DataTR>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    page === i + 1
                      ? "bg-sky-500 text-white"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`page-${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </Fade>

      <DetailModal
        open={addOpen}
        onClose={() => { setAddOpen(false); resetForm(); }}
        title="Add New Asset"
        subtitle="Register an asset to the inventory"
        footer={
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            data-testid="submit-add-asset"
            onClick={handleCreateAsset}
            disabled={!formName || !formCategory || !formSerial}
          >
            <Package className="size-4 mr-2" />
            Create Asset & Generate QR
          </Button>
        }
      >
        <DetailSection title="Asset Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Asset Name *</Label>
              <Input placeholder='e.g. MacBook Pro 14"' value={formName} onChange={(e) => setFormName(e.target.value)} data-testid="input-asset-name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Serial Number *</Label>
              <Input placeholder="e.g. C03VX2M6JG00" value={formSerial} onChange={(e) => setFormSerial(e.target.value)} data-testid="input-serial" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Model</Label>
              <Input placeholder="e.g. MacBook Pro 14" value={formModel} onChange={(e) => setFormModel(e.target.value)} data-testid="input-model" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Manufacturer</Label>
              <Input placeholder="e.g. Apple" value={formManufacturer} onChange={(e) => setFormManufacturer(e.target.value)} data-testid="input-manufacturer" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Condition</Label>
              <Select value={formCondition} onValueChange={setFormCondition}>
                <SelectTrigger data-testid="select-condition"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Purchase & Warranty">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Purchase Date</Label>
              <Input type="date" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} data-testid="input-purchase-date" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Purchase Price ($)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} data-testid="input-price" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Warranty Expiry</Label>
              <Input type="date" value={formWarranty} onChange={(e) => setFormWarranty(e.target.value)} data-testid="input-warranty" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Location</Label>
              <Input placeholder="e.g. IT Storage Room" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} data-testid="input-location" />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Notes">
          <Textarea placeholder="Optional notes about this asset..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} data-testid="input-notes" />
        </DetailSection>
      </DetailModal>

      <DetailModal
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setAssignAsset(null); }}
        title="Assign Asset"
        subtitle={assignAsset ? `Assign "${assignAsset.name}" to an employee` : ""}
        footer={
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            data-testid="submit-assign"
            onClick={handleAssign}
            disabled={!assignEmployee}
          >
            <UserPlus className="size-4 mr-2" />
            Confirm Assignment
          </Button>
        }
      >
        <DetailSection title="Assignment Details">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Employee *</Label>
              <Select value={assignEmployee} onValueChange={setAssignEmployee}>
                <SelectTrigger data-testid="select-employee"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.status === "active").map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} — {e.designation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Assignment Date</Label>
              <Input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} data-testid="input-assign-date" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea placeholder="Optional notes..." value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} rows={2} data-testid="input-assign-notes" />
            </div>
          </div>
        </DetailSection>
      </DetailModal>

      <DetailModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Asset QR Code"
        subtitle={qrAssetName}
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={printQR} data-testid="print-qr-btn">
              <Printer className="size-4 mr-2" /> Print QR
            </Button>
            <Button variant="outline" className="flex-1" asChild data-testid="download-qr-btn">
              <a href={qrDataUrl} download={`QR-${qrAssetName.replace(/\s+/g, "-")}.png`}>
                <QrCode className="size-4 mr-2" /> Download
              </a>
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center py-6 gap-4">
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 border rounded-xl p-2" data-testid="qr-code-image" />
          )}
          <p className="text-sm text-muted-foreground text-center">
            Apply this QR sticker on the asset. Scanning it will open the asset detail page.
          </p>
        </div>
      </DetailModal>
    </PageShell>
  );
}
