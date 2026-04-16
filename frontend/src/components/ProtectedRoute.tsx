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
  const { user, isAuthenticated, isLoading } = useAuthStore();

  console.log("[ProtectedRoute] Render:", { isAuthenticated, isLoading, hasUser: !!user });

  // Not authenticated - redirect immediately (don't wait for loading)
  if (!isAuthenticated || !user) {
    console.log("[ProtectedRoute] Redirecting to", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  // Role check
  if (requiredRole && user.role !== requiredRole) {
    console.log("[ProtectedRoute] Role check failed, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Render children - add loading overlay on top if still loading
  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {children}
    </>
  );
};