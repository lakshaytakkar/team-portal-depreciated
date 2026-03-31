import { useState } from "react";
import {
  Phone, MessageCircle, Mail, Clock, HelpCircle, ChevronDown,
  ChevronUp, ExternalLink, User, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RM_CONTACT, LN_FAQS, CLIENT_PROFILE } from "@/lib/mock-data-dashboard-ln";

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

export default function LnSupport() {
  const rm = RM_CONTACT;
  const companyName = CLIENT_PROFILE.companies[0]?.name || "my company";
  const whatsAppMessage = encodeURIComponent(`Hi, I need help with my company ${companyName}`);
  const whatsAppUrl = `https://wa.me/${rm.whatsApp.replace(/[^0-9]/g, "")}?text=${whatsAppMessage}`;

  return (
    <div className="p-6 space-y-6" data-testid="ln-support-page">
      <div>
        <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Support</h1>
        <p className="text-muted-foreground text-sm">Get help from your specialist or find answers in our FAQ.</p>
      </div>

      <Card className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-0.5">Your Assigned Specialist</p>
                <h3 className="font-bold text-lg text-blue-900" data-testid="text-rm-name">{rm.name}</h3>
                <p className="text-sm text-blue-700" data-testid="text-rm-role">{rm.role}</p>
                <p className="text-sm text-blue-600 mt-0.5" data-testid="text-rm-phone">{rm.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" data-testid="button-whatsapp">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </a>
              <a href={`tel:${rm.phone}`}>
                <Button variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-50 gap-2" data-testid="button-call">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <a href={`mailto:support@legalnations.com?subject=Support Request — ${companyName}&body=Hi LegalNations team,%0A%0AI need help with...`} className="block">
          <Card className="rounded-xl border bg-card h-full hover:bg-muted/20 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-1">Send a detailed query via email.</p>
                <p className="text-sm font-medium" data-testid="text-support-email">support@legalnations.com</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <Card className="rounded-xl border bg-card h-full hover:bg-muted/20 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-0.5">Schedule a Call</h3>
              <p className="text-sm text-muted-foreground mb-1">Book a 30-min consultation with a specialist.</p>
              <p className="text-sm font-medium text-blue-600" data-testid="text-schedule-link">Pick a time slot →</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>Everything you need to know about US company formation and compliance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {LN_FAQS.map((faq, idx) => (
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
              <p className="text-sm">Monday – Friday, 9:00 AM – 6:00 PM EST</p>
              <p className="text-xs mt-1">WhatsApp messages are answered within 4 hours during business hours.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
