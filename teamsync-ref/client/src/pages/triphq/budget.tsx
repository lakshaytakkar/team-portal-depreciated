import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DollarSign, Plus, Edit2, Trash2, Upload, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRIPHQ_COLOR, EXPENSE_CATEGORIES, CURRENCIES } from "@/lib/triphq-config";
import { SopModal, TutorialModal, SopTutorialButtons } from "@/components/sop/sop-modal";
import { SOP_REGISTRY } from "@/lib/sop-data";
import { PageShell, PageHeader, StatGrid, StatCard, FilterPill } from "@/components/layout";
import { FormDialog } from "@/components/ds/form-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORY_COLORS: Record<string, string> = {
  transport: "text-blue-700 bg-blue-50", food: "text-orange-700 bg-orange-50", hotel: "text-purple-700 bg-purple-50",
  shopping: "text-pink-700 bg-pink-50", business: "text-emerald-700 bg-emerald-50", misc: "text-gray-700 bg-gray-50",
};

export default function TripHQBudget() {
  const { toast } = useToast();
  const [sopOpen, setSopOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [catFilter, setCatFilter] = useState("all");

  const { data: expenses = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/triphq/expenses"] });
  const { data: docs = [] } = useQuery<any[]>({ queryKey: ["/api/triphq/documents"] });

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
      if (editItem?.id) return apiRequest("PATCH", `/api/triphq/expenses/${editItem.id}`, body);
      return apiRequest("POST", "/api/triphq/expenses", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triphq/expenses"] });
      setFormOpen(false); setEditItem(null);
      toast({ title: editItem?.id ? "Expense updated" : "Expense added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/triphq/expenses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/triphq/expenses"] }); toast({ title: "Expense removed" }); },
  });

  const handleUpload = async (expenseId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", "receipt");
    fd.append("entity_type", "expense");
    fd.append("entity_id", expenseId);
    await fetch("/api/triphq/upload", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["/api/triphq/documents"] });
    toast({ title: "Receipt uploaded" });
  };

  const filtered = catFilter === "all" ? expenses : expenses.filter((e: any) => e.category === catFilter);

  const totalByCurrency: Record<string, number> = {};
  expenses.forEach((e: any) => { totalByCurrency[e.currency] = (totalByCurrency[e.currency] || 0) + parseFloat(e.amount); });

  const totalCNY = totalByCurrency["CNY"] || 0;
  const totalAll = expenses.reduce((s: number, e: any) => s + parseFloat(e.amount), 0);

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (e: any) => { setEditItem(e); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      date: fd.get("date"),
      city: fd.get("city") || null,
      category: fd.get("category"),
      amount: parseFloat(fd.get("amount") as string),
      currency: fd.get("currency"),
      description: fd.get("description") || null,
      payment_method: fd.get("payment_method") || null,
    });
  };

  if (isLoading) {
    return (<PageShell className="animate-pulse"><div className="h-16 bg-muted rounded-xl" /><StatGrid>{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}</StatGrid></PageShell>);
  }

  return (
    <PageShell>
      <PageHeader title="Budget Tracker" subtitle={`${expenses.length} expenses logged`} actions={
        <div className="flex items-center gap-2">
          <SopTutorialButtons onSopClick={() => setSopOpen(true)} onTutorialClick={() => setTutorialOpen(true)} />
          <Button onClick={openCreate} style={{ backgroundColor: TRIPHQ_COLOR }} className="text-white" data-testid="button-add-expense"><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
        </div>
      } />

      <StatGrid>
        {Object.entries(totalByCurrency).map(([cur, amt]) => (
          <StatCard key={cur} label={`Total ${cur}`} value={`${cur === "CNY" ? "¥" : cur === "USD" ? "$" : cur === "INR" ? "₹" : "฿"}${amt.toLocaleString()}`} icon={DollarSign} iconBg="rgba(8,145,178,0.1)" iconColor={TRIPHQ_COLOR} />
        ))}
        {Object.keys(totalByCurrency).length === 0 && <StatCard label="Total Spent" value="¥0" icon={DollarSign} iconBg="rgba(8,145,178,0.1)" iconColor={TRIPHQ_COLOR} />}
      </StatGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterPill label="All" active={catFilter === "all"} onClick={() => setCatFilter("all")} count={expenses.length} />
        {EXPENSE_CATEGORIES.map((cat) => (
          <FilterPill key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} active={catFilter === cat} onClick={() => setCatFilter(cat)} count={expenses.filter((e: any) => e.category === cat).length} />
        ))}
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 text-xs font-medium">Date</th>
            <th className="text-left px-4 py-3 text-xs font-medium">City</th>
            <th className="text-left px-4 py-3 text-xs font-medium">Category</th>
            <th className="text-left px-4 py-3 text-xs font-medium">Description</th>
            <th className="text-right px-4 py-3 text-xs font-medium">Amount</th>
            <th className="text-left px-4 py-3 text-xs font-medium">Method</th>
            <th className="text-center px-4 py-3 text-xs font-medium">Receipt</th>
            <th className="text-right px-4 py-3 text-xs font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((e: any) => {
              const receiptDocs = docs.filter((d: any) => d.entityType === "expense" && d.entityId === e.id);
              return (
                <tr key={e.id} className="border-b hover:bg-muted/30" data-testid={`expense-${e.id}`}>
                  <td className="px-4 py-3 text-sm">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.city || "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[e.category] || ""}`}>{e.category}</Badge></td>
                  <td className="px-4 py-3 text-sm">{e.description || "—"}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{e.currency === "CNY" ? "¥" : e.currency === "USD" ? "$" : e.currency === "INR" ? "₹" : "฿"}{parseFloat(e.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.paymentMethod || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {receiptDocs.length > 0 ? (
                      <a href={receiptDocs[0].fileUrl} target="_blank" rel="noopener noreferrer"><Receipt className="h-4 w-4 text-emerald-600 mx-auto" /></a>
                    ) : (
                      <label className="cursor-pointer"><input type="file" className="hidden" accept="image/*,.pdf" onChange={(ev) => { if (ev.target.files?.[0]) handleUpload(e.id, ev.target.files[0]); }} /><Upload className="h-4 w-4 text-muted-foreground mx-auto" /></label>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">No expenses yet</td></tr>}
          </tbody>
        </table>
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editItem?.id ? "Edit Expense" : "Add Expense"} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Date *</label><Input name="date" type="date" required defaultValue={editItem?.date?.split("T")[0] || new Date().toISOString().split("T")[0]} data-testid="input-date" /></div>
            <div><label className="text-sm font-medium">City</label><Input name="city" defaultValue={editItem?.city || ""} data-testid="input-city" /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Category *</label>
            <select name="category" required defaultValue={editItem?.category || "food"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-category">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Amount *</label><Input name="amount" type="number" step="0.01" required defaultValue={editItem?.amount || ""} data-testid="input-amount" /></div>
            <div>
              <label className="text-sm font-medium">Currency *</label>
              <select name="currency" required defaultValue={editItem?.currency || "CNY"} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="select-currency">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Description</label><Input name="description" defaultValue={editItem?.description || ""} data-testid="input-description" /></div>
          <div><label className="text-sm font-medium">Payment Method</label><Input name="payment_method" placeholder="Alipay, Cash, Card..." defaultValue={editItem?.paymentMethod || ""} data-testid="input-payment-method" /></div>
        </div>
      </FormDialog>
      <SopModal open={sopOpen} onOpenChange={setSopOpen} config={SOP_REGISTRY["triphq-budget"].sop} color={TRIPHQ_COLOR} />
      <TutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} config={SOP_REGISTRY["triphq-budget"].tutorial} color={TRIPHQ_COLOR} />
    </PageShell>
  );
}
