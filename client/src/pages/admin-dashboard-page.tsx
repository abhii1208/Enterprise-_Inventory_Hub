import { useQuery } from "@tanstack/react-query";
import { Boxes, CalendarClock, Users, UserCheck } from "lucide-react";
import { fetchDashboard, fetchImportHistory } from "../api/admin";
import { Card } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { Skeleton } from "../components/ui/skeleton";
import { StatCard } from "../components/ui/stat-card";
import { formatDate } from "../lib/utils";

export function AdminDashboardPage() {
  const metricsQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboard
  });
  const historyQuery = useQuery({
    queryKey: ["admin", "import-history"],
    queryFn: fetchImportHistory
  });

  if (metricsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const metrics = metricsQuery.data!;
  const recentImports = historyQuery.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={metrics.totalUsers} hint="All provisioned accounts" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Active Users" value={metrics.activeUsers} hint="Currently enabled access" icon={<UserCheck className="h-5 w-5" />} />
        <StatCard label="Inventory Rows" value={metrics.totalInventoryRecords} hint="Current searchable records" icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Last Upload" value={metrics.lastUploadDate ? formatDate(metrics.lastUploadDate) : "No uploads"} hint="Most recent committed import" icon={<CalendarClock className="h-5 w-5" />} />
      </section>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Recent imports</p>
            <h3 className="mt-2 font-display text-3xl text-ink">Latest upload activity</h3>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {recentImports.length ? (
            recentImports.map((item) => (
              <div key={item.id} className="interactive-lift rounded-2xl border border-line bg-white/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{item.fileName}</p>
                    <p className="mt-1 text-sm text-muted">
                      Uploaded by {item.uploadedBy.name} on {formatDate(item.uploadedAt)}
                    </p>
                  </div>
                  <div className="text-sm text-muted">
                    {item.rowsImported} rows imported, {item.failedRows} skipped
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No imports yet" description="Upload an inventory workbook to start populating searchable records." />
          )}
        </div>
      </Card>
    </div>
  );
}
