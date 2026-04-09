import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/app-layout";
import { ProtectedRoute } from "../routes/protected-route";
import { RoleGuard } from "../routes/role-guard";
import { AdminDashboardPage } from "../pages/admin-dashboard-page";
import { AuditLogsPage } from "../pages/audit-logs-page";
import { CurrentImportedRowsPage } from "../pages/current-imported-rows-page";
import { ImportHistoryPage } from "../pages/import-history-page";
import { InventoryImportPage } from "../pages/inventory-import-page";
import { LoginPage } from "../pages/login-page";
import { ProfilePage } from "../pages/profile-page";
import { UserManagementPage } from "../pages/user-management-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/import" replace />
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "admin",
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboardPage />
      },
      {
        path: "admin/users",
        element: (
          <RoleGuard roles={["ADMIN"]}>
            <UserManagementPage />
          </RoleGuard>
        )
      },
      {
        path: "admin/import",
        element: <InventoryImportPage />
      },
      {
        path: "admin/current-rows",
        element: <CurrentImportedRowsPage />
      },
      {
        path: "admin/import-history",
        element: <ImportHistoryPage />
      },
      {
        path: "admin/audit-logs",
        element: <AuditLogsPage />
      }
    ]
  }
]);
