import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FileText, IndianRupee, Users, User, Mail, Phone, Building2,
  ExternalLink, Search, Plus, Globe, Hash, Calendar, ArrowLeft,
  CheckCircle2, Circle, BookOpen, Youtube, FileCheck, ClipboardCheck,
  Send, Copy, Eye, Pencil, Save, X, MapPin, CreditCard,
  AlertCircle, ChevronRight, BarChart3, Clock, Package,
  Printer, Truck, MessageSquare, LinkIcon,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { DataTable, type Column } from "@/components/ds/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/ui/animated";
import { PageShell, StatCard } from "@/components/layout";
import { DocumentManager } from "@/components/legalnations/document-manager";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const LEGALNATIONS_COLOR = "#225AEA";

interface TaxFiling {
  id: string;
  client_id: string | null;
  llc_name: string | null;
  llc_type: string | null;
  amount_received: number;
  main_entity_name: string | null;
  contact_details: string | null;
  address: string | null;
  address_2: string | null;
  email_address: string | null;
  status: string;
  date_of_formation: string | null;
  notes: string | null;
  bank_transactions_count: number;
  filing_done: boolean;
  ein_number: string | null;
  reference_number: string | null;
  tax_standing: string | null;
  annual_report_filed: boolean;
  state_annual_report_due: string | null;
  country: string | null;
  naics: string | null;
  principal_activity: string | null;
  personal_address: string | null;
  pan_aadhar_dl: string | null;
  filled_1120: boolean;
  filled_5472: boolean;
  verified_ein_in_form: boolean;
  message: string | null;
  subject: string | null;
  recipient: string | null;
  fax: string | null;
  bank_statements_status: string | null;
  business_activity: string | null;
  date_copy: string | null;
  send_mail_status: string | null;
  tax_standing_last_checked: string | null;
  filing_search_url: string | null;
  additional_notes: string | null;
  filing_stage: string | null;
  mail_tracking_number: string | null;
  fax_confirmation: string | null;
  required_documents: string | null;
  created_at: string;
  updated_at: string | null;
}

const statusVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "In progress": "warning",
  "Not Started": "neutral",
  "Completed": "success",
  "Filed": "success",
  "Pending": "info",
};

const FILING_STAGES = [
  "Document Collection",
  "EIN Verification",
  "Form 1120 Preparation",
  "Form 5472 Preparation",
  "Review & QC",
  "Print & Package",
  "Mail to IRS",
  "Awaiting Confirmation",
  "Filed & Confirmed",
];

const stageVariant: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "Document Collection": "neutral",
  "EIN Verification": "info",
  "Form 1120 Preparation": "warning",
  "Form 5472 Preparation": "warning",
  "Review & QC": "info",
  "Print & Package": "info",
  "Mail to IRS": "warning",
  "Awaiting Confirmation": "warning",
  "Filed & Confirmed": "success",
};

const IRS_RESOURCES = [
  { title: "Form 1120 (Corporation Tax Return)", url: "https://www.irs.gov/forms-pubs/about-form-1120", type: "form", desc: "Pro Forma 1120 for foreign-owned single-member LLCs" },
  { title: "Form 5472 (Foreign-Owned LLC Disclosure)", url: "https://www.irs.gov/forms-pubs/about-form-5472", type: "form", desc: "Information Return for 25% Foreign-Owned U.S. Corporation" },
  { title: "Form 1120-S (S-Corp Tax Return)", url: "https://www.irs.gov/forms-pubs/about-form-1120-s", type: "form", desc: "For S-Corporation elections" },
  { title: "Form 1065 (Partnership Return)", url: "https://www.irs.gov/forms-pubs/about-form-1065", type: "form", desc: "For multi-member LLC partnerships" },
  { title: "Form 8832 (Entity Classification)", url: "https://www.irs.gov/forms-pubs/about-form-8832", type: "form", desc: "Entity Classification Election" },
  { title: "How to File Form 5472 for Foreign LLC", url: "https://www.youtube.com/results?search_query=form+5472+filing+guide+foreign+owned+LLC", type: "video" },
  { title: "Pro Forma 1120 Filing Guide", url: "https://www.youtube.com/results?search_query=pro+forma+1120+disregarded+entity+filing", type: "video" },
  { title: "Single Member LLC Tax Return Tutorial", url: "https://www.youtube.com/results?search_query=how+to+file+single+member+LLC+tax+return+IRS", type: "video" },
  { title: "Multi Member LLC Partnership Filing", url: "https://www.youtube.com/results?search_query=multi+member+LLC+partnership+form+1065+filing", type: "video" },
  { title: "Wyoming Annual Report Filing", url: "https://www.youtube.com/results?search_query=wyoming+annual+report+filing+LLC", type: "video" },
  { title: "LetterStream - Certified Mail to IRS", url: "https://www.letterstream.com/", type: "service", desc: "Send tax returns via certified mail" },
  { title: "IRS Where to File Addresses", url: "https://www.irs.gov/filing/where-to-file-paper-tax-returns-with-or-without-a-payment", type: "reference" },
  { title: "Wyoming Business Filing Search", url: "https://wyobiz.wyo.gov/Business/FilingSearch.aspx", type: "reference" },
  { title: "IRS Tax Calendar (Pub 509)", url: "https://www.irs.gov/pub/irs-pdf/p509.pdf", type: "reference" },
  { title: "NAICS Code Lookup", url: "https://www.naics.com/search/", type: "reference" },
  { title: "IRS EIN Verification", url: "https://www.irs.gov/businesses/small-businesses-self-employed/lost-or-misplaced-your-ein", type: "reference" },
];

const CROSS_SELL_TEMPLATES = {
  whatsapp: `Hi {name}! 👋\n\nThis is a reminder about your annual USA tax filing requirement for {llc_name}.\n\nAs a US LLC owner, you need to file a tax return (Pro Forma 1120 + Form 5472) with the IRS every year.\n\n💰 Our Tax Filing Service:\n• Single Member LLC: ₹15,000 + GST\n• Multi Member LLC: ₹19,000 + GST\n\nWe handle everything - form preparation, filing with IRS via certified mail, and confirmation.\n\nWould you like us to handle this for you?`,
  email_subject: `USA Tax Filing Reminder - {llc_name}`,
  email_body: `Dear {name},\n\nI hope this message finds you well.\n\nAs the tax filing season approaches, I wanted to remind you about the annual tax filing requirement for your US LLC ({llc_name}).\n\nEven if your LLC had zero transactions, the IRS requires filing a Pro Forma 1120 along with Form 5472 for foreign-owned LLCs.\n\nOur Tax Filing Service:\n- Single Member LLC: ₹15,000 + GST (₹17,700 total)\n- Multi Member LLC: ₹19,000 + GST (₹22,420 total)\n\nWhat's included:\n✓ Complete form preparation (1120 + 5472)\n✓ Review and verification\n✓ Filing via certified mail to IRS\n✓ Confirmation and tracking\n✓ Copy of all filed documents\n\nPlease let me know if you'd like to proceed.\n\nBest regards,\nLegalNations Team`,
};

const FILING_PROCEDURE = [
  { step: "Identify Eligible Clients", desc: "Check all LLC clients with formation date before Dec 31 of the tax year. Both single and multi-member LLCs need annual filing.", icon: Search },
  { step: "Cross-Sell Outreach", desc: "Send WhatsApp/email templates to eligible clients. Follow up within 3-5 days. Track conversions.", icon: Send },
  { step: "Collect Documents", desc: "Gather: PAN/Aadhar/DL copy, Bank Statements (full year), EIN confirmation letter, LLC formation documents.", icon: Package },
  { step: "Verify EIN & Details", desc: "Verify EIN number against IRS records. Confirm LLC name, formation date, address, and member details.", icon: ClipboardCheck },
  { step: "Prepare Form 1120", desc: "Fill Pro Forma 1120 with LLC details, zeroes for income/expenses (disregarded entity). Mark as information return.", icon: FileText },
  { step: "Prepare Form 5472", desc: "Fill Form 5472 with foreign owner details, LLC info, reportable transactions from bank statements.", icon: FileText },
  { step: "Review & Quality Check", desc: "Cross-verify all details: EIN, addresses, transaction amounts. Get second reviewer sign-off.", icon: Eye },
  { step: "Print & Package", desc: "Print completed forms. Prepare mailing package with cover letter addressed to IRS service center.", icon: Printer },
  { step: "Mail via LetterStream", desc: "Send via LetterStream certified mail. Save tracking number and fax confirmation. IRS address depends on state.", icon: Truck },
  { step: "Track & Confirm", desc: "Monitor delivery status. Save fax confirmation. Update client record with reference number and filing date.", icon: CheckCircle2 },
  { step: "Send Copies to Client", desc: "Email/share filed copies with client. Update filing status to 'Completed'. Send receipt/invoice.", icon: Mail },
];

function formatCurrency(val: number) {
  return val ? `₹${val.toLocaleString("en-IN")}` : "—";
}

function FilingDetailPanel({ filing, onClose, onUpdate, isSaving }: {
  filing: TaxFiling;
  onClose: () => void;
  onUpdate: (updates: Partial<TaxFiling>) => void;
  isSaving?: boolean;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<TaxFiling>>({});

  const startEdit = () => {
    setForm({ ...filing });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate(form);
    setEditing(false);
  };

  const rawStageIdx = FILING_STAGES.indexOf(filing.filing_stage || "Document Collection");
  const currentStageIdx = rawStageIdx >= 0 ? rawStageIdx : 0;

  const personalized = (template: string) =>
    template
      .replace(/\{name\}/g, filing.main_entity_name || "Client")
      .replace(/\{llc_name\}/g, filing.llc_name || "Your LLC");

  const waLink = filing.contact_details
    ? `https://wa.me/${filing.contact_details.replace(/\D/g, "")}?text=${encodeURIComponent(personalized(CROSS_SELL_TEMPLATES.whatsapp))}`
    : null;

  const mailtoLink = filing.email_address
    ? `mailto:${filing.email_address}?subject=${encodeURIComponent(personalized(CROSS_SELL_TEMPLATES.email_subject))}&body=${encodeURIComponent(personalized(CROSS_SELL_TEMPLATES.email_body))}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="btn-back-filings">
          <ArrowLeft className="size-4 mr-1" /> Back to Filings
        </Button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} data-testid="btn-cancel-edit">
                <X className="size-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={isSaving} data-testid="btn-save-filing">
                <Save className="size-3.5 mr-1" /> {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={startEdit} data-testid="btn-edit-filing">
              <Pencil className="size-3.5 mr-1" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-filing-llc">{filing.llc_name || "Unnamed LLC"}</h2>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={filing.llc_type || "—"} variant={filing.llc_type === "Multi Member" ? "info" : "neutral"} />
            <StatusBadge status={filing.filing_stage || "Document Collection"} variant={stageVariant[filing.filing_stage || "Document Collection"] || "neutral"} />
            <span className="text-sm text-muted-foreground">{filing.main_entity_name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" data-testid="btn-wa-filing">
                <SiWhatsapp className="size-3.5 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          {mailtoLink && (
            <a href={mailtoLink}>
              <Button size="sm" variant="outline" data-testid="btn-email-filing">
                <Mail className="size-3.5 mr-1" /> Email
              </Button>
            </a>
          )}
          {filing.contact_details && (
            <a href={`tel:${filing.contact_details}`}>
              <Button size="sm" variant="outline" data-testid="btn-call-filing">
                <Phone className="size-3.5 mr-1" /> Call
              </Button>
            </a>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Filing Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-3">
            {FILING_STAGES.map((stage, idx) => (
              <div key={stage} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-2 w-full rounded-full ${
                    idx <= currentStageIdx
                      ? idx === currentStageIdx
                        ? "bg-primary"
                        : "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {FILING_STAGES.map((stage, idx) => (
              <span
                key={stage}
                className={`text-[9px] text-center flex-1 ${
                  idx <= currentStageIdx ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {stage.split(" ").slice(0, 2).join(" ")}
              </span>
            ))}
          </div>
          {editing && (
            <div className="mt-4">
              <Label className="text-xs">Update Stage</Label>
              <Select value={form.filing_stage || filing.filing_stage || ""} onValueChange={(v) => setForm({ ...form, filing_stage: v })}>
                <SelectTrigger data-testid="select-filing-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILING_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="details" data-testid="filing-detail-tabs">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="details">Client & LLC Details</TabsTrigger>
          <TabsTrigger value="filing">Filing Information</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="documents">Documents & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><User className="size-4 text-primary" /> Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoField label="Entity Name" value={editing ? form.main_entity_name : filing.main_entity_name} editing={editing} onChange={(v) => setForm({ ...form, main_entity_name: v })} />
                <InfoField label="Contact" value={editing ? form.contact_details : filing.contact_details} editing={editing} onChange={(v) => setForm({ ...form, contact_details: v })} />
                <InfoField label="Email" value={editing ? form.email_address : filing.email_address} editing={editing} onChange={(v) => setForm({ ...form, email_address: v })} />
                <InfoField label="Country" value={editing ? form.country : filing.country} editing={editing} onChange={(v) => setForm({ ...form, country: v })} />
                <InfoField label="PAN/Aadhar/DL" value={editing ? form.pan_aadhar_dl : filing.pan_aadhar_dl} editing={editing} onChange={(v) => setForm({ ...form, pan_aadhar_dl: v })} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Building2 className="size-4 text-primary" /> LLC Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoField label="LLC Name" value={editing ? form.llc_name : filing.llc_name} editing={editing} onChange={(v) => setForm({ ...form, llc_name: v })} />
                <InfoField label="LLC Type" value={filing.llc_type} />
                <InfoField label="Formation Date" value={editing ? form.date_of_formation : filing.date_of_formation} editing={editing} onChange={(v) => setForm({ ...form, date_of_formation: v })} />
                <InfoField label="EIN Number" value={editing ? form.ein_number : filing.ein_number} editing={editing} onChange={(v) => setForm({ ...form, ein_number: v })} />
                <InfoField label="Amount Received" value={formatCurrency(filing.amount_received)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><MapPin className="size-4 text-primary" /> Address & Banking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoField label="Address" value={editing ? form.address : filing.address} editing={editing} onChange={(v) => setForm({ ...form, address: v })} multiline />
                <InfoField label="Address 2" value={editing ? form.address_2 : filing.address_2} editing={editing} onChange={(v) => setForm({ ...form, address_2: v })} />
                <InfoField label="Personal Address" value={editing ? form.personal_address : filing.personal_address} editing={editing} onChange={(v) => setForm({ ...form, personal_address: v })} multiline />
                <div>
                  <span className="text-xs text-muted-foreground">Bank Transactions</span>
                  <p className="font-medium">{filing.bank_transactions_count}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="filing" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><FileCheck className="size-4 text-primary" /> Filing Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <CheckField label="Form 1120 Filled" checked={editing ? (form.filled_1120 ?? filing.filled_1120) : filing.filled_1120} editing={editing} onChange={(v) => setForm({ ...form, filled_1120: v })} />
                  <CheckField label="Form 5472 Filled" checked={editing ? (form.filled_5472 ?? filing.filled_5472) : filing.filled_5472} editing={editing} onChange={(v) => setForm({ ...form, filled_5472: v })} />
                  <CheckField label="EIN Verified in Form" checked={editing ? (form.verified_ein_in_form ?? filing.verified_ein_in_form) : filing.verified_ein_in_form} editing={editing} onChange={(v) => setForm({ ...form, verified_ein_in_form: v })} />
                  <CheckField label="Filing Done" checked={editing ? (form.filing_done ?? filing.filing_done) : filing.filing_done} editing={editing} onChange={(v) => setForm({ ...form, filing_done: v })} />
                  <CheckField label="Annual Report Filed" checked={editing ? (form.annual_report_filed ?? filing.annual_report_filed) : filing.annual_report_filed} editing={editing} onChange={(v) => setForm({ ...form, annual_report_filed: v })} />
                </div>
                <Separator />
                <InfoField label="Reference Number" value={editing ? form.reference_number : filing.reference_number} editing={editing} onChange={(v) => setForm({ ...form, reference_number: v })} />
                <InfoField label="NAICS Code" value={editing ? form.naics : filing.naics} editing={editing} onChange={(v) => setForm({ ...form, naics: v })} />
                <InfoField label="Principal Activity" value={editing ? form.principal_activity : filing.principal_activity} editing={editing} onChange={(v) => setForm({ ...form, principal_activity: v })} />
                <InfoField label="Business Activity" value={editing ? form.business_activity : filing.business_activity} editing={editing} onChange={(v) => setForm({ ...form, business_activity: v })} />
                <InfoField label="Date Copy" value={editing ? form.date_copy : filing.date_copy} editing={editing} onChange={(v) => setForm({ ...form, date_copy: v })} />
                <InfoField label="Filing Search URL" value={editing ? form.filing_search_url : filing.filing_search_url} editing={editing} onChange={(v) => setForm({ ...form, filing_search_url: v })} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Truck className="size-4 text-primary" /> Mailing & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {editing ? (
                  <div>
                    <Label className="text-xs">Tax Standing</Label>
                    <Select value={form.tax_standing || filing.tax_standing || ""} onValueChange={(v) => setForm({ ...form, tax_standing: v })}>
                      <SelectTrigger data-testid="select-tax-standing"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Good Standing">Good Standing</SelectItem>
                        <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                        <SelectItem value="Delinquent">Delinquent</SelectItem>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <InfoField label="Tax Standing" value={filing.tax_standing} />
                )}
                <InfoField label="State Annual Report Due" value={editing ? form.state_annual_report_due : filing.state_annual_report_due} editing={editing} onChange={(v) => setForm({ ...form, state_annual_report_due: v })} />
                {editing ? (
                  <div>
                    <Label className="text-xs">Send Mail Status</Label>
                    <Select value={form.send_mail_status || filing.send_mail_status || ""} onValueChange={(v) => setForm({ ...form, send_mail_status: v })}>
                      <SelectTrigger data-testid="select-mail-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Sent">Not Sent</SelectItem>
                        <SelectItem value="Preparing">Preparing</SelectItem>
                        <SelectItem value="Sent via LetterStream">Sent via LetterStream</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <InfoField label="Mail Status" value={filing.send_mail_status} />
                )}
                <InfoField label="Mail Tracking #" value={editing ? form.mail_tracking_number : filing.mail_tracking_number} editing={editing} onChange={(v) => setForm({ ...form, mail_tracking_number: v })} />
                <InfoField label="Fax" value={editing ? form.fax : filing.fax} editing={editing} onChange={(v) => setForm({ ...form, fax: v })} />
                <InfoField label="Fax Confirmation" value={editing ? form.fax_confirmation : filing.fax_confirmation} editing={editing} onChange={(v) => setForm({ ...form, fax_confirmation: v })} />
                {editing ? (
                  <div>
                    <Label className="text-xs">Bank Statements</Label>
                    <Select value={form.bank_statements_status || filing.bank_statements_status || ""} onValueChange={(v) => setForm({ ...form, bank_statements_status: v })}>
                      <SelectTrigger data-testid="select-bank-stmt"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Not Required">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <InfoField label="Bank Statements" value={filing.bank_statements_status} />
                )}
                <InfoField label="Tax Standing Last Checked" value={editing ? form.tax_standing_last_checked : filing.tax_standing_last_checked} editing={editing} onChange={(v) => setForm({ ...form, tax_standing_last_checked: v })} />
                <InfoField label="Required Documents" value={editing ? form.required_documents : filing.required_documents} editing={editing} onChange={(v) => setForm({ ...form, required_documents: v })} multiline />
                <div className="pt-2">
                  <a href="https://wyobiz.wyo.gov/Business/FilingSearch.aspx" target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="w-full" data-testid="btn-wyo-search">
                      <Globe className="size-3.5 mr-1" /> Wyoming Business Filing Search
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><SiWhatsapp className="size-4 text-green-600" /> WhatsApp Message</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded-lg font-sans max-h-[250px] overflow-y-auto">
                  {personalized(CROSS_SELL_TEMPLATES.whatsapp)}
                </pre>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(personalized(CROSS_SELL_TEMPLATES.whatsapp)); toast({ title: "Copied" }); }} data-testid="btn-copy-wa">
                    <Copy className="size-3.5 mr-1" /> Copy
                  </Button>
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="text-green-600" data-testid="btn-send-wa">
                        <Send className="size-3.5 mr-1" /> Send via WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Mail className="size-4 text-blue-600" /> Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground">Subject:</span>
                  <p className="text-sm font-medium">{personalized(CROSS_SELL_TEMPLATES.email_subject)}</p>
                </div>
                <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded-lg font-sans max-h-[200px] overflow-y-auto">
                  {personalized(CROSS_SELL_TEMPLATES.email_body)}
                </pre>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(personalized(CROSS_SELL_TEMPLATES.email_body)); toast({ title: "Copied" }); }} data-testid="btn-copy-email">
                    <Copy className="size-3.5 mr-1" /> Copy
                  </Button>
                  {mailtoLink && (
                    <a href={mailtoLink}>
                      <Button size="sm" variant="outline" className="text-blue-600" data-testid="btn-send-email">
                        <Send className="size-3.5 mr-1" /> Send Email
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="size-4 text-primary" /> IRS Correspondence</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <InfoField label="Recipient" value={editing ? form.recipient : filing.recipient} editing={editing} onChange={(v) => setForm({ ...form, recipient: v })} />
                <InfoField label="Subject" value={editing ? form.subject : filing.subject} editing={editing} onChange={(v) => setForm({ ...form, subject: v })} />
                <InfoField label="Message" value={editing ? form.message : filing.message} editing={editing} onChange={(v) => setForm({ ...form, message: v })} multiline />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notes & Pending Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editing ? (
                  <>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-sm" data-testid="input-notes" />
                    </div>
                    <div>
                      <Label className="text-xs">Additional Notes</Label>
                      <Textarea value={form.additional_notes || ""} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} className="text-sm" data-testid="input-add-notes" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-xs text-muted-foreground">Notes</span>
                      {filing.notes ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {filing.notes.split(",").map((note, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                              <AlertCircle className="size-3 mr-1" /> {note.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No notes</p>
                      )}
                    </div>
                    {filing.additional_notes && (
                      <div>
                        <span className="text-xs text-muted-foreground">Additional Notes</span>
                        <p className="text-sm mt-1">{filing.additional_notes}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {filing.client_id && (
              <DocumentManager
                clientId={filing.client_id}
                defaultCategory="tax_filing"
                showCategoryFilter={true}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoField({ label, value, editing, onChange, multiline }: {
  label: string;
  value: string | null | undefined;
  editing?: boolean;
  onChange?: (v: string) => void;
  multiline?: boolean;
}) {
  if (editing && onChange) {
    return (
      <div>
        <Label className="text-xs">{label}</Label>
        {multiline ? (
          <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="text-sm mt-0.5" rows={2} />
        ) : (
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="text-sm mt-0.5" />
        )}
      </div>
    );
  }
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="font-medium text-sm">{value || "—"}</p>
    </div>
  );
}

function CheckField({ label, checked, editing, onChange }: {
  label: string;
  checked: boolean;
  editing?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {editing && onChange ? (
        <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      ) : (
        checked ? <CheckCircle2 className="size-4 text-green-500" /> : <Circle className="size-4 text-muted-foreground" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default function TaxFilingPage() {
  const { toast } = useToast();
  const [selectedFiling, setSelectedFiling] = useState<TaxFiling | null>(null);
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const { data: filingsData, isLoading } = useQuery<{ filings: TaxFiling[]; total: number }>({
    queryKey: ["/api/legalnations/tax-filings"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaxFiling> }) => {
      const res = await apiRequest("PATCH", `/api/legalnations/tax-filings/${id}`, updates);
      return res.json();
    },
    onSuccess: (serverData: TaxFiling) => {
      queryClient.invalidateQueries({ queryKey: ["/api/legalnations/tax-filings"] });
      if (serverData && serverData.id) {
        setSelectedFiling(serverData);
      }
      toast({ title: "Filing updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleUpdate = (updates: Partial<TaxFiling>) => {
    if (!selectedFiling) return;
    const clean = { ...updates };
    delete (clean as any).id;
    delete (clean as any).created_at;
    updateMutation.mutate({ id: selectedFiling.id, updates: clean });
  };

  const filings = filingsData?.filings || [];
  const singleCount = filings.filter(f => f.llc_type === "Single Member").length;
  const multiCount = filings.filter(f => f.llc_type === "Multi Member").length;
  const totalRevenue = filings.reduce((sum, f) => sum + (f.amount_received || 0), 0);
  const completedCount = filings.filter(f => f.filing_done).length;

  const columns: Column<TaxFiling>[] = [
    {
      key: "llc_name",
      header: "LLC Name",
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-sm font-medium" data-testid={`text-llc-${item.id}`}>{item.llc_name || "—"}</span>
          {item.main_entity_name && (
            <span className="block text-xs text-muted-foreground">{item.main_entity_name}</span>
          )}
        </div>
      ),
    },
    {
      key: "llc_type",
      header: "Type",
      render: (item) => (
        <StatusBadge
          status={item.llc_type || "—"}
          variant={item.llc_type === "Multi Member" ? "info" : "neutral"}
        />
      ),
    },
    {
      key: "amount_received",
      header: "Amount",
      sortable: true,
      render: (item) => <span className="text-sm font-medium">{formatCurrency(item.amount_received)}</span>,
    },
    {
      key: "filing_stage",
      header: "Stage",
      render: (item) => (
        <StatusBadge status={item.filing_stage || "Document Collection"} variant={stageVariant[item.filing_stage || "Document Collection"] || "neutral"} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge status={item.status} variant={statusVariant[item.status] || "neutral"} />
      ),
    },
    {
      key: "bank_transactions_count",
      header: "Bank Txns",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-center block">{item.bank_transactions_count}</span>
      ),
    },
    {
      key: "date_of_formation",
      header: "Formation",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.date_of_formation || "—"}</span>
      ),
    },
    {
      key: "notes",
      header: "Pending",
      render: (item) => {
        if (!item.notes) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {item.notes.split(",").slice(0, 2).map((n, i) => (
              <Badge key={i} variant="outline" className="text-[10px] text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                {n.trim()}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: "_actions",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.contact_details && (
            <a href={`https://wa.me/${item.contact_details.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon" className="size-7 text-green-600" data-testid={`btn-wa-${item.id}`}>
                <SiWhatsapp className="size-3.5" />
              </Button>
            </a>
          )}
          {item.email_address && (
            <a href={`mailto:${item.email_address}`}>
              <Button variant="ghost" size="icon" className="size-7" data-testid={`btn-email-${item.id}`}>
                <Mail className="size-3.5" />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setSelectedFiling(item)} data-testid={`btn-view-${item.id}`}>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell>
      <PageTransition>
        <div className="space-y-6">
          {selectedFiling ? (
            <FilingDetailPanel
              filing={selectedFiling}
              onClose={() => setSelectedFiling(null)}
              onUpdate={handleUpdate}
              isSaving={updateMutation.isPending}
            />
          ) : (
            <>
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100" data-testid="text-service-title">USA Tax Filing Service</h2>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Annual tax filing for US LLCs — Pro Forma 1120 + Form 5472</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
                      <div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Single Member</div>
                        <div className="text-lg font-bold text-blue-900 dark:text-blue-100">₹15,000<span className="text-xs font-normal">+GST</span></div>
                        <div className="text-xs text-muted-foreground">(₹17,700)</div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Multi Member</div>
                        <div className="text-lg font-bold text-blue-900 dark:text-blue-100">₹19,000<span className="text-xs font-normal">+GST</span></div>
                        <div className="text-xs text-muted-foreground">(₹22,420)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total Filings" value={filings.length} icon={FileText} iconBg="#EFF6FF" iconColor="#2563EB" />
                <StatCard label="Single Member" value={singleCount} icon={User} iconBg="#F0FDF4" iconColor="#16A34A" />
                <StatCard label="Multi Member" value={multiCount} icon={Users} iconBg="#FFF7ED" iconColor="#EA580C" />
                <StatCard label="Completed" value={completedCount} icon={CheckCircle2} iconBg="#F0FDF4" iconColor="#16A34A" />
                <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={IndianRupee} iconBg="#FAF5FF" iconColor="#9333EA" />
              </div>

              <Tabs defaultValue="filings" data-testid="tax-tabs">
                <TabsList>
                  <TabsTrigger value="filings" data-testid="tab-filings">Active Filings ({filings.length})</TabsTrigger>
                  <TabsTrigger value="procedure" data-testid="tab-procedure">Filing Procedure</TabsTrigger>
                  <TabsTrigger value="resources" data-testid="tab-resources">Resources & Forms</TabsTrigger>
                  <TabsTrigger value="crosssell" data-testid="tab-crosssell">Cross-Sell Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="filings" className="mt-4">
                  {isLoading ? (
                    <TableSkeleton rows={8} columns={8} />
                  ) : (
                    <DataTable
                      data={filings}
                      columns={columns}
                      searchPlaceholder="Search by LLC name, entity name, or email..."
                      onRowClick={(item) => setSelectedFiling(item)}
                      filters={[
                        { label: "Type", key: "llc_type", options: ["Single Member", "Multi Member"] },
                        { label: "Status", key: "status", options: ["In progress", "Not Started", "Completed"] },
                        { label: "Stage", key: "filing_stage", options: FILING_STAGES },
                      ]}
                    />
                  )}
                </TabsContent>

                <TabsContent value="procedure" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Complete Tax Filing Procedure (Cross-Sell & Operations)</CardTitle>
                      <p className="text-sm text-muted-foreground">Step-by-step annual process for filing US LLC tax returns for foreign-owned entities</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {FILING_PROCEDURE.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <div key={idx} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                              <div className="flex flex-col items-center gap-1">
                                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <span className="text-sm font-bold">{idx + 1}</span>
                                </div>
                                {idx < FILING_PROCEDURE.length - 1 && (
                                  <div className="w-px h-full bg-border min-h-[16px]" />
                                )}
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                  <Icon className="size-4 text-primary" />
                                  <h4 className="font-medium text-sm">{item.step}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileCheck className="size-4 text-red-600" /> IRS Forms
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        {IRS_RESOURCES.filter(r => r.type === "form").map((r) => (
                          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors" data-testid={`link-form-${r.title.split(" ")[1]}`}>
                            <FileText className="size-4 text-red-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm block">{r.title}</span>
                              {r.desc && <span className="text-xs text-muted-foreground block">{r.desc}</span>}
                            </div>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Youtube className="size-4 text-red-600" /> Video Tutorials
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        {IRS_RESOURCES.filter(r => r.type === "video").map((r) => (
                          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors">
                            <Youtube className="size-4 text-red-500 shrink-0" />
                            <span className="text-sm flex-1">{r.title}</span>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Globe className="size-4 text-green-600" /> Services & References
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        {IRS_RESOURCES.filter(r => r.type === "service" || r.type === "reference").map((r) => (
                          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted transition-colors">
                            {r.type === "service" ? <Truck className="size-4 text-blue-500 shrink-0" /> : <BookOpen className="size-4 text-blue-500 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm block">{r.title}</span>
                              {r.desc && <span className="text-xs text-muted-foreground block">{r.desc}</span>}
                            </div>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="crosssell" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <SiWhatsapp className="size-4 text-green-600" /> WhatsApp Template
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Send to existing LLC clients for yearly cross-sell</p>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans">
                          {CROSS_SELL_TEMPLATES.whatsapp}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => { navigator.clipboard.writeText(CROSS_SELL_TEMPLATES.whatsapp); toast({ title: "Template copied" }); }}
                          data-testid="btn-copy-wa-template"
                        >
                          <Copy className="size-3.5 mr-1" /> Copy Template
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Mail className="size-4 text-blue-600" /> Email Template
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Professional email for tax filing outreach</p>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <span className="text-xs text-muted-foreground">Subject:</span>
                          <p className="text-sm font-medium">{CROSS_SELL_TEMPLATES.email_subject}</p>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans max-h-[300px] overflow-y-auto">
                          {CROSS_SELL_TEMPLATES.email_body}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => { navigator.clipboard.writeText(CROSS_SELL_TEMPLATES.email_body); toast({ title: "Template copied" }); }}
                          data-testid="btn-copy-email-template"
                        >
                          <Copy className="size-3.5 mr-1" /> Copy Template
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Cross-Sell Strategy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { title: "Identify", desc: "All clients with LLC formation date before Dec 31 of the filing year need to file annually.", icon: Search },
                            { title: "Outreach", desc: "Send WhatsApp + email reminders starting January. Follow up every 5-7 days until response.", icon: Send },
                            { title: "Convert", desc: "Answer questions, explain penalties for non-filing ($25,000 per year). Collect payment.", icon: CreditCard },
                            { title: "Deliver", desc: "Complete filing within 2-3 weeks. Send copies. Schedule next year's reminder.", icon: CheckCircle2 },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <div key={item.title} className="text-center p-3 rounded-lg bg-muted/30">
                                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                                  <Icon className="size-5" />
                                </div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </PageTransition>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["legalnations-tax-filing"].sop} color={LEGALNATIONS_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["legalnations-tax-filing"].tutorial} color={LEGALNATIONS_COLOR} />
    </PageShell>
  );
}