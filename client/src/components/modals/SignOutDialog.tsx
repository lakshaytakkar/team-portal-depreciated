import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SignOutDialog({ open, onOpenChange, onConfirm }: SignOutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-8 gap-8 rounded-[16px]">
        <DialogTitle className="sr-only">Sign Out</DialogTitle>
        <div className="flex flex-col items-center gap-4">
          {/* Icon with gradient rings */}
          <div className="relative flex items-center justify-center p-4 rounded-full bg-gradient-to-b from-[rgba(219,234,254,0.48)] to-transparent border border-[#DBEAFE]">
            <div className="flex items-center justify-center p-3.5 bg-card border border-[#BFDBFE] rounded-full shadow-[0px_2px_4px_0px_rgba(37,99,235,0.04)]">
              <LogOut className="h-6 w-6 text-[#2563EB]" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-[24px] font-semibold text-foreground leading-[1.3]">Logout</h2>
            <p className="text-[16px] text-muted-foreground leading-[1.5]">Are you sure want to Logout from Suprans?</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <Button 
            variant="outline" 
            className="flex-1 h-[56px] rounded-lg border text-foreground font-semibold text-[16px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 h-[56px] rounded-lg bg-[#2563EB] text-white font-semibold text-[16px] shadow-sm border-none"
            onClick={onConfirm}
          >
            Yes, Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
