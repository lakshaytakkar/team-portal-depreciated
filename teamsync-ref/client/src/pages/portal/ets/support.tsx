import { useState } from "react";
import { Phone, MessageCircle, Mail, Clock, HelpCircle, ChevronDown, ChevronUp, ExternalLink, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { PARTNER_PROFILE, MOCK_FAQS } from "@/lib/mock-data-dashboard-ets";

function FaqItem({ faq, idx }: { faq: { question: string; answer: string }; idx: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left hover:bg-accent/30 rounded-lg px-3 transition-colors"
        onClick={() => setOpen(!open)}
        data-testid={`button-faq-${idx}`}
      >
        <span className="font-medium text-sm pr-4">{faq.question}</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        }
      </button>
      {open && (
        <div className="pb-4 px-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function EtsPortalSupport() {
  const rm = PARTNER_PROFILE;
  const whatsAppMessage = encodeURIComponent(`Hi, I need help with my store ${rm.storeName}`);
  const whatsAppUrl = `https://wa.me/${rm.rmWhatsApp}?text=${whatsAppMessage}`;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-support">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-support-title">Support</h1>
        <p className="text-muted-foreground">Get help from your relationship manager or find answers in our FAQ.</p>
      </div>

      <Card className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-0.5">Your Relationship Manager</p>
                <h3 className="font-bold text-lg text-green-900" data-testid="text-rm-name-support">{rm.rmName}</h3>
                <p className="text-sm text-green-700" data-testid="text-rm-phone-support">{rm.rmPhone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" data-testid="button-whatsapp-rm-support">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </a>
              <a href={`tel:${rm.rmPhone}`}>
                <Button variant="outline" className="border-green-300 text-green-800 hover:bg-green-50 gap-2" data-testid="button-call-rm">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <a href={`tel:+919306566900`} className="block">
          <Card className="rounded-xl border bg-card h-full hover:bg-muted/20 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5">Call Support</h3>
                <p className="text-sm text-muted-foreground mb-1">Speak directly with the EazyToSell support team.</p>
                <p className="text-base font-bold" data-testid="text-support-phone">+91 93065 66900</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="mailto:support@eazytosell.com" className="block">
          <Card className="rounded-xl border bg-card h-full hover:bg-muted/20 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-1">Send a detailed query via email.</p>
                <p className="text-sm font-medium" data-testid="text-support-email">support@eazytosell.com</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>Operational FAQs for day-to-day store management.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {MOCK_FAQS.map((faq, idx) => (
              <FaqItem key={idx} faq={faq} idx={idx} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Business Hours</p>
              <p className="text-sm">Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
              <p className="text-xs mt-1">WhatsApp messages are answered within 2 hours during business hours.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
