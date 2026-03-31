import { useState } from "react";
import { Plus, CheckCircle2, XCircle, Send } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, journalEntries, type JournalEntry } from "@/lib/mock-data-finance";
import { FINANCE_COLOR } from "@/lib/finance-config";
import { PageShell } from "@/components/layout";


function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id) ?? ALL_FINANCE_COMPANIES[0];
}

function fmtAmt(v: number) {
  if (v === 0) return "";
  return `₹${v.toLocaleString("en-IN")}`;
}

function totalDr(entry: JournalEntry) { return entry.lines.reduce((s, l) => s + l.debit, 0); }
function totalCr(entry: JournalEntry) { return entry.lines.reduce((s, l) => s + l.credit, 0); }
function isBalanced(entry: JournalEntry) { return Math.abs(totalDr(entry) - totalCr(entry)) < 0.01; }

export default function FinanceJournal() {
  const isLoading = useSimulatedLoading(500);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(journalEntries[0]);

  const filtered = journalEntries.filter(je => {
    if (companyFilter !== "all" && je.companyId !== companyFilter && je.companyId !== "all") return false;
    if (statusFilter !== "all" && je.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64" />
        <div className="flex gap-4">
          <div className="w-72 shrink-0 h-[600px] bg-muted rounded-xl" />
          <div className="flex-1 h-[600px] bg-muted rounded-xl" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Journal Entries</h1>
            <p className="text-sm text-muted-foreground">Double-entry bookkeeping records — Dr = Cr always</p>
          </div>
          <Button style={{ backgroundColor: FINANCE_COLOR }} className="text-white" data-testid="btn-new-journal">
            <Plus className="h-4 w-4 mr-1" />New Journal Entry
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {[{ id: "all", label: "All" }, ...ALL_FINANCE_COMPANIES.map(c => ({ id: c.id, label: c.shortName }))].map(c => (
              <button
                key={c.id}
                onClick={() => setCompanyFilter(c.id)}
                data-testid={`pill-company-${c.id}`}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${companyFilter === c.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground hover:border-amber-400"}`}
                style={companyFilter === c.id ? { backgroundColor: FINANCE_COLOR, borderColor: FINANCE_COLOR } : undefined}
              >{c.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {[{ id: "all", label: "All" }, { id: "posted", label: "Posted" }, { id: "draft", label: "Draft" }].map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                data-testid={`pill-status-${s.id}`}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${statusFilter === s.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground hover:border-amber-400"}`}
                style={statusFilter === s.id ? { backgroundColor: FINANCE_COLOR, borderColor: FINANCE_COLOR } : undefined}
              >{s.label}</button>
            ))}
          </div>
        </div>
      </Fade>

      <div className="flex gap-4">
        <Fade className="w-72 shrink-0">
          <Card className="max-h-[650px] overflow-y-auto">
            <CardContent className="p-2">
              {filtered.length === 0 && <p className="text-xs text-muted-foreground px-2 py-4">No entries match</p>}
              {filtered.map((je, i) => {
                const co = je.companyId !== "all" ? getCompany(je.companyId) : null;
                const bal = isBalanced(je);
                const isSelected = selectedEntry?.id === je.id;
                return (
                  <button
                    key={je.id}
                    onClick={() => setSelectedEntry(je)}
                    data-testid={`je-card-${je.id}`}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${isSelected ? "border-2 border-amber-400 bg-amber-50" : "border border-transparent hover:bg-muted"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">JE-{String(i + 1).padStart(3, "0")}</span>
                      <div className="flex items-center gap-1">
                        {je.tags.map(t => (
                          <span key={t} className={`text-xs px-1 py-0.5 rounded font-semibold ${t === "IC" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"}`}>{t}</span>
                        ))}
                        <Badge className={`text-xs ${je.status === "posted" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`} variant="outline">{je.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs font-medium leading-tight mb-1 truncate">{je.narration}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{je.date}</span>
                      <span className="text-xs font-semibold text-muted-foreground">₹{totalDr(je).toLocaleString("en-IN")}</span>
                    </div>
                    {co && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mt-1 inline-block ${co.badgeBg} ${co.badgeText}`}>{co.shortName}</span>}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </Fade>

        <Fade className="flex-1 min-w-0">
          {!selectedEntry ? (
            <Card className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Select a journal entry to view details</p>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{selectedEntry.narration}</CardTitle>
                      {selectedEntry.tags.map(t => (
                        <span key={t} className={`text-xs px-1.5 py-0.5 rounded font-semibold ${t === "IC" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"}`}>{t}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedEntry.date} · Created by {selectedEntry.createdBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${selectedEntry.status === "posted" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`} variant="outline">
                      {selectedEntry.status}
                    </Badge>
                    {selectedEntry.status === "draft" && (
                      <Button size="sm" style={{ backgroundColor: FINANCE_COLOR }} className="text-white" data-testid="btn-post-journal">
                        <Send className="h-3.5 w-3.5 mr-1" />Post Journal
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Account</th>
                      <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium">Debit (₹)</th>
                      <th className="text-right px-4 py-2 text-muted-foreground font-medium">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines.map((line, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/20" data-testid={`je-line-${idx}`}>
                        <td className="px-4 py-2">
                          <p className="font-medium">{line.accountName}</p>
                          <p className="text-muted-foreground/60 text-xs">{line.accountId}</p>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{line.description}</td>
                        <td className="px-4 py-2 text-right font-semibold text-emerald-700">{line.debit > 0 ? `₹${line.debit.toLocaleString("en-IN")}` : ""}</td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600">{line.credit > 0 ? `₹${line.credit.toLocaleString("en-IN")}` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/20 font-semibold">
                      <td className="px-4 py-2 text-muted-foreground" colSpan={2}>
                        <div className="flex items-center gap-2">
                          {isBalanced(selectedEntry)
                            ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-emerald-700">Balanced — Dr = Cr</span></>
                            : <><XCircle className="h-4 w-4 text-red-500" /><span className="text-red-600">Unbalanced — Check entries</span></>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right text-emerald-700">₹{totalDr(selectedEntry).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2 text-right text-red-600">₹{totalCr(selectedEntry).toLocaleString("en-IN")}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          )}
        </Fade>
      </div>
    </PageTransition>
  );
}
