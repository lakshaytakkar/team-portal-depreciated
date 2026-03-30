import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import { stages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { LogActivityDialog } from "./LogActivityDialog";

interface QuickLogActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickLogActivityDialog({ open, onOpenChange }: QuickLogActivityDialogProps) {
  const { currentUser, currentTeamId } = useStore();
  const effectiveRole = useStore.getState().getEffectiveRole();
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ['/api/leads', currentTeamId, effectiveRole],
    queryFn: async () => {
      const role = useStore.getState().getEffectiveRole();
      const res = await fetch(`/api/leads?teamId=${currentTeamId}&effectiveRole=${role}`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!currentUser && open,
  });

  const filtered = leads.filter((l: any) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search)
  ).slice(0, 8);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    onOpenChange(false);
    setShowLog(true);
  };

  const handleLogClose = (val: boolean) => {
    setShowLog(val);
    if (!val) {
      setSelectedLeadId(null);
      setSearch("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setSearch(""); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Log Activity – Select Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
                data-testid="input-lead-search"
              />
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No leads found.</p>
              ) : (
                filtered.map((lead: any) => {
                  const stage = stages.find(s => s.id === lead.stage);
                  return (
                    <button
                      key={lead.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                      onClick={() => handleSelectLead(lead.id)}
                      data-testid={`select-lead-${lead.id}`}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {lead.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs shrink-0 capitalize border-0",
                          `bg-${stage?.color}-100 text-${stage?.color}-700`
                        )}
                      >
                        {lead.stage}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedLeadId && (
        <LogActivityDialog
          leadId={selectedLeadId}
          open={showLog}
          onOpenChange={handleLogClose}
        />
      )}
    </>
  );
}
