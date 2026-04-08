import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../lib/types";
import { useAuth } from "../features/auth/use-auth";

type RoleGuardProps = {
  roles: Role[];
  children?: React.ReactNode;
};

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { data } = useAuth();

  if (!data || !roles.includes(data.role)) {
    return <Navigate to="/admin/import" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
