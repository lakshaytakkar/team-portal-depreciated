import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Search, 
  Plus, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  CreditCard, 
  QrCode, 
  Building2, 
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Upload,
  ExternalLink,
  MoreHorizontal,
  Share2,
  Mail,
  IndianRupee,
  FileText,
  Banknote,
  Smartphone,
  Link2,
  X,
  Check,
  MessageCircle
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import QRCode from "qrcode";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PersonCell } from "@/components/ui/avatar-cells";
import { CRM_COLOR } from "@/lib/crm-config";
import { PageShell } from "@/components/layout";
import { Separator } from "@/components/ui/separator";

const COMPANY_CONFIG = {
  "startup-squad": {
    name: "Startup Squad Pvt Ltd",
    upiId: "startingsquad@ybl",
    bank: {
      name: "HDFC Bank",
      accountName: "Startup Squad Pvt Ltd",
      accountNumber: "50200085441832",
      ifsc: "HDFC0000123",
      branch: "Connaught Place, New Delhi"
    },
    razorpayEnabled: true
  },
  "suprans-biz": {
    name: "Suprans Biz Solutions",
    upiId: "payments@supransbiz",
    bank: {
      name: "ICICI Bank",
      accountName: "Suprans Biz Solutions LLP",
      accountNumber: "920020043567891",
      ifsc: "ICIC0001234",
      branch: "Sector 18, Noida"
    },
    razorpayEnabled: false
  },
  "legalnations": {
    name: "LegalNations Consulting",
    upiId: "legalnations@paytm",
    bank: {
      name: "Axis Bank",
      accountName: "LegalNations Consulting Pvt Ltd",
      accountNumber: "921010045678234",
      ifsc: "UTIB0002345",
      branch: "Nehru Place, New Delhi"
    },
    razorpayEnabled: false
  }
};

type CompanyKey = keyof typeof COMPANY_CONFIG;

interface PaymentLink {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  description: string;
  methods: string[];
  receivingCompany: CompanyKey;
  status: "pending" | "paid" | "expired";
  createdAt: string;
  paidAt?: string;
  paymentNote?: string;
  upiQr?: string;
}

const initialPaymentLinks: PaymentLink[] = [
  {
    id: "PL-1001",
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh.k@gmail.com",
    customerPhone: "+91 98765 43210",
    amount: 15000,
    description: "Legal Consultation Fee",
    methods: ["UPI", "Bank Transfer"],
    receivingCompany: "startup-squad",
    status: "paid",
    createdAt: "2024-02-15T10:30:00Z",
    paidAt: "2024-02-16T14:20:00Z"
  },
  {
    id: "PL-1002",
    customerName: "Anita Sharma",
    customerEmail: "anita.s@outlook.com",
    customerPhone: "+91 91234 56789",
    amount: 45000,
    description: "Company Incorporation Advance",
    methods: ["UPI"],
    receivingCompany: "legalnations",
    status: "pending",
    createdAt: "2024-02-28T09:15:00Z"
  },
  {
    id: "PL-1003",
    customerName: "Vikram Singh",
    customerEmail: "vikram.v@techstart.in",
    customerPhone: "+91 99887 76655",
    amount: 12500,
    description: "Document Verification Service",
    methods: ["Bank Transfer"],
    receivingCompany: "suprans-biz",
    status: "expired",
    createdAt: "2024-02-01T11:00:00Z"
  },
  {
    id: "PL-1004",
    customerName: "Siddharth Malhotra",
    customerEmail: "sid.m@retailhub.com",
    customerPhone: "+91 98989 89898",
    amount: 85000,
    description: "E-commerce Setup Package",
    methods: ["UPI", "Bank Transfer", "Razorpay"],
    receivingCompany: "startup-squad",
    status: "pending",
    createdAt: "2024-03-01T15:45:00Z"
  },
  {
    id: "PL-1005",
    customerName: "Meera Iyer",
    customerEmail: "meera.iyer@lifestyle.in",
    customerPhone: "+91 97654 32109",
    amount: 22000,
    description: "Brand Registration Fee",
    methods: ["UPI"],
    receivingCompany: "legalnations",
    status: "paid",
    createdAt: "2024-02-20T12:00:00Z",
    paidAt: "2024-02-20T16:30:00Z"
  },
  {
    id: "PL-1006",
    customerName: "Arjun Reddy",
    customerEmail: "arjun.r@venture.com",
    customerPhone: "+91 95544 33221",
    amount: 150000,
    description: "Retainer Fee - Q1",
    methods: ["Bank Transfer"],
    receivingCompany: "startup-squad",
    status: "pending",
    createdAt: "2024-03-02T10:00:00Z"
  },
  {
    id: "PL-1007",
    customerName: "Priyanka Nair",
    customerEmail: "priyanka.n@global.com",
    customerPhone: "+91 94433 22110",
    amount: 35000,
    description: "GST Filing Assistance",
    methods: ["UPI", "Bank Transfer"],
    receivingCompany: "suprans-biz",
    status: "pending",
    createdAt: "2024-03-02T11:30:00Z"
  },
  {
    id: "PL-1008",
    customerName: "Amit Deshmukh",
    customerEmail: "amit.d@productions.in",
    customerPhone: "+91 93322 11009",
    amount: 5000,
    description: "Agreement Drafting",
    methods: ["UPI"],
    receivingCompany: "legalnations",
    status: "paid",
    createdAt: "2024-01-15T09:00:00Z",
    paidAt: "2024-01-15T11:45:00Z"
  }
];

export default function PaymentLinksPage() {
  const isLoading = useSimulatedLoading(800);
  const { toast } = useToast();
  const [links, setLinks] = useState<PaymentLink[]>(initialPaymentLinks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMarkAsPaidOpen, setIsMarkAsPaidOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [markPaidNote, setMarkPaidNote] = useState("");
  const [markPaidFile, setMarkPaidFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    amount: "",
    description: "",
    receivingCompany: "startup-squad" as CompanyKey,
    methods: ["UPI"] as string[]
  });

  const stats = {
    total: links.length,
    pending: links.filter(l => l.status === "pending").length,
    paid: links.filter(l => l.status === "paid").length,
    totalCollected: links.filter(l => l.status === "paid").reduce((sum, l) => sum + l.amount, 0)
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          link.id.toLowerCase().includes(search.toLowerCase()) ||
                          link.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || link.status === filter;
    return matchesSearch && matchesFilter;
  });

  const generateQRCode = async (amount: string, description: string, company: CompanyKey) => {
    try {
      const config = COMPANY_CONFIG[company];
      const upiUrl = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.name)}&am=${amount}&tn=${encodeURIComponent(description)}&cu=INR`;
      const url = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const drawBrandedQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !qrCodeUrl) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const company = COMPANY_CONFIG[formData.receivingCompany] || COMPANY_CONFIG["startup-squad"];
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 520;

      ctx.fillStyle = "#ffffff";
      ctx.roundRect(0, 0, 400, 520, 16);
      ctx.fill();

      ctx.fillStyle = CRM_COLOR;
      ctx.fillRect(0, 0, 400, 60);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(company.name, 200, 37);

      ctx.drawImage(img, 50, 80, 300, 300);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`₹${parseFloat(formData.amount).toLocaleString("en-IN")}`, 200, 420);

      ctx.fillStyle = "#6B7280";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText(formData.description || "Payment", 200, 445);

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(`UPI: ${company.upiId}`, 200, 475);
      ctx.fillText("Scan with any UPI app to pay", 200, 495);
    };
    img.src = qrCodeUrl;
  }, [qrCodeUrl, formData.receivingCompany, formData.amount, formData.description]);

  useEffect(() => {
    if (qrCodeUrl && canvasRef.current) {
      drawBrandedQR();
    }
  }, [qrCodeUrl, drawBrandedQR]);

  const handleCreateLink = () => {
    if (currentStep === 1) {
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
        toast({ title: "Missing Info", description: "Please fill in all customer details", variant: "destructive" });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.amount || !formData.description || formData.methods.length === 0) {
        toast({ title: "Missing Info", description: "Please fill in payment details", variant: "destructive" });
        return;
      }
      generateQRCode(formData.amount, formData.description, formData.receivingCompany);
      setCurrentStep(3);
    } else {
      const newLink: PaymentLink = {
        id: `PL-${1000 + links.length + 1}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        amount: parseFloat(formData.amount),
        description: formData.description,
        methods: formData.methods,
        receivingCompany: formData.receivingCompany,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      setLinks([newLink, ...links]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Payment Link Created", description: `₹${parseFloat(formData.amount).toLocaleString("en-IN")} payment link sent to ${formData.customerName}` });
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      amount: "",
      description: "",
      receivingCompany: "startup-squad",
      methods: ["UPI"]
    });
    setCurrentStep(1);
    setQrCodeUrl("");
  };

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: label ? `${label} copied to clipboard` : "Copied to clipboard" });
  };

  const downloadBrandedQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `payment-qr-${formData.customerName.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      downloadBrandedQR();
    } else {
      const link = document.createElement("a");
      link.download = `qr-${formData.customerName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const getShareWhatsAppMessage = (link: PaymentLink) => {
    const company = COMPANY_CONFIG[link.receivingCompany];
    let msg = `Hi ${link.customerName},\n\n`;
    msg += `Here are the payment details for: *${link.description}*\n`;
    msg += `Amount: *₹${link.amount.toLocaleString("en-IN")}*\n\n`;
    
    if (link.methods.includes("UPI")) {
      msg += `*UPI Payment:*\nUPI ID: ${company.upiId}\n\n`;
    }
    if (link.methods.includes("Bank Transfer")) {
      msg += `*Bank Transfer:*\n`;
      msg += `Bank: ${company.bank.name}\n`;
      msg += `A/C Name: ${company.bank.accountName}\n`;
      msg += `A/C No: ${company.bank.accountNumber}\n`;
      msg += `IFSC: ${company.bank.ifsc}\n`;
      msg += `Branch: ${company.bank.branch}\n\n`;
    }
    if (link.methods.includes("Razorpay")) {
      msg += `*Online Payment:*\nhttps://rzp.io/l/${link.id}\n\n`;
    }
    msg += `Payment Link: https://pay.suprans.com/${link.id}\n\n`;
    msg += `From: ${company.name}\nThank you!`;
    return msg;
  };

  const getShareEmailSubject = (link: PaymentLink) => {
    const company = COMPANY_CONFIG[link.receivingCompany];
    return `Payment Request - ₹${link.amount.toLocaleString("en-IN")} | ${company.name}`;
  };

  const getShareEmailBody = (link: PaymentLink) => {
    return getShareWhatsAppMessage(link).replace(/\*/g, "");
  };

  const openShareDialog = (link: PaymentLink) => {
    setSelectedLink(link);
    setIsShareDialogOpen(true);
  };

  const handleMarkAsPaid = (linkId: string) => {
    setLinks(links.map(l => l.id === linkId ? { ...l, status: "paid" as const, paidAt: new Date().toISOString(), paymentNote: markPaidNote || undefined } : l));
    setIsMarkAsPaidOpen(false);
    setMarkPaidNote("");
    setMarkPaidFile(null);
    toast({ title: "Payment Confirmed", description: "Payment has been marked as paid." });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge data-testid={`badge-status-paid`} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 flex items-center gap-1 no-default-hover-elevate no-default-active-elevate"><CheckCircle2 className="size-3" /> Paid</Badge>;
      case "pending": return <Badge data-testid={`badge-status-pending`} className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 flex items-center gap-1 no-default-hover-elevate no-default-active-elevate"><Clock className="size-3" /> Pending</Badge>;
      case "expired": return <Badge data-testid={`badge-status-expired`} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 flex items-center gap-1 no-default-hover-elevate no-default-active-elevate"><AlertCircle className="size-3" /> Expired</Badge>;
      default: return null;
    }
  };

  const getMethodBadges = (methods: string[]) => (
    <div className="flex items-center gap-1 flex-wrap">
      {methods.map(m => {
        const icon = m === "UPI" ? <QrCode className="size-2.5" /> : m === "Bank Transfer" ? <Building2 className="size-2.5" /> : <CreditCard className="size-2.5" />;
        return (
          <Badge key={m} variant="outline" className="text-[10px] gap-1 no-default-hover-elevate no-default-active-elevate">
            {icon} {m}
          </Badge>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-64" />
          </div>
          <div className="h-10 bg-muted rounded w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-10 bg-muted rounded w-full" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl w-full" />
          ))}
        </div>
      </PageShell>
    );
  }

  const currentCompany = COMPANY_CONFIG[formData.receivingCompany];

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Payment Links</h1>
            <p className="text-muted-foreground" data-testid="text-page-description">Generate and track payment links for your clients</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="button-create-payment-link"
            style={{ backgroundColor: CRM_COLOR }}
          >
            <Plus className="size-4 mr-1.5" /> Create Payment Link
          </Button>
        </div>
      </Fade>

      <Fade delay={0.05}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card data-testid="stat-total-requests">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${CRM_COLOR}15` }}>
                  <FileText className="size-4" style={{ color: CRM_COLOR }} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-pending">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="size-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-paid">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.paid}</p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-collected">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                  <IndianRupee className="size-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">₹{stats.totalCollected.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </CardContent>
          </Card>
        </div>
      </Fade>

      <Fade delay={0.1}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              className="pl-10 rounded-md"
              placeholder="Search by customer, ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-payments"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-md w-full md:w-auto overflow-x-auto no-scrollbar">
            {["all", "pending", "paid", "expired"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  filter === s 
                    ? "text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={filter === s ? { backgroundColor: CRM_COLOR } : {}}
                data-testid={`pill-status-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Fade>

      <Stagger className="space-y-3">
        {filteredLinks.map((link) => (
          <StaggerItem key={link.id}>
            <Card className="hover-elevate" data-testid={`card-payment-${link.id}`}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <PersonCell name={link.customerName} subtitle={link.description} />
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase shrink-0" data-testid={`text-id-${link.id}`}>{link.id}</span>
                </div>

                <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Amount</p>
                    <p className="font-bold text-sm" data-testid={`text-amount-${link.id}`}>₹{link.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Company</p>
                    <p className="text-sm truncate max-w-[120px]">{COMPANY_CONFIG[link.receivingCompany]?.name.split(" ").slice(0, 2).join(" ")}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Methods</p>
                    {getMethodBadges(link.methods)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
                    {getStatusBadge(link.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openShareDialog(link)}
                    data-testid={`button-share-${link.id}`}
                  >
                    <Share2 className="size-3 mr-1" /> Share
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-menu-${link.id}`}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => copyToClipboard(`https://pay.suprans.com/${link.id}`, "Payment link")}
                        data-testid={`menu-copy-${link.id}`}
                      >
                        <Copy className="size-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openShareDialog(link)}
                        data-testid={`menu-share-${link.id}`}
                      >
                        <Share2 className="size-4 mr-2" /> Share Details
                      </DropdownMenuItem>
                      {link.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedLink(link);
                              setIsMarkAsPaidOpen(true);
                            }}
                            className="text-emerald-600 focus:text-emerald-600"
                            data-testid={`menu-mark-paid-${link.id}`}
                          >
                            <CheckCircle2 className="size-4 mr-2" /> Mark as Paid
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}

        {filteredLinks.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="bg-muted size-12 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <CreditCard className="size-6" />
            </div>
            <p className="text-muted-foreground text-sm" data-testid="text-empty-state">No payment links found matching your search.</p>
          </div>
        )}
      </Stagger>

      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg" data-testid="dialog-create-payment">
          <DialogHeader>
            <DialogTitle>Create Payment Link</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3: {currentStep === 1 ? "Customer Details" : currentStep === 2 ? "Payment Info" : "Preview & Share"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div 
                  className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step <= currentStep ? "text-white" : "bg-muted text-muted-foreground"
                  }`}
                  style={step <= currentStep ? { backgroundColor: CRM_COLOR } : {}}
                  data-testid={`step-indicator-${step}`}
                >
                  {step < currentStep ? <Check className="size-3.5" /> : step}
                </div>
                {step < 3 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${step < currentStep ? "bg-sky-600" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <div className="py-2">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input 
                    id="customerName"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input 
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    data-testid="input-customer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input 
                    id="customerPhone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    data-testid="input-customer-phone"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                    <Input 
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      data-testid="input-amount"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description"
                    placeholder="e.g. Service charge for Feb"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    data-testid="input-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Receiving Company</Label>
                  <Select 
                    value={formData.receivingCompany} 
                    onValueChange={(v) => setFormData({...formData, receivingCompany: v as CompanyKey})}
                  >
                    <SelectTrigger data-testid="select-company">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMPANY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key} data-testid={`option-company-${key}`}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 pt-2">
                  <Label>Payment Methods</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="method-upi" 
                        checked={formData.methods.includes("UPI")}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData({...formData, methods: [...formData.methods, "UPI"]});
                          else setFormData({...formData, methods: formData.methods.filter(m => m !== "UPI")});
                        }}
                        data-testid="checkbox-upi"
                      />
                      <label htmlFor="method-upi" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5">
                        <QrCode className="size-3.5" /> UPI
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="method-bank" 
                        checked={formData.methods.includes("Bank Transfer")}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData({...formData, methods: [...formData.methods, "Bank Transfer"]});
                          else setFormData({...formData, methods: formData.methods.filter(m => m !== "Bank Transfer")});
                        }}
                        data-testid="checkbox-bank"
                      />
                      <label htmlFor="method-bank" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5">
                        <Building2 className="size-3.5" /> Bank Transfer
                      </label>
                    </div>
                    {COMPANY_CONFIG[formData.receivingCompany]?.razorpayEnabled && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="method-razorpay" 
                          checked={formData.methods.includes("Razorpay")}
                          onCheckedChange={(checked) => {
                            if (checked) setFormData({...formData, methods: [...formData.methods, "Razorpay"]});
                            else setFormData({...formData, methods: formData.methods.filter(m => m !== "Razorpay")});
                          }}
                          data-testid="checkbox-razorpay"
                        />
                        <label htmlFor="method-razorpay" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5">
                          <CreditCard className="size-3.5" /> Razorpay
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Payment Request to</p>
                  <p className="text-lg font-bold" data-testid="text-preview-name">{formData.customerName}</p>
                  <p className="text-2xl font-bold text-emerald-600" data-testid="text-preview-amount">₹{parseFloat(formData.amount).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{currentCompany.name}</p>
                </div>

                <div className="w-full space-y-4">
                  {formData.methods.includes("UPI") && (
                    <div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md border border-dashed flex flex-col items-center gap-3" data-testid="section-upi-qr">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <QrCode className="size-3" /> Scan QR to Pay via UPI
                      </p>
                      {qrCodeUrl && (
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <img src={qrCodeUrl} alt="UPI QR Code" className="size-40" data-testid="img-qr-code" />
                        </div>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                      <p className="text-xs text-muted-foreground">UPI ID: <span className="font-mono font-medium text-foreground">{currentCompany.upiId}</span></p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={downloadQR} data-testid="button-download-qr">
                          <Download className="size-3 mr-1" /> Download QR
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(currentCompany.upiId, "UPI ID")} data-testid="button-copy-upi">
                          <Copy className="size-3 mr-1" /> Copy VPA
                        </Button>
                      </div>
                    </div>
                  )}

                  {formData.methods.includes("Bank Transfer") && (
                    <div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md space-y-3" data-testid="section-bank-details">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3" /> Bank Transfer Details
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: "Bank", value: currentCompany.bank.name },
                          { label: "A/C Name", value: currentCompany.bank.accountName },
                          { label: "A/C Number", value: currentCompany.bank.accountNumber },
                          { label: "IFSC Code", value: currentCompany.bank.ifsc },
                          { label: "Branch", value: currentCompany.bank.branch },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between text-sm gap-2">
                            <span className="text-muted-foreground shrink-0">{label}:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium truncate">{value}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0"
                                onClick={() => copyToClipboard(value, label)}
                                data-testid={`button-copy-bank-${label.toLowerCase().replace(/[^a-z]/g, "")}`}
                              >
                                <Copy className="size-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.methods.includes("Razorpay") && (
                    <div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md space-y-2" data-testid="section-razorpay">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="size-3" /> Razorpay Payment Link
                      </p>
                      <div className="flex items-center gap-2">
                        <Input 
                          readOnly 
                          value={`https://rzp.io/l/PL-${1000 + links.length + 1}`}
                          className="text-xs font-mono"
                          data-testid="input-razorpay-link"
                        />
                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(`https://rzp.io/l/PL-${1000 + links.length + 1}`, "Razorpay link")} data-testid="button-copy-razorpay">
                          <Copy className="size-4" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Link will be active once connected with Razorpay</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs">Payment Page Link</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        readOnly 
                        value={`https://pay.suprans.com/PL-${1000 + links.length + 1}`}
                        className="text-xs font-mono"
                        data-testid="input-payment-link"
                      />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(`https://pay.suprans.com/PL-${1000 + links.length + 1}`, "Payment link")} data-testid="button-copy-link">
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-2">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)} data-testid="button-step-back">
                <ChevronLeft className="size-4 mr-1" /> Back
              </Button>
            ) : (
              <div />
            )}
            <Button 
              onClick={handleCreateLink}
              style={{ backgroundColor: CRM_COLOR }}
              data-testid="button-step-continue"
            >
              {currentStep < 3 ? "Continue" : "Finish & Save"}
              {currentStep < 3 && <ChevronRight className="size-4 ml-1" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-share">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="size-5" /> Share Payment Details
            </DialogTitle>
            <DialogDescription>
              Send payment information to {selectedLink?.customerName}
            </DialogDescription>
          </DialogHeader>
          {selectedLink && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-md">
                <div>
                  <p className="font-medium text-sm">{selectedLink.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedLink.description}</p>
                </div>
                <p className="font-bold text-lg" data-testid="text-share-amount">₹{selectedLink.amount.toLocaleString("en-IN")}</p>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full justify-start gap-3 bg-emerald-600 text-white"
                  onClick={() => {
                    const msg = getShareWhatsAppMessage(selectedLink);
                    const phone = selectedLink.customerPhone.replace(/\s+/g, "").replace("+", "");
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="size-4" />
                  Share via WhatsApp
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    const subject = getShareEmailSubject(selectedLink);
                    const body = getShareEmailBody(selectedLink);
                    window.open(`mailto:${selectedLink.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
                  }}
                  data-testid="button-share-email"
                >
                  <Mail className="size-4" />
                  Share via Email
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    const msg = getShareWhatsAppMessage(selectedLink).replace(/\*/g, "");
                    copyToClipboard(msg, "Payment details");
                  }}
                  data-testid="button-share-copy-all"
                >
                  <Copy className="size-4" />
                  Copy All Details
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => copyToClipboard(`https://pay.suprans.com/${selectedLink.id}`, "Payment link")}
                  data-testid="button-share-copy-link"
                >
                  <Link2 className="size-4" />
                  Copy Payment Link
                </Button>
              </div>

              {selectedLink.methods.includes("Bank Transfer") && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="size-3" /> Bank Details — {COMPANY_CONFIG[selectedLink.receivingCompany]?.bank.name}
                    </p>
                    <div className="space-y-1.5">
                      {(() => {
                        const bank = COMPANY_CONFIG[selectedLink.receivingCompany]?.bank;
                        if (!bank) return null;
                        return [
                          { label: "A/C Name", value: bank.accountName },
                          { label: "A/C No", value: bank.accountNumber },
                          { label: "IFSC", value: bank.ifsc },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between text-sm gap-2">
                            <span className="text-muted-foreground text-xs">{label}:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs font-medium">{value}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0"
                                onClick={() => copyToClipboard(value, label)}
                                data-testid={`button-share-copy-${label.toLowerCase().replace(/[^a-z]/g, "")}`}
                              >
                                <Copy className="size-3" />
                              </Button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMarkAsPaidOpen} onOpenChange={(open) => {
        setIsMarkAsPaidOpen(open);
        if (!open) {
          setMarkPaidNote("");
          setMarkPaidFile(null);
        }
      }}>
        <DialogContent data-testid="dialog-mark-paid">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Marking payment for {selectedLink?.customerName} as paid.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-5">
            <div className="flex flex-col items-center gap-2">
              <p className="text-muted-foreground text-sm uppercase font-bold tracking-wider">Amount Received</p>
              <p className="text-4xl font-black" data-testid="text-mark-paid-amount">₹{selectedLink?.amount.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">{selectedLink?.description}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNote">Confirmation Note (Optional)</Label>
              <Textarea
                id="confirmNote"
                placeholder="e.g. Received via NEFT, Ref: TXN123456"
                value={markPaidNote}
                onChange={(e) => setMarkPaidNote(e.target.value)}
                className="resize-none"
                rows={3}
                data-testid="input-confirm-note"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Proof (Optional)</Label>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.pdf"
                onChange={(e) => setMarkPaidFile(e.target.files?.[0] || null)}
              />
              {markPaidFile ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{markPaidFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMarkPaidFile(null)}
                    data-testid="button-remove-file"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                  data-testid="dropzone-payment-proof"
                >
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsMarkAsPaidOpen(false)} data-testid="button-cancel-mark-paid">Cancel</Button>
            <Button 
              style={{ backgroundColor: CRM_COLOR }}
              onClick={() => selectedLink && handleMarkAsPaid(selectedLink.id)}
              data-testid="button-confirm-payment"
            >
              <CheckCircle2 className="size-4 mr-1.5" /> Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
