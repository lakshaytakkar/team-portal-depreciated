import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { holidays } from "@/lib/mock-data-hrms";
import { PageShell } from "@/components/layout";

const typeStyle: Record<string, { badge: string; dot: string }> = {
  national: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  optional: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  company: { badge: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
};

export default function HrmsHolidays() {
  const isLoading = useSimulatedLoading(500);

  const national = holidays.filter((h) => h.type === "national");
  const optional = holidays.filter((h) => h.type === "optional");
  const company = holidays.filter((h) => h.type === "company");

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </PageShell>
    );
  }

  const HolidayList = ({ items }: { items: typeof holidays }) => (
    <div className="space-y-2">
      {items.map((h) => (
        <div key={h.id} className="flex items-center gap-3 py-2 border-b last:border-0" data-testid={`holiday-${h.id}`}>
          <div className={`size-2 rounded-full shrink-0 ${typeStyle[h.type].dot}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{h.name}</p>
            <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeStyle[h.type].badge}`}>{h.type}</span>
        </div>
      ))}
    </div>
  );

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Holiday Calendar 2026</h1>
            <p className="text-sm text-muted-foreground">{holidays.length} holidays total · {national.length} national, {optional.length} optional, {company.length} company</p>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          {Object.entries(typeStyle).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs">
              <div className={`size-2.5 rounded-full ${style.dot}`} />
              <span className="text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </Fade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-emerald-500" /> National Holidays ({national.length})
              </CardTitle>
            </CardHeader>
            <CardContent><HolidayList items={national} /></CardContent>
          </Card>
        </Fade>
        <Fade>
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-amber-500" /> Optional Holidays ({optional.length})
                </CardTitle>
              </CardHeader>
              <CardContent><HolidayList items={optional} /></CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-sky-500" /> Company Holidays ({company.length})
                </CardTitle>
              </CardHeader>
              <CardContent><HolidayList items={company} /></CardContent>
            </Card>
          </div>
        </Fade>
      </div>
    </PageTransition>
  );
}
