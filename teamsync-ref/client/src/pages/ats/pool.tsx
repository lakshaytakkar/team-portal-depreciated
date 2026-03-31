import { useState } from "react";
import { Search, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PersonCell } from "@/components/ui/avatar-cells";
import { candidates } from "@/lib/mock-data-ats";
import { PageShell } from "@/components/layout";

const poolCandidates = candidates.filter(c => c.stage === "rejected" || c.stage === "hired").concat(
  candidates.filter(c => c.experience >= 4 && !["applied", "screening", "interview"].includes(c.stage))
).filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i).slice(0, 8);

const expLevels = [
  { label: "Junior (0-2y)", min: 0, max: 2 },
  { label: "Mid (3-5y)", min: 3, max: 5 },
  { label: "Senior (6+y)", min: 6, max: 99 },
];

export default function AtsTalentPool() {
  const isLoading = useSimulatedLoading(700);
  const [search, setSearch] = useState("");
  const [expFilter, setExpFilter] = useState("all");

  const filtered = poolCandidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    if (expFilter === "all") return matchSearch;
    const level = expLevels.find(l => l.label === expFilter);
    return matchSearch && level ? c.experience >= level.min && c.experience <= level.max : matchSearch;
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}</div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">Talent Pool</h1>
          <p className="text-sm text-muted-foreground">Passive candidates and past applicants for future consideration</p>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search by name or skill..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="pool-search" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setExpFilter("all")} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${expFilter === "all" ? "bg-violet-600 text-white border-violet-600" : "border-border text-muted-foreground"}`} data-testid="exp-filter-all">All Levels</button>
            {expLevels.map(l => (
              <button key={l.label} onClick={() => setExpFilter(l.label)} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${expFilter === l.label ? "bg-violet-600 text-white border-violet-600" : "border-border text-muted-foreground"}`} data-testid={`exp-filter-${l.label}`}>{l.label}</button>
            ))}
          </div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <StaggerItem key={c.id}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`pool-card-${c.id}`}>
              <CardContent className="p-5 space-y-3">
                <PersonCell name={c.name} subtitle={`${c.currentRole} · ${c.currentCompany}`} size="md" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.experience}y experience</span>
                  <span className="text-muted-foreground">Added {c.addedDate}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 4).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                  {c.skills.length > 4 && <Badge variant="secondary" className="text-[10px]">+{c.skills.length - 4}</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild data-testid={`whatsapp-pool-${c.id}`}>
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      <SiWhatsapp className="size-3.5 text-green-500 mr-1" /> WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild data-testid={`email-pool-${c.id}`}>
                    <a href={`mailto:${c.email}`}><Mail className="size-3.5 mr-1" /> Reach Out</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">No candidates found in talent pool</div>}
      </Stagger>
    </PageTransition>
  );
}
