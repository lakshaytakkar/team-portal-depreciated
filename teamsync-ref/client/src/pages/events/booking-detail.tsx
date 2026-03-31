import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Plane, CheckCircle2, Clock, IndianRupee } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ds/status-badge";
import { FormDialog } from "@/components/ds/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookings, tourPackages } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PageShell } from "@/components/layout";
import { PersonCell } from "@/components/ui/avatar-cells";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const paymentBadge: Record<string, "success" | "warning" | "error" | "neutral"> = {
  full: "success",
  partial: "warning",
  pending: "error",
  refunded: "neutral",
};
const bookingBadge: Record<string, "success" | "warning" | "error" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
};
const visaBadge: Record<string, "success" | "warning" | "error" | "neutral" | "info"> = {
  pending: "warning",
  applied: "neutral",
  approved: "success",
  rejected: "error",
};

export default function BookingDetail() {
  const [location, navigate] = useLocation();
  const loading = useSimulatedLoading(600);
  const { toast } = useToast();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const id = location.split("/").pop();
  const booking = bookings.find((b) => b.id === id);

  if (!loading && !booking) {
    return (
      <PageShell>
        <Button variant="ghost" size="sm" onClick={() => navigate("/goyotours/bookings")} className="gap-2 mb-4">
          <ArrowLeft className="size-4" /> Back to Bookings
        </Button>
        <p className="text-muted-foreground">Booking not found.</p>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  const b = booking!;
  const pkg = tourPackages.find((p) => p.id === b.package_id);

  const waMessage = encodeURIComponent(
    `Hi ${b.client_name}! 🙏\n\nYour booking for *${b.package_name}* is confirmed.\n\n📋 Booking ID: ${b.id}\n✈️ Travel Date: ${formatDate(b.travel_date)}\n👥 Passengers: ${b.passengers}\n\n💰 Total Amount: ${formatCurrency(b.total_amount)}\n✅ Advance Paid: ${formatCurrency(b.advance_paid)}\n⏳ Balance Due: ${formatCurrency(b.balance_due)}\n\nPlease complete the balance payment at least 30 days before travel.\n\nFor any queries, contact us anytime! - GoyoTours Team`
  );

  return (
    <PageShell>
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-5 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/goyotours/bookings")} className="gap-2" data-testid="btn-back">
              <ArrowLeft className="size-4" /> Back
            </Button>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <h1 className="text-xl font-bold font-heading" data-testid="booking-detail-title">{b.id}</h1>
              <StatusBadge status={b.booking_status} variant={bookingBadge[b.booking_status]} />
              <StatusBadge status={b.payment_status} variant={paymentBadge[b.payment_status]} />
              <StatusBadge status={`Visa: ${b.visa_status}`} variant={visaBadge[b.visa_status] as any} />
            </div>
          </div>
        </Fade>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-4">
            <Fade direction="up" delay={0.05}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-4">Client Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Name</p>
                    <PersonCell name={b.client_name} size="lg" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">City</p>
                    <p>{b.client_city}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Phone</p>
                    <a href={`tel:${b.client_phone}`} className="text-blue-500 hover:underline" data-testid="detail-client-phone">{b.client_phone}</a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                    <a href={`mailto:${b.client_email}`} className="text-blue-500 hover:underline text-sm truncate" data-testid="detail-client-email">{b.client_email}</a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Passengers</p>
                    <p className="font-medium" data-testid="detail-pax">{b.passengers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Travel Date</p>
                    <p className="font-medium">{formatDate(b.travel_date)}</p>
                  </div>
                </div>
                {b.special_requests && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-0.5">Special Requests</p>
                    <p className="text-sm">{b.special_requests}</p>
                  </div>
                )}
                {b.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-0.5">Notes</p>
                    <p className="text-sm text-muted-foreground">{b.notes}</p>
                  </div>
                )}
              </div>
            </Fade>

            <Fade direction="up" delay={0.08}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-4">Package Details</h2>
                <p className="font-semibold mb-1" data-testid="detail-pkg-name">{b.package_name}</p>
                {pkg && (
                  <p className="text-sm text-muted-foreground mb-3">{pkg.duration_days}D/{pkg.duration_nights}N · {pkg.destination}</p>
                )}
                <div className="grid grid-cols-3 gap-3 text-sm text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                    <p className="font-bold text-foreground">{formatCurrency(b.total_amount)}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Paid</p>
                    <p className="font-bold text-green-600">{formatCurrency(b.advance_paid)}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                    <p className="font-bold text-amber-600">{formatCurrency(b.balance_due)}</p>
                  </div>
                </div>
              </div>
            </Fade>

            <Fade direction="up" delay={0.1}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-4">Payment History</h2>
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="flex flex-col gap-4">
                    {b.payments.map((payment, i) => (
                      <div key={i} className="flex gap-4 relative pl-8" data-testid={`payment-row-${i}`}>
                        <div className="absolute left-2 top-1 size-3 rounded-full bg-green-500 border-2 border-background" />
                        <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(payment.date)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{payment.mode} · {payment.reference}</p>
                          {payment.note && <p className="text-xs mt-0.5">{payment.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {b.balance_due > 0 && (
                  <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    Balance due: <span className="font-bold">{formatCurrency(b.balance_due)}</span> — to be collected before travel
                  </div>
                )}
              </div>
            </Fade>

            <Fade direction="up" delay={0.12}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-4">Visa & Flight Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className={`size-8 rounded-full flex items-center justify-center ${b.visa_status === "approved" ? "bg-green-100" : b.visa_status === "rejected" ? "bg-red-100" : "bg-amber-100"}`}>
                      <CheckCircle2 className={`size-4 ${b.visa_status === "approved" ? "text-green-600" : b.visa_status === "rejected" ? "text-red-500" : "text-amber-500"}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Visa Status</p>
                      <p className="text-sm font-semibold capitalize" data-testid="detail-visa-status">{b.visa_status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className={`size-8 rounded-full flex items-center justify-center ${b.flight_status === "booked" ? "bg-green-100" : "bg-muted"}`}>
                      <Plane className={`size-4 ${b.flight_status === "booked" ? "text-green-600" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Flight Status</p>
                      <p className="text-sm font-semibold capitalize" data-testid="detail-flight-status">{b.flight_status.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
          </div>

          <div className="flex flex-col gap-4">
            <Fade direction="up" delay={0.06}>
              <div className="rounded-xl border border-pink-200 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-900 p-5">
                <h2 className="text-sm font-semibold font-heading mb-4 text-pink-700 dark:text-pink-400">Actions</h2>
                <div className="flex flex-col gap-2.5">
                  <Button
                    className="w-full gap-2 text-white"
                    style={{ backgroundColor: "#E91E63" }}
                    onClick={() => setPaymentDialogOpen(true)}
                    data-testid="btn-record-payment"
                  >
                    <IndianRupee className="size-4" />
                    Record Payment
                  </Button>
                  <a
                    href={`https://wa.me/${b.client_phone.replace(/\D/g, "")}?text=${waMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="btn-wa-reminder"
                  >
                    <Button variant="outline" className="w-full gap-2 text-green-700 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20">
                      <SiWhatsapp className="size-4" />
                      Send WhatsApp Reminder
                    </Button>
                  </a>
                  {b.visa_status === "pending" && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => toast({ title: "Visa status updated", description: "Marked as visa applied." })}
                      data-testid="btn-mark-visa"
                    >
                      <CheckCircle2 className="size-4" />
                      Mark Visa Applied
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => toast({ title: "Voucher generated", description: "Travel voucher sent to printer." })}
                    data-testid="btn-print-voucher"
                  >
                    <CreditCard className="size-4" />
                    Print Voucher
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-pink-200 dark:border-pink-900">
                  <p className="text-xs text-muted-foreground mb-1">Booking Date</p>
                  <p className="text-sm font-medium">{formatDate(b.booking_date)}</p>
                </div>
              </div>
            </Fade>

            <Fade direction="up" delay={0.1}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold font-heading mb-3">Travel Timeline</h2>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Date</p>
                      <p>{formatDate(b.booking_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plane className="size-3.5 text-pink-500 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Travel Date</p>
                      <p className="font-medium text-pink-600">{formatDate(b.travel_date)}</p>
                    </div>
                  </div>
                  {(() => {
                    const days = Math.ceil((new Date(b.travel_date).getTime() - Date.now()) / 86400000);
                    return days > 0 ? (
                      <div className="rounded-lg bg-muted p-2 text-center">
                        <p className="text-lg font-bold text-foreground">{days}</p>
                        <p className="text-xs text-muted-foreground">days to departure</p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-2 text-center">
                        <p className="text-xs text-green-600 font-medium">Trip completed or in progress</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </Fade>
          </div>
        </div>

        <FormDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          title="Record Payment"
          onSubmit={() => {
            setPaymentDialogOpen(false);
            toast({ title: "Payment recorded", description: "Payment added to booking history." });
          }}
          submitLabel="Record Payment"
        >
          <div className="grid gap-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
              <p className="text-muted-foreground text-xs">Balance Due</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(b.balance_due)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="pd-amount">Amount Received (₹)</Label>
                <Input id="pd-amount" type="number" placeholder="e.g. 69990" data-testid="input-pd-amount" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pd-mode">Payment Mode</Label>
                <Select>
                  <SelectTrigger id="pd-mode" data-testid="input-pd-mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pd-ref">Reference / UTR Number</Label>
              <Input id="pd-ref" placeholder="Transaction reference" data-testid="input-pd-ref" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pd-note">Note</Label>
              <Input id="pd-note" placeholder="e.g. Balance payment received" data-testid="input-pd-note" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </PageShell>
  );
}
