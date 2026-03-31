import { useState, useMemo } from "react";
import { Phone, Mail, Copy, Plus, Globe, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiWhatsapp } from "react-icons/si";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog } from "@/components/ds/form-dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { 
  PageHeader, 
  PageShell,
  IndexToolbar,
  SectionGrid,
  SectionCard
} from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { PersonCell } from "@/components/ui/avatar-cells";
import { importantContacts, type ImportantContact, type ContactCategory, type ContactPriority } from "@/lib/mock-data-contacts";

const categoryConfig: Record<ContactCategory, { label: string; color: string }> = {
  visa_agent: { label: "Visa Agent", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  embassy: { label: "Embassy", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  hotel: { label: "Hotel", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  supplier: { label: "Supplier", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  guide: { label: "Guide", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  legal: { label: "Legal", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  finance: { label: "Finance", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  logistics: { label: "Logistics", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  media: { label: "Media", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  partner: { label: "Partner", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  government: { label: "Government", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
  other: { label: "Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
};

const priorityConfig: Record<ContactPriority, { label: string; dot: string }> = {
  high: { label: "High", dot: "bg-red-500" },
  medium: { label: "Medium", dot: "bg-amber-400" },
  low: { label: "Low", dot: "bg-gray-300 dark:bg-gray-600" },
};

const countryFlags: Record<string, string> = {
  China: "🇨🇳",
  India: "🇮🇳",
  USA: "🇺🇸",
  Canada: "🇨🇦",
};

function ContactCard({ contact }: { contact: ImportantContact }) {
  const { toast } = useToast();
  const cat = categoryConfig[contact.category] || categoryConfig.other;
  const pri = priorityConfig[contact.priority];
  const flag = countryFlags[contact.country] || "🌐";

  const copyPhone = () => {
    navigator.clipboard.writeText(contact.phone);
    toast({ title: "Phone copied", description: contact.phone });
  };

  return (
    <div
      className="relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      data-testid={`card-contact-${contact.id}`}
    >
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {contact.is_shared && (
          <Badge variant="outline" className="text-xs px-1.5 py-0.5 gap-1">
            <Share2 className="size-2.5" />
            Shared
          </Badge>
        )}
        <div className={`size-2.5 rounded-full ${pri.dot}`} title={`${pri.label} priority`} data-testid={`dot-priority-${contact.id}`} />
      </div>

      <div className="mb-3 pr-16">
        <PersonCell name={contact.name} subtitle={contact.title} size="sm" />
        <p className="text-sm font-medium text-foreground/80 mt-0.5" data-testid={`text-org-${contact.id}`}>{contact.organization}</p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}
          data-testid={`badge-category-${contact.id}`}
        >
          {cat.label}
        </span>
        <span className="text-xs text-muted-foreground" data-testid={`text-location-${contact.id}`}>
          {flag} {contact.city}, {contact.country}
        </span>
      </div>

      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {contact.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground" data-testid={`tag-${contact.id}-${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {contact.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed" data-testid={`text-notes-${contact.id}`}>
          {contact.notes}
        </p>
      )}

      <div className="flex items-center gap-1 pt-3 border-t border-border">
        {contact.whatsapp && (
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            data-testid={`btn-whatsapp-${contact.id}`}
          >
            <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
              <SiWhatsapp className="size-4" />
            </Button>
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} data-testid={`btn-email-${contact.id}`}>
            <Button variant="ghost" size="icon" className="size-8">
              <Mail className="size-4" />
            </Button>
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} data-testid={`btn-call-${contact.id}`}>
            <Button variant="ghost" size="icon" className="size-8">
              <Phone className="size-4" />
            </Button>
          </a>
        )}
        {contact.phone && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={copyPhone}
            data-testid={`btn-copy-${contact.id}`}
          >
            <Copy className="size-4" />
          </Button>
        )}
        {contact.website && (
          <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noreferrer" data-testid={`btn-web-${contact.id}`} className="ml-auto">
            <Button variant="ghost" size="icon" className="size-8">
              <Globe className="size-4" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-1 mt-2 pt-3 border-t border-border">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function ImportantContacts() {
  const [location] = useLocation();
  const { toast } = useToast();
  const loading = useSimulatedLoading(650);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const vertical = detectVerticalFromUrl(location);
  const accentColor = vertical?.color || "#E91E63";

  const filtered = useMemo(() => {
    return importantContacts.filter((c) => {
      const verticalMatch =
        !vertical ||
        c.verticalIds.includes("all") ||
        c.verticalIds.includes(vertical.id);
      if (!verticalMatch) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [vertical, categoryFilter, priorityFilter, search]);

  const allForVertical = importantContacts.filter(
    (c) => !vertical || c.verticalIds.includes("all") || c.verticalIds.includes(vertical.id)
  );
  const highPriority = allForVertical.filter((c) => c.priority === "high").length;
  const sharedCount = allForVertical.filter((c) => c.is_shared).length;
  const categoriesCount = new Set(allForVertical.map((c) => c.category)).size;

  const uniqueCategories = Array.from(new Set(allForVertical.map((c) => c.category)));

  return (
    <PageShell className="overflow-y-auto h-full">
      <PageHeader
        title="Important Contacts"
        subtitle={`Key contacts and partners for ${vertical?.name} operations.`}
        actions={
          <Button 
            onClick={() => setDialogOpen(true)}
            style={{ backgroundColor: accentColor }}
            className="text-white font-semibold"
            data-testid="button-add-contact"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        }
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        color={accentColor}
        placeholder="Search contacts..."
        filters={uniqueCategories.map(c => ({ value: c, label: categoryConfig[c as ContactCategory]?.label || c }))}
        activeFilter={categoryFilter}
        onFilter={(val) => setCategoryFilter(val as any)}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse bg-muted rounded-xl border" />
          ))}
        </div>
      ) : (
        <SectionGrid cols={3}>
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </SectionGrid>
      )}

      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <Phone className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No contacts found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add Important Contact"
        onSubmit={() => setDialogOpen(false)}
        submitLabel="Add Contact"
      >
        <div className="grid gap-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-name">Full Name</Label>
              <Input id="c-name" placeholder="e.g. Jason Huang" data-testid="input-name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-title">Title / Role</Label>
              <Input id="c-title" placeholder="e.g. Director" data-testid="input-title" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-org">Organization</Label>
            <Input id="c-org" placeholder="Company or department name" data-testid="input-org" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-category">Category</Label>
              <Select>
                <SelectTrigger id="c-category" data-testid="input-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-priority">Priority</Label>
              <Select>
                <SelectTrigger id="c-priority" data-testid="input-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" placeholder="+91 98xxx xxxxx" data-testid="input-phone" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-whatsapp">WhatsApp Number</Label>
              <Input id="c-whatsapp" placeholder="Country code + number (no +)" data-testid="input-whatsapp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" placeholder="contact@domain.com" data-testid="input-email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-website">Website</Label>
              <Input id="c-website" placeholder="www.example.com" data-testid="input-website" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-city">City</Label>
              <Input id="c-city" placeholder="City" data-testid="input-city" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-country">Country</Label>
              <Input id="c-country" placeholder="Country" data-testid="input-country" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-notes">Notes</Label>
            <Input id="c-notes" placeholder="Key notes about this contact..." data-testid="input-notes" />
          </div>
        </div>
      </FormDialog>
    </PageShell>
  );
}
