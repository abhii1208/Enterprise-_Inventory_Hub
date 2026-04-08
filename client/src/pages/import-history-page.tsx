import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { clearImportHistory, fetchImportHistory } from "../api/admin";
import { queryClient } from "../app/query-client";
import { useAuth } from "../features/auth/use-auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DataTable } from "../components/ui/data-table";
import { EmptyState } from "../components/ui/empty-state";
import { formatDate } from "../lib/utils";

export function ImportHistoryPage() {
  const { data: user } = useAuth();
  const historyQuery = useQuery({
    queryKey: ["admin", "import-history"],
    queryFn: fetchImportHistory
  });
  const clearMutation = useMutation({
    mutationFn: clearImportHistory,
    onSuccess: async (result) => {
      toast.success(`Import history cleared (${result.deletedCount} removed)`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "import-history"] });
    }
  });

  return (
    <div className="space-y-6">
      <section>
        <h2 className="section-title">Import history</h2>
        <p className="section-subtitle">Review upload provenance, import counts, and recent master replacement events.</p>
        {user?.role === "ADMIN" ? (
          <div className="mt-4">
            <Button variant="danger" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
              {clearMutation.isPending ? "Clearing..." : "Clear history"}
            </Button>
          </div>
        ) : null}
      </section>

      <DataTable
        rows={historyQuery.data ?? []}
        empty={<EmptyState title="No import history" description="Committed imports will appear here once inventory files are uploaded." />}
        columns={[
          {
            key: "file",
            title: "File",
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{row.fileName}</p>
                <p className="mt-1 text-xs text-muted">{row.summary ?? "No summary"}</p>
              </div>
            )
          },
          {
            key: "uploadedBy",
            title: "Uploaded By",
            render: (row) => (
              <div>
                <p className="font-medium text-ink">{row.uploadedBy.name}</p>
                <p className="mt-1 text-xs text-muted">{row.uploadedBy.email}</p>
              </div>
            )
          },
          {
            key: "date",
            title: "Date",
            render: (row) => formatDate(row.uploadedAt)
          },
          {
            key: "rows",
            title: "Rows",
            render: (row) => `${row.rowsImported} imported`
          },
          {
            key: "failed",
            title: "Failed",
            render: (row) => (
              <Badge className={row.failedRows ? "text-danger" : "border-brand-100 bg-brand-50 text-brand-600"}>
                {row.failedRows}
              </Badge>
            )
          }
        ]}
      />
    </div>
  );
}
