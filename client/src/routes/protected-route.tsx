import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/use-auth";
import { AppLoader } from "../components/ui/app-loader";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { data, isLoading, isError } = useAuth();

  if (isLoading) {
    return <AppLoader label="Preparing your workspace" />;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

