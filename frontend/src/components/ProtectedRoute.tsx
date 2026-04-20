import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "ORGANIZER";
  fallbackPath?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  fallbackPath = "/login",
}: ProtectedRouteProps) => {
  // Use selector - component TIDAK re-render kalau isLoading berubah
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log("[ProtectedRoute] Render:", { isAuthenticated, hasUser: !!user });

  // Not authenticated
  if (!isAuthenticated || !user) {
    console.log("[ProtectedRoute] Redirecting to", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  // Role check - use fallbackPath instead of hardcoded "/"
  if (requiredRole && user.role !== requiredRole) {
    console.log("[ProtectedRoute] Role check failed, redirecting to", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};