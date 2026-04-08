import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { clearAuditLogs, fetchAuditLogs } from "../api/admin";
import { queryClient } from "../app/query-client";
import { useAuth } from "../features/auth/use-auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DataTable } from "../components/ui/data-table";
import { EmptyState } from "../components/ui/empty-state";
import { formatDate } from "../lib/utils";

export function AuditLogsPage() {
  const { data: user } = useAuth();
  const auditQuery = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: fetchAuditLogs
  });
  const clearMutation = useMutation({
    mutationFn: clearAuditLogs,
    onSuccess: async (result) => {
      toast.success(`Audit logs cleared (${result.deletedCount} removed)`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    }
  });

  return (
    <div className="space-y-6">
      <section>
        <h2 className="section-title">Audit logs</h2>
        <p className="section-subtitle">A concise record of key administrative actions and authentication events.</p>
        {user?.role === "ADMIN" ? (
          <div className="mt-4">
            <Button variant="danger" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
              {clearMutation.isPending ? "Clearing..." : "Clear audit logs"}
            </Button>
          </div>
        ) : null}
      </section>

      <DataTable
        rows={auditQuery.data ?? []}
        empty={<EmptyState title="No audit events" description="Administrative activity will appear here as users sign in, change settings, and import inventory." />}
        columns={[
          {
            key: "action",
            title: "Action",
            render: (row) => <Badge className="border-brand-100 bg-brand-50 text-brand-600">{row.action}</Badge>
          },
          {
            key: "entity",
            title: "Entity",
            render: (row) => `${row.entityType}${row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ""}`
          },
          {
            key: "description",
            title: "Description",
            render: (row) => row.description
          },
          {
            key: "actor",
            title: "Actor",
            render: (row) => row.actor?.name ?? "System"
          },
          {
            key: "date",
            title: "Date",
            render: (row) => formatDate(row.createdAt)
          }
        ]}
      />
    </div>
  );
}
