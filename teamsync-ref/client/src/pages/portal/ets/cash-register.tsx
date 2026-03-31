import { useState, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet, Clock, DollarSign, ArrowUpRight, Lock, Unlock,
  History, Banknote, CreditCard, Smartphone,
} from "lucide-react";
import {
  REGISTER_SESSIONS, EXPANDED_SALES, getCashSalesToday,
  type RegisterSession,
} from "@/lib/mock-data-pos-ets";

type Tab = "current" | "history";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function EtsCashRegister() {
  const inSidebar = useEtsSidebar();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("current");
  const [sessions, setSessions] = useState<RegisterSession[]>([...REGISTER_SESSIONS]);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("5000");
  const [closingAmount, setClosingAmount] = useState("");
  const [closeNotes, setCloseNotes] = useState("");

  const currentSession = sessions.find(s => s.status === "open");
  const cashSalesToday = getCashSalesToday();
  const expectedCash = currentSession ? currentSession.openingAmount + cashSalesToday : 0;

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todaySales = EXPANDED_SALES.filter(s => new Date(s.timestamp) >= todayStart);
  const todayCashSales = todaySales.filter(s => s.paymentMethod === "cash");
  const todayUpiSales = todaySales.filter(s => s.paymentMethod === "upi");
  const todayCardSales = todaySales.filter(s => s.paymentMethod === "card");

  const todayStats = useMemo(() => ({
    totalTransactions: todaySales.length,
    cashTotal: todayCashSales.reduce((s, x) => s + x.totalAmount, 0),
    upiTotal: todayUpiSales.reduce((s, x) => s + x.totalAmount, 0),
    cardTotal: todayCardSales.reduce((s, x) => s + x.totalAmount, 0),
    totalRevenue: todaySales.reduce((s, x) => s + x.totalAmount, 0),
  }), [todaySales]);

  function openRegister() {
    const amt = parseFloat(openingAmount) || 0;
    if (amt <= 0) return;
    const session: RegisterSession = {
      id: `reg-${Date.now()}`, storeId: "store-001", openedBy: "Rajesh Kumar",
      openedAt: new Date().toISOString(), openingAmount: amt, status: "open",
    };
    setSessions(prev => [session, ...prev.filter(s => s.status !== "open")]);
    navigator.vibrate?.([100, 50, 100]);
    toast({ title: "Register Opened", description: `Opening cash: ${formatINR(amt)}` });
    setShowOpenDialog(false);
    setOpeningAmount("5000");
  }

  function closeRegister() {
    if (!currentSession) return;
    const actual = parseFloat(closingAmount) || 0;
    const diff = actual - expectedCash;
    const closed: RegisterSession = {
      ...currentSession, status: "closed",
      closedBy: "Rajesh Kumar", closedAt: new Date().toISOString(),
      closingAmount: actual, expectedAmount: expectedCash, difference: diff,
      notes: closeNotes || undefined,
    };
    setSessions(prev => prev.map(s => s.id === currentSession.id ? closed : s));
    navigator.vibrate?.([100, 50, 200]);
    toast({
      title: "Register Closed",
      description: `Difference: ${diff === 0 ? "Perfect match!" : (diff > 0 ? "+" : "") + formatINR(diff)}`,
    });
    setShowCloseDialog(false);
    setClosingAmount("");
    setCloseNotes("");
  }

  const closedSessions = sessions.filter(s => s.status === "closed");

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "px-16 lg:px-24 py-6 space-y-6"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-register-title">Cash Register</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Daily cash cycle management</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <Button
            variant={tab === "current" ? "default" : "ghost"}
            size="sm" className="h-7 text-xs gap-1.5"
            onClick={() => setTab("current")}
            data-testid="button-tab-current"
          >
            <Wallet className="w-3.5 h-3.5" /> Today
          </Button>
          <Button
            variant={tab === "history" ? "default" : "ghost"}
            size="sm" className="h-7 text-xs gap-1.5"
            onClick={() => setTab("history")}
            data-testid="button-tab-history"
          >
            <History className="w-3.5 h-3.5" /> History
          </Button>
        </div>
      </div>

      {tab === "current" && (
        <div className="space-y-4">
          {!currentSession ? (
            <Card className="rounded-xl border bg-card border-l-4 border-l-amber-400">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-lg font-semibold font-heading">Register is Closed</h2>
                <p className="text-sm text-muted-foreground">Open the register to start tracking today's cash</p>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                  onClick={() => setShowOpenDialog(true)}
                  data-testid="button-open-register"
                >
                  <Unlock className="w-4 h-4" />
                  Open Register
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="rounded-xl border bg-card border-l-4 border-l-green-500 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Register Open
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        since {new Date(currentSession.openedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <Button
                      variant="outline" size="sm" className="text-xs h-7 gap-1.5 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setShowCloseDialog(true)}
                      data-testid="button-close-register"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Close Register
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-xl border bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-muted-foreground">Opening Cash</p>
                    <p className="text-2xl font-bold font-heading mt-1" data-testid="stat-opening">{formatINR(currentSession.openingAmount)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-green-600">Cash Sales Today</p>
                    <p className="text-2xl font-bold font-heading text-green-700 mt-1" data-testid="stat-cash-sales">{formatINR(cashSalesToday)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-indigo-600">Expected in Drawer</p>
                    <p className="text-2xl font-bold font-heading text-indigo-700 mt-1" data-testid="stat-expected">{formatINR(expectedCash)}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold font-heading mt-1" data-testid="stat-transactions">{todayStats.totalTransactions}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-xl border bg-card">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-4">Payment Method Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Banknote className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Cash</span>
                          <span className="text-sm font-semibold">{formatINR(todayStats.cashTotal)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: todayStats.totalRevenue > 0 ? `${(todayStats.cashTotal / todayStats.totalRevenue) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">UPI</span>
                          <span className="text-sm font-semibold">{formatINR(todayStats.upiTotal)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: todayStats.totalRevenue > 0 ? `${(todayStats.upiTotal / todayStats.totalRevenue) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Card</span>
                          <span className="text-sm font-semibold">{formatINR(todayStats.cardTotal)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: todayStats.totalRevenue > 0 ? `${(todayStats.cardTotal / todayStats.totalRevenue) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold font-heading">{formatINR(todayStats.totalRevenue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border bg-card">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-3">Today's Cash Transactions</h3>
                  {todayCashSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No cash sales today</p>
                  ) : (
                    <div className="space-y-1.5">
                      {todayCashSales.map(sale => (
                        <div key={sale.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                          <div>
                            <p className="text-sm font-medium">{sale.receiptNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sale.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              {" · "}{sale.items.reduce((s, i) => s + i.quantity, 0)} items
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-green-600">+{formatINR(sale.totalAmount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          {closedSessions.length === 0 ? (
            <Card className="rounded-xl border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">No past register sessions</CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-left tracking-wide">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-left tracking-wide">Opened By</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right tracking-wide">Opening</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right tracking-wide">Expected</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right tracking-wide">Actual</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right tracking-wide">Difference</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-left tracking-wide">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {closedSessions.map(session => {
                    const diff = session.difference ?? 0;
                    const diffColor = diff === 0 ? "text-green-600" : Math.abs(diff) <= 50 ? "text-amber-600" : "text-red-600";
                    return (
                      <tr key={session.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-session-${session.id}`}>
                        <td className="px-4 py-3.5">
                          <p className="font-medium">{new Date(session.openedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.openedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            {" — "}
                            {session.closedAt && new Date(session.closedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{session.openedBy}</td>
                        <td className="px-4 py-3.5 text-right">{formatINR(session.openingAmount)}</td>
                        <td className="px-4 py-3.5 text-right">{formatINR(session.expectedAmount ?? 0)}</td>
                        <td className="px-4 py-3.5 text-right font-medium">{formatINR(session.closingAmount ?? 0)}</td>
                        <td className={`px-4 py-3.5 text-right font-semibold ${diffColor}`}>
                          {diff === 0 ? "Match" : `${diff > 0 ? "+" : ""}${formatINR(diff)}`}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[150px] truncate">
                          {session.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-indigo-500" /> Open Register
            </DialogTitle>
            <DialogDescription>Enter the starting cash amount in the drawer</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Opening Cash Amount
              </label>
              <Input
                type="number" min="0" className="text-lg font-bold text-center h-12"
                value={openingAmount} onChange={e => setOpeningAmount(e.target.value)}
                data-testid="input-opening-amount"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[2000, 3000, 5000, 10000].map(amt => (
                <Button
                  key={amt} variant="outline" size="sm" className="text-xs"
                  onClick={() => setOpeningAmount(String(amt))}
                >
                  {formatINR(amt)}
                </Button>
              ))}
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={openRegister} data-testid="button-confirm-open">
              <Unlock className="w-4 h-4" /> Open Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" /> Close Register
            </DialogTitle>
            <DialogDescription>Count the cash and enter the actual amount</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-indigo-600">Expected Cash in Drawer</p>
              <p className="text-2xl font-bold font-heading text-indigo-700 mt-1">{formatINR(expectedCash)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatINR(currentSession?.openingAmount ?? 0)} opening + {formatINR(cashSalesToday)} cash sales
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Actual Cash Counted
              </label>
              <Input
                type="number" min="0" className="text-lg font-bold text-center h-12"
                value={closingAmount} onChange={e => setClosingAmount(e.target.value)}
                placeholder="Count and enter..."
                data-testid="input-closing-amount"
              />
            </div>
            {closingAmount && (
              <div className={`rounded-xl p-4 text-center ${
                parseFloat(closingAmount) === expectedCash ? "bg-green-50" :
                Math.abs(parseFloat(closingAmount) - expectedCash) <= 50 ? "bg-amber-50" : "bg-red-50"
              }`}>
                <p className="text-xs text-muted-foreground">Difference</p>
                <p className={`text-xl font-bold font-heading ${
                  parseFloat(closingAmount) === expectedCash ? "text-green-600" :
                  Math.abs(parseFloat(closingAmount) - expectedCash) <= 50 ? "text-amber-600" : "text-red-600"
                }`}>
                  {(() => {
                    const diff = (parseFloat(closingAmount) || 0) - expectedCash;
                    return diff === 0 ? "Perfect match!" : `${diff > 0 ? "+" : ""}${formatINR(diff)}`;
                  })()}
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Notes (optional)
              </label>
              <Textarea
                className="text-sm" rows={2}
                value={closeNotes} onChange={e => setCloseNotes(e.target.value)}
                placeholder="Explain any discrepancy..."
                data-testid="input-close-notes"
              />
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 gap-2"
              disabled={!closingAmount}
              onClick={closeRegister}
              data-testid="button-confirm-close"
            >
              <Lock className="w-4 h-4" /> Close Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
