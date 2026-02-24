import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Mail,
  Smartphone,
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Link2,
  Send,
  Loader2,
  ArrowUpDown,
  Eye,
} from "lucide-react";

interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  short_url: string;
  created_at: number;
  expire_by?: number;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  reference_id?: string;
  notes?: Record<string, string>;
  upi_link?: boolean;
  payments?: {
    payment_id: string;
    amount: number;
    status: string;
    method: string;
  }[];
}

interface PaymentLinksResponse {
  payment_links: PaymentLink[];
  count: number;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof CheckCircle2 }> = {
  created: { label: "Created", variant: "secondary", icon: Clock },
  partially_paid: { label: "Partially Paid", variant: "outline", icon: IndianRupee },
  paid: { label: "Paid", variant: "default", icon: CheckCircle2 },
  expired: { label: "Expired", variant: "destructive", icon: XCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

function formatAmount(paise: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CreatePaymentLinkDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isUpi, setIsUpi] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    expireBy: "",
    referenceId: "",
    notifySms: false,
    notifyEmail: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payment-links", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Payment Link Created",
        description: "Link has been generated successfully.",
      });
      navigator.clipboard.writeText(data.short_url);
      toast({
        title: "Link Copied",
        description: "Payment link copied to clipboard.",
      });
      setOpen(false);
      resetForm();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      expireBy: "",
      referenceId: "",
      notifySms: false,
      notifyEmail: false,
    });
    setIsUpi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      amount,
      description: formData.description,
      customerName: formData.customerName || undefined,
      customerEmail: formData.customerEmail || undefined,
      customerPhone: formData.customerPhone || undefined,
      expireBy: formData.expireBy || undefined,
      referenceId: formData.referenceId || undefined,
      notifySms: formData.notifySms,
      notifyEmail: formData.notifyEmail,
      isUpi,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-[#F34147] hover:bg-[#D93036] text-white" data-testid="button-create-payment-link">
          <Plus className="h-4 w-4 mr-2" />
          Create Payment Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-dialog-title">
            <Link2 className="h-5 w-5 text-[#F34147]" />
            Create Payment Link
          </DialogTitle>
          <DialogDescription>
            Generate a Razorpay payment link to share with your customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium">Link Type:</Label>
            <Tabs value={isUpi ? "upi" : "standard"} onValueChange={(v) => setIsUpi(v === "upi")}>
              <TabsList className="h-8">
                <TabsTrigger value="standard" className="text-xs px-3 h-7" data-testid="tab-standard">
                  <CreditCard className="h-3 w-3 mr-1" /> Standard
                </TabsTrigger>
                <TabsTrigger value="upi" className="text-xs px-3 h-7" data-testid="tab-upi">
                  <Smartphone className="h-3 w-3 mr-1" /> UPI
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (INR) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  data-testid="input-amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referenceId">Reference ID</Label>
              <Input
                id="referenceId"
                placeholder="INV-001"
                value={formData.referenceId}
                onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                data-testid="input-reference-id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Purpose *</Label>
            <Textarea
              id="description"
              placeholder="e.g., Dubai Tour - Booking Amount for Mr. Sharma"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              required
              data-testid="input-description"
            />
          </div>

          <div className="space-y-3 border rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground">Customer Details (Optional)</p>
            <div className="space-y-2">
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                placeholder="Customer name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                data-testid="input-customer-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  data-testid="input-customer-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  placeholder="+91 98765 43210"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  data-testid="input-customer-phone"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expireBy">Expiry Date (Optional)</Label>
            <Input
              id="expireBy"
              type="datetime-local"
              value={formData.expireBy}
              onChange={(e) => setFormData({ ...formData, expireBy: e.target.value })}
              data-testid="input-expire-by"
            />
          </div>

          <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Notify Customer:</p>
            <div className="flex items-center gap-2">
              <Switch
                id="notifySms"
                checked={formData.notifySms}
                onCheckedChange={(v) => setFormData({ ...formData, notifySms: v })}
                data-testid="switch-notify-sms"
              />
              <Label htmlFor="notifySms" className="text-sm flex items-center gap-1">
                <Smartphone className="h-3 w-3" /> SMS
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="notifyEmail"
                checked={formData.notifyEmail}
                onCheckedChange={(v) => setFormData({ ...formData, notifyEmail: v })}
                data-testid="switch-notify-email"
              />
              <Label htmlFor="notifyEmail" className="text-sm flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#F34147] hover:bg-[#D93036] text-white"
              disabled={createMutation.isPending}
              data-testid="button-generate-link"
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Generate Link</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LinkDetailDialog({ link }: { link: PaymentLink }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const notifyMutation = useMutation({
    mutationFn: async (medium: string) => {
      const res = await apiRequest("POST", `/api/payment-links/${link.id}/notify`, { medium });
      return res.json();
    },
    onSuccess: (_, medium) => {
      toast({ title: "Notification Sent", description: `${medium === 'sms' ? 'SMS' : 'Email'} notification sent to customer.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const statusConf = STATUS_CONFIG[link.status] || STATUS_CONFIG.created;
  const StatusIcon = statusConf.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" data-testid={`button-view-link-${link.id}`}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-link-detail-title">
            <Link2 className="h-5 w-5 text-[#F34147]" />
            Payment Link Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-2xl font-bold" data-testid="text-link-amount">{formatAmount(link.amount, link.currency)}</p>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </div>
            <Badge variant={statusConf.variant} className="flex items-center gap-1" data-testid={`badge-status-${link.id}`}>
              <StatusIcon className="h-3 w-3" />
              {statusConf.label}
            </Badge>
          </div>

          {link.customer && (link.customer.name || link.customer.email || link.customer.contact) && (
            <div className="space-y-2 border rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</p>
              {link.customer.name && <p className="text-sm font-medium" data-testid="text-customer-name">{link.customer.name}</p>}
              {link.customer.email && <p className="text-sm text-muted-foreground">{link.customer.email}</p>}
              {link.customer.contact && <p className="text-sm text-muted-foreground">{link.customer.contact}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Created</p>
              <p className="font-medium">{formatDate(link.created_at)}</p>
            </div>
            {link.expire_by && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Expires</p>
                <p className="font-medium">{formatDate(link.expire_by)}</p>
              </div>
            )}
            {link.reference_id && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Reference</p>
                <p className="font-medium">{link.reference_id}</p>
              </div>
            )}
            {link.notes?.created_by && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Created By</p>
                <p className="font-medium">{link.notes.created_by}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Input
              value={link.short_url}
              readOnly
              className="text-sm bg-white dark:bg-background"
              data-testid="input-link-url"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(link.short_url);
                toast({ title: "Copied!", description: "Link copied to clipboard." });
              }}
              data-testid="button-copy-link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(link.short_url, "_blank")}
              data-testid="button-open-link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {link.status === "created" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifyMutation.mutate("sms")}
                disabled={notifyMutation.isPending}
                className="flex-1"
                data-testid="button-resend-sms"
              >
                <Smartphone className="h-4 w-4 mr-1" /> Send SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifyMutation.mutate("email")}
                disabled={notifyMutation.isPending}
                className="flex-1"
                data-testid="button-resend-email"
              >
                <Mail className="h-4 w-4 mr-1" /> Send Email
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentLinksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<PaymentLinksResponse>({
    queryKey: ["/api/payment-links"],
  });

  const links = data?.payment_links || [];

  const filteredLinks = links
    .filter((link) => {
      const matchesSearch =
        !search ||
        link.description?.toLowerCase().includes(search.toLowerCase()) ||
        link.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        link.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
        link.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
        link.short_url?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || link.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => sortOrder === "newest" ? b.created_at - a.created_at : a.created_at - b.created_at);

  const stats = {
    total: links.length,
    created: links.filter((l) => l.status === "created").length,
    paid: links.filter((l) => l.status === "paid").length,
    expired: links.filter((l) => l.status === "expired").length,
    totalCollected: links
      .filter((l) => l.status === "paid")
      .reduce((sum, l) => sum + l.amount, 0),
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Payment link copied to clipboard." });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Payment Links</h1>
          <p className="text-muted-foreground text-sm">Generate and manage Razorpay payment links for customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <CreatePaymentLinkDialog onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/payment-links"] });
          }} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid="card-stat-total">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Link2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-stat-pending">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.created}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-stat-paid">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-stat-collected">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F34147]/10 rounded-lg">
                <IndianRupee className="h-5 w-5 text-[#F34147]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatAmount(stats.totalCollected)}</p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, description, reference..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="created">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          data-testid="button-sort"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#F34147]" />
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Link2 className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">No payment links found</p>
              <p className="text-sm">Create your first payment link to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => {
                  const statusConf = STATUS_CONFIG[link.status] || STATUS_CONFIG.created;
                  const StatusIcon = statusConf.icon;
                  return (
                    <TableRow key={link.id} data-testid={`row-link-${link.id}`}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium text-sm truncate" data-testid={`text-desc-${link.id}`}>{link.description}</p>
                          {link.reference_id && (
                            <p className="text-xs text-muted-foreground">Ref: {link.reference_id}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{link.customer?.name || "—"}</p>
                          {link.customer?.contact && (
                            <p className="text-xs text-muted-foreground">{link.customer.contact}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm" data-testid={`text-amount-${link.id}`}>
                          {formatAmount(link.amount, link.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConf.variant} className="flex items-center gap-1 w-fit" data-testid={`badge-status-${link.id}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {link.upi_link ? "UPI" : "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{formatDate(link.created_at)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <LinkDetailDialog link={link} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLink(link.short_url)}
                            data-testid={`button-copy-${link.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" data-testid={`button-more-${link.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(link.short_url, "_blank")}>
                                <ExternalLink className="h-4 w-4 mr-2" /> Open Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyLink(link.short_url)}>
                                <Copy className="h-4 w-4 mr-2" /> Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
