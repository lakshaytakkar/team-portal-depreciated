import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Link as LinkIcon, Check, Loader2, MessageSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { SendWhatsAppDialog } from "@/components/dialogs/SendWhatsAppDialog";
import { apiRequest } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";

interface GenerateQuoteDialogProps {
  leadId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GenerateQuoteDialog({ leadId, trigger, open, onOpenChange }: GenerateQuoteDialogProps) {
  const { currentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'generating' | 'success'>('details');
  const [type, setType] = useState<'quote' | 'payment_link'>('quote');
  
  const show = open !== undefined ? open : isOpen;
  const setShow = onOpenChange || setIsOpen;

  const { data: lead } = useQuery<Lead>({
    queryKey: ['/api/leads', leadId],
    enabled: !!leadId,
  });

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  if (!lead) return null;

  const handleGenerate = () => {
    setStep('generating');
    setTimeout(async () => {
      setStep('success');
      
      try {
        await apiRequest("POST", "/api/activities", {
          leadId,
          userId: currentUser?.id,
          type: 'email',
          notes: `Generated ${type === 'quote' ? 'Quotation' : 'Payment Link'} for ₹${amount || lead.value}`,
          outcome: 'sent'
        });
      } catch {}
    }, 1500);
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      setStep('details');
      setType('quote');
    }, 300);
  };

  const displayAmount = amount || lead.value?.toString() || "0";
  const displayDescription = description || (lead.service ? `Service charge for ${lead.service}` : "");

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate {type === 'quote' ? 'Quotation' : 'Payment Link'}</DialogTitle>
          <DialogDescription>
            Create a formal document or link for {lead.name}.
          </DialogDescription>
        </DialogHeader>

        {step === 'details' && (
          <div className="grid gap-4 py-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button 
                variant={type === 'quote' ? 'default' : 'ghost'} 
                className="flex-1 h-8 text-xs"
                onClick={() => setType('quote')}
                data-testid="button-type-quote"
              >
                <FileText className="mr-2 h-3 w-3" /> Quotation PDF
              </Button>
              <Button 
                variant={type === 'payment_link' ? 'default' : 'ghost'} 
                className="flex-1 h-8 text-xs"
                onClick={() => setType('payment_link')}
                data-testid="button-type-payment-link"
              >
                <LinkIcon className="mr-2 h-3 w-3" /> Payment Link
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                value={amount || displayAmount} 
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={description || displayDescription}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item details..."
                data-testid="input-description"
              />
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating document...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Successfully Generated!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {type === 'quote' ? 'The quotation PDF has been created.' : 'Payment link is ready to share.'}
              </p>
            </div>
            {type === 'payment_link' && (
              <div className="w-full mt-4 space-y-3">
                <div className="flex gap-2">
                  <Input readOnly value={`https://pay.salespulse.in/${lead.id}/pay`} className="text-xs bg-muted font-mono" />
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(`https://pay.salespulse.in/${lead.id}/pay`)} data-testid="button-copy-link">
                    Copy
                  </Button>
                </div>
                
                <SendWhatsAppDialog 
                  leadId={leadId} 
                  defaultMessage={`Hi ${lead.name}, here is the payment link for the service: https://pay.salespulse.in/${lead.id}/pay`}
                  trigger={
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" size="sm" data-testid="button-send-whatsapp">
                      <MessageSquare className="mr-2 h-4 w-4" /> Send via WhatsApp
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'details' ? (
            <Button onClick={handleGenerate} data-testid="button-generate">Generate & Send</Button>
          ) : step === 'success' ? (
            <Button onClick={handleClose} data-testid="button-done">Done</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
