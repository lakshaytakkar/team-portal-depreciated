import { FileText, Upload, CheckCircle, Clock } from "lucide-react";
import { StatsCard } from "@/components/ds/stats-card";
import { StatusBadge } from "@/components/ds/status-badge";
import { DataTable, type Column } from "@/components/ds/data-table";
import { Badge } from "@/components/ui/badge";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { clientDocuments, stageDefinitions } from "@/lib/mock-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import type { ClientDocument } from "@shared/schema";
import { PageShell } from "@/components/layout";
import { PersonCell, CompanyCell } from "@/components/ui/avatar-cells";

const statusVariantMap: Record<string, "success" | "warning" | "info"> = {
  verified: "success",
  pending: "warning",
  uploaded: "info",
};

const categoryColors: Record<string, string> = {
  Articles: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "EIN Letter": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "BOI Receipt": "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "Operating Agreement": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Bank Docs": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  Passport: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "Address Proof": "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Filing Receipt": "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "IRS Confirmation": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  Other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const columns: Column<ClientDocument>[] = [
  {
    key: "title",
    header: "Document",
    sortable: true,
    render: (doc) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" data-testid={`text-doc-title-${doc.id}`}>{doc.title}</span>
        <span className="text-xs text-muted-foreground">{doc.fileSize}</span>
      </div>
    ),
  },
  {
    key: "clientName",
    header: "Client",
    sortable: true,
    render: (doc) => (
      <CompanyCell name={doc.clientName} size="sm" />
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (doc) => (
      <Badge
        variant="secondary"
        className={`border-0 text-xs font-medium px-2 py-0.5 ${categoryColors[doc.category] || categoryColors.Other}`}
        data-testid={`badge-doc-category-${doc.id}`}
      >
        {doc.category}
      </Badge>
    ),
  },
  {
    key: "stage",
    header: "Stage",
    sortable: true,
    render: (doc) => {
      const stage = stageDefinitions.find((s) => s.number === doc.stage);
      return (
        <span className="text-sm text-muted-foreground" data-testid={`text-doc-stage-${doc.id}`}>
          {stage ? `${doc.stage}. ${stage.name}` : `Stage ${doc.stage}`}
        </span>
      );
    },
  },
  {
    key: "uploadDate",
    header: "Uploaded",
    sortable: true,
    render: (doc) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{doc.uploadDate}</span>
        <PersonCell name={doc.uploadedBy} size="xs" />
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (doc) => (
      <StatusBadge
        status={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
        variant={statusVariantMap[doc.status]}
      />
    ),
  },
];

export default function DocumentVaultPage() {
  const loading = useSimulatedLoading();

  const totalDocs = clientDocuments.length;
  const verifiedDocs = clientDocuments.filter((d) => d.status === "verified").length;
  const pendingDocs = clientDocuments.filter((d) => d.status === "pending").length;
  const uploadedDocs = clientDocuments.filter((d) => d.status === "uploaded").length;

  const categories = Array.from(new Set(clientDocuments.map((d) => d.category)));
  const stages = Array.from(new Set(clientDocuments.map((d) => d.stage))).sort((a, b) => a - b);
  const statuses = ["uploaded", "pending", "verified"];

  return (
    <PageShell>
      <PageTransition>
{loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Documents"
                value={totalDocs}
                change={`${categories.length} categories`}
                changeType="neutral"
                icon={<FileText className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Verified"
                value={verifiedDocs}
                change={`${Math.round((verifiedDocs / totalDocs) * 100)}% verified rate`}
                changeType="positive"
                icon={<CheckCircle className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Pending Review"
                value={pendingDocs}
                change="Awaiting verification"
                changeType="warning"
                icon={<Clock className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Recently Uploaded"
                value={uploadedDocs}
                change="Not yet reviewed"
                changeType="neutral"
                icon={<Upload className="size-5" />}
              />
            </StaggerItem>
          </Stagger>
        )}

        <div className="mt-6">
          {loading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : (
            <DataTable
              data={clientDocuments}
              columns={columns}
              searchPlaceholder="Search documents..."
              searchKey="title"
              filters={[
                { label: "Category", key: "category", options: categories },
                { label: "Stage", key: "stage", options: stages.map(String) },
                { label: "Status", key: "status", options: statuses },
              ]}
              pageSize={10}
              emptyTitle="No documents found"
              emptyDescription="Upload documents to see them here."
            />
          )}
        </div>
      </PageTransition>
    </PageShell>
  );
}
