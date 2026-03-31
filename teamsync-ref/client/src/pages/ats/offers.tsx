import { useState } from "react";
import { FileSignature, Send, CheckCircle2, XCircle } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { offers, candidates, jobOpenings, type Offer } from "@/lib/mock-data-ats";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
  IndexToolbar,
  PrimaryAction,
  DetailModal,
  DetailSection,
} from "@/components/layout";
import { StatusBadge } from "@/components/ds/status-badge";
import { PersonCell } from "@/components/ui/avatar-cells";

export default function AtsOffers() {
  const isLoading = useSimulatedLoading(700);
  const [offerData, setOfferData] = useState(offers);
  const [preview, setPreview] = useState<Offer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sent = offerData.filter(o => o.status === "sent").length;
  const accepted = offerData.filter(o => o.status === "accepted").length;
  const declined = offerData.filter(o => o.status === "declined").length;
  const awaiting = offerData.filter(o => o.status === "sent").length;

  const handleMarkAccepted = (id: string) => setOfferData(prev => prev.map(o => o.id === id ? { ...o, status: "accepted" as const } : o));
  const handleMarkDeclined = (id: string) => setOfferData(prev => prev.map(o => o.id === id ? { ...o, status: "declined" as const } : o));
  const handleSend = (id: string) => setOfferData(prev => prev.map(o => o.id === id ? { ...o, status: "sent" as const } : o));

  const filtered = offerData.filter(o => {
    const matchSearch = o.candidateName.toLowerCase().includes(search.toLowerCase()) || o.jobTitle.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  if (isLoading) {
    return (
      <PageShell className="animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <StatGrid>
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
        </StatGrid>
        <div className="h-72 bg-muted rounded-xl" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Offers"
          subtitle="Manage offer letters and candidate responses"
          actions={
            <PrimaryAction
              color="#7c3aed"
              icon={FileSignature}
              onClick={() => setCreateOpen(true)}
              testId="create-offer-btn"
            >
              Create Offer
            </PrimaryAction>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          <StatCard
            label="Offers Sent"
            value={sent + accepted + declined}
            icon={FileSignature}
            iconBg="rgba(124, 58, 237, 0.1)"
            iconColor="#7c3aed"
          />
          <StatCard
            label="Accepted"
            value={accepted}
            icon={FileSignature}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Declined"
            value={declined}
            icon={FileSignature}
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
          />
          <StatCard
            label="Awaiting Response"
            value={awaiting}
            icon={FileSignature}
            iconBg="rgba(14, 165, 233, 0.1)"
            iconColor="#0ea5e9"
          />
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search offers..."
          color="#7c3aed"
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <DataTH>Candidate</DataTH>
                <DataTH>Job Title</DataTH>
                <DataTH>Offered Salary</DataTH>
                <DataTH>Joining Date</DataTH>
                <DataTH>Expiry</DataTH>
                <DataTH>Status</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(offer => (
                <DataTR key={offer.id} data-testid={`offer-row-${offer.id}`}>
                  <DataTD><PersonCell name={offer.candidateName} size="sm" /></DataTD>
                  <DataTD className="text-muted-foreground">{offer.jobTitle}</DataTD>
                  <DataTD className="font-semibold">₹{offer.offeredSalary.toLocaleString("en-IN")}</DataTD>
                  <DataTD className="text-muted-foreground">{offer.joiningDate}</DataTD>
                  <DataTD className="text-muted-foreground">{offer.expiryDate}</DataTD>
                  <DataTD>
                    <StatusBadge status={offer.status} />
                  </DataTD>
                  <DataTD align="right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreview(offer)} data-testid={`preview-offer-${offer.id}`}>Preview</Button>
                      {offer.status === "draft" && (
                        <button onClick={() => handleSend(offer.id)} className="p-1.5 rounded hover:bg-sky-100 text-sky-600 transition-colors" title="Send Offer" data-testid={`send-offer-${offer.id}`}>
                          <Send className="size-3.5" />
                        </button>
                      )}
                      {offer.status === "sent" && (
                        <>
                          <button onClick={() => handleMarkAccepted(offer.id)} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors" title="Mark Accepted" data-testid={`accept-offer-${offer.id}`}>
                            <CheckCircle2 className="size-3.5" />
                          </button>
                          <button onClick={() => handleMarkDeclined(offer.id)} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors" title="Mark Declined" data-testid={`decline-offer-${offer.id}`}>
                            <XCircle className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No offers created yet</td></tr>}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>

      <DetailModal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Offer Letter Preview"
        footer={
          <Button variant="outline" onClick={() => setPreview(null)} data-testid="close-preview">Close</Button>
        }
      >
        <DetailSection title="Official Offer Letter">
          {preview && (
            <div className="border rounded-xl p-6 space-y-4 text-sm font-serif">
              <div className="text-center space-y-1">
                <p className="font-bold text-lg text-violet-700">TeamSync</p>
                <p className="text-xs text-muted-foreground">Official Offer Letter</p>
              </div>
              <Separator />
              <p>Dear <strong>{preview.candidateName}</strong>,</p>
              <p>We are pleased to extend an offer of employment for the position of <strong>{preview.jobTitle}</strong> at TeamSync.</p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Annual CTC</span><span className="font-bold text-emerald-600">₹{preview.offeredSalary.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joining Date</span><span className="font-semibold">{preview.joiningDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Offer Valid Till</span><span className="font-semibold">{preview.expiryDate}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">This offer is contingent upon successful completion of background verification. Please sign and return this letter by the expiry date.</p>
              <div className="flex justify-between pt-2 text-xs text-muted-foreground border-t">
                <span>HR Department</span>
                <span>TeamSync · Bengaluru</span>
              </div>
            </div>
          )}
        </DetailSection>
      </DetailModal>

      <DetailModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Offer"
        subtitle="Prepare an offer letter for a candidate"
        footer={
          <PrimaryAction color="#7c3aed" onClick={() => setCreateOpen(false)} data-testid="submit-offer">Create Offer</PrimaryAction>
        }
      >
        <DetailSection title="Offer Details">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Candidate</label>
              <Select><SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>{candidates.slice(0, 10).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Job Opening</label>
              <Select><SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>{jobOpenings.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Offered Salary (₹ annual)</label><Input type="number" placeholder="e.g. 1800000" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium">Joining Date</label><Input type="date" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Offer Expiry</label><Input type="date" /></div>
            </div>
          </div>
        </DetailSection>
      </DetailModal>
    </PageShell>
  );
}
