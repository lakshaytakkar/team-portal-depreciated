import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, RefreshCw, Copy, IndianRupee, Clock, CheckCircle2,
  XCircle, Loader2, Eye, Download, Share2, MessageCircle, Mail,
  QrCode, Building2, CreditCard, Upload, ImageIcon, Trash2, ExternalLink,
} from "lucide-react";

const COMPANIES = [
  {
    name: "Startup Squad Pvt Ltd",
    upi: "8059153883@pthdfc",
    bank: {
      accountNo: "9306566900",
      ifsc: "HDFC0000930",
      bankName: "HDFC Bank",
      accountName: "Startup Squad Pvt Ltd",
    },
  },
];

interface PaymentRequest {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: string;
  currency: string;
  description: string;
  receivingCompany: string;
  methods: string[];
  razorpayLinkId?: string;
  razorpayLinkUrl?: string;
  razorpayLinkStatus?: string;
  upiAddress?: string;
  bankAccountNo?: string;
  status: string;
  paymentScreenshotUrl?: string;
  paymentProofNote?: string;
  referenceId?: string;
  notes?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

function generateUpiUrl(upiId: string, payeeName: string, amount: number, description: string) {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;
}

function UpiQrCode({ upiUrl, amount, companyName }: { upiUrl: string; amount: number; companyName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, upiUrl, {
        width: 240,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      }, () => {
        if (!cancelled) setQrReady(true);
      });
    });
    return () => { cancelled = true; };
  }, [upiUrl]);

  const downloadQr = useCallback(() => {
    if (!canvasRef.current) return;
    const downloadCanvas = document.createElement("canvas");
    const ctx = downloadCanvas.getContext("2d")!;
    const qrSize = 240;
    const padding = 30;
    const headerHeight = 50;
    const footerHeight = 40;
    const totalHeight = padding + headerHeight + qrSize + footerHeight + padding;
    const totalWidth = qrSize + padding * 2;
    downloadCanvas.width = totalWidth;
    downloadCanvas.height = totalHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(companyName, totalWidth / 2, padding + 20);
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "#666";
    ctx.fillText("Scan to pay via UPI", totalWidth / 2, padding + 38);
    ctx.drawImage(canvasRef.current, padding, padding + headerHeight, qrSize, qrSize);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.fillText(`₹${amount.toLocaleString("en-IN")}`, totalWidth / 2, padding + headerHeight + qrSize + 28);
    const link = document.createElement("a");
    link.download = `upi-qr-${amount}.jpg`;
    link.href = downloadCanvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [amount, companyName]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-xl border-2 border-muted">
        <canvas ref={canvasRef} />
      </div>
      {qrReady && (
        <Button variant="outline" size="sm" onClick={downloadQr} data-testid="button-download-qr">
          <Download className="h-4 w-4 mr-2" /> Download QR as JPG
        </Button>
      )}
    </div>
  );
}

function BankDetailsCard({ company }: { company: typeof COMPANIES[0] }) {
  const { toast } = useToast();
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  return (
    <div className="bg-muted/50 rounded-xl p-5 space-y-3 border">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-sm">Bank Transfer Details</span>
      </div>
      {[
        { label: "Account Name", value: company.bank.accountName },
        { label: "Account Number", value: company.bank.accountNo },
        { label: "IFSC Code", value: company.bank.ifsc },
        { label: "Bank", value: company.bank.bankName },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium font-mono">{value}</span>
            <button onClick={() => copyToClipboard(value, label)} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreatePaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receivingCompany, setReceivingCompany] = useState("Startup Squad Pvt Ltd");
  const [methods, setMethods] = useState<string[]>(["upi_qr", "bank_details", "razorpay_link"]);
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payment-requests", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      toast({ title: "Payment request created!" });
      onOpenChange(false);
      resetForm();
      setViewRequest(data);
      setViewDialogOpen(true);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState<PaymentRequest | null>(null);

  const resetForm = () => {
    setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
    setAmount(""); setDescription(""); setReferenceId(""); setNotes("");
    setMethods(["upi_qr", "bank_details", "razorpay_link"]);
  };

  const toggleMethod = (method: string) => {
    setMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const handleSubmit = () => {
    if (!customerName || !amount || !description || methods.length === 0) {
      toast({ title: "Please fill required fields and select at least one method", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      customerName, customerEmail, customerPhone,
      amount: parseFloat(amount), description,
      receivingCompany, methods, referenceId, notes,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Request</DialogTitle>
            <DialogDescription>Generate payment collection options for your customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Customer Name *</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name" data-testid="input-customer-name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@example.com" data-testid="input-customer-email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+91 9876543210" data-testid="input-customer-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (₹) *</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" data-testid="input-amount" />
              </div>
              <div>
                <Label>Receiving Company</Label>
                <Select value={receivingCompany} onValueChange={setReceivingCompany}>
                  <SelectTrigger data-testid="select-company"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Payment for..." data-testid="input-description" />
            </div>
            <div>
              <Label className="mb-2 block">Payment Methods *</Label>
              <div className="flex flex-col gap-2">
                {[
                  { id: "upi_qr", label: "UPI QR Code", icon: QrCode, color: "text-green-600" },
                  { id: "bank_details", label: "Bank Deposit Details", icon: Building2, color: "text-blue-600" },
                  { id: "razorpay_link", label: "Razorpay Payment Link", icon: CreditCard, color: "text-purple-600" },
                ].map(({ id, label, icon: Icon, color }) => (
                  <label key={id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${methods.includes(id) ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"}`}>
                    <Checkbox checked={methods.includes(id)} onCheckedChange={() => toggleMethod(id)} data-testid={`checkbox-method-${id}`} />
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Reference ID (optional)</Label>
              <Input value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="INV-001" data-testid="input-reference-id" />
            </div>
            <div>
              <Label>Internal Notes (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." rows={2} data-testid="input-notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-create-payment">
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {viewRequest && (
        <ShareDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} request={viewRequest} />
      )}
    </>
  );
}

function ShareDialog({ open, onOpenChange, request }: { open: boolean; onOpenChange: (v: boolean) => void; request: PaymentRequest }) {
  const { toast } = useToast();
  const company = COMPANIES.find(c => c.name === request.receivingCompany) || COMPANIES[0];
  const amount = parseFloat(request.amount);
  const upiUrl = generateUpiUrl(company.upi, company.name, amount, request.description);

  const buildWhatsappMsg = () => {
    let msg = `Hello ${request.customerName},\n\nPayment Request from *${company.name}*\n`;
    msg += `Amount: *₹${amount.toLocaleString("en-IN")}*\nFor: ${request.description}\n`;
    if (request.referenceId) msg += `Ref: ${request.referenceId}\n`;
    msg += `\n--- Payment Options ---\n`;
    if (request.methods.includes("upi_qr")) {
      msg += `\n📱 *UPI Payment*\nUPI ID: ${company.upi}\n`;
    }
    if (request.methods.includes("bank_details")) {
      msg += `\n🏦 *Bank Transfer*\nAccount: ${company.bank.accountNo}\nIFSC: ${company.bank.ifsc}\nBank: ${company.bank.bankName}\nName: ${company.bank.accountName}\n`;
    }
    if (request.methods.includes("razorpay_link") && request.razorpayLinkUrl) {
      msg += `\n💳 *Pay Online*\n${request.razorpayLinkUrl}\n`;
    }
    msg += `\nPlease share payment confirmation after transfer. Thank you!`;
    return msg;
  };

  const buildEmailBody = () => {
    let body = `Dear ${request.customerName},\n\nPlease find the payment details below:\n\n`;
    body += `Amount: INR ${amount.toLocaleString("en-IN")}\nDescription: ${request.description}\n`;
    if (request.referenceId) body += `Reference: ${request.referenceId}\n`;
    body += `\n--- Payment Options ---\n`;
    if (request.methods.includes("upi_qr")) {
      body += `\nUPI Payment\nUPI ID: ${company.upi}\n`;
    }
    if (request.methods.includes("bank_details")) {
      body += `\nBank Transfer\nAccount Number: ${company.bank.accountNo}\nIFSC: ${company.bank.ifsc}\nBank: ${company.bank.bankName}\nAccount Name: ${company.bank.accountName}\n`;
    }
    if (request.methods.includes("razorpay_link") && request.razorpayLinkUrl) {
      body += `\nPay Online: ${request.razorpayLinkUrl}\n`;
    }
    body += `\nKindly share the payment confirmation screenshot after making the transfer.\n\nRegards,\n${company.name}`;
    return body;
  };

  const shareWhatsapp = () => {
    const phone = request.customerPhone?.replace(/[^0-9]/g, "") || "";
    const msg = encodeURIComponent(buildWhatsappMsg());
    window.open(`https://wa.me/${phone.startsWith("91") || phone.length <= 10 ? (phone.length === 10 ? "91" + phone : phone) : phone}?text=${msg}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Payment Request - ₹${amount.toLocaleString("en-IN")} - ${request.description}`);
    const body = encodeURIComponent(buildEmailBody());
    window.open(`mailto:${request.customerEmail || ""}?subject=${subject}&body=${body}`, "_blank");
  };

  const copyAll = () => {
    navigator.clipboard.writeText(buildWhatsappMsg().replace(/\*/g, ""));
    toast({ title: "Payment details copied!" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Share Payment Details
          </DialogTitle>
          <DialogDescription>
            Payment request for {request.customerName} - ₹{amount.toLocaleString("en-IN")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">₹{amount.toLocaleString("en-IN")}</p>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </div>
            <Badge variant={request.status === "paid" ? "default" : "secondary"} className={request.status === "paid" ? "bg-green-100 text-green-700" : ""}>
              {request.status === "paid" ? "Paid" : "Pending"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.methods.includes("upi_qr") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <QrCode className="h-4 w-4" /> UPI QR Code
                </div>
                <UpiQrCode upiUrl={upiUrl} amount={amount} companyName={company.name} />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">UPI: <span className="font-mono">{company.upi}</span></p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {request.methods.includes("bank_details") && (
                <BankDetailsCard company={company} />
              )}
              {request.methods.includes("razorpay_link") && request.razorpayLinkUrl && (
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-400">
                    <CreditCard className="h-4 w-4" /> Razorpay Link
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={request.razorpayLinkUrl} readOnly className="text-xs font-mono" />
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(request.razorpayLinkUrl!); toast({ title: "Link copied!" }); }} data-testid="button-copy-razorpay">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(request.razorpayLinkUrl, "_blank")} data-testid="button-open-razorpay">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={shareWhatsapp} className="bg-[#25D366] hover:bg-[#20BD5A] text-white" data-testid="button-share-whatsapp">
              <MessageCircle className="h-4 w-4 mr-2" /> Send via WhatsApp
            </Button>
            <Button onClick={shareEmail} variant="outline" data-testid="button-share-email">
              <Mail className="h-4 w-4 mr-2" /> Send via Email
            </Button>
            <Button onClick={copyAll} variant="outline" data-testid="button-copy-all">
              <Copy className="h-4 w-4 mr-2" /> Copy All Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MarkAsPaidDialog({ open, onOpenChange, request }: { open: boolean; onOpenChange: (v: boolean) => void; request: PaymentRequest }) {
  const { toast } = useToast();
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markPaidMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/payment-requests/${request.id}/upload-screenshot`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      toast({ title: "Payment marked as paid!" });
      onOpenChange(false);
      setScreenshotUrl(""); setNote("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
          <DialogDescription>
            Upload payment proof screenshot for ₹{parseFloat(request.amount).toLocaleString("en-IN")} from {request.customerName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Payment Screenshot *</Label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
            {screenshotUrl ? (
              <div className="mt-2 relative group">
                <img src={screenshotUrl} alt="Payment proof" className="w-full max-h-48 object-contain rounded-lg border" />
                <button onClick={() => { setScreenshotUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="mt-2 w-full border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors" data-testid="button-upload-screenshot">
                {uploading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /> : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </button>
            )}
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Transaction ID, remarks..." rows={2} data-testid="input-payment-note" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => markPaidMutation.mutate({ screenshotUrl, note })} disabled={!screenshotUrl || markPaidMutation.isPending} data-testid="button-confirm-paid">
            {markPaidMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewScreenshotDialog({ open, onOpenChange, request }: { open: boolean; onOpenChange: (v: boolean) => void; request: PaymentRequest }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Proof</DialogTitle>
          <DialogDescription>
            {request.customerName} - ₹{parseFloat(request.amount).toLocaleString("en-IN")}
          </DialogDescription>
        </DialogHeader>
        {request.paymentScreenshotUrl && (
          <img src={request.paymentScreenshotUrl} alt="Payment proof" className="w-full rounded-lg border" />
        )}
        {request.paymentProofNote && (
          <p className="text-sm text-muted-foreground">{request.paymentProofNote}</p>
        )}
        {request.paidAt && (
          <p className="text-xs text-muted-foreground">Paid on: {new Date(request.paidAt).toLocaleString("en-IN")}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentLinksPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [shareRequest, setShareRequest] = useState<PaymentRequest | null>(null);
  const [markPaidRequest, setMarkPaidRequest] = useState<PaymentRequest | null>(null);
  const [viewScreenshot, setViewScreenshot] = useState<PaymentRequest | null>(null);

  const { data: requests = [], isLoading, refetch } = useQuery<PaymentRequest[]>({
    queryKey: ["/api/payment-requests"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/payment-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      toast({ title: "Payment request deleted" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/payment-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
    },
  });

  const filtered = requests.filter(r => {
    const matchesSearch = !search || r.customerName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || (r.referenceId || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    paid: requests.filter(r => r.status === "paid").length,
    totalAmount: requests.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0),
    paidAmount: requests.filter(r => r.status === "paid").reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0),
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">Paid</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const methodIcons = (methods: string[]) => (
    <div className="flex gap-1">
      {methods.includes("upi_qr") && <span title="UPI QR" className="inline-flex items-center justify-center h-6 w-6 rounded bg-green-100 dark:bg-green-950"><QrCode className="h-3.5 w-3.5 text-green-600" /></span>}
      {methods.includes("bank_details") && <span title="Bank Details" className="inline-flex items-center justify-center h-6 w-6 rounded bg-blue-100 dark:bg-blue-950"><Building2 className="h-3.5 w-3.5 text-blue-600" /></span>}
      {methods.includes("razorpay_link") && <span title="Razorpay Link" className="inline-flex items-center justify-center h-6 w-6 rounded bg-purple-100 dark:bg-purple-950"><CreditCard className="h-3.5 w-3.5 text-purple-600" /></span>}
    </div>
  );

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Collect Payment</h1>
          <p className="text-sm text-muted-foreground">Generate UPI QR, bank details, or Razorpay links and share with customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-new-payment">
            <Plus className="h-4 w-4 mr-2" /> New Payment Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, icon: IndianRupee, color: "text-foreground" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600" },
          { label: "Paid", value: stats.paid, icon: CheckCircle2, color: "text-green-600" },
          { label: "Amount Collected", value: `₹${stats.paidAmount.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color}`} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
                </div>
                <Icon className={`h-5 w-5 ${color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, description, ref..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="input-search" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36" data-testid="select-status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] dark:shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Methods</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payment requests found</TableCell></TableRow>
            ) : filtered.map(req => (
              <TableRow key={req.id} data-testid={`row-payment-${req.id}`}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{req.customerName}</p>
                    {req.customerPhone && <p className="text-xs text-muted-foreground">{req.customerPhone}</p>}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">₹{parseFloat(req.amount).toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm truncate max-w-[200px]">{req.description}</p>
                    {req.referenceId && <p className="text-xs text-muted-foreground font-mono">{req.referenceId}</p>}
                  </div>
                </TableCell>
                <TableCell>{methodIcons(req.methods || [])}</TableCell>
                <TableCell>
                  {req.status === "pending" ? (
                    <button onClick={() => setMarkPaidRequest(req)} className="cursor-pointer" data-testid={`button-status-${req.id}`}>
                      {statusBadge(req.status)}
                    </button>
                  ) : req.status === "paid" && req.paymentScreenshotUrl ? (
                    <button onClick={() => setViewScreenshot(req)} className="cursor-pointer" data-testid={`button-view-proof-${req.id}`}>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 gap-1">
                        <ImageIcon className="h-3 w-3" /> Paid
                      </Badge>
                    </button>
                  ) : statusBadge(req.status)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setShareRequest(req)} title="Share/View" data-testid={`button-share-${req.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {req.status === "pending" && (
                      <Button variant="ghost" size="icon" onClick={() => setMarkPaidRequest(req)} title="Mark as Paid" data-testid={`button-mark-paid-${req.id}`}>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this payment request?")) deleteMutation.mutate(req.id); }} title="Delete" data-testid={`button-delete-${req.id}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <CreatePaymentDialog open={createOpen} onOpenChange={setCreateOpen} />
      {shareRequest && <ShareDialog open={!!shareRequest} onOpenChange={v => !v && setShareRequest(null)} request={shareRequest} />}
      {markPaidRequest && <MarkAsPaidDialog open={!!markPaidRequest} onOpenChange={v => !v && setMarkPaidRequest(null)} request={markPaidRequest} />}
      {viewScreenshot && <ViewScreenshotDialog open={!!viewScreenshot} onOpenChange={v => !v && setViewScreenshot(null)} request={viewScreenshot} />}
    </div>
  );
}