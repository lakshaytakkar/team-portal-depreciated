import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft, Package, QrCode, Printer, MapPin, Calendar,
  DollarSign, Shield, Cpu, Building2, UserPlus, UserMinus, Hash,
} from "lucide-react";
import { Fade, PageTransition } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { StatusBadge } from "@/components/ds/status-badge";
import { PageShell, DetailSection, DetailModal } from "@/components/layout";
import { DetailBanner, InfoPropertyGrid } from "@/components/blocks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTableContainer, DataTH, DataTD, DataTR } from "@/components/layout";
import {
  getAssetById,
  getAssignmentsForAsset,
  getCurrentAssignment,
  type Asset,
  type AssetAssignment,
  assetAssignments,
} from "@/lib/mock-data-assets";
import { employees } from "@/lib/mock-data-hrms";
import QRCode from "qrcode";

export default function HrmsAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(600);

  const asset = getAssetById(id || "");
  const allAssignments = getAssignmentsForAsset(id || "");
  const currentAssignment = getCurrentAssignment(id || "");
  const pastAssignments = allAssignments.filter((a) => a.returnDate !== null);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmployee, setAssignEmployee] = useState("");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignNotes, setAssignNotes] = useState("");
  const [localStatus, setLocalStatus] = useState<Asset["status"] | null>(null);
  const [localAssignments, setLocalAssignments] = useState<AssetAssignment[]>(allAssignments);
  const [localCurrentAssignment, setLocalCurrentAssignment] = useState<AssetAssignment | undefined>(currentAssignment);

  useEffect(() => {
    if (asset) {
      setLocalStatus(asset.status);
    }
  }, [asset]);

  useEffect(() => {
    if (id) {
      const url = `${window.location.origin}/hrms/assets/${id}`;
      QRCode.toDataURL(url, { width: 200, margin: 2 }).then(setQrDataUrl);
    }
  }, [id]);

  const printQR = () => {
    if (!asset) return;
    const w = window.open("", "_blank", "width=400,height=500");
    if (!w) return;
    w.document.write(`
      <html><head><title>QR Code – ${asset.name}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0}
      img{width:200px;height:200px}h2{margin:16px 0 4px;font-size:16px}p{color:#666;font-size:12px;margin:0}</style></head>
      <body><img src="${qrDataUrl}" /><h2>${asset.name}</h2><p>${asset.assetCode} · ${asset.serialNumber}</p>
      <script>setTimeout(()=>window.print(),300)</script></body></html>
    `);
    w.document.close();
  };

  const handleAssign = () => {
    if (!asset || !assignEmployee) return;
    const emp = employees.find((e) => e.id === assignEmployee);
    if (!emp) return;
    const newAssignment: AssetAssignment = {
      id: `ASGN-${Date.now()}`,
      assetId: asset.id,
      employeeId: emp.id,
      employeeName: emp.name,
      assignedDate: assignDate,
      returnDate: null,
      notes: assignNotes,
    };
    setLocalCurrentAssignment(newAssignment);
    setLocalAssignments((prev) => [...prev, newAssignment]);
    setLocalStatus("assigned");
    setAssignOpen(false);
    setAssignEmployee("");
    setAssignNotes("");
  };

  const handleUnassign = () => {
    if (!localCurrentAssignment) return;
    const updated = { ...localCurrentAssignment, returnDate: new Date().toISOString().split("T")[0] };
    setLocalAssignments((prev) => prev.map((a) => (a.id === localCurrentAssignment.id ? updated : a)));
    setLocalCurrentAssignment(undefined);
    setLocalStatus("available");
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="h-40 bg-muted rounded-2xl" />
        <div className="h-96 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  if (!asset) {
    return (
      <PageShell>
        <Button variant="ghost" onClick={() => setLocation("/hrms/assets")} className="mb-4" data-testid="back-not-found">
          <ArrowLeft className="size-4 mr-2" /> Back
        </Button>
        <div className="text-center py-20 text-muted-foreground">Asset not found.</div>
      </PageShell>
    );
  }

  const effectiveStatus = localStatus || asset.status;

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/hrms/assets")} data-testid="back-btn">
          <ArrowLeft className="size-4 mr-2" /> All Assets
        </Button>
      </Fade>

      <Fade>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-5">
                  <img
                    src={asset.imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                    alt={asset.name}
                    className="h-24 w-24 rounded-xl object-cover border bg-muted flex-shrink-0"
                    data-testid="asset-image"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-xl font-bold truncate" data-testid="asset-title">{asset.name}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{asset.assetCode}</code>
                          <span className="mx-2">·</span>
                          {asset.manufacturer} {asset.model}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <StatusBadge status={effectiveStatus} />
                        <StatusBadge status={asset.condition} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="size-3" /> Serial</div>
                        <div className="text-sm font-medium font-mono">{asset.serialNumber}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Package className="size-3" /> Category</div>
                        <div className="text-sm font-medium">{asset.category}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="size-3" /> Price</div>
                        <div className="text-sm font-medium">${asset.purchasePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" /> Location</div>
                        <div className="text-sm font-medium">{asset.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  Current Assignment
                  {localCurrentAssignment ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnassign}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      data-testid="unassign-btn"
                    >
                      <UserMinus className="size-3.5 mr-1.5" /> Unassign
                    </Button>
                  ) : effectiveStatus === "available" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssignOpen(true)}
                      className="text-sky-600 border-sky-200 hover:bg-sky-50"
                      data-testid="assign-asset-btn"
                    >
                      <UserPlus className="size-3.5 mr-1.5" /> Assign
                    </Button>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {localCurrentAssignment ? (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-sky-50/50 dark:bg-sky-950/20">
                    <div className="flex items-center gap-3">
                      <PersonCell name={localCurrentAssignment.employeeName} size="md" />
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Since {fmtDate(localCurrentAssignment.assignedDate)}</div>
                      {localCurrentAssignment.notes && (
                        <div className="text-xs text-muted-foreground mt-0.5">{localCurrentAssignment.notes}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    {effectiveStatus === "available" ? "This asset is not currently assigned to anyone." : `Asset is ${effectiveStatus}.`}
                  </div>
                )}
              </CardContent>
            </Card>

            {localAssignments.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Assignment History</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DataTableContainer>
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/30">
                        <tr>
                          <DataTH>Employee</DataTH>
                          <DataTH>Assigned</DataTH>
                          <DataTH>Returned</DataTH>
                          <DataTH>Notes</DataTH>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {localAssignments
                          .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
                          .map((a) => (
                            <DataTR key={a.id} data-testid={`history-row-${a.id}`}>
                              <DataTD><PersonCell name={a.employeeName} size="sm" /></DataTD>
                              <DataTD className="text-muted-foreground">{fmtDate(a.assignedDate)}</DataTD>
                              <DataTD>
                                {a.returnDate ? (
                                  <span className="text-muted-foreground">{fmtDate(a.returnDate)}</span>
                                ) : (
                                  <StatusBadge status="active" />
                                )}
                              </DataTD>
                              <DataTD className="text-muted-foreground text-xs">{a.notes || "—"}</DataTD>
                            </DataTR>
                          ))}
                      </tbody>
                    </table>
                  </DataTableContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <InfoItem icon={Cpu} label="Manufacturer" value={asset.manufacturer} />
                  <InfoItem icon={Package} label="Model" value={asset.model} />
                  <InfoItem icon={Calendar} label="Purchase Date" value={fmtDate(asset.purchaseDate)} />
                  <InfoItem icon={DollarSign} label="Purchase Price" value={`$${asset.purchasePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
                  <InfoItem icon={Shield} label="Warranty Expiry" value={asset.warrantyExpiry ? fmtDate(asset.warrantyExpiry) : "N/A"} />
                  <InfoItem icon={MapPin} label="Location" value={asset.location} />
                </div>
                {asset.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {asset.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-72 flex-shrink-0 space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <QrCode className="size-4" /> QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col items-center gap-3">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="Asset QR Code" className="w-40 h-40 border rounded-xl p-2" data-testid="detail-qr-code" />
                )}
                <p className="text-xs text-muted-foreground text-center">Scan to open this asset's page</p>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={printQR} data-testid="detail-print-qr">
                    <Printer className="size-3.5 mr-1" /> Print
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs" asChild data-testid="detail-download-qr">
                    <a href={qrDataUrl} download={`QR-${asset.assetCode}.png`}>
                      <QrCode className="size-3.5 mr-1" /> Save
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <QuickInfoRow label="Code" value={asset.assetCode} />
                <QuickInfoRow label="Category" value={asset.category} />
                <QuickInfoRow label="Status" value={<StatusBadge status={effectiveStatus} />} />
                <QuickInfoRow label="Condition" value={<StatusBadge status={asset.condition} />} />
                <QuickInfoRow label="Serial" value={<code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{asset.serialNumber}</code>} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Fade>

      <DetailModal
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setAssignEmployee(""); setAssignNotes(""); }}
        title="Assign Asset"
        subtitle={`Assign "${asset.name}" to an employee`}
        footer={
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            data-testid="submit-assign-detail"
            onClick={handleAssign}
            disabled={!assignEmployee}
          >
            <UserPlus className="size-4 mr-2" /> Confirm Assignment
          </Button>
        }
      >
        <DetailSection title="Assignment Details">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Employee *</Label>
              <Select value={assignEmployee} onValueChange={setAssignEmployee}>
                <SelectTrigger data-testid="detail-select-employee"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.status === "active").map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} — {e.designation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Assignment Date</Label>
              <Input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} data-testid="detail-assign-date" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea placeholder="Optional notes..." value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} rows={2} data-testid="detail-assign-notes" />
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageTransition>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      <Icon className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function QuickInfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{typeof value === "string" ? value : value}</span>
    </div>
  );
}
